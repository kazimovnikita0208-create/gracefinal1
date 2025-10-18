import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyTelegramAuth } from '../middleware/telegramAuth';

const router = Router();
const prisma = new PrismaClient();

// Middleware для проверки админ прав (пока простая проверка)
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    
    // Проверяем, является ли пользователь админом
    const admin = await prisma.admin.findFirst({
      where: {
        telegramId: BigInt(req.user.telegramId),
        isActive: true
      }
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуются права администратора'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Ошибка проверки прав доступа'
    });
  }
};

// Применяем проверку Telegram и прав администратора для всех admin маршрутов
router.use(verifyTelegramAuth as any, requireAdmin as any);

// GET /api/admin/dashboard - Общая статистика
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Статистика за сегодня
    const todayAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Общая статистика
    const totalAppointments = await prisma.appointment.count();
    const totalMasters = await prisma.master.count();
    const totalServices = await prisma.service.count();
    const totalUsers = await prisma.user.count();

    // Выручка за сегодня
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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении статистики'
    });
  }
});

// GET /api/admin/masters - Получить всех мастеров
router.get('/masters', async (req, res) => {
  try {
    const masters = await prisma.master.findMany({
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
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: masters
    });
  } catch (error) {
    console.error('Ошибка при получении мастеров:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастеров'
    });
  }
});

// POST /api/admin/masters - Создать нового мастера
router.post('/masters', async (req, res) => {
  try {
    const { name, specialization, description, photoUrl, experience, serviceIds } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({
        success: false,
        error: 'Имя и специализация обязательны'
      });
    }

    const master = await prisma.master.create({
      data: {
        name,
        specialization,
        description,
        photoUrl,
        experience: experience ? parseInt(experience) : null,
        services: serviceIds ? {
          create: serviceIds.map((serviceId: number) => ({
            serviceId
          }))
        } : undefined
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: master
    });
  } catch (error) {
    console.error('Ошибка при создании мастера:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании мастера'
    });
  }
});

// PUT /api/admin/masters/:id - Обновить мастера
router.put('/masters/:id', async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);
    const { name, specialization, description, photoUrl, experience, isActive, serviceIds } = req.body;

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

    // Проверяем существование мастера
    const existingMaster = await prisma.master.findUnique({
      where: { id: masterId }
    });

    if (!existingMaster) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    const master = await prisma.master.update({
      where: { id: masterId },
      data: {
        name,
        specialization,
        description,
        photoUrl,
        experience: experience ? parseInt(experience) : null,
        isActive,
        services: serviceIds ? {
          deleteMany: {},
          create: serviceIds.map((serviceId: number) => ({
            serviceId
          }))
        } : undefined
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: master
    });
  } catch (error) {
    console.error('Ошибка при обновлении мастера:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении мастера'
    });
  }
});

// DELETE /api/admin/masters/:id - Удалить мастера
router.delete('/masters/:id', async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

    // Проверяем существование мастера
    const existingMaster = await prisma.master.findUnique({
      where: { id: masterId }
    });

    if (!existingMaster) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    await prisma.master.delete({
      where: { id: masterId }
    });

    res.json({
      success: true,
      message: 'Мастер успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении мастера:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении мастера'
    });
  }
});

// GET /api/admin/services - Получить все услуги
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
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
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуг'
    });
  }
});

// POST /api/admin/services - Создать новую услугу
router.post('/services', async (req, res) => {
  try {
    const { name, description, price, duration, category, masterIds } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Название, цена и длительность обязательны'
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseInt(price),
        duration: parseInt(duration),
        category,
        masterServices: masterIds ? {
          create: masterIds.map((masterId: number) => ({
            masterId
          }))
        } : undefined
      },
      include: {
        masterServices: {
          include: {
            master: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Ошибка при создании услуги:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании услуги'
    });
  }
});

// PUT /api/admin/services/:id - Обновить услугу
router.put('/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const { name, description, price, duration, category, isActive, masterIds } = req.body;

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID услуги'
      });
    }

    // Проверяем существование услуги
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        price: price ? parseInt(price) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        category,
        isActive,
        masterServices: masterIds ? {
          deleteMany: {},
          create: masterIds.map((masterId: number) => ({
            masterId
          }))
        } : undefined
      },
      include: {
        masterServices: {
          include: {
            master: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Ошибка при обновлении услуги:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении услуги'
    });
  }
});

// DELETE /api/admin/services/:id - Удалить услугу
router.delete('/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID услуги'
      });
    }

    // Проверяем существование услуги
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    res.json({
      success: true,
      message: 'Услуга успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении услуги:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении услуги'
    });
  }
});

// GET /api/admin/appointments - Получить все записи
router.get('/appointments', async (req, res) => {
  try {
    const { status, masterId, date, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (masterId) {
      where.masterId = parseInt(masterId as string);
    }
    
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      where.appointmentDate = {
        gte: startDate,
        lt: endDate
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: true,
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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей'
    });
  }
});

// PUT /api/admin/appointments/:id/status - Изменить статус записи
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID записи'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Статус обязателен'
      });
    }

    // Проверяем существование записи
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Запись не найдена'
      });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        user: true,
        master: true,
        service: true
      }
    });

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Ошибка при изменении статуса записи:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при изменении статуса записи'
    });
  }
});

export default router;
