# 🚀 Решение проблемы с URL serveo на Vercel

## ❌ Проблема:
- Vercel использует старый serveo URL
- serveo URL меняется при перезапуске
- Frontend не может подключиться к backend

## ✅ Решения:

### 1. **Deploy backend на Vercel (рекомендуется)**

#### Создайте отдельный репозиторий для backend:
```bash
# Создайте новый репозиторий на GitHub для backend
# Например: grace-backend
```

#### Настройте Vercel для backend:
1. Подключите backend репозиторий к Vercel
2. Настройте переменные окружения:
   - `DATABASE_URL`
   - `TELEGRAM_BOT_TOKEN`
3. Deploy backend на Vercel

#### Обновите frontend API URL:
```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://grace-backend.vercel.app'  // Vercel backend URL
  : 'http://localhost:3001';            // Local development
```

### 2. **Использовать Railway для backend**

#### Deploy на Railway:
1. Зайдите на https://railway.app
2. Подключите GitHub репозиторий
3. Deploy backend
4. Получите стабильный URL

#### Обновите API URL:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://grace-backend-production.up.railway.app'
  : 'http://localhost:3001';
```

### 3. **Использовать Render для backend**

#### Deploy на Render:
1. Зайдите на https://render.com
2. Подключите GitHub репозиторий
3. Deploy backend
4. Получите стабильный URL

### 4. **Временное решение: Обновить serveo URL**

#### Получите новый serveo URL:
```bash
ssh -R 80:localhost:3001 serveo.net
```

#### Обновите Vercel переменные окружения:
1. Зайдите в Vercel Dashboard
2. Выберите ваш проект
3. Settings → Environment Variables
4. Обновите `NEXT_PUBLIC_API_URL` на новый serveo URL

## 🚀 Рекомендуемый план:

### Шаг 1: Deploy backend на Vercel
1. Создайте новый репозиторий для backend
2. Скопируйте папку `backend/` в новый репозиторий
3. Deploy на Vercel
4. Получите стабильный URL

### Шаг 2: Обновите frontend
1. Обновите API URL в коде
2. Redeploy frontend на Vercel

### Шаг 3: Настройте переменные окружения
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://grace-backend.vercel.app

# Backend (Vercel Environment Variables)
DATABASE_URL=file:./dev.db
TELEGRAM_BOT_TOKEN=7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k
```

## 🎯 Готово!

После этого у вас будет стабильная связка:
- Frontend: https://gracefinal.vercel.app
- Backend: https://grace-backend.vercel.app
- Telegram Bot: работает с serveo или тоже на Vercel
