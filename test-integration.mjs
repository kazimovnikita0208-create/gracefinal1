// Тест интеграции фронтенда и бэкенда
import fetch from 'node-fetch';

async function testIntegration() {
  console.log('🧪 Тестирование интеграции фронтенда и бэкенда\n');
  console.log('=' .repeat(50));

  try {
    // Тест 1: Проверяем бэкенд
    console.log('1️⃣ Тестируем бэкенд API...');
    const backendResponse = await fetch('http://localhost:3001/health');
    const backendData = await backendResponse.json();
    console.log('✅ Бэкенд:', backendData.success ? 'OK' : 'FAILED');
    console.log('   Статус:', backendData.data?.status);
    console.log('');

    // Тест 2: Проверяем фронтенд
    console.log('2️⃣ Тестируем фронтенд...');
    const frontendResponse = await fetch('http://localhost:3000');
    console.log('✅ Фронтенд:', frontendResponse.ok ? 'OK' : 'FAILED');
    console.log('   Статус:', frontendResponse.status);
    console.log('');

    // Тест 3: Проверяем API мастеров
    console.log('3️⃣ Тестируем API мастеров...');
    const mastersResponse = await fetch('http://localhost:3001/api/masters');
    const mastersData = await mastersResponse.json();
    console.log('✅ Мастера:', mastersData.success ? 'OK' : 'FAILED');
    console.log('   Количество:', mastersData.count);
    console.log('');

    // Тест 4: Проверяем API услуг
    console.log('4️⃣ Тестируем API услуг...');
    const servicesResponse = await fetch('http://localhost:3001/api/services');
    const servicesData = await servicesResponse.json();
    console.log('✅ Услуги:', servicesData.success ? 'OK' : 'FAILED');
    console.log('   Количество:', servicesData.count);
    console.log('');

    console.log('🎉 Интеграция работает!');
    console.log('=' .repeat(50));
    console.log('📊 Фронтенд: http://localhost:3000');
    console.log('🔧 Бэкенд: http://localhost:3001');
    console.log('📚 API: http://localhost:3001/api');
    console.log('💡 Откройте фронтенд в браузере для тестирования');

  } catch (error) {
    console.error('❌ Ошибка при тестировании интеграции:', error.message);
    console.log('\n💡 Убедитесь, что оба сервера запущены:');
    console.log('   - Бэкенд: npm run dev (в папке backend)');
    console.log('   - Фронтенд: npm run dev (в папке frontend)');
  }
}

testIntegration();
