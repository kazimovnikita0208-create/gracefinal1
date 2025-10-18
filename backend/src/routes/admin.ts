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
    res.status(500).json({
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
    const totalRevenue = await prisma.appointment.aggregate({
      _sum: {
        totalPrice: true
      }
    });
    const activeMasters = await prisma.master.count({
      where: { isActive: true }
    });
    const activeServices = await prisma.service.count({
      where: { isActive: true }
    });

    // Средний рейтинг
    const reviews = await prisma.review.findMany({
      select: { rating: true }
    });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        todayAppointments,
        totalAppointments,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        activeMasters,
        activeServices
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

// GET /api/admin/masters - Получить всех мастеров для админки
router.get('/masters', async (req, res) => {
  try {
    const masters = await prisma.master.findMany({
      include: {
        services: {
          include: {
            service: true
          }
        },
        schedules: true,
        reviews: {
          select: {
            rating: true
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

    const mastersData = masters.map(master => {
      const reviews = master.reviews;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : master.rating;

      return {
        id: master.id,
        name: master.name,
        specialization: master.specialization,
        description: master.description,
        photoUrl: master.photoUrl,
        experience: master.experience,
        rating: Math.round(avgRating * 10) / 10,
        isActive: master.isActive,
        appointmentsCount: master._count.appointments,
        services: master.services.map(ms => ({
          id: ms.service.id,
          name: ms.service.name,
          price: ms.service.price,
          duration: ms.service.duration,
          category: ms.service.category
        })),
        schedules: master.schedules.map(schedule => ({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isWorking: schedule.isWorking
        })),
        createdAt: master.createdAt,
        updatedAt: master.updatedAt
      };
    });

    res.json({
      success: true,
      data: mastersData,
      count: mastersData.length
    });
  } catch (error) {
    console.error('Ошибка при получении мастеров:', error);
    res.status(500).json({
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
        isActive: true
      }
    });

    // Связываем мастера с услугами
    if (serviceIds && serviceIds.length > 0) {
      await Promise.all(
        serviceIds.map((serviceId: number) =>
          prisma.masterService.create({
            data: {
              masterId: master.id,
              serviceId: serviceId
            }
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: master,
      message: 'Мастер успешно создан'
    });
  } catch (error) {
    console.error('Ошибка при создании мастера:', error);
    res.status(500).json({
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

    const updateData: any = {};
    if (name) updateData.name = name;
    if (specialization) updateData.specialization = specialization;
    if (description !== undefined) updateData.description = description;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (experience !== undefined) updateData.experience = experience ? parseInt(experience) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const master = await prisma.master.update({
      where: { id: masterId },
      data: updateData
    });

    // Обновляем связи с услугами
    if (serviceIds !== undefined) {
      // Удаляем старые связи
      await prisma.masterService.deleteMany({
        where: { masterId: masterId }
      });

      // Создаем новые связи
      if (serviceIds.length > 0) {
        await Promise.all(
          serviceIds.map((serviceId: number) =>
            prisma.masterService.create({
              data: {
                masterId: masterId,
                serviceId: serviceId
              }
            })
          )
        );
      }
    }

    res.json({
      success: true,
      data: master,
      message: 'Мастер успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка при обновлении мастера:', error);
    res.status(500).json({
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

    // Проверяем, есть ли активные записи
    const activeAppointments = await prisma.appointment.count({
      where: {
        masterId: masterId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить мастера с активными записями'
      });
    }

    // Удаляем связи с услугами
    await prisma.masterService.deleteMany({
      where: { masterId: masterId }
    });

    // Удаляем расписание
    await prisma.masterSchedule.deleteMany({
      where: { masterId: masterId }
    });

    // Удаляем мастера
    await prisma.master.delete({
      where: { id: masterId }
    });

    res.json({
      success: true,
      message: 'Мастер успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении мастера:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении мастера'
    });
  }
});

// GET /api/admin/services - Получить все услуги для админки
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        masterServices: {
          include: {
            master: {
              select: {
                id: true,
                name: true,
                specialization: true
              }
            }
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

    const servicesData = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      isActive: service.isActive,
      appointmentsCount: service._count.appointments,
      masters: service.masterServices.map(ms => ({
        id: ms.master.id,
        name: ms.master.name,
        specialization: ms.master.specialization
      })),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    res.json({
      success: true,
      data: servicesData,
      count: servicesData.length
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуг'
    });
  }
});

// POST /api/admin/services - Создать новую услугу
router.post('/services', async (req, res) => {
  try {
    const { name, description, price, duration, category, masterIds } = req.body;

    if (!name || !price || !duration || !category) {
      return res.status(400).json({
        success: false,
        error: 'Название, цена, длительность и категория обязательны'
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseInt(price),
        duration: parseInt(duration),
        category,
        isActive: true
      }
    });

    // Связываем услугу с мастерами
    if (masterIds && masterIds.length > 0) {
      await Promise.all(
        masterIds.map((masterId: number) =>
          prisma.masterService.create({
            data: {
              masterId: masterId,
              serviceId: service.id
            }
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: service,
      message: 'Услуга успешно создана'
    });
  } catch (error) {
    console.error('Ошибка при создании услуги:', error);
    res.status(500).json({
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

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });

    // Обновляем связи с мастерами
    if (masterIds !== undefined) {
      // Удаляем старые связи
      await prisma.masterService.deleteMany({
        where: { serviceId: serviceId }
      });

      // Создаем новые связи
      if (masterIds.length > 0) {
        await Promise.all(
          masterIds.map((masterId: number) =>
            prisma.masterService.create({
              data: {
                masterId: masterId,
                serviceId: serviceId
              }
            })
          )
        );
      }
    }

    res.json({
      success: true,
      data: service,
      message: 'Услуга успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка при обновлении услуги:', error);
    res.status(500).json({
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

    // Проверяем, есть ли активные записи
    const activeAppointments = await prisma.appointment.count({
      where: {
        serviceId: serviceId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить услугу с активными записями'
      });
    }

    // Удаляем связи с мастерами
    await prisma.masterService.deleteMany({
      where: { serviceId: serviceId }
    });

    // Удаляем услугу
    await prisma.service.delete({
      where: { id: serviceId }
    });

    res.json({
      success: true,
      message: 'Услуга успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении услуги:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении услуги'
    });
  }
});

// GET /api/admin/appointments - Получить все записи для админки (dev: без авторизации)
router.get('/appointments', async (req, res) => {
  try {
    const { status, masterId, serviceId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    }
    if (masterId && typeof masterId === 'string') {
      whereClause.masterId = parseInt(masterId);
    }
    if (serviceId && typeof serviceId === 'string') {
      whereClause.serviceId = parseInt(serviceId);
    }
    if (startDate && typeof startDate === 'string') {
      whereClause.appointmentDate = {
        ...whereClause.appointmentDate,
        gte: new Date(startDate)
      };
    }
    if (endDate && typeof endDate === 'string') {
      whereClause.appointmentDate = {
        ...whereClause.appointmentDate,
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        master: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.appointment.count({ where: whereClause });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
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

// PUT /api/admin/appointments/:id/status - Изменить статус записи (dev: без авторизации)
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

    if (!status || !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный статус записи'
      });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        master: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: 'Статус записи обновлен'
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса записи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении статуса записи'
    });
  }
});

export default router;
