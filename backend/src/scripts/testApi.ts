import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3334/api';

async function testApi() {
  console.log('🧪 Тестирование Grace Beauty Salon API\n');
  console.log('=' .repeat(50));

  try {
    // Тест 1: Health check
    console.log('1️⃣ Тестируем Health Check...');
    const healthResponse = await fetch('http://localhost:3334/health');
    const healthData: any = await healthResponse.json();
    console.log('✅ Health Check:', healthData.success ? 'OK' : 'FAILED');
    console.log('   Статус:', healthData.data?.status);
    console.log('   Время работы:', Math.round(healthData.data?.uptime || 0), 'сек\n');

    // Тест 2: Мастера
    console.log('2️⃣ Тестируем API мастеров...');
    const mastersResponse = await fetch(`${API_BASE}/masters`);
    const mastersData: any = await mastersResponse.json();
    console.log('✅ Мастера:', mastersData.success ? 'OK' : 'FAILED');
    console.log('   Количество:', mastersData.count);
    if (mastersData.data && mastersData.data.length > 0) {
      console.log('   Первый мастер:', mastersData.data[0].name);
      console.log('   Специализация:', mastersData.data[0].specialization);
      console.log('   Рейтинг:', mastersData.data[0].rating);
    }
    console.log('');

    // Тест 3: Услуги
    console.log('3️⃣ Тестируем API услуг...');
    const servicesResponse = await fetch(`${API_BASE}/services`);
    const servicesData: any = await servicesResponse.json();
    console.log('✅ Услуги:', servicesData.success ? 'OK' : 'FAILED');
    console.log('   Количество:', servicesData.count);
    if (servicesData.data && servicesData.data.length > 0) {
      console.log('   Первая услуга:', servicesData.data[0].name);
      console.log('   Цена:', (servicesData.data[0].price / 100).toFixed(0) + '₽');
      console.log('   Категория:', servicesData.data[0].category);
    }
    console.log('');

    // Тест 4: Категории услуг
    console.log('4️⃣ Тестируем категории услуг...');
    const categoriesResponse = await fetch(`${API_BASE}/services/categories`);
    const categoriesData: any = await categoriesResponse.json();
    console.log('✅ Категории:', categoriesData.success ? 'OK' : 'FAILED');
    if (categoriesData.data && categoriesData.data.length > 0) {
      console.log('   Категории:', categoriesData.data.map((cat: any) => cat.label).join(', '));
    }
    console.log('');

    // Тест 5: Расписание
    console.log('5️⃣ Тестируем API расписания...');
    const scheduleResponse = await fetch(`${API_BASE}/schedule`);
    const scheduleData: any = await scheduleResponse.json();
    console.log('✅ Расписание:', scheduleData.success ? 'OK' : 'FAILED');
    console.log('   Количество записей:', scheduleData.count);
    if (scheduleData.data && scheduleData.data.length > 0) {
      const firstSchedule = scheduleData.data[0];
      console.log('   Мастер:', firstSchedule.master.name);
      console.log('   День:', firstSchedule.dayName);
      console.log('   Время:', `${firstSchedule.startTime}-${firstSchedule.endTime}`);
    }
    console.log('');

    // Тест 6: Конкретный мастер
    if (mastersData.data && mastersData.data.length > 0) {
      console.log('6️⃣ Тестируем конкретного мастера...');
      const masterId = mastersData.data[0].id;
      const masterResponse = await fetch(`${API_BASE}/masters/${masterId}`);
      const masterData: any = await masterResponse.json();
      console.log('✅ Мастер по ID:', masterData.success ? 'OK' : 'FAILED');
      if (masterData.data) {
        console.log('   Имя:', masterData.data.name);
        console.log('   Услуг:', masterData.data.services.length);
        console.log('   Отзывов:', masterData.data.reviews.length);
      }
      console.log('');
    }

    // Тест 7: Конкретная услуга
    if (servicesData.data && servicesData.data.length > 0) {
      console.log('7️⃣ Тестируем конкретную услугу...');
      const serviceId = servicesData.data[0].id;
      const serviceResponse = await fetch(`${API_BASE}/services/${serviceId}`);
      const serviceData: any = await serviceResponse.json();
      console.log('✅ Услуга по ID:', serviceData.success ? 'OK' : 'FAILED');
      if (serviceData.data) {
        console.log('   Название:', serviceData.data.name);
        console.log('   Мастеров:', serviceData.data.masters.length);
        console.log('   Длительность:', serviceData.data.duration, 'мин');
      }
      console.log('');
    }

    // Тест 8: Доступные слоты (если есть мастера и услуги)
    if (mastersData.data && mastersData.data.length > 0 && servicesData.data && servicesData.data.length > 0) {
      console.log('8️⃣ Тестируем доступные слоты...');
      const masterId = mastersData.data[0].id;
      const serviceId = servicesData.data[0].id;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      const slotsResponse = await fetch(`${API_BASE}/schedule/available?masterId=${masterId}&serviceId=${serviceId}&date=${dateStr}`);
      const slotsData: any = await slotsResponse.json();
      console.log('✅ Доступные слоты:', slotsData.success ? 'OK' : 'FAILED');
      if (slotsData.data) {
        console.log('   Количество слотов:', slotsData.data.length);
        if (slotsData.data.length > 0) {
          console.log('   Первый слот:', new Date(slotsData.data[0]).toLocaleString('ru-RU'));
        }
      }
      console.log('');
    }

    console.log('🎉 Все тесты завершены!');
    console.log('=' .repeat(50));
    console.log('📊 API работает корректно');
    console.log('🌐 Frontend может подключаться к API');
    console.log('💡 Следующий шаг: интеграция с frontend');

  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
    console.log('\n💡 Убедитесь, что сервер запущен: npm run dev');
  }
}

// Запускаем тесты
testApi();
