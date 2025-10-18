import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 5556; // Другой порт, чтобы не конфликтовать

// Middleware
app.use(express.json());

// Главная страница
app.get('/', async (req, res) => {
  try {
    // Получаем все данные
    const [users, masters, services, appointments, admins] = await Promise.all([
      prisma.user.findMany(),
      prisma.master.findMany(),
      prisma.service.findMany(),
      prisma.appointment.findMany({
        include: {
          user: true,
          master: true,
          service: true
        }
      }),
      prisma.admin.findMany()
    ]);

    const masterServices = await prisma.masterService.findMany({
      include: {
        master: true,
        service: true
      }
    });

    const schedules = await prisma.masterSchedule.findMany({
      include: {
        master: true
      }
    });

    const notifications = await prisma.notification.findMany();

    // Формируем HTML
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grace Beauty Salon - База данных</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ec4899, #be185d);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #ec4899;
        }
        .section h2 {
            margin: 0 0 20px 0;
            color: #1f2937;
            font-size: 1.5rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #ec4899;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .data-table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        .data-table tr:hover {
            background: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }
        .price {
            font-weight: 600;
            color: #059669;
        }
        .rating {
            color: #f59e0b;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Grace Beauty Salon</h1>
            <p>База данных - Просмотр информации</p>
        </div>
        
        <div class="content">
            <!-- Статистика -->
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${users.length}</div>
                    <div class="stat-label">Пользователи</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${masters.length}</div>
                    <div class="stat-label">Мастера</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${services.length}</div>
                    <div class="stat-label">Услуги</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${appointments.length}</div>
                    <div class="stat-label">Записи</div>
                </div>
            </div>

            <!-- Мастера -->
            <div class="section">
                <h2>👨‍💼 Мастера (${masters.length})</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Специализация</th>
                            <th>Опыт</th>
                            <th>Рейтинг</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${masters.map(master => `
                            <tr>
                                <td><strong>${master.name}</strong></td>
                                <td>${master.specialization}</td>
                                <td>${master.experience || 0} лет</td>
                                <td><span class="rating">⭐ ${master.rating}</span></td>
                                <td><span class="badge ${master.isActive ? 'badge-success' : 'badge-warning'}">${master.isActive ? 'Активен' : 'Неактивен'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Услуги -->
            <div class="section">
                <h2>💅 Услуги (${services.length})</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Длительность</th>
                            <th>Категория</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${services.map(service => `
                            <tr>
                                <td><strong>${service.name}</strong></td>
                                <td><span class="price">${(service.price / 100).toFixed(0)}₽</span></td>
                                <td>${service.duration} мин</td>
                                <td><span class="badge badge-info">${service.category}</span></td>
                                <td><span class="badge ${service.isActive ? 'badge-success' : 'badge-warning'}">${service.isActive ? 'Активна' : 'Неактивна'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Связи мастер-услуга -->
            <div class="section">
                <h2>🔗 Связи мастер-услуга (${masterServices.length})</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Мастер</th>
                            <th>Услуга</th>
                            <th>Цена</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${masterServices.map(ms => `
                            <tr>
                                <td><strong>${ms.master.name}</strong></td>
                                <td>${ms.service.name}</td>
                                <td><span class="price">${(ms.service.price / 100).toFixed(0)}₽</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Записи -->
            <div class="section">
                <h2>📅 Записи (${appointments.length})</h2>
                ${appointments.length > 0 ? `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Клиент</th>
                                <th>Мастер</th>
                                <th>Услуга</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th>Цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments.map(appointment => `
                                <tr>
                                    <td>${appointment.user.firstName} ${appointment.user.lastName || ''}</td>
                                    <td>${appointment.master.name}</td>
                                    <td>${appointment.service.name}</td>
                                    <td>${new Date(appointment.appointmentDate).toLocaleDateString('ru-RU')}</td>
                                    <td><span class="badge badge-info">${appointment.status}</span></td>
                                    <td><span class="price">${(appointment.totalPrice / 100).toFixed(0)}₽</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="text-align: center; color: #6b7280; font-style: italic;">Записей пока нет</p>'}
            </div>

            <!-- Админы -->
            <div class="section">
                <h2>👤 Администраторы (${admins.length})</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Роль</th>
                            <th>Telegram ID</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${admins.map(admin => `
                            <tr>
                                <td><strong>${admin.name}</strong></td>
                                <td><span class="badge badge-info">${admin.role}</span></td>
                                <td>${admin.telegramId.toString()}</td>
                                <td><span class="badge ${admin.isActive ? 'badge-success' : 'badge-warning'}">${admin.isActive ? 'Активен' : 'Неактивен'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки данных', details: error });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🌐 Веб-просмотрщик базы данных запущен на http://localhost:${PORT}`);
  console.log('📊 Откройте браузер и перейдите по ссылке выше');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Завершение работы веб-просмотрщика...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Завершение работы веб-просмотрщика...');
  await prisma.$disconnect();
  process.exit(0);
});

// Предотвращаем автоматическое завершение
process.on('uncaughtException', (error) => {
  console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', reason);
});
