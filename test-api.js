// Простой тест API
const http = require('http');

function testAPI() {
  console.log('🧪 Тестирование API...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Статус: ${res.statusCode}`);
    console.log(`📊 Заголовки:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Ответ:', data);
      console.log('\n🎉 API работает!');
    });
  });

  req.on('error', (err) => {
    console.error('❌ Ошибка:', err.message);
  });

  req.end();
}

testAPI();



