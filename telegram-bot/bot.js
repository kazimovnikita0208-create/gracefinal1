const { Telegraf } = require('telegraf');

const bot = new Telegraf('7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k');

// Команда /start
bot.start((ctx) => {
  ctx.reply('👋 Добро пожаловать в Grace Beauty Salon!', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🏠 Открыть приложение',
          web_app: { url: 'https://gracefinal.vercel.app' }
        }]
      ]
    }
  });
});

// Команда /help
bot.help((ctx) => {
  ctx.reply('🆘 Доступные команды:\n/start - Начать работу\n/help - Помощь\n/app - Открыть приложение');
});

// Команда /app
bot.command('app', (ctx) => {
  ctx.reply('🚀 Открываю приложение Grace...', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '💄 Grace Beauty Salon',
          web_app: { url: 'https://gracefinal.vercel.app' }
        }]
      ]
    }
  });
});

// Обработка WebApp данных
bot.on('web_app_data', (ctx) => {
  const data = ctx.webAppData.data;
  console.log('Получены данные от WebApp:', data);
  ctx.reply('✅ Данные получены! Спасибо за использование приложения.');
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
bot.launch().then(() => {
  console.log('🤖 Бот запущен!');
  console.log('📱 Отправьте /start боту для тестирования');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
