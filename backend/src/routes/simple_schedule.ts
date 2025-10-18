import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/schedule/masters/:id - Получить расписание мастера
router.get('/masters/:id', async (req, res) => {
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

    return res.json({
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

// GET /api/schedule/available-slots - Получить доступные слоты
router.get('/available-slots', async (req, res) => {
  try {
    const { masterId, serviceId, date } = req.query;

    if (!masterId || !serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: 'ID мастера, ID услуги и дата обязательны'
      });
    }

    const masterIdNum = parseInt(masterId as string);
    const serviceIdNum = parseInt(serviceId as string);

    if (isNaN(masterIdNum) || isNaN(serviceIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Неверные параметры'
      });
    }

    const master = await prisma.master.findFirst({
      where: {
        id: masterIdNum,
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
        id: serviceIdNum,
        isActive: true,
        masterServices: {
          some: {
            masterId: masterIdNum
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
        masterId: masterIdNum,
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
        masterId: masterIdNum,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        service: true
      }
    });

    // Генерируем доступные слоты
    const availableSlots = [];
    const startTime = schedule.startTime.split(':');
    const endTime = schedule.endTime.split(':');
    
    const startHour = parseInt(startTime[0] || '0');
    const startMinute = parseInt(startTime[1] || '0');
    const endHour = parseInt(endTime[0] || '23');
    const endMinute = parseInt(endTime[1] || '59');

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

    return res.json({
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
