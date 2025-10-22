# 🚀 Развертывание Telegram бота на Railway

## Шаг 1: Подготовка проекта

1. Создайте файл `railway.json` в корне проекта:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node telegram-bot/bot.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Создайте файл `Procfile`:
```
worker: node telegram-bot/bot.js
```

3. Убедитесь, что в `package.json` есть:
```json
{
  "scripts": {
    "start": "node telegram-bot/bot.js"
  }
}
```

## Шаг 2: Развертывание на Railway

1. Зайдите на https://railway.app
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий
6. Railway автоматически развернет проект

## Шаг 3: Настройка переменных окружения

1. В панели Railway перейдите в Settings
2. Добавьте переменную `TELEGRAM_BOT_TOKEN`
3. Значение: `7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU`

## Шаг 4: Настройка webhook

После развертывания Railway даст вам URL вида:
`https://your-project.railway.app`

Установите webhook:
```bash
curl -X POST "https://api.telegram.org/bot7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.railway.app/webhook"}'
```

## Преимущества Railway:
- ✅ Простое развертывание
- ✅ Автоматические деплои
- ✅ Бесплатный план
- ✅ Поддержка Node.js
- ✅ Переменные окружения
- ✅ Логи в реальном времени


