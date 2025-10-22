// Простой тестовый endpoint
export default function handler(req, res) {
  console.log('🧪 TEST ENDPOINT - Получен запрос:', req.method, req.url);
  console.log('🧪 TEST ENDPOINT - Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🧪 TEST ENDPOINT - Body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).json({ 
    success: true, 
    message: 'Test endpoint работает!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}


