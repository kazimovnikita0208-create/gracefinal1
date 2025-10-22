// Скрипт для настройки webhook в Telegram для Vercel
const https = require('https');

// Получаем токен и URL из аргументов командной строки или переменных окружения
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];
const vercelUrl = process.env.VERCEL_URL || process.argv[3];

if (!botToken) {
  console.error('❌ Ошибка: Не указан токен бота!');
  console.log('Использование: node scripts/setup-vercel-webhook.js <BOT_TOKEN> <VERCEL_URL>');
  console.log('Или установите переменные окружения TELEGRAM_BOT_TOKEN и VERCEL_URL');
  process.exit(1);
}

if (!vercelUrl) {
  console.error('❌ Ошибка: Не указан URL Vercel!');
  console.log('Использование: node scripts/setup-vercel-webhook.js <BOT_TOKEN> <VERCEL_URL>');
  console.log('Или установите переменные окружения TELEGRAM_BOT_TOKEN и VERCEL_URL');
  process.exit(1);
}

// Формируем URL webhook
const webhookUrl = `https://${vercelUrl}/api/telegram/webhook`;

console.log('🚀 Настраиваем webhook для Telegram бота на Vercel...');
console.log('🤖 Токен бота:', botToken);
console.log('🌐 Vercel URL:', vercelUrl);
console.log('🔗 Webhook URL:', webhookUrl);

// Сначала удаляем старый webhook
console.log('🗑️ Удаляем старый webhook...');
const deleteOptions = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${botToken}/deleteWebhook`,
  method: 'POST'
};

const deleteReq = https.request(deleteOptions, (deleteRes) => {
  let deleteData = '';
  deleteRes.on('data', (chunk) => {
    deleteData += chunk;
  });
  
  deleteRes.on('end', () => {
    console.log('🗑️ Старый webhook удален:', deleteData);
    
    // Теперь устанавливаем новый webhook
    console.log('🔧 Устанавливаем новый webhook для Vercel...');
    
    const postData = JSON.stringify({
      url: webhookUrl,
      drop_pending_updates: true // Опционально: удаляем накопившиеся обновления
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/setWebhook`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📊 Статус установки webhook: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Webhook установлен для Vercel!');
        console.log('📊 Ответ:', data);
        
        // Проверяем информацию о webhook
        console.log('🔍 Проверяем информацию о webhook...');
        const infoOptions = {
          hostname: 'api.telegram.org',
          port: 443,
          path: `/bot${botToken}/getWebhookInfo`,
          method: 'GET'
        };
        
        const infoReq = https.request(infoOptions, (infoRes) => {
          let infoData = '';
          infoRes.on('data', (chunk) => {
            infoData += chunk;
          });
          
          infoRes.on('end', () => {
            console.log('📋 Информация о webhook:', infoData);
            
            try {
              const webhookInfo = JSON.parse(infoData);
              if (webhookInfo.ok) {
                console.log('🎯 Webhook URL:', webhookInfo.result.url);
                console.log('📊 Pending updates:', webhookInfo.result.pending_update_count);
                if (webhookInfo.result.last_error_message) {
                  console.log('⚠️ Последняя ошибка:', webhookInfo.result.last_error_message);
                } else {
                  console.log('✅ Нет ошибок в webhook!');
                }
                console.log('🎉 БОТ НА VERCEL ГОТОВ! ОТПРАВЬТЕ /start БОТУ!');
              }
            } catch (e) {
              console.log('❌ Ошибка парсинга webhook info:', e.message);
            }
          });
        });
        
        infoReq.on('error', (err) => {
          console.error('❌ Ошибка получения информации о webhook:', err.message);
        });
        
        infoReq.end();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Ошибка установки webhook:', err.message);
    });

    req.write(postData);
    req.end();
  });
});

deleteReq.on('error', (err) => {
  console.error('❌ Ошибка удаления webhook:', err.message);
});

deleteReq.end();
