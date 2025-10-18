import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyTelegramAuth } from '../middleware/telegramAuth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/user - Получить информацию о пользователе
router.get('/', verifyTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        appointments: {
          include: {
            master: {
              select: {
                id: true,
                name: true,
                specialization: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          },
          orderBy: {
            appointmentDate: 'desc'
          },
          take: 5 // Последние 5 записей
        },
        reviews: {
          include: {
            master: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Последние 5 отзывов
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    const userData = {
      id: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      recentAppointments: user.appointments.map(appointment => ({
        id: appointment.id,
        master: appointment.master,
        service: appointment.service,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        totalPrice: appointment.totalPrice
      })),
      recentReviews: user.reviews.map(review => ({
        id: review.id,
        master: review.master.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }))
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении пользователя'
    });
  }
});

// PUT /api/user - Обновить информацию о пользователе
router.put('/', verifyTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, phone } = req.body;

    // Валидация данных
    const updateData: any = {};
    
    if (firstName && typeof firstName === 'string' && firstName.trim()) {
      updateData.firstName = firstName.trim();
    }
    
    if (lastName !== undefined) {
      updateData.lastName = lastName ? lastName.trim() : null;
    }
    
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Нет данных для обновления'
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: updateData,
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Информация о пользователе обновлена'
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при обновлении пользователя'
    });
  }
});

// GET /api/user/appointments - Получить все записи пользователя
router.get('/appointments', verifyTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const whereClause: any = {
      userId: userId
    };

    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        master: {
          select: {
            id: true,
            name: true,
            specialization: true,
            photoUrl: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const appointmentsData = appointments.map(appointment => ({
      id: appointment.id,
      master: appointment.master,
      service: appointment.service,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes,
      totalPrice: appointment.totalPrice,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json({
      success: true,
      data: appointmentsData,
      count: appointmentsData.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записей пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей'
    });
  }
});

// GET /api/user/reviews - Получить отзывы пользователя
router.get('/reviews', verifyTelegramAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        userId: userId
      },
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
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const reviewsData = reviews.map(review => ({
      id: review.id,
      master: review.master,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json({
      success: true,
      data: reviewsData,
      count: reviewsData.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении отзывов пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении отзывов'
    });
  }
});

export default router;
