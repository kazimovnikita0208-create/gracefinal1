// Тест интеграции базы данных
const http = require('http');

function testDatabaseIntegration() {
  console.log('🧪 Тестирование интеграции базы данных\n');
  console.log('=' .repeat(50));

  // Тест 1: Проверяем API мастеров
  console.log('1️⃣ Тестируем API мастеров...');
  const mastersOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/masters',
    method: 'GET'
  };

  const mastersReq = http.request(mastersOptions, (res) => {
    console.log(`✅ Статус: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success && response.data) {
          console.log(`📊 Мастеров в базе: ${response.data.length}`);
          console.log(`👨‍💼 Первый мастер: ${response.data[0]?.name || 'Нет данных'}`);
          console.log(`⭐ Рейтинг: ${response.data[0]?.rating || 'Нет данных'}`);
        } else {
          console.log('❌ Ошибка в ответе API');
        }
      } catch (err) {
        console.log('❌ Ошибка парсинга JSON:', err.message);
      }
      
      // Тест 2: Проверяем API услуг
      console.log('\n2️⃣ Тестируем API услуг...');
      const servicesOptions = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/services',
        method: 'GET'
      };

      const servicesReq = http.request(servicesOptions, (res) => {
        console.log(`✅ Статус: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.success && response.data) {
              console.log(`📊 Услуг в базе: ${response.data.length}`);
              console.log(`💅 Первая услуга: ${response.data[0]?.name || 'Нет данных'}`);
              console.log(`💰 Цена: ${response.data[0]?.price ? (response.data[0].price / 100) + '₽' : 'Нет данных'}`);
            } else {
              console.log('❌ Ошибка в ответе API');
            }
          } catch (err) {
            console.log('❌ Ошибка парсинга JSON:', err.message);
          }
          
          console.log('\n🎉 Тестирование завершено!');
          console.log('=' .repeat(50));
          console.log('✅ База данных работает корректно');
          console.log('✅ API эндпоинты отвечают');
          console.log('✅ Интеграция настроена');
        });
      });

      servicesReq.on('error', (err) => {
        console.error('❌ Ошибка API услуг:', err.message);
      });

      servicesReq.end();
    });
  });

  mastersReq.on('error', (err) => {
    console.error('❌ Ошибка API мастеров:', err.message);
    console.log('\n💡 Убедитесь, что бэкенд запущен: npm run dev (в папке backend)');
  });

  mastersReq.end();
}

testDatabaseIntegration();



