import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../app';
import { logger } from '../utils/logger';

// Расширяем интерфейс Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        telegramId: bigint;
        firstName: string;
        lastName: string | null;
        username: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string | undefined;
  username?: string | undefined;
  auth_date: number;
  hash: string;
}

// Парсинг данных от Telegram
function parseTelegramData(initData: string): TelegramAuthData {
  const params = new URLSearchParams(initData);
  
  return {
    id: parseInt(params.get('id') || '0'),
    first_name: params.get('first_name') || '',
    last_name: params.get('last_name') || undefined,
    username: params.get('username') || undefined,
    auth_date: parseInt(params.get('auth_date') || '0'),
    hash: params.get('hash') || '',
  };
}

// Проверка подписи Telegram
function verifyTelegramSignature(authData: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    logger.error('TELEGRAM_BOT_TOKEN не настроен');
    return false;
  }
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  const dataCheckString = Object.keys(authData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${authData[key as keyof TelegramAuthData]}`)
    .join('\n');
  
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return hash === authData.hash;
}

// Middleware для аутентификации через Telegram
export const verifyTelegramAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      res.status(401).json({
        success: false,
        error: 'Отсутствуют данные аутентификации Telegram',
      });
      return;
    }
    
    // Парсим данные от Telegram
    const authData = parseTelegramData(initData);
    
    // Проверяем подпись
    if (!verifyTelegramSignature(authData)) {
      res.status(401).json({
        success: false,
        error: 'Неверная подпись Telegram',
      });
      return;
    }
    
    // Проверяем время (не старше 24 часов)
    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 86400) {
      res.status(401).json({
        success: false,
        error: 'Данные аутентификации устарели',
      });
      return;
    }
    
    // Находим или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(authData.id) }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(authData.id),
          firstName: authData.first_name,
          lastName: authData.last_name || null,
          username: authData.username || null,
        }
      });
      
      logger.info('Создан новый пользователь', { 
        userId: user.id,
        telegramId: authData.id,
        firstName: authData.first_name 
      });
    } else {
      // Обновляем данные пользователя если они изменились
      if (user.firstName !== authData.first_name || 
          user.lastName !== authData.last_name || 
          user.username !== authData.username) {
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: authData.first_name,
            lastName: authData.last_name || null,
            username: authData.username || null,
          }
        });
        
        logger.info('Обновлены данные пользователя', { 
          userId: user.id,
          telegramId: authData.id 
        });
      }
    }
    
    // Проверяем активность пользователя
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Аккаунт заблокирован',
      });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Ошибка аутентификации Telegram', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    res.status(401).json({
      success: false,
      error: 'Ошибка аутентификации',
    });
  }
};

// Опциональная аутентификация (для публичных endpoints)
export const optionalTelegramAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      // Если нет данных аутентификации, продолжаем без пользователя
      next();
      return;
    }
    
    // Парсим данные от Telegram
    const authData = parseTelegramData(initData);
    
    // Проверяем подпись
    if (!verifyTelegramSignature(authData)) {
      // Если подпись неверная, продолжаем без пользователя
      next();
      return;
    }
    
    // Проверяем время (не старше 24 часов)
    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 86400) {
      // Если данные устарели, продолжаем без пользователя
      next();
      return;
    }
    
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(authData.id) }
    });
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    logger.error('Ошибка опциональной аутентификации Telegram', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    // В случае ошибки продолжаем без пользователя
    next();
  }
};