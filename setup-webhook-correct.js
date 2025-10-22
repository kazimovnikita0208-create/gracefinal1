// Настраиваем webhook с правильным токеном
const https = require('https');

const botToken = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';
const webhookUrl = 'https://gracefinal-dfrnxvpvr-nikitas-projects-1742d776.vercel.app/api/telegram-webhook-final';

console.log('🚀 Настраиваем webhook с правильным токеном...');
console.log('🤖 Токен бота:', botToken);
console.log('🌐 Webhook URL:', webhookUrl);

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
  console.log(`📊 Статус: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Webhook настроен!');
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
            }
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
  console.error('❌ Ошибка настройки webhook:', err.message);
});

req.write(postData);
req.end();


