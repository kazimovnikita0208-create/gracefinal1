import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/appointments - Получить записи пользователя
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      userId: 1 // Временно для тестирования
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

    return res.json({
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
router.post('/', async (req, res) => {
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

    // Проверяем, что время записи в будущем
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

    return res.status(201).json({
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
router.get('/:id', async (req, res) => {
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
        userId: 1 // Временно для тестирования
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

    return res.json({
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
router.put('/:id', async (req, res) => {
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
        userId: 1 // Временно для тестирования
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

    return res.json({
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
router.delete('/:id', async (req, res) => {
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
        userId: 1 // Временно для тестирования
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

    return res.json({
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
