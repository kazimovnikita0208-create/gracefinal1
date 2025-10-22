// Простой webhook endpoint для Railway
const express = require('express');
const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  console.log('📨 WEBHOOK: Получен запрос', req.method, req.url);
  console.log('📨 WEBHOOK: Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📨 WEBHOOK: Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('📨 WEBHOOK: Bot token exists:', !!botToken);
    
    if (!botToken) {
      console.error('❌ WEBHOOK: TELEGRAM_BOT_TOKEN не найден');
      res.status(500).json({ error: 'Bot token not found' });
      return;
    }
    
    // Обрабатываем сообщения
    if (req.body.message) {
      const message = req.body.message;
      console.log('💬 WEBHOOK: Найдено сообщение:', message.text);
      console.log('💬 WEBHOOK: От пользователя:', message.from.first_name);
      
      let responseText = '';
      let replyMarkup = null;
      
      if (message.text === '/start') {
        responseText = '🌟 Добро пожаловать в Grace Beauty Salon!\n\n✨ Мы предлагаем:\n• Маникюр и педикюр\n• Массаж и SPA\n• Косметологические услуги\n• Ногтевой дизайн\n\n📱 Нажмите /app чтобы открыть приложение для записи!';
        console.log('💬 WEBHOOK: Обрабатываем /start');
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
        console.log('💬 WEBHOOK: Обрабатываем /app');
      } else if (message.text === '/help') {
        responseText = '🆘 Помощь по боту:\n\n/start - Начать работу с ботом\n/app - Открыть приложение для записи\n/help - Показать эту справку\n\n💬 По вопросам звоните: +7 (XXX) XXX-XX-XX';
        console.log('💬 WEBHOOK: Обрабатываем /help');
      } else {
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
        console.log('💬 WEBHOOK: Обрабатываем обычное сообщение');
      }
      
      // Отправляем ответ в Telegram
      console.log('📤 WEBHOOK: Отправляем ответ в Telegram...');
      console.log('📤 WEBHOOK: Chat ID:', message.chat.id);
      console.log('📤 WEBHOOK: Response text:', responseText);
      
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
      console.log('📤 WEBHOOK: Ответ от Telegram API:', JSON.stringify(telegramResult, null, 2));
      
      if (telegramResult.ok) {
        console.log('✅ WEBHOOK: Сообщение отправлено успешно!');
        res.status(200).json({ success: true, telegramResult });
      } else {
        console.error('❌ WEBHOOK: Ошибка отправки сообщения:', telegramResult);
        res.status(500).json({ error: 'Failed to send message', details: telegramResult });
      }
    } else {
      console.log('📨 WEBHOOK: Сообщение не найдено в теле запроса');
      res.status(200).json({ success: true, message: 'No message found' });
    }
    
  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Telegram bot webhook is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Telegram bot webhook server running on port ${PORT}`);
});

module.exports = app;


