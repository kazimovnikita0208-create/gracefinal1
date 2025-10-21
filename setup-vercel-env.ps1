# PowerShell скрипт для настройки переменных окружения Vercel

Write-Host "🔧 Настройка переменных окружения Vercel..." -ForegroundColor Green

# Токен бота
$botToken = "7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k"

Write-Host "📝 Добавляем TELEGRAM_BOT_TOKEN..." -ForegroundColor Yellow

# Используем echo для передачи токена в vercel env add
$token | vercel env add TELEGRAM_BOT_TOKEN production

Write-Host "✅ Переменная окружения добавлена!" -ForegroundColor Green
Write-Host "🔄 Перезапускаем развертывание..." -ForegroundColor Yellow

# Перезапускаем развертывание
vercel --prod --yes

Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "📱 Теперь бот должен работать в облаке!" -ForegroundColor Cyan
