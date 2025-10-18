import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/services - Получить все услуги
router.get('/', async (req, res) => {
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

    return res.json({
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

// GET /api/services/:id - Получить услугу по ID
router.get('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID услуги'
      });
    }

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

    return res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Ошибка при получении услуги:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуги'
    });
  }
});

// GET /api/services/categories - Получить категории услуг
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(item => item.category);

    return res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Ошибка при получении категорий услуг:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении категорий услуг'
    });
  }
});

export default router;
