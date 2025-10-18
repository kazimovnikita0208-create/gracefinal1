const { Telegraf } = require('telegraf');

const bot = new Telegraf('7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k');

// URL будет обновлен после запуска localtunnel
let webAppUrl = 'https://your-localtunnel-url.loca.lt';

// Команда /start
bot.start((ctx) => {
  ctx.reply('👋 Добро пожаловать в Grace Beauty Salon!\n\n🔧 Используем localtunnel для тестирования:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🏠 Открыть приложение',
          web_app: { url: webAppUrl }
        }],
        [{
          text: '🌐 Открыть в браузере',
          url: webAppUrl
        }]
      ]
    }
  });
});

// Команда /help
bot.help((ctx) => {
  ctx.reply('🆘 Доступные команды:\n/start - Начать работу\n/help - Помощь\n/url - Показать текущий URL\n/update - Обновить URL');
});

// Команда /url
bot.command('url', (ctx) => {
  ctx.reply(`🔗 Текущий URL: ${webAppUrl}\n\nДля обновления используйте /update`);
});

// Команда /update
bot.command('update', (ctx) => {
  ctx.reply('📝 Отправьте новый URL в формате:\n/update https://abc123.loca.lt');
});

// Обработка обновления URL
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith('https://') && text.includes('.loca.lt')) {
    webAppUrl = text;
    ctx.reply(`✅ URL обновлен: ${webAppUrl}`);
  }
});

// Команда /app
bot.command('app', (ctx) => {
  ctx.reply('🚀 Открываю приложение Grace...', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '💄 Grace Beauty Salon',
          web_app: { url: webAppUrl }
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
  console.log('🔧 После запуска localtunnel обновите URL командой /update');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

