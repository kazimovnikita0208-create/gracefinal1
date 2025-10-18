import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyTelegramAuth } from '../middleware/telegramAuth';

const router = Router();
const prisma = new PrismaClient();

// Dev-friendly auth: in development, create/get a test user and attach to req
async function devOrTelegramAuth(req: any, res: any, next: any) {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const telegramTestId = 123456789; // из useTelegram мок-данных
      let user = await prisma.user.findUnique({ where: { telegramId: telegramTestId } });
      if (!user) {
        user = await prisma.user.create({
          data: { telegramId: telegramTestId, firstName: 'Тестовый', lastName: 'Пользователь' }
        });
      }
      req.user = user;
      return next();
    } catch (e) {
      return next(e);
    }
  }
  return verifyTelegramAuth(req, res, next);
}

// GET /api/appointments - Получить записи пользователя
router.get('/', devOrTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const whereClause: any = {
      userId: userId
    };

    // Фильтр по статусу если указан
    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        master: {
          select: {
            id: true,
            name: true,
            specialization: true,
            photoUrl: true
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
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const appointmentsData = appointments.map(appointment => ({
      id: appointment.id,
      master: appointment.master,
      service: appointment.service,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes,
      totalPrice: appointment.totalPrice,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json({
      success: true,
      data: appointmentsData,
      count: appointmentsData.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
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

// POST /api/appointments - Создать новую запись
router.post('/', devOrTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { masterId, serviceId, appointmentDate, notes } = req.body;

    // Валидация данных
    if (!masterId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать мастера, услугу и дату записи'
      });
    }

    // Проверяем существование мастера
    const master = await prisma.master.findUnique({
      where: {
        id: parseInt(masterId),
        isActive: true
      }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    // Проверяем существование услуги
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(serviceId),
        isActive: true
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    // Проверяем, что мастер предоставляет эту услугу
    const masterService = await prisma.masterService.findUnique({
      where: {
        masterId_serviceId: {
          masterId: parseInt(masterId),
          serviceId: parseInt(serviceId)
        }
      }
    });

    if (!masterService) {
      return res.status(400).json({
        success: false,
        error: 'Мастер не предоставляет эту услугу'
      });
    }

    // Проверяем, что дата записи в будущем
    const appointmentDateTime = new Date(appointmentDate);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      return res.status(400).json({
        success: false,
        error: 'Дата записи должна быть в будущем'
      });
    }

    // Проверяем, что в это время нет других записей у мастера
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        masterId: parseInt(masterId),
        appointmentDate: appointmentDateTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'На это время уже есть запись'
      });
    }

    // Создаем запись
    const appointment = await prisma.appointment.create({
      data: {
        userId: userId,
        masterId: parseInt(masterId),
        serviceId: parseInt(serviceId),
        appointmentDate: appointmentDateTime,
        notes: notes || null,
        totalPrice: service.price,
        status: 'PENDING'
      },
      include: {
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
            duration: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: appointment.id,
        master: appointment.master,
        service: appointment.service,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        notes: appointment.notes,
        totalPrice: appointment.totalPrice,
        createdAt: appointment.createdAt
      },
      message: 'Запись успешно создана'
    });
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании записи'
    });
  }
});

// PUT /api/appointments/:id/cancel - Отменить запись
router.put('/:id/cancel', verifyTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const appointmentId = parseInt(req.params.id);

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID записи'
      });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: userId
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Запись не найдена'
      });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Запись уже отменена'
      });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя отменить завершенную запись'
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        status: 'CANCELLED'
      },
      include: {
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
      data: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        master: updatedAppointment.master.name,
        service: updatedAppointment.service.name,
        appointmentDate: updatedAppointment.appointmentDate
      },
      message: 'Запись успешно отменена'
    });
  } catch (error) {
    console.error('Ошибка при отмене записи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при отмене записи'
    });
  }
});

export default router;
