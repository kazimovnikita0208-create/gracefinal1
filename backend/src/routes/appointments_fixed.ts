import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyTelegramAuth, optionalTelegramAuth } from '../middleware/telegramAuth';

const router = Router();
const prisma = new PrismaClient();

// Middleware для разработки (позволяет работать без Telegram)
const devOrTelegramAuth = async (req: any, res: any, next: any) => {
  // Если это разработка и нет Telegram данных, пропускаем
  if (process.env.NODE_ENV === 'development' && !req.headers['x-telegram-init-data']) {
    req.user = {
      id: 1,
      telegramId: BigInt(123456789),
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      phone: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    next();
    return;
  }
  
  // Иначе используем обычную аутентификацию
  return verifyTelegramAuth(req, res, next);
};

// GET /api/appointments - Получить записи пользователя
router.get('/', devOrTelegramAuth as any, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      userId: req.user.id
    };
    
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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей'
    });
  }
});

// POST /api/appointments - Создать новую запись
router.post('/', devOrTelegramAuth as any, async (req, res) => {
  try {
    const { masterId, serviceId, appointmentDate, notes } = req.body;

    if (!masterId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Мастер, услуга и дата записи обязательны'
      });
    }

    // Проверяем существование мастера и услуги
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

    // Проверяем, что мастер предоставляет эту услугу
    const masterService = await prisma.masterService.findFirst({
      where: {
        masterId: parseInt(masterId),
        serviceId: parseInt(serviceId)
      }
    });

    if (!masterService) {
      return res.status(400).json({
        success: false,
        error: 'Мастер не предоставляет эту услугу'
      });
    }

    // Проверяем, что время записи в будущем
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Время записи должно быть в будущем'
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
        error: 'В это время у мастера уже есть запись'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании записи'
    });
  }
});

// GET /api/appointments/:id - Получить запись по ID
router.get('/:id', devOrTelegramAuth as any, async (req, res) => {
  try {
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
        userId: req.user.id
      },
      include: {
        master: true,
        service: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Запись не найдена'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Ошибка при получении записи:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записи'
    });
  }
});

// PUT /api/appointments/:id - Обновить запись
router.put('/:id', devOrTelegramAuth as any, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { appointmentDate, notes } = req.body;

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID записи'
      });
    }

    // Проверяем существование записи
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: req.user.id
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Запись не найдена'
      });
    }

    // Проверяем, что запись можно изменить
    if (existingAppointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя изменить завершенную запись'
      });
    }

    const updateData: any = {};
    
    if (appointmentDate) {
      const appointmentDateTime = new Date(appointmentDate);
      if (appointmentDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Время записи должно быть в будущем'
        });
      }
      updateData.appointmentDate = appointmentDateTime;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        master: true,
        service: true
      }
    });

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Ошибка при обновлении записи:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении записи'
    });
  }
});

// DELETE /api/appointments/:id - Отменить запись
router.delete('/:id', devOrTelegramAuth as any, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID записи'
      });
    }

    // Проверяем существование записи
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: req.user.id
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Запись не найдена'
      });
    }

    // Проверяем, что запись можно отменить
    if (existingAppointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя отменить завершенную запись'
      });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Запись успешно отменена'
    });
  } catch (error) {
    console.error('Ошибка при отмене записи:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при отмене записи'
    });
  }
});

export default router;
