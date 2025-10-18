const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем мастеров
  const master1 = await prisma.master.create({
    data: {
      name: 'Анна Иванова',
      specialization: 'Мастер маникюра',
      description: 'Опытный мастер с 5-летним стажем. Специализируется на классическом и аппаратном маникюре.',
      photoUrl: 'https://via.placeholder.com/300x300/ec4899/ffffff?text=AI',
      experience: 5,
      isActive: true,
    }
  });

  const master2 = await prisma.master.create({
    data: {
      name: 'Мария Петрова',
      specialization: 'Мастер педикюра',
      description: 'Специалист по аппаратному педикюру с 3-летним опытом.',
      photoUrl: 'https://via.placeholder.com/300x300/ec4899/ffffff?text=MP',
      experience: 3,
      isActive: true,
    }
  });

  const master3 = await prisma.master.create({
    data: {
      name: 'Елена Смирнова',
      specialization: 'Мастер бровей',
      description: 'Специалист по коррекции и окрашиванию бровей.',
      photoUrl: 'https://via.placeholder.com/300x300/ec4899/ffffff?text=ES',
      experience: 4,
      isActive: true,
    }
  });

  console.log('✅ Мастера созданы');

  // Создаем услуги
  const service1 = await prisma.service.create({
    data: {
      name: 'Маникюр классический',
      description: 'Классический маникюр с покрытием гель-лаком',
      price: 1500,
      duration: 60,
      category: 'Маникюр',
      isActive: true,
    }
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Педикюр аппаратный',
      description: 'Аппаратный педикюр с покрытием гель-лаком',
      price: 2000,
      duration: 90,
      category: 'Педикюр',
      isActive: true,
    }
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Коррекция бровей',
      description: 'Коррекция формы бровей воском',
      price: 800,
      duration: 30,
      category: 'Брови',
      isActive: true,
    }
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Окрашивание бровей',
      description: 'Окрашивание бровей краской',
      price: 1200,
      duration: 45,
      category: 'Брови',
      isActive: true,
    }
  });

  console.log('✅ Услуги созданы');

  // Связываем мастеров с услугами
  await prisma.masterService.create({
    data: {
      masterId: master1.id,
      serviceId: service1.id,
    }
  });

  await prisma.masterService.create({
    data: {
      masterId: master2.id,
      serviceId: service2.id,
    }
  });

  await prisma.masterService.create({
    data: {
      masterId: master3.id,
      serviceId: service3.id,
    }
  });

  await prisma.masterService.create({
    data: {
      masterId: master3.id,
      serviceId: service4.id,
    }
  });

  console.log('✅ Связи мастер-услуга созданы');

  // Создаем расписание для мастеров
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  
  for (let masterId of [master1.id, master2.id, master3.id]) {
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) { // Пн-Пт
      await prisma.masterSchedule.create({
        data: {
          masterId: masterId,
          dayOfWeek: dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isWorking: true,
        }
      });
    }
    
    // Суббота (сокращенный день)
    await prisma.masterSchedule.create({
      data: {
        masterId: masterId,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        isWorking: true,
      }
    });
  }

  console.log('✅ Расписание создано');

  // Создаем тестового пользователя
  const user = await prisma.user.create({
    data: {
      telegramId: BigInt(123456789),
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      username: 'testuser',
      phone: '+7 (999) 123-45-67',
      isActive: true,
    }
  });

  console.log('✅ Тестовый пользователь создан');

  // Создаем тестовую запись
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: user.id,
      masterId: master1.id,
      serviceId: service1.id,
      appointmentDate: tomorrow,
      notes: 'Тестовая запись',
      totalPrice: service1.price,
      status: 'PENDING',
    }
  });

  console.log('✅ Тестовая запись создана');

  // Создаем админа
  await prisma.admin.create({
    data: {
      telegramId: BigInt(987654321),
      firstName: 'Админ',
      lastName: 'Системы',
      username: 'admin',
      isActive: true,
    }
  });

  console.log('✅ Админ создан');

  console.log('🎉 База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
