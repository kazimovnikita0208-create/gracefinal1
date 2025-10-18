// Простой тест подключения к API
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Тестируем подключение к API...');
    
    // Тест health check
    console.log('1️⃣ Тестируем health check...');
    const healthResponse = await fetch('http://localhost:3334/health');
    console.log('Health check статус:', healthResponse.status);
    
    // Тест админ API
    console.log('2️⃣ Тестируем админ API...');
    const mastersResponse = await fetch('http://localhost:3334/api/admin/masters');
    console.log('Masters API статус:', mastersResponse.status);
    
    if (mastersResponse.ok) {
      const data = await mastersResponse.json();
      console.log('📊 Данные мастеров:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Ошибка API:', mastersResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

testAPI().catch(console.error);
