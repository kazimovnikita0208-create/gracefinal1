// Скрипт для проверки токена бота
const https = require('https');

const BOT_TOKEN = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';

console.log('🔍 Проверяем токен бота...');
console.log('🤖 Токен:', BOT_TOKEN);

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/getMe`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('📊 Статус:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('📋 Ответ от Telegram API:', response);
    
    if (res.statusCode === 200 && response.ok) {
      console.log('✅ Токен работает! Бот:', response.result.first_name);
      console.log('✅ Username бота:', response.result.username);
      console.log('✅ ID бота:', response.result.id);
      
      // Проверяем webhook
      console.log('🔍 Проверяем webhook...');
      const webhookOptions = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/getWebhookInfo`,
        method: 'GET'
      };
      
      const webhookReq = https.request(webhookOptions, (webhookRes) => {
        let webhookData = '';
        webhookRes.on('data', (chunk) => {
          webhookData += chunk;
        });
        
        webhookRes.on('end', () => {
          const webhookInfo = JSON.parse(webhookData);
          console.log('📋 Информация о webhook:', webhookInfo);
          
          if (webhookInfo.ok) {
            console.log('🎯 Webhook URL:', webhookInfo.result.url);
            console.log('📊 Pending updates:', webhookInfo.result.pending_update_count);
            
            if (webhookInfo.result.last_error_message) {
              console.log('⚠️ Последняя ошибка webhook:', webhookInfo.result.last_error_message);
              console.log('⚠️ Время последней ошибки:', new Date(webhookInfo.result.last_error_date * 1000));
            }
          }
        });
      });
      
      webhookReq.on('error', (err) => {
        console.error('❌ Ошибка проверки webhook:', err.message);
      });
      
      webhookReq.end();
    } else {
      console.error('❌ Токен не работает:', response.description || 'Неизвестная ошибка');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Ошибка запроса:', err.message);
});

req.end();
