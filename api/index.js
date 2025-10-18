const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();

// Диагностика подключения к базе данных
console.log('🔍 Проверяем переменные окружения...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Не установлен');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('Используем SQLite для локальной разработки');

let prisma;

try {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  console.log('✅ Prisma Client создан успешно');
} catch (error) {
  console.error('❌ Ошибка создания Prisma Client:', error);
  throw error;
}

// Функция инициализации базы данных
async function initializeDatabase() {
  try {
    console.log('🔌 Тестируем подключение к базе данных...');
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверяем, есть ли уже данные
    const masterCount = await prisma.master.count();
    
    if (masterCount > 0) {
      console.log('✅ База данных уже инициализирована');
      return;
    }
    
    console.log('🌱 Инициализируем базу данных...');
    
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

    // Связываем мастеров с услугами
    await prisma.masterService.createMany({
      data: [
        { masterId: master1.id, serviceId: service1.id },
        { masterId: master2.id, serviceId: service2.id },
        { masterId: master3.id, serviceId: service3.id },
        { masterId: master3.id, serviceId: service4.id },
      ]
    });

    // Создаем расписание
    const scheduleData = [];
    for (let masterId of [master1.id, master2.id, master3.id]) {
      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
        scheduleData.push({
          masterId: masterId,
          dayOfWeek: dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isWorking: true,
        });
      }
      scheduleData.push({
        masterId: masterId,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        isWorking: true,
      });
    }

    await prisma.masterSchedule.createMany({
      data: scheduleData
    });

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

    console.log('🎉 База данных успешно инициализирована!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
}

// Инициализируем базу данных при запуске
initializeDatabase();

// Middleware
app.use(cors({
  origin: ['https://gracefinal.vercel.app', 'https://web.telegram.org'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Grace Salon API is running',
    timestamp: new Date().toISOString()
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('🔍 Тестируем подключение к базе данных...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Не установлен');
    
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    res.json({
      success: true,
      message: 'База данных подключена успешно',
      databaseUrl: process.env.DATABASE_URL ? 'Установлен' : 'Не установлен',
      testResult: result
    });
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка подключения к базе данных',
      details: {
        message: error.message,
        code: error.code,
        databaseUrl: process.env.DATABASE_URL ? 'Установлен' : 'Не установлен'
      }
    });
  }
});

// Masters routes
app.get('/api/masters', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    if (!prisma) {
      return res.status(500).json({
        success: false,
        error: 'Prisma Client не инициализирован'
      });
    }

    const masters = await prisma.master.findMany({
      where: {
        isActive: true
      },
      include: {
        services: {
          include: {
            service: true
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: masters
    });
  } catch (error) {
    console.error('Ошибка при получении мастеров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастеров'
    });
  }
});

// Get master by ID
app.get('/api/masters/:id', async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);
    const master = await prisma.master.findFirst({
      where: {
        id: masterId,
        isActive: true
      },
      include: {
        services: {
          include: {
            service: true
          }
        },
        schedules: true,
        _count: {
          select: {
            appointments: true,
            reviews: true
          }
        }
      }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    res.json({
      success: true,
      data: master
    });
  } catch (error) {
    console.error('Ошибка при получении мастера:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастера'
    });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      include: {
        masterServices: {
          include: {
            master: true
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуг'
    });
  }
});

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true
      },
      include: {
        masterServices: {
          include: {
            master: true
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Ошибка при получении услуги:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуги'
    });
  }
});

// Appointments routes
app.get('/api/appointments', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = { userId: 1 }; // Временно для тестирования
    
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        master: true,
        service: true
      },
      orderBy: {
        appointmentDate: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.appointment.count({ where });

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей'
    });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { masterId, serviceId, appointmentDate, notes } = req.body;

    if (!masterId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Мастер, услуга и дата записи обязательны'
      });
    }

    const master = await prisma.master.findUnique({
      where: { id: parseInt(masterId) }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Время записи должно быть в будущем'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: 1, // Временно для тестирования
        masterId: parseInt(masterId),
        serviceId: parseInt(serviceId),
        appointmentDate: appointmentDateTime,
        notes: notes || null,
        totalPrice: service.price
      },
      include: {
        master: true,
        service: true
      }
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании записи'
    });
  }
});

// Admin routes
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const totalAppointments = await prisma.appointment.count();
    const totalMasters = await prisma.master.count();
    const totalServices = await prisma.service.count();
    const totalUsers = await prisma.user.count();

    const todayRevenue = await prisma.appointment.aggregate({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalPrice: true
      }
    });

    res.json({
      success: true,
      data: {
        today: {
          appointments: todayAppointments,
          revenue: todayRevenue._sum.totalPrice || 0
        },
        total: {
          appointments: totalAppointments,
          masters: totalMasters,
          services: totalServices,
          users: totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении статистики'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint не найден'
  });
});

module.exports = app;