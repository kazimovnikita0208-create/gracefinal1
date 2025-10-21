// Тест подключения к базе данных на Vercel
const API_BASE_URL = 'https://gracefinal1.vercel.app/api';

async function testVercelDatabase() {
  console.log('🧪 Тестируем подключение к базе данных на Vercel...\n');

  try {
    // Тест 1: Health endpoint
    console.log('1️⃣ Тестируем health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('📋 Health response:', healthData);

    if (healthData.success) {
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

    console.log('\n' + '='.repeat(50) + '\n');

    // Тест 3: Получение мастеров
    console.log('3️⃣ Тестируем получение мастеров...');
    const mastersResponse = await fetch(`${API_BASE_URL}/masters`);
    const mastersData = await mastersResponse.json();
    console.log('📋 Результат получения мастеров:', mastersData);

    if (mastersData.success) {
      console.log('✅ Мастера загружены!');
      console.log('👥 Количество мастеров:', mastersData.data.length);
    } else {
      console.log('❌ Ошибка загрузки мастеров:', mastersData.error);
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

// Запускаем тест
testVercelDatabase();
