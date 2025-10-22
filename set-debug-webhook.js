// Устанавливаем отладочный webhook
const https = require('https');

const botToken = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';
const webhookUrl = 'https://gracefinal-cvrxm9u6v-nikitas-projects-1742d776.vercel.app/api/debug-webhook';

console.log('🔍 Устанавливаем отладочный webhook...');
console.log('🤖 Токен бота:', botToken);
console.log('🌐 Отладочный Webhook URL:', webhookUrl);

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
    console.log('✅ Отладочный webhook установлен!');
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
        console.log('🔍 ТЕПЕРЬ ОТПРАВЬТЕ /start БОТУ И МЫ УВИДИМ ДЕТАЛЬНЫЕ ЛОГИ!');
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


