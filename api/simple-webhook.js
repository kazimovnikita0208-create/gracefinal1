// Простой webhook без аутентификации для Telegram бота
export default async function handler(req, res) {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обрабатываем OPTIONS запросы
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Только POST запросы
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('📨 Получен webhook от Telegram:', JSON.stringify(req.body, null, 2));
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден');
      res.status(500).json({ error: 'Bot token not found' });
      return;
    }
    
    // Обрабатываем различные типы обновлений
    if (req.body.message) {
      const message = req.body.message;
      console.log('💬 Сообщение:', message.text);
      
      let responseText = '';
      let replyMarkup = null;
      
      // Простой ответ на сообщения
      if (message.text === '/start') {
        responseText = '🌟 Добро пожаловать в Grace Beauty Salon!\n\n✨ Мы предлагаем:\n• Маникюр и педикюр\n• Массаж и SPA\n• Косметологические услуги\n• Ногтевой дизайн\n\n📱 Нажмите /app чтобы открыть приложение для записи!';
      } else if (message.text === '/app') {
        const webAppUrl = 'https://gracefinal1.vercel.app';
          
        responseText = '📱 Открываем приложение для записи...';
        replyMarkup = {
          inline_keyboard: [
            [
              {
                text: '🌟 Записаться на услугу',
                web_app: { url: webAppUrl }
              }
            ]
          ]
        };
      } else if (message.text === '/help') {
        responseText = '🆘 Помощь по боту:\n\n/start - Начать работу с ботом\n/app - Открыть приложение для записи\n/help - Показать эту справку\n\n💬 По вопросам звоните: +7 (XXX) XXX-XX-XX';
      } else {
        // Ответ на любое другое сообщение
        responseText = '👋 Спасибо за сообщение!\n\nДля записи на услугу используйте команду /app\nИли нажмите кнопку ниже:';
        replyMarkup = {
          inline_keyboard: [
            [
              {
                text: '📱 Открыть приложение',
                web_app: { url: 'https://gracefinal1.vercel.app' }
              }
            ]
          ]
        };
      }
      
      // Отправляем сообщение в Telegram
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: responseText,
          reply_markup: replyMarkup
        })
      });
      
      const telegramResult = await telegramResponse.json();
      console.log('📤 Ответ отправлен в Telegram:', telegramResult);
      
      res.status(200).json({ success: true, telegramResult });
    }
    
    // Обрабатываем callback_query (нажатия на кнопки)
    if (req.body.callback_query) {
      const callback = req.body.callback_query;
      console.log('🔘 Callback query:', callback.data);
      
      // Отвечаем на callback query
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callback.id,
          text: '✅ Обработано!'
        })
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


