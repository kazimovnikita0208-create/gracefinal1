import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/services - Получить все услуги
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereClause: any = {
      isActive: true
    };

    // Фильтр по категории если указан
    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        masterServices: {
          include: {
            master: {
              select: {
                id: true,
                name: true,
                specialization: true,
                rating: true
              }
            }
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    const servicesData = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      masters: service.masterServices.map(ms => ({
        id: ms.master.id,
        name: ms.master.name,
        specialization: ms.master.specialization,
        rating: ms.master.rating
      }))
    }));

    res.json({
      success: true,
      data: servicesData,
      count: servicesData.length,
      filters: {
        category: category || null
      }
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    res.status(500).json({
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

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        isActive: true
      },
      include: {
        masterServices: {
          include: {
            master: {
              select: {
                id: true,
                name: true,
                specialization: true,
                rating: true,
                experience: true,
                photoUrl: true
              }
            }
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

    const serviceData = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      masters: service.masterServices.map(ms => ({
        id: ms.master.id,
        name: ms.master.name,
        specialization: ms.master.specialization,
        rating: ms.master.rating,
        experience: ms.master.experience,
        photoUrl: ms.master.photoUrl
      }))
    };

    res.json({
      success: true,
      data: serviceData
    });
  } catch (error) {
    console.error('Ошибка при получении услуги:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуги'
    });
  }
});

// GET /api/services/categories - Получить все категории услуг
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

    const categoriesData = categories.map(cat => ({
      value: cat.category,
      label: getCategoryLabel(cat.category)
    }));

    res.json({
      success: true,
      data: categoriesData
    });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении категорий'
    });
  }
});

// Функция для получения читаемого названия категории
function getCategoryLabel(category: string): string {
  const labels: { [key: string]: string } = {
    'hair': 'Волосы',
    'nails': 'Ногти',
    'face': 'Лицо'
  };
  return labels[category] || category;
}

export default router;



