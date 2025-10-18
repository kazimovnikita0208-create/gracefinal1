import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewData() {
  console.log('🔍 Просмотр данных в базе данных Grace Beauty Salon\n');

  try {
    // Пользователи
    const users = await prisma.user.findMany();
    console.log('👥 Пользователи:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName || ''} (ID: ${user.id}, Telegram: ${user.telegramId})`);
    });

    // Мастера
    const masters = await prisma.master.findMany();
    console.log('\n👨‍💼 Мастера:', masters.length);
    masters.forEach(master => {
      console.log(`  - ${master.name} (${master.specialization}) - Рейтинг: ${master.rating}, Опыт: ${master.experience} лет`);
    });

    // Услуги
    const services = await prisma.service.findMany();
    console.log('\n💅 Услуги:', services.length);
    services.forEach(service => {
      const price = (service.price / 100).toFixed(0);
      console.log(`  - ${service.name} - ${price}₽, ${service.duration} мин (${service.category})`);
    });

    // Связи мастер-услуга
    const masterServices = await prisma.masterService.findMany({
      include: {
        master: true,
        service: true
      }
    });
    console.log('\n🔗 Связи мастер-услуга:', masterServices.length);
    masterServices.forEach(ms => {
      console.log(`  - ${ms.master.name} → ${ms.service.name}`);
    });

    // Расписание
    const schedules = await prisma.masterSchedule.findMany({
      include: {
        master: true
      }
    });
    console.log('\n📅 Расписание мастеров:');
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    schedules.forEach(schedule => {
      const dayName = dayNames[schedule.dayOfWeek];
      const status = schedule.isWorking ? 'Работает' : 'Выходной';
      console.log(`  - ${schedule.master.name}: ${dayName} ${schedule.startTime}-${schedule.endTime} (${status})`);
    });

    // Записи
    const appointments = await prisma.appointment.findMany({
      include: {
        user: true,
        master: true,
        service: true
      }
    });
    console.log('\n📅 Записи:', appointments.length);
    appointments.forEach(appointment => {
      const date = appointment.appointmentDate.toLocaleDateString('ru-RU');
      const price = (appointment.totalPrice / 100).toFixed(0);
      console.log(`  - ${appointment.user.firstName} → ${appointment.master.name} (${appointment.service.name}) - ${date}, ${price}₽`);
    });

    // Админы
    const admins = await prisma.admin.findMany();
    console.log('\n👤 Администраторы:', admins.length);
    admins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.role}) - Telegram: ${admin.telegramId}`);
    });

    // Уведомления
    const notifications = await prisma.notification.findMany();
    console.log('\n🔔 Уведомления:', notifications.length);
    notifications.forEach(notification => {
      console.log(`  - ${notification.title} (${notification.type}) - ${notification.sentAt.toLocaleDateString('ru-RU')}`);
    });

    console.log('\n✅ Данные успешно загружены!');
    console.log('\n💡 Для интерактивного просмотра используйте: npm run db:studio');

  } catch (error) {
    console.error('❌ Ошибка при загрузке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewData();



