#!/bin/bash

echo "🚀 Развертывание Telegram бота на Vercel..."

# Проверяем наличие Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаем Vercel CLI..."
    npm install -g vercel
fi

# Проверяем переменные окружения
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения"
    echo "💡 Установите переменную: export TELEGRAM_BOT_TOKEN='ваш_токен'"
    exit 1
fi

echo "🔧 Настраиваем переменные окружения..."
vercel env add TELEGRAM_BOT_TOKEN production

echo "📤 Развертываем на Vercel..."
vercel --prod

echo "🔗 Получаем URL развертывания..."
DEPLOYMENT_URL=$(vercel ls | grep gracefinal1 | awk '{print $2}' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="https://gracefinal1.vercel.app"
fi

echo "🌐 URL развертывания: $DEPLOYMENT_URL"

echo "🔧 Настраиваем webhook..."
WEBHOOK_URL="$DEPLOYMENT_URL/api/telegram-webhook"

# Настраиваем webhook через API
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}"

echo "✅ Webhook настроен: $WEBHOOK_URL"

echo "🧪 Тестируем webhook..."
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"

echo ""
echo "🎉 Развертывание завершено!"
echo "📱 Теперь бот работает 24/7 в облаке!"
echo "🔗 URL: $DEPLOYMENT_URL"
echo "🤖 Webhook: $WEBHOOK_URL"
