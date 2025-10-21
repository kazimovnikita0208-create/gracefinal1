import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

// Создаем экземпляр бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply(
    '🌟 Добро пожаловать в Grace Beauty Salon!\n\n' +
    '✨ Мы предлагаем:\n' +
    '• Маникюр и педикюр\n' +
    '• Массаж и SPA\n' +
    '• Косметологические услуги\n' +
    '• Ногтевой дизайн\n\n' +
    '📱 Нажмите /app чтобы открыть приложение для записи!'
  );
});

// Обработчик команды /help
bot.help((ctx) => {
  ctx.reply(
    '🆘 Помощь по боту:\n\n' +
    '/start - Начать работу с ботом\n' +
    '/app - Открыть приложение для записи\n' +
    '/help - Показать эту справку\n\n' +
    '💬 По вопросам звоните: +7 (XXX) XXX-XX-XX'
  );
});

// Обработчик команды /app
bot.command('app', (ctx) => {
  const webAppUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://gracefinal1.vercel.app';
    
  ctx.reply(
    '📱 Открываем приложение для записи...',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌟 Записаться на услугу',
              web_app: { url: webAppUrl }
            }
          ]
        ]
      }
    }
  );
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  ctx.reply(
    '👋 Спасибо за сообщение!\n\n' +
    'Для записи на услугу используйте команду /app\n' +
    'Или нажмите кнопку ниже:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Открыть приложение',
              web_app: { url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gracefinal1.vercel.app' }
            }
          ]
        ]
      }
    }
  );
});

// Обработчик Web App данных
bot.on('web_app_data', (ctx) => {
  const data = ctx.webAppData;
  ctx.reply('✅ Данные получены! Спасибо за использование приложения.');
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('❌ Ошибка бота:', err);
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
});

// Функция для запуска бота
async function startBot() {
  try {
    await bot.launch();
    console.log('✅ Telegram бот запущен на Vercel!');
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
  }
}

// Запускаем бота при инициализации
startBot();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Обрабатываем webhook от Telegram
    if (body.message) {
      await bot.handleUpdate(body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telegram bot API endpoint is running' 
  });
}
