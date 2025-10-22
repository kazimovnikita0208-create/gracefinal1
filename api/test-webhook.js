// Простой тестовый webhook для диагностики
export default async function handler(req, res) {
  console.log('🧪 TEST WEBHOOK: Получен запрос', req.method, req.url);
  console.log('🧪 TEST WEBHOOK: Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🧪 TEST WEBHOOK: Body:', JSON.stringify(req.body, null, 2));
  console.log('🧪 TEST WEBHOOK: Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
  
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('🧪 TEST WEBHOOK: Обрабатываем POST запрос...');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('❌ TEST WEBHOOK: TELEGRAM_BOT_TOKEN не найден');
      res.status(500).json({ error: 'Bot token not found' });
      return;
    }
    
    // Простой ответ на любое сообщение
    if (req.body.message) {
      const message = req.body.message;
      console.log('💬 TEST WEBHOOK: Найдено сообщение:', message.text);
      console.log('💬 TEST WEBHOOK: От пользователя:', message.from.first_name);
      
      const responseText = `🧪 TEST: Получено сообщение "${message.text}" от ${message.from.first_name}`;
      
      console.log('📤 TEST WEBHOOK: Отправляем ответ в Telegram...');
      
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: responseText
        })
      });
      
      const telegramResult = await telegramResponse.json();
      console.log('📤 TEST WEBHOOK: Ответ от Telegram API:', JSON.stringify(telegramResult, null, 2));
      
      if (telegramResult.ok) {
        console.log('✅ TEST WEBHOOK: Сообщение отправлено успешно!');
        res.status(200).json({ success: true, telegramResult });
      } else {
        console.error('❌ TEST WEBHOOK: Ошибка отправки сообщения:', telegramResult);
        res.status(500).json({ error: 'Failed to send message', details: telegramResult });
      }
    } else {
      console.log('🧪 TEST WEBHOOK: Сообщение не найдено в теле запроса');
      res.status(200).json({ success: true, message: 'No message found' });
    }
    
  } catch (error) {
    console.error('❌ TEST WEBHOOK: Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}