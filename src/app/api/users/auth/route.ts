import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Аутентификация пользователя...');
    const { telegramId, firstName, lastName, username } = await request.json();
    
    if (!telegramId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram ID обязателен' 
      }, { status: 400 });
    }

    // Ищем существующего пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) {
      // Создаем нового пользователя
      console.log('👤 Создаем нового пользователя:', { telegramId, firstName, lastName, username });
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          firstName: firstName || 'Пользователь',
          lastName: lastName || null,
          username: username || null
        }
      });
      console.log('✅ Пользователь создан:', user.id);
    } else {
      console.log('✅ Пользователь найден:', user.id);
    }

    // Сериализуем BigInt для JSON
    const serializedUser = {
      ...user,
      telegramId: user.telegramId.toString()
    };

    return NextResponse.json({
      success: true,
      data: serializedUser
    });
  } catch (error) {
    console.error('❌ Ошибка аутентификации:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка аутентификации'
    }, { status: 500 });
  }
}
