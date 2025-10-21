const https = require('https');

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/telegram-webhook`
  : 'https://gracefinal1.vercel.app/api/telegram-webhook';

console.log('🤖 Настройка Telegram Webhook...');
console.log('🔗 Webhook URL:', WEBHOOK_URL);

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

// Функция для настройки webhook
async function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  const data = JSON.stringify({
    url: WEBHOOK_URL,
    allowed_updates: ['message', 'callback_query']
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('📡 Ответ от Telegram API:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Ошибка парсинга ответа:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Функция для получения информации о webhook
async function getWebhookInfo() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('📊 Информация о webhook:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Ошибка парсинга ответа:', error);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Ошибка запроса:', error);
      reject(error);
    });
  });
}

// Основная функция
async function main() {
  try {
    console.log('🔍 Проверяем текущий webhook...');
    await getWebhookInfo();
    
    console.log('🔧 Настраиваем новый webhook...');
    const result = await setWebhook();
    
    if (result.ok) {
      console.log('✅ Webhook успешно настроен!');
      console.log('🌐 URL:', WEBHOOK_URL);
    } else {
      console.error('❌ Ошибка настройки webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем только если это основной модуль
if (require.main === module) {
  main();
}

module.exports = { setWebhook, getWebhookInfo };
