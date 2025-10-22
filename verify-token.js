// Скрипт для проверки токена бота и отправки тестового сообщения
const https = require('https');

// Токен бота
const BOT_TOKEN = '7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU';
// Ваш Telegram ID (из логов)
const CHAT_ID = 621447493;

console.log('🔍 Проверяем токен бота...');
console.log('🤖 Токен:', BOT_TOKEN);

// Шаг 1: Проверяем токен через getMe
const getMeOptions = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/getMe`,
  method: 'GET'
};

const getMeReq = https.request(getMeOptions, (res) => {
  console.log('📊 Статус getMe:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📋 Ответ от getMe:', response);
      
      if (res.statusCode === 200 && response.ok) {
        console.log('✅ Токен работает! Бот:', response.result.first_name);
        console.log('✅ Username бота:', response.result.username);
        console.log('✅ ID бота:', response.result.id);
        
        // Шаг 2: Отправляем тестовое сообщение
        console.log('📤 Отправляем тестовое сообщение...');
        
        const message = {
          chat_id: CHAT_ID,
          text: '🧪 Это тестовое сообщение от скрипта verify-token.js.\n\nЕсли вы видите это сообщение, значит токен бота работает корректно!'
        };
        
        const sendMessageOptions = {
          hostname: 'api.telegram.org',
          port: 443,
          path: `/bot${BOT_TOKEN}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(message))
          }
        };
        
        const sendMessageReq = https.request(sendMessageOptions, (sendRes) => {
          console.log('📊 Статус sendMessage:', sendRes.statusCode);
          
          let sendData = '';
          sendRes.on('data', (chunk) => {
            sendData += chunk;
          });
          
          sendRes.on('end', () => {
            try {
              const sendResponse = JSON.parse(sendData);
              console.log('📋 Ответ от sendMessage:', sendResponse);
              
              if (sendRes.statusCode === 200 && sendResponse.ok) {
                console.log('✅ Тестовое сообщение отправлено успешно!');
                console.log('✅ Message ID:', sendResponse.result.message_id);
              } else {
                console.error('❌ Ошибка отправки тестового сообщения:', sendResponse.description || 'Неизвестная ошибка');
              }
            } catch (e) {
              console.error('❌ Ошибка парсинга ответа sendMessage:', e.message);
            }
          });
        });
        
        sendMessageReq.on('error', (err) => {
          console.error('❌ Ошибка запроса sendMessage:', err.message);
        });
        
        sendMessageReq.write(JSON.stringify(message));
        sendMessageReq.end();
        
      } else {
        console.error('❌ Токен не работает:', response.description || 'Неизвестная ошибка');
      }
    } catch (e) {
      console.error('❌ Ошибка парсинга ответа getMe:', e.message);
    }
  });
});

getMeReq.on('error', (err) => {
  console.error('❌ Ошибка запроса getMe:', err.message);
});

getMeReq.end();
