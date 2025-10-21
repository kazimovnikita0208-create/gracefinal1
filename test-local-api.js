// Тестовый скрипт для проверки локального API
const API_BASE_URL = 'http://localhost:3001/api';

async function testLocalAPI() {
  console.log('🧪 Тестируем локальный API...\n');

  try {
    // Тест 1: Проверка health endpoint
    console.log('1️⃣ Тестируем health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('📋 Health response:', healthData);

    if (healthData.status === 'ok') {
      console.log('✅ API работает!');
    } else {
      console.log('❌ API не работает:', healthData);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Тест 2: Аутентификация пользователя
    console.log('2️⃣ Тестируем аутентификацию пользователя...');
    const testUser = {
      telegramId: 123456789,
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      username: 'test_user'
    };

    const authResponse = await fetch(`${API_BASE_URL}/users/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const authData = await authResponse.json();
    console.log('📋 Результат аутентификации:', authData);

    if (authData.success) {
      console.log('✅ Пользователь успешно аутентифицирован!');
      console.log('👤 ID пользователя:', authData.data.id);
    } else {
      console.log('❌ Ошибка аутентификации:', authData.error);
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('💡 Убедитесь, что сервер запущен на localhost:3000');
  }
}

// Запускаем тест
testLocalAPI();
