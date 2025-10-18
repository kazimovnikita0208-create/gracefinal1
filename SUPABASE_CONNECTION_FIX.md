# 🔧 Исправление подключения к Supabase

## Проблема
Vercel не может подключиться к Supabase: `Can't reach database server`

## Решения

### 1. Проверьте статус проекта Supabase
- Откройте: https://supabase.com/dashboard/project/fuhtyverxeszomnvdtzo
- Убедитесь, что проект **активен** (не приостановлен)
- Если приостановлен - нажмите "Resume project"

### 2. Попробуйте альтернативные форматы DATABASE_URL

#### Вариант A: С параметрами подключения
```
postgresql://postgres:Grace2025!!final@db.fuhtyverxeszomnvdtzo.supabase.co:5432/postgres?sslmode=require
```

#### Вариант B: С pooler (рекомендуется для Vercel)
```
postgresql://postgres:Grace2025!!final@db.fuhtyverxeszomnvdtzo.supabase.co:6543/postgres?pgbouncer=true&sslmode=require
```

#### Вариант C: Полный URL из Supabase Dashboard
1. Откройте Supabase Dashboard
2. Settings → Database
3. Скопируйте "Connection string" 
4. Замените `[YOUR-PASSWORD]` на `Grace2025!!final`

### 3. Обновите DATABASE_URL в Vercel

1. Откройте Vercel: https://vercel.com/nikitas-projects-1742d776/gracefinal
2. Settings → Environment Variables
3. Найдите `DATABASE_URL`
4. Обновите значение на один из вариантов выше
5. Сохраните изменения
6. Перезапустите деплой

### 4. Проверьте настройки сети в Supabase

1. Supabase Dashboard → Settings → Database
2. Проверьте "Database URL" и "Connection pooling"
3. Убедитесь, что "Direct connection" включен

### 5. Альтернативное решение: Используйте Connection Pooling

Если прямое подключение не работает, попробуйте:
```
postgresql://postgres:Grace2025!!final@db.fuhtyverxeszomnvdtzo.supabase.co:6543/postgres?pgbouncer=true
```

## После обновления

1. **Перезапустите деплой** в Vercel
2. **Проверьте**: https://gracefinal.vercel.app/api/db-test
3. **Если работает** - проверьте: https://gracefinal.vercel.app/api/masters
