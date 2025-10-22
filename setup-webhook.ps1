# PowerShell скрипт для настройки webhook
$botToken = "7725254943:AAESbQTSTCpGw1t2ltyBO9SBimcUxOq033k"
$webhookUrl = "https://gracefinal-51rbs5u5d-nikitas-projects-1742d776.vercel.app/api/telegram-webhook"

Write-Host "🔧 Настраиваем webhook для Telegram бота..." -ForegroundColor Green
Write-Host "🤖 Токен бота: $botToken" -ForegroundColor Yellow
Write-Host "🌐 Webhook URL: $webhookUrl" -ForegroundColor Yellow

try {
    $body = @{
        url = $webhookUrl
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ Webhook настроен успешно!" -ForegroundColor Green
    Write-Host "📊 Ответ: $($response | ConvertTo-Json)" -ForegroundColor Cyan
    
    # Проверяем информацию о webhook
    Write-Host "🔍 Проверяем информацию о webhook..." -ForegroundColor Yellow
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
    Write-Host "📋 Информация о webhook:" -ForegroundColor Cyan
    $webhookInfo | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ Ошибка настройки webhook: $($_.Exception.Message)" -ForegroundColor Red
}