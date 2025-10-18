import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalTelegramAuth } from '../middleware/telegramAuth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/masters - Получить всех мастеров
router.get('/', optionalTelegramAuth as any, async (req, res) => {
  try {
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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастеров'
    });
  }
});

// GET /api/masters/:id - Получить мастера по ID
router.get('/:id', optionalTelegramAuth as any, async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

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
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастера'
    });
  }
});

// GET /api/masters/:id/services - Получить услуги мастера
router.get('/:id/services', optionalTelegramAuth as any, async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

    const master = await prisma.master.findFirst({
      where: {
        id: masterId,
        isActive: true
      }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        masterServices: {
          some: {
            masterId: masterId
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
    console.error('Ошибка при получении услуг мастера:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуг мастера'
    });
  }
});

// GET /api/masters/:id/schedule - Получить расписание мастера
router.get('/:id/schedule', optionalTelegramAuth as any, async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

    const master = await prisma.master.findFirst({
      where: {
        id: masterId,
        isActive: true
      }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    const schedules = await prisma.masterSchedule.findMany({
      where: {
        masterId: masterId,
        isWorking: true
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Ошибка при получении расписания мастера:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении расписания мастера'
    });
  }
});

// GET /api/masters/:id/available-slots - Получить доступные слоты
router.get('/:id/available-slots', optionalTelegramAuth as any, async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);
    const { date, serviceId } = req.query;

    if (isNaN(masterId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID мастера'
      });
    }

    if (!date || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Дата и ID услуги обязательны'
      });
    }

    const master = await prisma.master.findFirst({
      where: {
        id: masterId,
        isActive: true
      }
    });

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(serviceId as string),
        isActive: true,
        masterServices: {
          some: {
            masterId: masterId
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена или мастер не предоставляет эту услугу'
      });
    }

    const appointmentDate = new Date(date as string);
    const dayOfWeek = appointmentDate.getDay();

    // Получаем расписание мастера на этот день
    const schedule = await prisma.masterSchedule.findFirst({
      where: {
        masterId: masterId,
        dayOfWeek: dayOfWeek,
        isWorking: true
      }
    });

    if (!schedule) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Получаем существующие записи на этот день
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        masterId: masterId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    // Генерируем доступные слоты
    const availableSlots = [];
    const startTime = schedule.startTime.split(':');
    const endTime = schedule.endTime.split(':');
    
    const startHour = parseInt(startTime[0]);
    const startMinute = parseInt(startTime[1]);
    const endHour = parseInt(endTime[0]);
    const endMinute = parseInt(endTime[1]);

    const slotDuration = service.duration; // в минутах
    const currentTime = new Date(appointmentDate);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTimeDate = new Date(appointmentDate);
    endTimeDate.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTimeDate) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      if (slotEnd <= endTimeDate) {
        // Проверяем, не пересекается ли слот с существующими записями
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointmentDate);
          const appointmentEnd = new Date(appointmentStart);
          appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.service.duration);

          return (currentTime < appointmentEnd && slotEnd > appointmentStart);
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: currentTime.toISOString(),
            endTime: slotEnd.toISOString(),
            duration: slotDuration
          });
        }
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30); // Слоты каждые 30 минут
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Ошибка при получении доступных слотов:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении доступных слотов'
    });
  }
});

export default router;
