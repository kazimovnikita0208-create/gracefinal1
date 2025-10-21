'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

// Начинаем с пустого списка — подтягиваем из API
const mockAppointments: any[] = [];

const statusConfig = {
  confirmed: {
    label: 'Подтверждена',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/30'
  },
  pending: {
    label: 'Ожидает подтверждения',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/30'
  },
  cancelled: {
    label: 'Отменена',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/30'
  },
  completed: {
    label: 'Завершена',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/30'
  }
};

export default function AppointmentsPage() {
  const { hapticFeedback } = useTelegram();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.getMyAppointments();
        if (res.success && res.data) {
          const normalized = res.data.map((apt: any) => ({
            id: apt.id,
            master: {
              name: apt.master?.name,
              specialization: apt.master?.specialization,
              avatar: '👤'
            },
            service: {
              name: apt.service?.name,
              duration: `${apt.service?.duration || 0} мин`,
              price: apt.service?.price || 0
            },
            date: apt.appointmentDate,
            time: new Date(apt.appointmentDate).toTimeString().slice(0,5),
            status: String(apt.status).toLowerCase(),
            notes: apt.notes
          }));
          setAppointments(normalized);
        }
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить записи');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcomingAppointments = (appointments.length ? appointments : mockAppointments).filter(apt => 
    apt.status !== 'completed'
  );
  
  const pastAppointments = (appointments.length ? appointments : mockAppointments).filter(apt => 
    apt.status === 'completed'
  );

  // Логирование для отладки
  console.log('📋 Все записи:', appointments);
  console.log('📋 Предстоящие записи:', upcomingAppointments);
  console.log('📋 Прошедшие записи:', pastAppointments);
  console.log('📋 Статусы записей:', appointments.map(apt => ({ id: apt.id, status: apt.status })));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // цена форматируется глобальной утилитой

  const handleTabChange = (tab: 'upcoming' | 'past') => {
    setSelectedTab(tab);
    hapticFeedback.impact('light');
  };

  const handleCancelAppointment = (appointmentId: number) => {
    hapticFeedback.impact('medium');
    // Здесь будет логика отмены записи
    console.log('Отмена записи:', appointmentId);
  };

  const handleRescheduleAppointment = (appointmentId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика переноса записи
    console.log('Перенос записи:', appointmentId);
  };

  const currentAppointments = selectedTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <Layout 
        title="Мои записи" 
        showBackButton={true}
        backButtonHref="/profile"
      >
        <div className="w-full max-w-sm mx-auto px-4 py-4 pb-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Загружаем ваши записи..." />
          </div>
        </div>
      </Layout>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <Layout 
        title="Мои записи" 
        showBackButton={true}
        backButtonHref="/profile"
      >
        <div className="w-full max-w-sm mx-auto px-4 py-4 pb-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
              Ошибка загрузки
            </h1>
            <p className="text-white/80 mb-6 drop-shadow-sm">
              {error}
            </p>
            <NeonButton
              variant="primary"
              size="lg"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </NeonButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Мои записи"
      showBackButton={true}
      backButtonHref="/profile"
    >
      <div className="container mx-auto max-w-sm px-4 py-4">
        {/* Переключатель вкладок */}
        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 border border-white/20">
          <button
            onClick={() => handleTabChange('upcoming')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'upcoming'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Предстоящие
          </button>
          <button
            onClick={() => handleTabChange('past')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'past'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Прошедшие
          </button>
        </div>

        {/* Список записей */}
        <div className="space-y-4">
          {currentAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-sm">
                {selectedTab === 'upcoming' ? 'Нет предстоящих записей' : 'Нет прошедших записей'}
              </h3>
              <p className="text-white/70 mb-6">
                {selectedTab === 'upcoming' 
                  ? 'Запишитесь на процедуру, чтобы увидеть её здесь'
                  : 'Ваши записи появятся здесь после посещения'
                }
              </p>
              {selectedTab === 'upcoming' && (
                <NeonButton
                  variant="salon"
                  size="lg"
                  className="w-full"
                  onClick={() => window.location.href = '/booking'}
                >
                  Записаться
                </NeonButton>
              )}
            </div>
          ) : (
            currentAppointments.map((appointment) => {
              const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 animate-fade-in"
                >
                  {/* Заголовок с мастером и статусом */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20">
                        {/* Стильный силуэт пользователя вместо эмодзи */}
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                          aria-hidden
                        >
                          <path
                            d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
                            fill="currentColor"
                            fillOpacity="0.95"
                          />
                          <path
                            d="M4 20.5C4 17.462 7.582 15 12 15s8 2.462 8 5.5c0 .828-.672 1.5-1.5 1.5h-13C4.672 22 4 21.328 4 20.5Z"
                            fill="currentColor"
                            fillOpacity="0.85"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white drop-shadow-sm">
                          {appointment.master.name}
                        </h3>
                        <p className="text-sm text-white/70">
                          {appointment.master.specialization}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`ml-auto px-3 py-1 rounded-full text-[11px] leading-tight font-medium text-center whitespace-nowrap ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Информация о записи */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-white/70">Услуга:</span>
                      <span className="font-medium text-white text-right">{appointment.service.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-white/70">Дата:</span>
                      <span className="font-medium text-white text-right">{formatDate(appointment.date)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-white/70">Время:</span>
                      <span className="font-medium text-white text-right tabular-nums">{appointment.time}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-white/70">Длительность:</span>
                      <span className="font-medium text-white text-right">{appointment.service.duration}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-white/70">Стоимость:</span>
                      <span className="font-bold text-green-400 text-lg text-right">{formatPrice(appointment.service.price)}</span>
                    </div>
                    
                    {appointment.notes && (
                      <div className="pt-2 border-t border-white/20">
                        <span className="text-white/70 text-sm">Примечание:</span>
                        <p className="text-white text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Действия */}
                  {selectedTab === 'upcoming' && appointment.status !== 'completed' && (
                    <div className="flex space-x-3">
                      <NeonButton
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRescheduleAppointment(appointment.id)}
                      >
                        Перенести
                      </NeonButton>
                      <NeonButton
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-400 border-red-400/50 hover:bg-red-500/20"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Отменить
                      </NeonButton>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Кнопки действий */}
        {selectedTab === 'upcoming' && (
          <div className="mt-6 space-y-3">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => (window.location.href = '/booking')}
            >
              📅 Записаться
            </NeonButton>
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => (window.location.href = '/')}
            >
              🏠 На главный экран
            </NeonButton>
          </div>
        )}
      </div>
    </Layout>
  );
}
