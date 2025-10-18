import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Логируем входящий запрос
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    // Логируем ответ
    logger.info('Response Sent', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
    });

    return originalSend.call(this, body);
  };

  next();
};



