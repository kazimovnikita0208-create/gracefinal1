'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice } from '@/lib/utils';
import { adminApi } from '@/lib/adminApi';

// Моковые данные записей
const mockAppointments = [
  {
    id: 1,
    clientName: 'Анна Петрова',
    clientPhone: '+7 (999) 123-45-67',
    masterName: 'Анна Иванова',
    serviceName: 'Маникюр классический',
    date: '2024-01-15',
    time: '14:00',
    duration: 60,
    price: 2500,
    status: 'confirmed',
    notes: 'Предпочитает розовые оттенки'
  },
  {
    id: 2,
    clientName: 'Мария Сидорова',
    clientPhone: '+7 (999) 234-56-78',
    masterName: 'Мария Петрова',
    serviceName: 'Стрижка и укладка',
    date: '2024-01-15',
    time: '16:30',
    duration: 90,
    price: 3500,
    status: 'pending',
    notes: 'Первая запись'
  },
  {
    id: 3,
    clientName: 'Елена Козлова',
    clientPhone: '+7 (999) 345-67-89',
    masterName: 'Елена Сидорова',
    serviceName: 'Чистка лица',
    date: '2024-01-16',
    time: '10:00',
    duration: 120,
    price: 4500,
    status: 'cancelled',
    notes: 'Отмена по просьбе клиента'
  }
];

const statusColors = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500'
};

const statusLabels = {
  confirmed: 'Подтверждена',
  pending: 'Ожидает',
  cancelled: 'Отменена',
  completed: 'Завершена'
};

export default function AdminAppointmentsPage() {
  const { hapticFeedback } = useTelegram();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAppointments();
        if (res.success && res.data) {
          const normalized = res.data.map((apt: any) => ({
            id: apt.id,
            clientName: `${apt.user?.firstName || ''} ${apt.user?.lastName || ''}`.trim(),
            clientPhone: apt.user?.phone || '',
            masterName: apt.master?.name || '',
            serviceName: apt.service?.name || '',
            date: new Date(apt.appointmentDate).toISOString().slice(0,10),
            time: new Date(apt.appointmentDate).toTimeString().slice(0,5),
            duration: apt.service?.duration || 0,
            price: apt.service?.price || 0,
            status: String(apt.status).toLowerCase(),
            notes: apt.notes || ''
          }));
          setAppointments(normalized);
        }
      } catch (e) {
        console.error('Ошибка при загрузке записей:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const dateMatch = selectedDate === 'all' || appointment.date === selectedDate;
    const statusMatch = selectedStatus === 'all' || appointment.status === selectedStatus;
    return dateMatch && statusMatch;
  });

  // Получаем уникальные даты для фильтра
  const uniqueDates = [...new Set(appointments.map(apt => apt.date))].sort();

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    hapticFeedback.impact('light');
    try {
      const apiStatus = newStatus.toUpperCase();
      const res = await adminApi.updateAppointmentStatus(appointmentId, apiStatus);
      if (res.success) {
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
      }
    } catch (e) {
      // no-op
    }
  };

  const handleReschedule = (appointmentId: number) => {
    hapticFeedback.impact('light');
    // Логика переноса записи
    console.log('Перенос записи:', appointmentId);
  };

  const handleCancel = (appointmentId: number) => {
    hapticFeedback.impact('medium');
    handleStatusChange(appointmentId, 'cancelled');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <Layout 
      title="Управление записями" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
            Записи
          </h1>
          <p className="text-white/80 text-xs">
            {filteredAppointments.length} записей найдено
          </p>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              Дата
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Все даты</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              Статус
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">Все статусы</option>
              <option value="confirmed">Подтвержденные</option>
              <option value="pending">Ожидающие</option>
              <option value="cancelled">Отмененные</option>
              <option value="completed">Завершенные</option>
            </select>
          </div>
        </div>

        {/* Состояние загрузки */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-white/60">Загрузка записей...</div>
          </div>
        )}

        {/* Список записей */}
        {!loading && (
          <div className="space-y-4 mb-6">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60">Записи не найдены</div>
              </div>
            ) : (
              filteredAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 hover:border-gray-500/50 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Заголовок записи */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[appointment.status as keyof typeof statusColors]}`}></div>
                  <h3 className="font-bold text-white text-lg drop-shadow-sm">
                    {appointment.clientName}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">
                    {statusLabels[appointment.status as keyof typeof statusLabels]}
                  </div>
                </div>
              </div>

              {/* Информация о записи */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Мастер:</span>
                  <span className="text-white font-medium">{appointment.masterName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Услуга:</span>
                  <span className="text-white font-medium">{appointment.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Дата и время:</span>
                  <span className="text-white font-medium">
                    {formatDate(appointment.date)} в {appointment.time}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Длительность:</span>
                  <span className="text-white font-medium">{appointment.duration} мин</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Цена:</span>
                  <span className="text-green-400 font-bold">{formatPrice(appointment.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Телефон:</span>
                  <span className="text-white font-medium">{appointment.clientPhone}</span>
                </div>
                {appointment.notes && (
                  <div className="text-sm">
                    <span className="text-white/80">Примечания:</span>
                    <span className="text-white/60 ml-2">{appointment.notes}</span>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-600/30">
                {appointment.status === 'pending' && (
                  <>
                    <NeonButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      className="text-xs"
                    >
                      Подтвердить
                    </NeonButton>
                    <NeonButton
                      variant="default"
                      size="sm"
                      onClick={() => handleReschedule(appointment.id)}
                      className="text-xs"
                    >
                      Перенести
                    </NeonButton>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <>
                    <NeonButton
                      variant="salon"
                      size="sm"
                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                      className="text-xs"
                    >
                      Завершить
                    </NeonButton>
                    <NeonButton
                      variant="default"
                      size="sm"
                      onClick={() => handleReschedule(appointment.id)}
                      className="text-xs"
                    >
                      Перенести
                    </NeonButton>
                  </>
                )}
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(appointment.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Отменить
                </NeonButton>
              </div>
            </div>
              ))
            )}
          </div>
        )}

        {/* Статистика */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold text-white mb-3 drop-shadow-sm">📊 Статистика</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/80">Сегодня</div>
              <div className="text-white font-bold">8 записей</div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Выручка</div>
              <div className="text-green-400 font-bold">₽24,500</div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Подтверждено</div>
              <div className="text-green-400 font-bold">6</div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Ожидает</div>
              <div className="text-yellow-400 font-bold">2</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
