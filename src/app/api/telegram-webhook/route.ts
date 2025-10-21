import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Логируем полученные данные
    console.log('📨 Получен webhook от Telegram:', JSON.stringify(body, null, 2));
    
    // Обрабатываем различные типы обновлений
    if (body.message) {
      const message = body.message;
      console.log('💬 Сообщение:', message.text);
      
      // Простой ответ на сообщения
      if (message.text === '/start') {
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: message.chat.id,
          text: '🌟 Добро пожаловать в Grace Beauty Salon!\n\n✨ Мы предлагаем:\n• Маникюр и педикюр\n• Массаж и SPA\n• Косметологические услуги\n• Ногтевой дизайн\n\n📱 Нажмите /app чтобы открыть приложение для записи!'
        });
      }
      
      if (message.text === '/app') {
        const webAppUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'https://gracefinal1.vercel.app';
          
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: message.chat.id,
          text: '📱 Открываем приложение для записи...',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌟 Записаться на услугу',
                  web_app: { url: webAppUrl }
                }
              ]
            ]
          }
        });
      }
      
      if (message.text === '/help') {
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: message.chat.id,
          text: '🆘 Помощь по боту:\n\n/start - Начать работу с ботом\n/app - Открыть приложение для записи\n/help - Показать эту справку\n\n💬 По вопросам звоните: +7 (XXX) XXX-XX-XX'
        });
      }
      
      // Ответ на любое другое сообщение
      return NextResponse.json({
        method: 'sendMessage',
        chat_id: message.chat.id,
        text: '👋 Спасибо за сообщение!\n\nДля записи на услугу используйте команду /app\nИли нажмите кнопку ниже:',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Открыть приложение',
                web_app: { url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gracefinal1.vercel.app' }
              }
            ]
          ]
        }
      });
    }
    
    // Обрабатываем callback_query (нажатия на кнопки)
    if (body.callback_query) {
      const callback = body.callback_query;
      console.log('🔘 Callback query:', callback.data);
      
      return NextResponse.json({
        method: 'answerCallbackQuery',
        callback_query_id: callback.id,
        text: '✅ Обработано!'
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telegram webhook endpoint is running',
    timestamp: new Date().toISOString()
  });
}
