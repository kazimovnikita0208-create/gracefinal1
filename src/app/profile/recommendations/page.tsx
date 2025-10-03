'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

// Моковые данные для рекомендаций
const mockRecommendations = [
  {
    id: 1,
    type: 'service',
    title: 'Рекомендуем попробовать',
    description: 'Основываясь на ваших предпочтениях, мы рекомендуем процедуру "Ламинирование ресниц"',
    service: {
      name: 'Ламинирование ресниц',
      duration: '60 мин',
      price: 3500,
      master: 'Анна Иванова',
      rating: 4.9
    },
    reason: 'Вы часто делаете маникюр, возможно, вам понравится уход за ресницами',
    priority: 'high',
    category: 'beauty'
  },
  {
    id: 2,
    type: 'care',
    title: 'Совет по уходу',
    description: 'Для поддержания красоты ногтей после маникюра',
    tip: {
      title: 'Уход за ногтями дома',
      steps: [
        'Используйте увлажняющий крем для рук 2-3 раза в день',
        'Наносите масло для кутикулы перед сном',
        'Избегайте контакта с агрессивными моющими средствами',
        'Носите перчатки при уборке'
      ]
    },
    reason: 'Ваш последний маникюр был 2 недели назад',
    priority: 'medium',
    category: 'care'
  },
  {
    id: 3,
    type: 'schedule',
    title: 'Оптимальное время для записи',
    description: 'Рекомендуем записаться на следующую неделю',
    schedule: {
      bestDays: ['Понедельник', 'Вторник', 'Среда'],
      bestTimes: ['10:00-12:00', '14:00-16:00'],
      reason: 'Меньше загруженность, больше времени на процедуру'
    },
    reason: 'Вы обычно записываетесь в будние дни',
    priority: 'low',
    category: 'schedule'
  },
  {
    id: 4,
    type: 'promotion',
    title: 'Специальное предложение',
    description: 'Только для вас - скидка 20% на комплекс процедур',
    promotion: {
      title: 'Комплекс "Красота рук"',
      originalPrice: 5000,
      discountPrice: 4000,
      services: ['Маникюр + покрытие', 'Дизайн ногтей', 'Уход за кутикулой'],
      validUntil: '2024-02-15'
    },
    reason: 'Вы часто заказываете комплексные процедуры',
    priority: 'high',
    category: 'promotion'
  }
];

const priorityConfig = {
  high: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/30',
    icon: '🔥'
  },
  medium: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/30',
    icon: '⭐'
  },
  low: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/30',
    icon: '💡'
  }
};

const categoryConfig = {
  beauty: { icon: '💅', color: 'text-pink-400' },
  care: { icon: '🧴', color: 'text-blue-400' },
  schedule: { icon: '📅', color: 'text-green-400' },
  promotion: { icon: '🎁', color: 'text-purple-400' }
};

export default function RecommendationsPage() {
  const { hapticFeedback } = useTelegram();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'beauty' | 'care' | 'schedule' | 'promotion'>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleFilterChange = (filter: 'all' | 'beauty' | 'care' | 'schedule' | 'promotion') => {
    setSelectedFilter(filter);
    hapticFeedback.impact('light');
  };

  const handleBookService = (serviceId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика записи на услугу
    console.log('Запись на услугу:', serviceId);
  };

  const handleApplyPromotion = (promotionId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика применения скидки
    console.log('Применение скидки:', promotionId);
  };

  const handleDismissRecommendation = (recommendationId: number) => {
    hapticFeedback.impact('light');
    // Здесь будет логика скрытия рекомендации
    console.log('Скрытие рекомендации:', recommendationId);
  };

  // Фильтрация данных
  const filteredRecommendations = mockRecommendations.filter(rec => 
    selectedFilter === 'all' || rec.category === selectedFilter
  );

  return (
    <Layout 
      title="Рекомендации"
      showBackButton={true}
      backButtonHref="/profile"
    >
      <div className="container mx-auto max-w-sm px-4 py-4">
        {/* Фильтры */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Все', icon: '📋' },
            { key: 'beauty', label: 'Красота', icon: '💅' },
            { key: 'care', label: 'Уход', icon: '🧴' },
            { key: 'schedule', label: 'Время', icon: '📅' },
            { key: 'promotion', label: 'Акции', icon: '🎁' }
          ].map((filter) => {
            const isActive = selectedFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Список рекомендаций */}
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-sm">
                Нет рекомендаций
              </h3>
              <p className="text-white/70">
                Рекомендации появятся после ваших первых посещений
              </p>
            </div>
          ) : (
            filteredRecommendations.map((recommendation) => {
              const priority = priorityConfig[recommendation.priority as keyof typeof priorityConfig];
              const category = categoryConfig[recommendation.category as keyof typeof categoryConfig];
              
              return (
                <div
                  key={recommendation.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 animate-fade-in"
                >
                  {/* Заголовок с приоритетом */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white drop-shadow-sm">
                          {recommendation.title}
                        </h3>
                        <p className="text-sm text-white/70">{recommendation.description}</p>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color} border ${priority.borderColor}`}>
                      {priority.icon}
                    </div>
                  </div>

                  {/* Содержимое рекомендации */}
                  <div className="mb-4">
                    {recommendation.type === 'service' && recommendation.service && (
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{recommendation.service.name}</h4>
                          <span className="text-green-400 font-bold">{formatPrice(recommendation.service.price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70 mb-3">
                          <span>{recommendation.service.duration}</span>
                          <span>Мастер: {recommendation.service.master}</span>
                        </div>
                        <NeonButton
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => handleBookService(recommendation.id)}
                        >
                          📅 Записаться
                        </NeonButton>
                      </div>
                    )}

                    {recommendation.type === 'care' && recommendation.tip && (
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-white mb-3">{recommendation.tip.title}</h4>
                        <ul className="space-y-2">
                          {recommendation.tip.steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-white/80">
                              <span className="text-primary-400 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendation.type === 'schedule' && recommendation.schedule && (
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-white mb-3">Лучшие дни и время</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-white/70 text-sm">Дни:</span>
                            <p className="text-white">{recommendation.schedule.bestDays.join(', ')}</p>
                          </div>
                          <div>
                            <span className="text-white/70 text-sm">Время:</span>
                            <p className="text-white">{recommendation.schedule.bestTimes.join(', ')}</p>
                          </div>
                          <p className="text-white/70 text-sm">{recommendation.schedule.reason}</p>
                        </div>
                      </div>
                    )}

                    {recommendation.type === 'promotion' && recommendation.promotion && (
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4 border border-purple-400/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white">{recommendation.promotion.title}</h4>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">{formatPrice(recommendation.promotion.discountPrice)}</div>
                            <div className="text-white/60 text-sm line-through">{formatPrice(recommendation.promotion.originalPrice)}</div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {recommendation.promotion.services.map((service, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-white/80">
                              <span className="text-purple-400">✓</span>
                              <span>{service}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">
                            Действует до: {new Date(recommendation.promotion.validUntil).toLocaleDateString('ru-RU')}
                          </span>
                          <NeonButton
                            variant="salon"
                            size="sm"
                            onClick={() => handleApplyPromotion(recommendation.id)}
                          >
                            🎁 Применить
                          </NeonButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Причина рекомендации */}
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-white/70 text-sm">
                      <span className="font-medium">Почему:</span> {recommendation.reason}
                    </p>
                  </div>

                  {/* Действия */}
                  <div className="flex space-x-3">
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDismissRecommendation(recommendation.id)}
                    >
                      ✕ Скрыть
                    </NeonButton>
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = '/booking'}
                    >
                      📅 Записаться
                    </NeonButton>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Кнопка записи */}
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
      </div>
    </Layout>
  );
}
