// Простой скрипт для настройки webhook
const https = require('https');

const BOT_TOKEN = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';
const WEBHOOK_URL = 'https://gracefinal-lg88dbcty-nikitas-projects-1742d776.vercel.app/api/telegram/webhook';

console.log('🚀 Настраиваем webhook...');
console.log('🤖 Токен бота:', BOT_TOKEN);
console.log('🌐 Webhook URL:', WEBHOOK_URL);

const postData = JSON.stringify({
  url: WEBHOOK_URL
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/setWebhook`,
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
    console.log('✅ Webhook установлен!');
    console.log('📊 Ответ:', data);
    
    // Проверяем информацию о webhook
    console.log('🔍 Проверяем информацию о webhook...');
    const infoOptions = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/getWebhookInfo`,
      method: 'GET'
    };
    
    const infoReq = https.request(infoOptions, (infoRes) => {
      let infoData = '';
      infoRes.on('data', (chunk) => {
        infoData += chunk;
      });
      
      infoRes.on('end', () => {
        console.log('📋 Информация о webhook:', infoData);
        console.log('🎉 БОТ ГОТОВ! ОТПРАВЬТЕ /start БОТУ!');
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
