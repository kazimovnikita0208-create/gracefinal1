# PowerShell script to start Telegram bot
Set-Location "C:\Users\Nikita\Desktop\GraceFinal"

# Start the bot with PM2
pm2 start ecosystem.config.js

Write-Host "Telegram bot started successfully!" -ForegroundColor Green
Write-Host "Bot is running in the background." -ForegroundColor Yellow
Write-Host "To check status: pm2 status" -ForegroundColor Cyan
Write-Host "To stop bot: pm2 stop grace-telegram-bot" -ForegroundColor Cyan
Write-Host "To restart bot: pm2 restart grace-telegram-bot" -ForegroundColor Cyan

# Keep window open for 3 seconds
Start-Sleep -Seconds 3
