import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Загружаем переменные окружения
dotenv.config({ path: './env' });
console.log('🔧 PORT из env:', process.env.PORT);
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Импортируем роутеры
import mastersRouter from './routes/masters';
import servicesRouter from './routes/services';
import appointmentsRouter from './routes/appointments';
import userRouter from './routes/user';
import scheduleRouter from './routes/schedule';
import adminRouter from './routes/admin';

// Загружаем переменные окружения
dotenv.config();

// Инициализация Prisma
export const prisma = new PrismaClient();

// Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // лимит запросов
  message: {
    success: false,
    error: 'Слишком много запросов, попробуйте позже',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet()); // Безопасность HTTP заголовков
app.use(limiter); // Rate limiting
app.use(cors({
  origin: true, // dev: разрешаем все источники
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
  maxAge: 86400,
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Логирование запросов

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// API Routes
app.use('/api', (req, res, next) => {
  logger.info(`API Request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// API маршруты
app.use('/api/masters', mastersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/user', userRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    message: `Не удалось найти ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Получен SIGINT, завершаем работу...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Получен SIGTERM, завершаем работу...');
  await prisma.$disconnect();
  process.exit(0);
});

// Запуск сервера
const server = app.listen(PORT, () => {
  logger.info(`🚀 Сервер запущен на порту ${PORT}`);
  logger.info(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Порт ${PORT} уже используется`);
  } else {
    logger.error('❌ Ошибка сервера:', error);
  }
  process.exit(1);
});

export default app;
