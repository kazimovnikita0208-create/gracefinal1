# 🗄️ Создание таблиц в Supabase

## Шаг 1: Откройте SQL Editor в Supabase

1. Откройте: https://supabase.com/dashboard/project/fuhtyverxeszomnvdtzo
2. Перейдите в **SQL Editor**
3. Нажмите **"New query"**

## Шаг 2: Выполните SQL миграцию

Скопируйте и выполните этот SQL код:

```sql
-- Создание таблиц для Grace Salon

-- Пользователи
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "telegramId" BIGINT UNIQUE NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Мастера
CREATE TABLE "Master" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Услуги
CREATE TABLE "Service" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Записи
CREATE TABLE "Appointment" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "masterId" INTEGER NOT NULL REFERENCES "Master"("id") ON DELETE CASCADE,
    "serviceId" INTEGER NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "totalPrice" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Расписание мастеров
CREATE TABLE "MasterSchedule" (
    "id" SERIAL PRIMARY KEY,
    "masterId" INTEGER NOT NULL REFERENCES "Master"("id") ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Связь мастер-услуга
CREATE TABLE "MasterService" (
    "id" SERIAL PRIMARY KEY,
    "masterId" INTEGER NOT NULL REFERENCES "Master"("id") ON DELETE CASCADE,
    "serviceId" INTEGER NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    UNIQUE("masterId", "serviceId")
);

-- Отзывы
CREATE TABLE "Review" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "masterId" INTEGER NOT NULL REFERENCES "Master"("id") ON DELETE CASCADE,
    "appointmentId" INTEGER REFERENCES "Appointment"("id") ON DELETE SET NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Админы
CREATE TABLE "Admin" (
    "id" SERIAL PRIMARY KEY,
    "telegramId" BIGINT UNIQUE NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Уведомления
CREATE TABLE "Notification" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

## Шаг 3: Проверьте создание таблиц

После выполнения SQL:
1. Перейдите в **Table Editor**
2. Убедитесь, что созданы таблицы: User, Master, Service, Appointment, etc.

## Шаг 4: Обновите DATABASE_URL в Vercel

1. Откройте: https://vercel.com/nikitas-projects-1742d776/gracefinal
2. **Settings** → **Environment Variables**
3. Убедитесь, что `DATABASE_URL` правильный:
   ```
   postgresql://postgres:Grace2025!!final@db.fuhtyverxeszomnvdtzo.supabase.co:5432/postgres
   ```

## Шаг 5: Перезапустите деплой

1. **Deployments** → **Redeploy**
2. Дождитесь завершения
3. Проверьте: https://gracefinal.vercel.app/api/db-test
