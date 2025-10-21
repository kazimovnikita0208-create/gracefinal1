// Тестовый скрипт для проверки Telegram аутентификации

const API_BASE_URL = 'https://gracefinal.vercel.app/api';

async function testTelegramAuth() {
  console.log('🧪 Тестируем Telegram аутентификацию...\n');

  // Тестовые данные пользователя
  const testUser = {
    telegramId: 123456789,
    firstName: 'Тестовый',
    lastName: 'Пользователь',
    username: 'test_user'
  };

  try {
    // Тест 1: Аутентификация пользователя
    console.log('1️⃣ Тестируем аутентификацию пользователя...');
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
      console.log('📱 Telegram ID:', authData.data.telegramId);
    } else {
      console.log('❌ Ошибка аутентификации:', authData.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Тест 2: Получение информации о пользователе
    console.log('2️⃣ Тестируем получение информации о пользователе...');
    const userResponse = await fetch(`${API_BASE_URL}/users/me?telegramId=${testUser.telegramId}`);
    const userData = await userResponse.json();
    console.log('📋 Информация о пользователе:', userData);

    if (userData.success) {
      console.log('✅ Информация о пользователе получена!');
      console.log('👤 Имя:', userData.data.firstName);
      console.log('📱 Username:', userData.data.username);
    } else {
      console.log('❌ Ошибка получения пользователя:', userData.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Тест 3: Повторная аутентификация (должна найти существующего пользователя)
    console.log('3️⃣ Тестируем повторную аутентификацию...');
    const reAuthResponse = await fetch(`${API_BASE_URL}/users/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const reAuthData = await reAuthResponse.json();
    console.log('📋 Результат повторной аутентификации:', reAuthData);

    if (reAuthData.success) {
      console.log('✅ Пользователь найден в базе данных!');
      console.log('👤 ID пользователя:', reAuthData.data.id);
    } else {
      console.log('❌ Ошибка повторной аутентификации:', reAuthData.error);
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

// Запускаем тест
testTelegramAuth();
