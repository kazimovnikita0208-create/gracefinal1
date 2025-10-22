// Webhook endpoint для Vercel
export default async function handler(req, res) {
  console.log('📨 VERCEL WEBHOOK: Получен запрос', req.method, req.url);
  console.log('📨 VERCEL WEBHOOK: Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📨 VERCEL WEBHOOK: Body:', JSON.stringify(req.body, null, 2));
  
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('📨 VERCEL WEBHOOK: Обрабатываем OPTIONS');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('📨 VERCEL WEBHOOK: Неверный метод', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('📨 VERCEL WEBHOOK: Обрабатываем POST запрос...');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('📨 VERCEL WEBHOOK: Bot token exists:', !!botToken);
    
    if (!botToken) {
      console.error('❌ VERCEL WEBHOOK: TELEGRAM_BOT_TOKEN не найден');
      res.status(500).json({ error: 'Bot token not found' });
      return;
    }
    
    // Обрабатываем сообщения
    if (req.body.message) {
      const message = req.body.message;
      console.log('💬 VERCEL WEBHOOK: Найдено сообщение:', message.text);
      console.log('💬 VERCEL WEBHOOK: От пользователя:', message.from.first_name);
      
      let responseText = '';
      let replyMarkup = null;
      
      if (message.text === '/start') {
        responseText = '🌟 Добро пожаловать в Grace Beauty Salon!\n\n✨ Мы предлагаем:\n• Маникюр и педикюр\n• Массаж и SPA\n• Косметологические услуги\n• Ногтевой дизайн\n\n📱 Нажмите /app чтобы открыть приложение для записи!';
        console.log('💬 VERCEL WEBHOOK: Обрабатываем /start');
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
        console.log('💬 VERCEL WEBHOOK: Обрабатываем /app');
      } else if (message.text === '/help') {
        responseText = '🆘 Помощь по боту:\n\n/start - Начать работу с ботом\n/app - Открыть приложение для записи\n/help - Показать эту справку\n\n💬 По вопросам звоните: +7 (XXX) XXX-XX-XX';
        console.log('💬 VERCEL WEBHOOK: Обрабатываем /help');
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
        console.log('💬 VERCEL WEBHOOK: Обрабатываем обычное сообщение');
      }
      
      // Отправляем ответ в Telegram
      console.log('📤 VERCEL WEBHOOK: Отправляем ответ в Telegram...');
      console.log('📤 VERCEL WEBHOOK: Chat ID:', message.chat.id);
      console.log('📤 VERCEL WEBHOOK: Response text:', responseText);
      
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
      console.log('📤 VERCEL WEBHOOK: Ответ от Telegram API:', JSON.stringify(telegramResult, null, 2));
      
      if (telegramResult.ok) {
        console.log('✅ VERCEL WEBHOOK: Сообщение отправлено успешно!');
        res.status(200).json({ success: true, telegramResult });
      } else {
        console.error('❌ VERCEL WEBHOOK: Ошибка отправки сообщения:', telegramResult);
        res.status(500).json({ error: 'Failed to send message', details: telegramResult });
      }
    } else {
      console.log('📨 VERCEL WEBHOOK: Сообщение не найдено в теле запроса');
      res.status(200).json({ success: true, message: 'No message found' });
    }
    
  } catch (error) {
    console.error('❌ VERCEL WEBHOOK: Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
