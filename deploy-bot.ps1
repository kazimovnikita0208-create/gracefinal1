# PowerShell скрипт для развертывания Telegram бота на Vercel

Write-Host "🚀 Развертывание Telegram бота на Vercel..." -ForegroundColor Green

# Проверяем наличие Vercel CLI
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI найден: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Устанавливаем Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Проверяем переменные окружения
if (-not $env:TELEGRAM_BOT_TOKEN) {
    Write-Host "❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения" -ForegroundColor Red
    Write-Host "💡 Установите переменную: `$env:TELEGRAM_BOT_TOKEN='ваш_токен'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Настраиваем переменные окружения..." -ForegroundColor Yellow
vercel env add TELEGRAM_BOT_TOKEN production

Write-Host "📤 Развертываем на Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "🔗 Получаем URL развертывания..." -ForegroundColor Yellow
$deploymentUrl = "https://gracefinal1.vercel.app"

Write-Host "🌐 URL развертывания: $deploymentUrl" -ForegroundColor Cyan

Write-Host "🔧 Настраиваем webhook..." -ForegroundColor Yellow
$webhookUrl = "$deploymentUrl/api/telegram-webhook"

# Настраиваем webhook через API
$body = @{
    url = $webhookUrl
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($env:TELEGRAM_BOT_TOKEN)/setWebhook" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Webhook настроен: $webhookUrl" -ForegroundColor Green
    Write-Host "📊 Ответ: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка настройки webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🧪 Тестируем webhook..." -ForegroundColor Yellow
try {
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($env:TELEGRAM_BOT_TOKEN)/getWebhookInfo"
    Write-Host "📊 Информация о webhook:" -ForegroundColor Cyan
    $webhookInfo | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Ошибка получения информации о webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Развертывание завершено!" -ForegroundColor Green
Write-Host "📱 Теперь бот работает 24/7 в облаке!" -ForegroundColor Green
Write-Host "🔗 URL: $deploymentUrl" -ForegroundColor Cyan
Write-Host "🤖 Webhook: $webhookUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Для тестирования отправьте /start боту" -ForegroundColor Yellow
