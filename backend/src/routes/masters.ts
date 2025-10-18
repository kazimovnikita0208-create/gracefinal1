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
        schedules: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    // Вычисляем средний рейтинг для каждого мастера
    const mastersWithRating = masters.map(master => {
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
        }))
      };
    });

    res.json({
      success: true,
      data: mastersWithRating,
      count: mastersWithRating.length
    });
  } catch (error) {
    console.error('Ошибка при получении мастеров:', error);
    res.status(500).json({
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

    const master = await prisma.master.findUnique({
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
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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

    // Вычисляем средний рейтинг
    const reviews = master.reviews;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : master.rating;

    const masterData = {
      id: master.id,
      name: master.name,
      specialization: master.specialization,
      description: master.description,
      photoUrl: master.photoUrl,
      experience: master.experience,
      rating: Math.round(avgRating * 10) / 10,
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
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: `${review.user.firstName} ${review.user.lastName || ''}`.trim(),
        createdAt: review.createdAt
      }))
    };

    res.json({
      success: true,
      data: masterData
    });
  } catch (error) {
    console.error('Ошибка при получении мастера:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастера'
    });
  }
});

// GET /api/masters/:id/services - Услуги конкретного мастера
router.get('/:id/services', async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);

    if (isNaN(masterId)) {
      return res.status(400).json({ success: false, error: 'Неверный ID мастера' });
    }

    const master = await prisma.master.findUnique({
      where: { id: masterId, isActive: true },
      include: {
        services: {
          include: { service: true }
        }
      }
    });

    if (!master) {
      return res.status(404).json({ success: false, error: 'Мастер не найден' });
    }

    const services = master.services.map(ms => ({
      id: ms.service.id,
      name: ms.service.name,
      description: ms.service.description || '',
      price: ms.service.price,
      duration: ms.service.duration,
      category: ms.service.category,
      isActive: ms.service.isActive
    }));

    return res.json({ success: true, data: services, count: services.length });
  } catch (error) {
    console.error('Ошибка при получении услуг мастера:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера при получении услуг мастера' });
  }
});

export default router;


