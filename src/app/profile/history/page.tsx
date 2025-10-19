'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

// Моковые данные для истории посещений
const mockHistory = [
  {
    id: 1,
    date: '2024-01-10',
    master: {
      name: 'Анна Иванова',
      specialization: 'Мастер маникюра',
      avatar: '👩‍🎨',
      rating: 4.9
    },
    services: [
      {
        name: 'Маникюр + покрытие',
        duration: '90 мин',
        price: 2500
      },
      {
        name: 'Дизайн ногтей',
        duration: '30 мин',
        price: 800
      }
    ],
    totalPrice: 3300,
    status: 'completed',
    review: {
      rating: 5,
      comment: 'Отличная работа! Очень довольна результатом.'
    }
  },
  {
    id: 2,
    date: '2024-01-05',
    master: {
      name: 'Мария Петрова',
      specialization: 'Мастер бровей',
      avatar: '👩‍💼',
      rating: 4.8
    },
    services: [
      {
        name: 'Коррекция бровей',
        duration: '30 мин',
        price: 1000
      }
    ],
    totalPrice: 1000,
    status: 'completed',
    review: {
      rating: 4,
      comment: 'Хорошая работа, но можно было лучше.'
    }
  },
  {
    id: 3,
    date: '2023-12-28',
    master: {
      name: 'Елена Смирнова',
      specialization: 'Мастер педикюра',
      avatar: '👩‍⚕️',
      rating: 4.7
    },
    services: [
      {
        name: 'Педикюр классический',
        duration: '120 мин',
        price: 3000
      }
    ],
    totalPrice: 3000,
    status: 'completed',
    review: null
  },
  {
    id: 4,
    date: '2023-12-20',
    master: {
      name: 'Ольга Козлова',
      specialization: 'Мастер маникюра',
      avatar: '👩‍🎨',
      rating: 4.6
    },
    services: [
      {
        name: 'Маникюр классический',
        duration: '60 мин',
        price: 2000
      }
    ],
    totalPrice: 2000,
    status: 'completed',
    review: {
      rating: 5,
      comment: 'Превосходно! Рекомендую этого мастера.'
    }
  }
];

const statusConfig = {
  completed: {
    label: 'Завершено',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/30'
  },
  cancelled: {
    label: 'Отменено',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/30'
  }
};

export default function HistoryPage() {
  const { hapticFeedback } = useTelegram();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'favorites'>('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleFilterChange = (filter: 'all' | 'recent' | 'favorites') => {
    setSelectedFilter(filter);
    hapticFeedback.impact('light');
  };

  const handleWriteReview = (visitId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика написания отзыва
    console.log('Написать отзыв для визита:', visitId);
  };

  const handleRepeatVisit = (visitId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика повторной записи
    console.log('Повторить визит:', visitId);
  };

  // Фильтрация данных
  const filteredHistory = mockHistory.filter(visit => {
    switch (selectedFilter) {
      case 'recent':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return new Date(visit.date) >= oneMonthAgo;
      case 'favorites':
        return visit.review;
      default:
        return true;
    }
  });

  // Статистика
  const totalVisits = mockHistory.length;
  const totalSpent = mockHistory.reduce((sum, visit) => sum + visit.totalPrice, 0);
  const averageRating = 5.0;

  return (
    <Layout 
      title="История посещений"
      showBackButton={true}
      backButtonHref="/profile"
    >
      <div className="container mx-auto max-w-sm px-4 py-4">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-bold text-white text-lg drop-shadow-sm">{totalVisits}</div>
            <div className="text-xs text-white/70">Визитов</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-bold text-white text-lg drop-shadow-sm">{formatPrice(totalSpent)}</div>
            <div className="text-xs text-white/70">Потрачено</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-bold text-white text-lg drop-shadow-sm">{averageRating.toFixed(1)}</div>
            <div className="text-xs text-white/70">Рейтинг</div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 border border-white/20">
          <button
            onClick={() => handleFilterChange('all')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === 'all'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => handleFilterChange('recent')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === 'recent'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            За месяц
          </button>
          <button
            onClick={() => handleFilterChange('favorites')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === 'favorites'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Избранные
          </button>
        </div>

        {/* Список визитов */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-sm">
                История пуста
              </h3>
              <p className="text-white/70 mb-6">
                Ваши посещения появятся здесь после записи
              </p>
              <NeonButton
                variant="salon"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/booking'}
              >
                Записаться
              </NeonButton>
            </div>
          ) : (
            filteredHistory.map((visit) => {
              const status = statusConfig[visit.status as keyof typeof statusConfig];
              
              return (
                <div
                  key={visit.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 animate-fade-in"
                >
                  {/* Заголовок с датой и статусом */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white drop-shadow-sm">
                        {formatDate(visit.date)}
                      </h3>
                      <p className="text-sm text-white/70">
                        {visit.services.length} {visit.services.length === 1 ? 'услуга' : 'услуги'}
                      </p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Мастер */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {visit.master.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{visit.master.name}</h4>
                      <p className="text-sm text-white/70">{visit.master.specialization}</p>
                    </div>
                  </div>

                  {/* Услуги */}
                  <div className="space-y-2 mb-4">
                    {visit.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                        <div>
                          <span className="text-white font-medium">{service.name}</span>
                          <span className="text-white/70 text-sm ml-2">({service.duration})</span>
                        </div>
                        <span className="text-white font-medium">{formatPrice(service.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Итого */}
                  <div className="flex items-center justify-between py-2 border-t border-white/20 mb-4">
                    <span className="text-white font-semibold">Итого:</span>
                    <span className="text-green-400 font-bold text-lg">{formatPrice(visit.totalPrice)}</span>
                  </div>

                  {/* Отзыв */}
                  {visit.review ? (
                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < 5 ? 'text-yellow-400' : 'text-white/30'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-white/70 text-sm">Ваш отзыв</span>
                      </div>
                      <p className="text-white text-sm">{visit.review.comment}</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <NeonButton
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => handleWriteReview(visit.id)}
                      >
                        ✍️ Написать отзыв
                      </NeonButton>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex space-x-3">
                    <NeonButton
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRepeatVisit(visit.id)}
                    >
                      🔄 Повторить
                    </NeonButton>
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `/booking/masters/${visit.master.name.toLowerCase().replace(' ', '-')}`}
                    >
                      📅 Записаться
                    </NeonButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
