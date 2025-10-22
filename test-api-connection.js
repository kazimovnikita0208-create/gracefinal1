// Скрипт для проверки API подключения
const https = require('https');

// Тестируем API endpoint для мастеров
const options = {
  hostname: 'gracefinal-m0ntsp5m9-nikitas-projects-1742d776.vercel.app',
  port: 443,
  path: '/api/masters',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🔍 Тестируем API endpoint для мастеров...');
console.log('🌐 URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log('📊 Статус:', res.statusCode);
  console.log('📋 Заголовки:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Ответ получен!');
      console.log('📊 Успех:', response.success);
      
      if (response.data) {
        console.log('📊 Количество мастеров:', response.data.length);
        console.log('📋 Первый мастер:', response.data[0]?.name || 'Нет данных');
      } else {
        console.log('❌ Данные отсутствуют');
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга ответа:', error);
      console.log('📋 Сырой ответ:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Ошибка запроса:', err);
});

req.end();