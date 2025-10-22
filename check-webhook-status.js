// Проверяем статус webhook в Telegram
const https = require('https');

const botToken = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';

console.log('🔍 Проверяем статус webhook в Telegram...');
console.log('🤖 Токен бота:', botToken);

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${botToken}/getWebhookInfo`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`📊 Статус: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Информация о webhook:', data);
    
    try {
      const webhookInfo = JSON.parse(data);
      if (webhookInfo.ok) {
        console.log('🎯 Webhook URL:', webhookInfo.result.url);
        console.log('📊 Pending updates:', webhookInfo.result.pending_update_count);
        console.log('🔗 Has custom certificate:', webhookInfo.result.has_custom_certificate);
        console.log('🌐 IP address:', webhookInfo.result.ip_address);
        
        if (webhookInfo.result.last_error_date) {
          console.log('⚠️ Последняя ошибка дата:', new Date(webhookInfo.result.last_error_date * 1000));
        }
        
        if (webhookInfo.result.last_error_message) {
          console.log('❌ Последняя ошибка:', webhookInfo.result.last_error_message);
        }
        
        if (webhookInfo.result.last_error_date && webhookInfo.result.last_error_message) {
          console.log('🚨 ПРОБЛЕМА: Webhook имеет ошибки!');
        } else {
          console.log('✅ Webhook работает без ошибок');
        }
      } else {
        console.error('❌ Ошибка получения информации о webhook:', webhookInfo.description);
      }
    } catch (e) {
      console.error('❌ Ошибка парсинга ответа:', e.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Ошибка запроса:', err.message);
});

req.end();


