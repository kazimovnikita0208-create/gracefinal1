import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/masters - Получить всех мастеров
router.get('/', async (req, res) => {
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

    return res.json({
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
router.get('/:id', async (req, res) => {
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

    return res.json({
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
router.get('/:id/services', async (req, res) => {
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

    return res.json({
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
router.get('/:id/schedule', async (req, res) => {
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

export default router;
