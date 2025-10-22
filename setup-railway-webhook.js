// Скрипт для настройки webhook после развертывания на Railway
const https = require('https');

const botToken = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';

// Замените на ваш Railway URL после развертывания
const railwayUrl = process.argv[2];

if (!railwayUrl) {
  console.log('❌ Ошибка: Укажите Railway URL');
  console.log('Использование: node setup-railway-webhook.js https://your-project.railway.app');
  process.exit(1);
}

const webhookUrl = `${railwayUrl}/webhook`;

console.log('🚀 Настраиваем webhook для Railway...');
console.log('🤖 Токен бота:', botToken);
console.log('🌐 Railway URL:', railwayUrl);
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
    console.log('🔧 Устанавливаем новый webhook для Railway...');
    
    const postData = JSON.stringify({
      url: webhookUrl
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
        console.log('✅ Webhook установлен для Railway!');
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
                console.log('🎉 БОТ НА RAILWAY ГОТОВ! ОТПРАВЬТЕ /start БОТУ!');
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


