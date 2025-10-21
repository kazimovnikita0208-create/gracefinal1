import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    
    if (!telegramId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram ID обязателен' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
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
    console.error('❌ Ошибка получения пользователя:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения пользователя'
    }, { status: 500 });
  }
}
