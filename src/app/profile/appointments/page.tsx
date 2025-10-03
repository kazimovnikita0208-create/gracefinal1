'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

// Моковые данные для записей
const mockAppointments = [
  {
    id: 1,
    master: {
      name: 'Анна Иванова',
      specialization: 'Мастер маникюра',
      avatar: '👩‍🎨',
      rating: 4.9
    },
    service: {
      name: 'Маникюр + покрытие',
      duration: '90 мин',
      price: 2500
    },
    date: '2024-01-15',
    time: '14:00',
    status: 'confirmed',
    notes: 'Французский маникюр'
  },
  {
    id: 2,
    master: {
      name: 'Мария Петрова',
      specialization: 'Мастер бровей',
      avatar: '👩‍💼',
      rating: 4.8
    },
    service: {
      name: 'Коррекция бровей',
      duration: '30 мин',
      price: 1000
    },
    date: '2024-01-18',
    time: '16:30',
    status: 'pending',
    notes: 'Форма по типу лица'
  },
  {
    id: 3,
    master: {
      name: 'Елена Смирнова',
      specialization: 'Мастер педикюра',
      avatar: '👩‍⚕️',
      rating: 4.7
    },
    service: {
      name: 'Педикюр классический',
      duration: '120 мин',
      price: 3000
    },
    date: '2024-01-20',
    time: '11:00',
    status: 'confirmed',
    notes: 'С покрытием гель-лаком'
  }
];

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
  }
};

export default function AppointmentsPage() {
  const { hapticFeedback } = useTelegram();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingAppointments = mockAppointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );
  
  const pastAppointments = mockAppointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'cancelled'
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

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
              const status = statusConfig[appointment.status as keyof typeof statusConfig];
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 animate-fade-in"
                >
                  {/* Заголовок с мастером и статусом */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {appointment.master.avatar}
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
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Информация о записи */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Услуга:</span>
                      <span className="font-medium text-white">{appointment.service.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Дата:</span>
                      <span className="font-medium text-white">{formatDate(appointment.date)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Время:</span>
                      <span className="font-medium text-white">{appointment.time}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Длительность:</span>
                      <span className="font-medium text-white">{appointment.service.duration}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Стоимость:</span>
                      <span className="font-bold text-green-400 text-lg">{formatPrice(appointment.service.price)}</span>
                    </div>
                    
                    {appointment.notes && (
                      <div className="pt-2 border-t border-white/20">
                        <span className="text-white/70 text-sm">Примечание:</span>
                        <p className="text-white text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Действия */}
                  {selectedTab === 'upcoming' && appointment.status === 'confirmed' && (
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

        {/* Кнопка записи */}
        {selectedTab === 'upcoming' && (
          <div className="mt-6">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => window.location.href = '/booking'}
            >
              📅 Записаться на процедуру
            </NeonButton>
          </div>
        )}
      </div>
    </Layout>
  );
}
