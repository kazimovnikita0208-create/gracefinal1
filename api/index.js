const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://gracefinal.vercel.app', 'https://web.telegram.org'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Grace Salon API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock data for testing
const mockMasters = [
  {
    id: 1,
    name: "Анна Иванова",
    specialization: "Мастер маникюра",
    description: "Опытный мастер с 5-летним стажем",
    photoUrl: "https://via.placeholder.com/300x300",
    experience: 5,
    isActive: true,
    services: [
      {
        service: {
          id: 1,
          name: "Маникюр классический",
          price: 1500,
          duration: 60
        }
      }
    ],
    _count: {
      appointments: 12
    }
  },
  {
    id: 2,
    name: "Мария Петрова",
    specialization: "Мастер педикюра",
    description: "Специалист по аппаратному педикюру",
    photoUrl: "https://via.placeholder.com/300x300",
    experience: 3,
    isActive: true,
    services: [
      {
        service: {
          id: 2,
          name: "Педикюр аппаратный",
          price: 2000,
          duration: 90
        }
      }
    ],
    _count: {
      appointments: 8
    }
  }
];

const mockServices = [
  {
    id: 1,
    name: "Маникюр классический",
    description: "Классический маникюр с покрытием",
    price: 1500,
    duration: 60,
    category: "Маникюр",
    isActive: true,
    masterServices: [
      {
        master: {
          id: 1,
          name: "Анна Иванова"
        }
      }
    ],
    _count: {
      appointments: 12
    }
  },
  {
    id: 2,
    name: "Педикюр аппаратный",
    description: "Аппаратный педикюр с покрытием",
    price: 2000,
    duration: 90,
    category: "Педикюр",
    isActive: true,
    masterServices: [
      {
        master: {
          id: 2,
          name: "Мария Петрова"
        }
      }
    ],
    _count: {
      appointments: 8
    }
  }
];

// Masters routes
app.get('/api/masters', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockMasters
    });
  } catch (error) {
    console.error('Ошибка при получении мастеров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастеров'
    });
  }
});

// Get master by ID
app.get('/api/masters/:id', async (req, res) => {
  try {
    const masterId = parseInt(req.params.id);
    const master = mockMasters.find(m => m.id === masterId);
    
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
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении мастера'
    });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockServices
    });
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуг'
    });
  }
});

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = mockServices.find(s => s.id === serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Ошибка при получении услуги:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении услуги'
    });
  }
});

// Appointments routes
app.get('/api/appointments', async (req, res) => {
  try {
    const mockAppointments = [
      {
        id: 1,
        userId: 1,
        masterId: 1,
        serviceId: 1,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING',
        notes: 'Тестовая запись',
        totalPrice: 1500,
        master: mockMasters[0],
        service: mockServices[0]
      }
    ];

    res.json({
      success: true,
      data: mockAppointments,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении записей'
    });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { masterId, serviceId, appointmentDate, notes } = req.body;

    if (!masterId || !serviceId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Мастер, услуга и дата записи обязательны'
      });
    }

    const master = mockMasters.find(m => m.id === parseInt(masterId));
    const service = mockServices.find(s => s.id === parseInt(serviceId));

    if (!master) {
      return res.status(404).json({
        success: false,
        error: 'Мастер не найден'
      });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Услуга не найдена'
      });
    }

    const appointment = {
      id: Math.floor(Math.random() * 1000),
      userId: 1,
      masterId: parseInt(masterId),
      serviceId: parseInt(serviceId),
      appointmentDate: new Date(appointmentDate).toISOString(),
      notes: notes || null,
      totalPrice: service.price,
      status: 'PENDING',
      master: master,
      service: service
    };

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании записи'
    });
  }
});

// Admin routes
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        today: {
          appointments: 3,
          revenue: 4500
        },
        total: {
          appointments: 25,
          masters: 2,
          services: 2,
          users: 15
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении статистики'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint не найден'
  });
});

module.exports = app;