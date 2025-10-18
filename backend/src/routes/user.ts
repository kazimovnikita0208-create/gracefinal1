import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/user/me - Получить текущего пользователя
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 1 }, // Временно для тестирования
      include: {
        _count: {
          select: {
            appointments: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении пользователя'
    });
  }
});

// PUT /api/user/me - Обновить профиль пользователя
router.put('/me', async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await prisma.user.update({
      where: { id: 1 }, // Временно для тестирования
      data: {
        phone: phone || null
      }
    });

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении пользователя'
    });
  }
});

// GET /api/user/me/appointments - Получить записи пользователя
router.get('/me/appointments', async (req, res) => {
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
    console.error('Ошибка при получении записей пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей пользователя'
    });
  }
});

// GET /api/user/me/reviews - Получить отзывы пользователя
router.get('/me/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        userId: 1 // Временно для тестирования
      },
      include: {
        master: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Ошибка при получении отзывов пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении отзывов пользователя'
    });
  }
});

export default router;
