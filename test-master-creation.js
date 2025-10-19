// Тест создания мастера
const fetch = require('node-fetch');

async function testCreateMaster() {
  try {
    console.log('🧪 Тестируем создание мастера...');
    
    const response = await fetch('http://localhost:3335/api/admin/masters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Тестовый мастер',
        specialization: 'Тестовая специализация',
        experience: 5,
        description: 'Тестовое описание'
      })
    });
    
    console.log('Статус ответа:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Мастер создан:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Ошибка:', error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

testCreateMaster();



