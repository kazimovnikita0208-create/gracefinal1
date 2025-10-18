const { Telegraf } = require('telegraf');

const bot = new Telegraf('7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k');

// Команда /start
bot.start((ctx) => {
  ctx.reply('👋 Добро пожаловать в Grace Beauty Salon!\n\n🔧 Для тестирования используйте локальную версию:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🌐 Открыть в браузере',
          url: 'http://localhost:3000'
        }],
        [{
          text: '📱 WebApp (требует ngrok)',
          web_app: { url: 'https://your-ngrok-url.ngrok.io' }
        }]
      ]
    }
  });
});

// Команда /help
bot.help((ctx) => {
  ctx.reply('🆘 Доступные команды:\n/start - Начать работу\n/help - Помощь\n/local - Локальное тестирование\n/ngrok - Инструкции по ngrok');
});

// Команда /local
bot.command('local', (ctx) => {
  ctx.reply('🔧 Локальное тестирование:\n\n1. Убедитесь, что приложение запущено: npm run dev\n2. Откройте http://localhost:3000 в браузере\n3. Для полного тестирования Telegram WebApp нужен ngrok', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🌐 Открыть приложение',
          url: 'http://localhost:3000'
        }]
      ]
    }
  });
});

// Команда /ngrok
bot.command('ngrok', (ctx) => {
  ctx.reply('📋 Настройка ngrok:\n\n1. Зарегистрируйтесь: https://dashboard.ngrok.com/signup\n2. Получите токен: https://dashboard.ngrok.com/get-started/your-authtoken\n3. Настройте: npx ngrok config add-authtoken YOUR_TOKEN\n4. Запустите: npx ngrok http 3000\n5. Обновите URL в боте');
});

// Команда /app
bot.command('app', (ctx) => {
  ctx.reply('🚀 Выберите способ тестирования:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🌐 Браузер (локально)',
          url: 'http://localhost:3000'
        }],
        [{
          text: '📱 Telegram WebApp',
          web_app: { url: 'https://your-ngrok-url.ngrok.io' }
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
  console.log('🔧 Для локального тестирования используйте /local');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

