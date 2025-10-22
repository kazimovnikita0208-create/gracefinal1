// Тест токена бота
const https = require('https');

const botToken = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';

console.log('🔍 Тестируем токен бота...');
console.log('🤖 Токен:', botToken);
console.log('📏 Длина токена:', botToken.length);

// Проверяем, что токен не содержит лишних символов
const cleanToken = botToken.trim();
console.log('🧹 Очищенный токен:', cleanToken);
console.log('📏 Длина очищенного токена:', cleanToken.length);

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${cleanToken}/getMe`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`📊 Статус: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Ответ от Telegram API:', data);
    
    try {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log('✅ Токен работает! Бот:', result.result.first_name);
      } else {
        console.log('❌ Ошибка:', result.description);
      }
    } catch (e) {
      console.log('❌ Ошибка парсинга JSON:', e.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Ошибка запроса:', err.message);
});

req.end();


