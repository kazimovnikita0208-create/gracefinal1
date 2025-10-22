// Простой тестовый endpoint для Vercel
export default function handler(req, res) {
  console.log('🧪 TEST VERCEL: Получен запрос', req.method, req.url);
  console.log('🧪 TEST VERCEL: Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🧪 TEST VERCEL: Body:', JSON.stringify(req.body, null, 2));
  console.log('🧪 TEST VERCEL: Bot token exists:', !!process.env.TELEGRAM_BOT_TOKEN);
  
  res.status(200).json({ 
    success: true, 
    message: 'Test Vercel endpoint работает!',
    method: req.method,
    url: req.url,
    botTokenExists: !!process.env.TELEGRAM_BOT_TOKEN,
    timestamp: new Date().toISOString()
  });
}
