import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../app';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

// Расширяем Request для добавления пользователя
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
  last_name?: string;
  username?: string;
  auth_date: number;
  hash: string;
}

// Парсинг данных от Telegram
function parseTelegramData(initData: string): TelegramAuthData {
  const params = new URLSearchParams(initData);
  
  return {
    id: parseInt(params.get('user') ? JSON.parse(params.get('user')!).id : '0'),
    first_name: params.get('user') ? JSON.parse(params.get('user')!).first_name : '',
    last_name: params.get('user') ? JSON.parse(params.get('user')!).last_name : undefined,
    username: params.get('user') ? JSON.parse(params.get('user')!).username : undefined,
    auth_date: parseInt(params.get('auth_date') || '0'),
    hash: params.get('hash') || '',
  };
}

// Проверка подписи Telegram
function verifyTelegramSignature(authData: TelegramAuthData, initData: string): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    logger.error('TELEGRAM_BOT_TOKEN не установлен');
    return false;
  }

  // Создаем secret key из bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Создаем data check string
  const dataCheckString = initData
    .split('&')
    .filter(param => !param.startsWith('hash='))
    .sort()
    .join('\n');
  
  // Вычисляем hash
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
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({
        success: false,
        error: 'Отсутствуют данные аутентификации Telegram',
      });
    }

    // Парсим данные от Telegram
    const authData = parseTelegramData(initData);
    
    // Проверяем подпись
    if (!verifyTelegramSignature(authData, initData)) {
      logger.warn('Неверная подпись Telegram', { 
        telegramId: authData.id,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        error: 'Неверная подпись Telegram',
      });
    }
    
    // Проверяем время (не старше 24 часов)
    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 86400) {
      logger.warn('Данные аутентификации устарели', { 
        telegramId: authData.id,
        authDate: authData.auth_date,
        now 
      });
      return res.status(401).json({
        success: false,
        error: 'Данные аутентификации устарели',
      });
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
          lastName: authData.last_name,
          username: authData.username,
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
            lastName: authData.last_name,
            username: authData.username,
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
      return res.status(403).json({
        success: false,
        error: 'Аккаунт заблокирован',
      });
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
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      // Если нет данных аутентификации, продолжаем без пользователя
      return next();
    }

    // Пытаемся аутентифицировать
    await verifyTelegramAuth(req, res, next);
  } catch (error) {
    // В случае ошибки продолжаем без аутентификации
    next();
  }
};


