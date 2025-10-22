// Скрипт для проверки локального API подключения
const http = require('http');

// Тестируем API endpoint для мастеров
const options = {
  hostname: 'localhost',
  port: 3334,
  path: '/api/masters',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🔍 Тестируем локальный API endpoint для мастеров...');
console.log('🌐 URL:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
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