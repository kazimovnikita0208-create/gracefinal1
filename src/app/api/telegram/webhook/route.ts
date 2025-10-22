import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is running',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('📨 WEBHOOK: Получен запрос POST');
  
  try {
    const body = await request.json();
    console.log('📨 WEBHOOK: Body:', JSON.stringify(body, null, 2));
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('📨 WEBHOOK: Bot token exists:', !!botToken);
    
    if (!botToken) {
      console.error('❌ WEBHOOK: TELEGRAM_BOT_TOKEN не найден');
      return NextResponse.json({ error: 'Bot token not found' }, { status: 500 });
    }
    
    // Обрабатываем сообщения
    if (body.message) {
      const message = body.message;
      console.log('💬 WEBHOOK: Найдено сообщение:', message.text);
      console.log('💬 WEBHOOK: От пользователя:', message.from.first_name);
      
      let responseText = '';
      let replyMarkup = null;
      
      if (message.text === '/start') {
        responseText = '🌟 Добро пожаловать в Grace Beauty Salon!\n\n✨ Мы предлагаем:\n• Маникюр и педикюр\n• Массаж и SPA\n• Косметологические услуги\n• Ногтевой дизайн\n\n📱 Нажмите /app чтобы открыть приложение для записи!';
        console.log('💬 WEBHOOK: Обрабатываем /start');
      } else if (message.text === '/app') {
        const webAppUrl = 'https://gracefinal1.vercel.app';
        responseText = '📱 Открываем приложение для записи...';
        replyMarkup = {
          inline_keyboard: [
            [
              {
                text: '🌟 Записаться на услугу',
                web_app: { url: webAppUrl }
              }
            ]
          ]
        };
        console.log('💬 WEBHOOK: Обрабатываем /app');
      } else if (message.text === '/help') {
        responseText = '🆘 Помощь по боту:\n\n/start - Начать работу с ботом\n/app - Открыть приложение для записи\n/help - Показать эту справку\n\n💬 По вопросам звоните: +7 (XXX) XXX-XX-XX';
        console.log('💬 WEBHOOK: Обрабатываем /help');
      } else {
        responseText = '👋 Спасибо за сообщение!\n\nДля записи на услугу используйте команду /app\nИли нажмите кнопку ниже:';
        replyMarkup = {
          inline_keyboard: [
            [
              {
                text: '📱 Открыть приложение',
                web_app: { url: 'https://gracefinal1.vercel.app' }
              }
            ]
          ]
        };
        console.log('💬 WEBHOOK: Обрабатываем обычное сообщение');
      }
      
      // Отправляем ответ в Telegram
      console.log('📤 WEBHOOK: Отправляем ответ в Telegram...');
      console.log('📤 WEBHOOK: Chat ID:', message.chat.id);
      console.log('📤 WEBHOOK: Response text:', responseText);
      
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: responseText,
          reply_markup: replyMarkup
        })
      });
      
      const telegramResult = await telegramResponse.json();
      console.log('📤 WEBHOOK: Ответ от Telegram API:', JSON.stringify(telegramResult, null, 2));
      
      if (telegramResult.ok) {
        console.log('✅ WEBHOOK: Сообщение отправлено успешно!');
        return NextResponse.json({ success: true, telegramResult });
      } else {
        console.error('❌ WEBHOOK: Ошибка отправки сообщения:', telegramResult);
        return NextResponse.json({ error: 'Failed to send message', details: telegramResult }, { status: 500 });
      }
    } else {
      console.log('📨 WEBHOOK: Сообщение не найдено в теле запроса');
      return NextResponse.json({ success: true, message: 'No message found' });
    }
    
  } catch (error: any) {
    console.error('❌ WEBHOOK: Ошибка обработки webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
