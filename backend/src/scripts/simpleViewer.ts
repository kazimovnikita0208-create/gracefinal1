import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewDatabase() {
  try {
    console.log('\n🌸 Grace Beauty Salon - База данных\n');
    console.log('=' .repeat(50));

    // Пользователи
    const users = await prisma.user.findMany();
    console.log(`\n👥 ПОЛЬЗОВАТЕЛИ (${users.length}):`);
    users.forEach(user => {
      console.log(`  • ${user.firstName} ${user.lastName || ''} (ID: ${user.telegramId})`);
    });

    // Мастера
    const masters = await prisma.master.findMany();
    console.log(`\n👨‍💼 МАСТЕРА (${masters.length}):`);
    masters.forEach(master => {
      console.log(`  • ${master.name} - ${master.specialization}`);
      console.log(`    Опыт: ${master.experience || 0} лет, Рейтинг: ⭐ ${master.rating}`);
      console.log(`    Статус: ${master.isActive ? '✅ Активен' : '❌ Неактивен'}`);
    });

    // Услуги
    const services = await prisma.service.findMany();
    console.log(`\n💅 УСЛУГИ (${services.length}):`);
    services.forEach(service => {
      console.log(`  • ${service.name} - ${(service.price / 100).toFixed(0)}₽`);
      console.log(`    Длительность: ${service.duration} мин, Категория: ${service.category}`);
      console.log(`    Статус: ${service.isActive ? '✅ Активна' : '❌ Неактивна'}`);
    });

    // Связи мастер-услуга
    const masterServices = await prisma.masterService.findMany({
      include: {
        master: true,
        service: true
      }
    });
    console.log(`\n🔗 СВЯЗИ МАСТЕР-УСЛУГА (${masterServices.length}):`);
    masterServices.forEach(ms => {
      console.log(`  • ${ms.master.name} → ${ms.service.name} (${(ms.service.price / 100).toFixed(0)}₽)`);
    });

    // Расписание
    const schedules = await prisma.masterSchedule.findMany({
      include: {
        master: true
      }
    });
    console.log(`\n📅 РАСПИСАНИЕ (${schedules.length} записей):`);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    schedules.forEach(schedule => {
      const dayName = days[schedule.dayOfWeek];
      console.log(`  • ${schedule.master.name}: ${dayName} ${schedule.startTime}-${schedule.endTime}`);
    });

    // Записи
    const appointments = await prisma.appointment.findMany({
      include: {
        user: true,
        master: true,
        service: true
      }
    });
    console.log(`\n📋 ЗАПИСИ (${appointments.length}):`);
    if (appointments.length > 0) {
      appointments.forEach(appointment => {
        const date = new Date(appointment.appointmentDate).toLocaleDateString('ru-RU');
        console.log(`  • ${appointment.user.firstName} → ${appointment.master.name} → ${appointment.service.name}`);
        console.log(`    Дата: ${date}, Статус: ${appointment.status}, Цена: ${(appointment.totalPrice / 100).toFixed(0)}₽`);
      });
    } else {
      console.log('  📝 Записей пока нет');
    }

    // Админы
    const admins = await prisma.admin.findMany();
    console.log(`\n👤 АДМИНИСТРАТОРЫ (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`  • ${admin.name} (${admin.role}) - Telegram ID: ${admin.telegramId}`);
      console.log(`    Статус: ${admin.isActive ? '✅ Активен' : '❌ Неактивен'}`);
    });

    // Уведомления
    const notifications = await prisma.notification.findMany();
    console.log(`\n🔔 УВЕДОМЛЕНИЯ (${notifications.length}):`);
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        console.log(`  • ${notification.title}: ${notification.message}`);
        console.log(`    Тип: ${notification.type}, Прочитано: ${notification.isRead ? '✅' : '❌'}`);
      });
    } else {
      console.log('  📝 Уведомлений пока нет');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✅ Просмотр базы данных завершен!');
    console.log('\n💡 Для веб-интерфейса используйте: npm run db:web');
    console.log('💡 Для Prisma Studio используйте: npm run db:studio');

  } catch (error) {
    console.error('❌ Ошибка при просмотре базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewDatabase();



