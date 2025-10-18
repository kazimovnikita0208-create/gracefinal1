import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/schedule - Получить расписание мастеров
router.get('/', async (req, res) => {
  try {
    const { masterId, dayOfWeek } = req.query;

    const whereClause: any = {};

    // Фильтр по мастеру если указан
    if (masterId && typeof masterId === 'string') {
      const masterIdNum = parseInt(masterId);
      if (!isNaN(masterIdNum)) {
        whereClause.masterId = masterIdNum;
      }
    }

    // Фильтр по дню недели если указан
    if (dayOfWeek && typeof dayOfWeek === 'string') {
      const dayOfWeekNum = parseInt(dayOfWeek);
      if (!isNaN(dayOfWeekNum) && dayOfWeekNum >= 0 && dayOfWeekNum <= 6) {
        whereClause.dayOfWeek = dayOfWeekNum;
      }
    }

    const schedules = await prisma.masterSchedule.findMany({
      where: whereClause,
      include: {
        master: {
          select: {
            id: true,
            name: true,
            specialization: true,
            photoUrl: true
          }
        }
      },
      orderBy: [
        { masterId: 'asc' },
        { dayOfWeek: 'asc' }
      ]
    });

    const schedulesData = schedules.map(schedule => ({
      id: schedule.id,
      master: schedule.master,
      dayOfWeek: schedule.dayOfWeek,
      dayName: getDayName(schedule.dayOfWeek),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isWorking: schedule.isWorking
    }));

    res.json({
      success: true,
      data: schedulesData,
      count: schedulesData.length,
      filters: {
        masterId: masterId || null,
        dayOfWeek: dayOfWeek || null
      }
    });
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении расписания'
    });
  }
});

// GET /api/schedule/available - Получить доступные слоты для записи
router.get('/available', async (req, res) => {
  try {
    const { masterId, serviceId, date } = req.query;

    if (!masterId || !serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать masterId, serviceId и date'
      });
    }

    const masterIdNum = parseInt(masterId as string);
    const serviceIdNum = parseInt(serviceId as string);
    const targetDate = new Date(date as string);

    if (isNaN(masterIdNum) || isNaN(serviceIdNum) || isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Неверные параметры запроса'
      });
    }

    // Проверяем, что мастер предоставляет эту услугу
    const masterService = await prisma.masterService.findUnique({
      where: {
        masterId_serviceId: {
          masterId: masterIdNum,
          serviceId: serviceIdNum
        }
      }
    });

    if (!masterService) {
      return res.status(400).json({
        success: false,
        error: 'Мастер не предоставляет эту услугу'
      });
    }

    // Получаем услугу для определения длительности
    const service = await prisma.service.findUnique({
      where: {
        id: serviceIdNum
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    // Получаем расписание мастера на этот день недели
    const dayOfWeek = targetDate.getDay();
    const masterSchedule = await prisma.masterSchedule.findUnique({
      where: {
        masterId_dayOfWeek: {
          masterId: masterIdNum,
          dayOfWeek: dayOfWeek
        }
      }
    });

    if (!masterSchedule || !masterSchedule.isWorking) {
      return res.json({
        success: true,
        data: [],
        message: 'Мастер не работает в этот день'
      });
    }

    // Получаем существующие записи на этот день
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
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
      select: {
        appointmentDate: true
      }
    });

    // Генерируем доступные слоты
    const availableSlots = generateAvailableSlots(
      targetDate,
      masterSchedule.startTime,
      masterSchedule.endTime,
      service.duration,
      existingAppointments.map(apt => apt.appointmentDate)
    );

    res.json({
      success: true,
      data: availableSlots,
      count: availableSlots.length,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration
      },
      master: {
        id: masterIdNum
      },
      date: targetDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Ошибка при получении доступных слотов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении доступных слотов'
    });
  }
});

// Функция для получения названия дня недели
function getDayName(dayOfWeek: number): string {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[dayOfWeek] || 'Неизвестно';
}

// Функция для генерации доступных слотов
function generateAvailableSlots(
  date: Date,
  startTime: string,
  endTime: string,
  serviceDuration: number,
  existingAppointments: Date[]
): string[] {
  const slots: string[] = [];
  
  // Парсим время начала и конца работы
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const workStart = new Date(date);
  workStart.setHours(startHour, startMinute, 0, 0);
  
  const workEnd = new Date(date);
  workEnd.setHours(endHour, endMinute, 0, 0);
  
  // Генерируем слоты с интервалом в 30 минут
  const currentSlot = new Date(workStart);
  
  while (currentSlot < workEnd) {
    const slotEnd = new Date(currentSlot);
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
    
    // Проверяем, что слот помещается в рабочее время
    if (slotEnd <= workEnd) {
      // Проверяем, что слот не пересекается с существующими записями
      const hasConflict = existingAppointments.some(apt => {
        const aptEnd = new Date(apt);
        aptEnd.setMinutes(aptEnd.getMinutes() + serviceDuration);
        
        return (currentSlot < aptEnd && slotEnd > apt);
      });
      
      if (!hasConflict) {
        slots.push(currentSlot.toISOString());
      }
    }
    
    // Переходим к следующему слоту (каждые 30 минут)
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }
  
  return slots;
}

export default router;



