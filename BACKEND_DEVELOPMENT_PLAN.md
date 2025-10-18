# 🚀 План разработки Backend для Grace Beauty Salon

## 📋 Обзор проекта

**Grace Beauty Salon** - это Telegram Web App для салона красоты с полной экосистемой управления записями, мастерами, услугами и клиентами.

### 🎯 Цели backend разработки:
- **REST API** для frontend приложения
- **Telegram аутентификация** через Telegram ID
- **SQLite база данных** с Prisma ORM
- **Админ панель** для управления салоном
- **Уведомления** через Telegram Bot

---

## 🏗️ Архитектура Backend

### 📦 Технологический стек:
- **Node.js** + **Express.js**
- **TypeScript** для типобезопасности
- **SQLite** + **Prisma ORM**
- **Telegram Bot API** для уведомлений
- **JWT** для аутентификации
- **CORS** для frontend интеграции

### 🗂️ Структура проекта:
```
backend/
├── src/
│   ├── controllers/     # Контроллеры API
│   ├── middleware/     # Middleware (auth, validation)
│   ├── models/         # Prisma модели
│   ├── routes/         # API маршруты
│   ├── services/       # Бизнес логика
│   ├── utils/          # Утилиты
│   └── app.ts          # Главный файл приложения
├── prisma/
│   ├── schema.prisma   # Схема базы данных
│   └── migrations/     # Миграции
├── package.json
└── .env
```

---

## 🗄️ Схема базы данных (Prisma)

### 📊 Основные модели:

```prisma
// Пользователи (клиенты салона)
model User {
  id          Int      @id @default(autoincrement())
  telegramId  BigInt   @unique
  firstName   String
  lastName    String?
  username    String?
  phone       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  appointments Appointment[]
  reviews      Review[]
  
  @@map("users")
}

// Мастера салона
model Master {
  id            Int      @id @default(autoincrement())
  name          String
  specialization String
  description   String?
  photoUrl      String?
  experience    Int?     // Опыт в годах
  rating        Float    @default(0.0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Связи
  appointments  Appointment[]
  schedules    MasterSchedule[]
  services      MasterService[]
  reviews       Review[]
  
  @@map("masters")
}

// Услуги салона
model Service {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Int      // Цена в копейках
  duration    Int      // Длительность в минутах
  category    String   // hair, nails, face
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  appointments Appointment[]
  masterServices MasterService[]
  
  @@map("services")
}

// Записи клиентов
model Appointment {
  id             Int              @id @default(autoincrement())
  userId         Int
  masterId       Int
  serviceId      Int
  appointmentDate DateTime
  status         AppointmentStatus @default(PENDING)
  notes          String?
  totalPrice     Int              // Итоговая цена в копейках
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  // Связи
  user           User             @relation(fields: [userId], references: [id])
  master         Master           @relation(fields: [masterId], references: [id])
  service        Service          @relation(fields: [serviceId], references: [id])
  
  @@map("appointments")
}

// Расписание мастеров
model MasterSchedule {
  id        Int     @id @default(autoincrement())
  masterId  Int
  dayOfWeek Int     // 0-6 (воскресенье-суббота)
  startTime String  // HH:mm
  endTime   String  // HH:mm
  isWorking Boolean @default(true)
  
  // Связи
  master    Master  @relation(fields: [masterId], references: [id])
  
  @@unique([masterId, dayOfWeek])
  @@map("master_schedules")
}

// Связь мастеров и услуг
model MasterService {
  id        Int @id @default(autoincrement())
  masterId Int
  serviceId Int
  
  // Связи
  master   Master  @relation(fields: [masterId], references: [id])
  service  Service @relation(fields: [serviceId], references: [id])
  
  @@unique([masterId, serviceId])
  @@map("master_services")
}

// Отзывы клиентов
model Review {
  id        Int     @id @default(autoincrement())
  userId    Int
  masterId  Int
  rating    Int     // 1-5
  comment   String?
  createdAt DateTime @default(now())
  
  // Связи
  user      User    @relation(fields: [userId], references: [id])
  master    Master  @relation(fields: [masterId], references: [id])
  
  @@map("reviews")
}

// Администраторы
model Admin {
  id         Int      @id @default(autoincrement())
  telegramId BigInt   @unique
  name       String
  role       AdminRole @default(MANAGER)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  
  @@map("admins")
}

// Уведомления
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int?
  type      NotificationType
  title     String
  message   String
  isRead    Boolean  @default(false)
  sentAt    DateTime @default(now())
  
  @@map("notifications")
}

// Enums
enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum AdminRole {
  SUPER_ADMIN
  MANAGER
  RECEPTIONIST
}

enum NotificationType {
  APPOINTMENT_REMINDER
  APPOINTMENT_CONFIRMED
  APPOINTMENT_CANCELLED
  PROMOTION
  SYSTEM
}
```

---

## 🔐 Система аутентификации

### 📱 Telegram Web App аутентификация:

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  auth_date: number;
  hash: string;
}

export const verifyTelegramAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { initData } = req.body;
    
    // Парсим данные от Telegram
    const authData = parseTelegramData(initData);
    
    // Проверяем подпись
    if (!verifyTelegramSignature(authData)) {
      return res.status(401).json({ error: 'Invalid Telegram signature' });
    }
    
    // Проверяем время (не старше 24 часов)
    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 86400) {
      return res.status(401).json({ error: 'Auth data expired' });
    }
    
    // Находим или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(authData.id) }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(authData.id),
          firstName: authData.first_name,
          lastName: authData.last_name,
          username: authData.username
        }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

function verifyTelegramSignature(authData: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  const dataCheckString = Object.keys(authData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');
  
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return hash === authData.hash;
}
```

---

## 🛠️ API Endpoints

### 👤 Пользователи:
```typescript
// GET /api/users/me - Получить текущего пользователя
// PUT /api/users/me - Обновить профиль
// GET /api/users/me/appointments - Мои записи
```

### 👨‍💼 Мастера:
```typescript
// GET /api/masters - Список всех мастеров
// GET /api/masters/:id - Информация о мастере
// GET /api/masters/:id/schedule - Расписание мастера
// GET /api/masters/:id/available-slots - Доступные слоты
```

### 💅 Услуги:
```typescript
// GET /api/services - Список всех услуг
// GET /api/services/:id - Информация об услуге
// GET /api/masters/:id/services - Услуги мастера
```

### 📅 Записи:
```typescript
// POST /api/appointments - Создать запись
// GET /api/appointments - Список записей (с фильтрами)
// GET /api/appointments/:id - Информация о записи
// PUT /api/appointments/:id - Обновить запись
// DELETE /api/appointments/:id - Отменить запись
```

### 🔔 Уведомления:
```typescript
// GET /api/notifications - Список уведомлений
// PUT /api/notifications/:id/read - Отметить как прочитанное
// POST /api/notifications/send - Отправить уведомление
```

---

## 🎛️ Админ панель API

### 📊 Статистика:
```typescript
// GET /api/admin/dashboard - Общая статистика
// GET /api/admin/appointments/stats - Статистика записей
// GET /api/admin/revenue - Выручка
// GET /api/admin/masters/performance - Производительность мастеров
```

### 👥 Управление мастерами:
```typescript
// POST /api/admin/masters - Добавить мастера
// PUT /api/admin/masters/:id - Обновить мастера
// DELETE /api/admin/masters/:id - Удалить мастера
// PUT /api/admin/masters/:id/schedule - Обновить расписание
```

### 💅 Управление услугами:
```typescript
// POST /api/admin/services - Добавить услугу
// PUT /api/admin/services/:id - Обновить услугу
// DELETE /api/admin/services/:id - Удалить услугу
// PUT /api/admin/services/:id/status - Изменить статус
```

### 📅 Управление записями:
```typescript
// GET /api/admin/appointments - Все записи (с фильтрами)
// PUT /api/admin/appointments/:id/status - Изменить статус
// POST /api/admin/appointments/:id/notify - Отправить уведомление
```

### 🎁 Бонусная система:
```typescript
// GET /api/admin/bonuses - Настройки бонусов
// PUT /api/admin/bonuses - Обновить настройки
// GET /api/admin/users/:id/bonuses - Бонусы пользователя
```

---

## 🤖 Telegram Bot интеграция

### 📱 Уведомления через бота:

```typescript
// services/telegramBot.ts
import { Telegraf } from 'telegraf';

class TelegramBotService {
  private bot: Telegraf;
  
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
    this.setupHandlers();
  }
  
  // Отправка уведомления о записи
  async sendAppointmentNotification(
    telegramId: number, 
    appointment: Appointment
  ) {
    const message = `
🎉 Ваша запись подтверждена!

📅 Дата: ${formatDate(appointment.appointmentDate)}
👨‍💼 Мастер: ${appointment.master.name}
💅 Услуга: ${appointment.service.name}
💰 Стоимость: ${formatPrice(appointment.totalPrice)}

До встречи в салоне Grace! ✨
    `;
    
    await this.bot.telegram.sendMessage(telegramId, message);
  }
  
  // Напоминание о записи
  async sendReminder(telegramId: number, appointment: Appointment) {
    const message = `
⏰ Напоминание о записи

Через 2 часа у вас запись:
📅 ${formatDateTime(appointment.appointmentDate)}
👨‍💼 ${appointment.master.name}
💅 ${appointment.service.name}

Не забудьте прийти вовремя! 😊
    `;
    
    await this.bot.telegram.sendMessage(telegramId, message);
  }
  
  // Отмена записи
  async sendCancellation(telegramId: number, appointment: Appointment) {
    const message = `
❌ Запись отменена

Ваша запись на ${formatDate(appointment.appointmentDate)} отменена.

Вы можете записаться на другое время через приложение.
    `;
    
    await this.bot.telegram.sendMessage(telegramId, message);
  }
}
```

---

## 📊 Система аналитики

### 📈 Метрики для админ панели:

```typescript
// services/analytics.ts
export class AnalyticsService {
  // Статистика за период
  async getPeriodStats(startDate: Date, endDate: Date) {
    return {
      totalAppointments: await this.getTotalAppointments(startDate, endDate),
      totalRevenue: await this.getTotalRevenue(startDate, endDate),
      averageRating: await this.getAverageRating(),
      popularServices: await this.getPopularServices(startDate, endDate),
      masterPerformance: await this.getMasterPerformance(startDate, endDate)
    };
  }
  
  // Выручка по дням
  async getDailyRevenue(days: number = 30) {
    // Агрегация выручки по дням
  }
  
  // Загруженность мастеров
  async getMasterWorkload(masterId: number, date: Date) {
    // Расчет загруженности мастера
  }
  
  // Популярные услуги
  async getPopularServices(limit: number = 10) {
    // Топ услуг по количеству записей
  }
}
```

---

## 🔧 Конфигурация и развертывание

### 📦 package.json:
```json
{
  "name": "grace-salon-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "telegraf": "^4.15.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.6.2",
    "typescript": "^5.3.3"
  }
}
```

### 🌍 Environment variables:
```env
# Database
DATABASE_URL="file:./dev.db"

# Telegram
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_WEBHOOK_URL="https://your-domain.com/webhook"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

---

## 🚀 План разработки

### 📅 Этап 1: Базовая настройка (1-2 дня)
- [ ] Инициализация проекта
- [ ] Настройка Prisma + SQLite
- [ ] Базовая структура Express
- [ ] Middleware для CORS и безопасности
- [ ] Telegram аутентификация

### 📅 Этап 2: Основные API (3-4 дня)
- [ ] CRUD для пользователей
- [ ] CRUD для мастеров
- [ ] CRUD для услуг
- [ ] CRUD для записей
- [ ] Система расписания

### 📅 Этап 3: Telegram Bot (2-3 дня)
- [ ] Настройка бота
- [ ] Уведомления о записях
- [ ] Напоминания
- [ ] Интеграция с API

### 📅 Этап 4: Админ панель (3-4 дня)
- [ ] Админ аутентификация
- [ ] Статистика и аналитика
- [ ] Управление мастерами
- [ ] Управление услугами
- [ ] Управление записями

### 📅 Этап 5: Дополнительные функции (2-3 дня)
- [ ] Система уведомлений
- [ ] Бонусная программа
- [ ] Отзывы и рейтинги
- [ ] Экспорт данных

### 📅 Этап 6: Тестирование и оптимизация (2-3 дня)
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] Оптимизация запросов
- [ ] Документация API

---

## 🔒 Безопасность

### 🛡️ Меры безопасности:
- **Telegram подпись** для аутентификации
- **Rate limiting** для API
- **CORS** настройки
- **Helmet** для HTTP заголовков
- **Валидация** всех входных данных
- **SQL injection** защита через Prisma

### 🔐 Админ доступ:
- Отдельная система аутентификации для админов
- Роли и права доступа
- Логирование действий админов

---

## 📱 Интеграция с Frontend

### 🔄 API контракт:
```typescript
// Все API endpoints должны соответствовать frontend типам
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Примеры endpoints:
// GET /api/masters -> Master[]
// GET /api/services -> Service[]
// POST /api/appointments -> Appointment
```

### 🌐 CORS настройки:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Мониторинг и логирование

### 📈 Метрики:
- Количество записей в день
- Выручка по периодам
- Загруженность мастеров
- Ошибки API

### 📝 Логирование:
- Запросы к API
- Ошибки и исключения
- Действия админов
- Telegram уведомления

---

## 🎯 Результат

После реализации этого плана получится:

✅ **Полнофункциональный backend** для салона красоты  
✅ **Telegram Web App** интеграция  
✅ **Админ панель** для управления  
✅ **Система уведомлений** через бота  
✅ **Аналитика и статистика**  
✅ **Безопасная аутентификация**  
✅ **Масштабируемая архитектура**  

**Общее время разработки: 15-20 дней** 🚀



