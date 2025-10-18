import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем мастеров
  const masters = await Promise.all([
    prisma.master.create({
      data: {
        name: 'Анна Иванова',
        specialization: 'Стилист-парикмахер',
        description: 'Опытный мастер с 8-летним стажем. Специализируется на окрашивании и стрижках.',
        photoUrl: '/images/masters/anna.jpg',
        experience: 8,
        rating: 4.9,
        isActive: true,
      },
    }),
    prisma.master.create({
      data: {
        name: 'Мария Петрова',
        specialization: 'Мастер маникюра и педикюра',
        description: 'Профессиональный nail-мастер с опытом работы 5 лет.',
        photoUrl: '/images/masters/maria.jpg',
        experience: 5,
        rating: 4.8,
        isActive: true,
      },
    }),
    prisma.master.create({
      data: {
        name: 'Елена Сидорова',
        specialization: 'Косметолог',
        description: 'Косметолог с 10-летним опытом. Специалист по уходу за кожей лица.',
        photoUrl: '/images/masters/elena.jpg',
        experience: 10,
        rating: 4.9,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Мастера созданы:', masters.length);

  // Создаем услуги
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Стрижка женская',
        description: 'Модная женская стрижка с укладкой',
        price: 200000, // 2000 руб в копейках
        duration: 60,
        category: 'hair',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Окрашивание волос',
        description: 'Профессиональное окрашивание волос',
        price: 450000, // 4500 руб в копейках
        duration: 180,
        category: 'hair',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Маникюр',
        description: 'Классический маникюр с покрытием',
        price: 150000, // 1500 руб в копейках
        duration: 90,
        category: 'nails',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Педикюр',
        description: 'Аппаратный педикюр с покрытием',
        price: 200000, // 2000 руб в копейках
        duration: 120,
        category: 'nails',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Чистка лица',
        description: 'Комплексная чистка лица',
        price: 300000, // 3000 руб в копейках
        duration: 90,
        category: 'face',
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Массаж лица',
        description: 'Расслабляющий массаж лица',
        price: 250000, // 2500 руб в копейках
        duration: 60,
        category: 'face',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Услуги созданы:', services.length);

  // Связываем мастеров с услугами
  const masterServices = [];
  
  // Анна (стилист) - парикмахерские услуги
  masterServices.push(
    await prisma.masterService.create({
      data: {
        masterId: masters[0].id,
        serviceId: services[0].id, // Стрижка женская
      },
    }),
    await prisma.masterService.create({
      data: {
        masterId: masters[0].id,
        serviceId: services[1].id, // Окрашивание волос
      },
    })
  );

  // Мария (nail-мастер) - маникюр и педикюр
  masterServices.push(
    await prisma.masterService.create({
      data: {
        masterId: masters[1].id,
        serviceId: services[2].id, // Маникюр
      },
    }),
    await prisma.masterService.create({
      data: {
        masterId: masters[1].id,
        serviceId: services[3].id, // Педикюр
      },
    })
  );

  // Елена (косметолог) - косметология
  masterServices.push(
    await prisma.masterService.create({
      data: {
        masterId: masters[2].id,
        serviceId: services[4].id, // Чистка лица
      },
    }),
    await prisma.masterService.create({
      data: {
        masterId: masters[2].id,
        serviceId: services[5].id, // Массаж лица
      },
    })
  );

  console.log('✅ Связи мастер-услуга созданы:', masterServices.length);

  // Создаем расписание для мастеров (рабочие дни: Пн-Пт 9:00-18:00, Сб 10:00-16:00)
  const schedules = [];
  
  for (const master of masters) {
    // Понедельник-Пятница (1-5)
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await prisma.masterSchedule.create({
          data: {
            masterId: master.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            isWorking: true,
          },
        })
      );
    }
    
    // Суббота (6)
    schedules.push(
      await prisma.masterSchedule.create({
        data: {
          masterId: master.id,
          dayOfWeek: 6,
          startTime: '10:00',
          endTime: '16:00',
          isWorking: true,
        },
      })
    );
    
    // Воскресенье (0) - выходной
    schedules.push(
      await prisma.masterSchedule.create({
        data: {
          masterId: master.id,
          dayOfWeek: 0,
          startTime: '00:00',
          endTime: '00:00',
          isWorking: false,
        },
      })
    );
  }

  console.log('✅ Расписание создано:', schedules.length);

  // Создаем тестового админа
  const admin = await prisma.admin.create({
    data: {
      telegramId: BigInt(123456789),
      name: 'Администратор',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Админ создан:', admin.name);

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



