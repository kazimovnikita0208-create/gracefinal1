// Отладочный webhook для диагностики
export default async function handler(req, res) {
  console.log('🔍 DEBUG WEBHOOK - Получен запрос:', req.method, req.url);
  console.log('🔍 DEBUG WEBHOOK - Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 DEBUG WEBHOOK - Body:', JSON.stringify(req.body, null, 2));
  
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
    console.log('🔍 DEBUG WEBHOOK - Обрабатываем POST запрос...');
    
    // Проверяем, есть ли сообщение
    if (req.body.message) {
      const message = req.body.message;
      console.log('🔍 DEBUG WEBHOOK - Найдено сообщение:', JSON.stringify(message, null, 2));
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      console.log('🔍 DEBUG WEBHOOK - Bot token exists:', !!botToken);
      
      if (botToken) {
        // Простой ответ
        const responseText = `🔍 DEBUG: Получено сообщение "${message.text}" от пользователя ${message.from.first_name}`;
        
        console.log('🔍 DEBUG WEBHOOK - Отправляем ответ в Telegram...');
        
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
        console.log('🔍 DEBUG WEBHOOK - Ответ от Telegram API:', JSON.stringify(telegramResult, null, 2));
        
        res.status(200).json({ success: true, telegramResult });
      } else {
        console.log('🔍 DEBUG WEBHOOK - Bot token не найден!');
        res.status(500).json({ error: 'Bot token not found' });
      }
    } else {
      console.log('🔍 DEBUG WEBHOOK - Сообщение не найдено в теле запроса');
      res.status(200).json({ success: true, message: 'No message found' });
    }
    
  } catch (error) {
    console.error('🔍 DEBUG WEBHOOK - Ошибка:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}


