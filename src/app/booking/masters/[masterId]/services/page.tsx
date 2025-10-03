'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { Layout } from '@/components/layout';
import { NeonButton } from '@/components/ui/neon-button';
import Card from '@/components/ui/Card';
import { Clock, Star, User, ArrowLeft } from 'lucide-react';

// Моковые данные мастеров
const masters = [
  {
    id: 1,
    name: 'Анна Иванова',
    specialization: 'Мастер маникюра и педикюра',
    rating: 4.9,
    experience: '5 лет',
    photo: '/api/placeholder/80/80',
    services: [
      { id: 1, name: 'Маникюр классический', price: 1500, duration: '60 мин' },
      { id: 2, name: 'Педикюр классический', price: 2000, duration: '90 мин' },
      { id: 3, name: 'Покрытие гель-лак', price: 800, duration: '30 мин' },
      { id: 4, name: 'Френч', price: 1200, duration: '45 мин' },
      { id: 5, name: 'Наращивание ногтей', price: 3000, duration: '120 мин' }
    ]
  },
  {
    id: 2,
    name: 'Мария Петрова',
    specialization: 'Мастер по бровям и ресницам',
    rating: 4.8,
    experience: '3 года',
    photo: '/api/placeholder/80/80',
    services: [
      { id: 6, name: 'Коррекция бровей', price: 1000, duration: '30 мин' },
      { id: 7, name: 'Окрашивание бровей', price: 1500, duration: '45 мин' },
      { id: 8, name: 'Наращивание ресниц', price: 2500, duration: '90 мин' },
      { id: 9, name: 'Ламинирование ресниц', price: 2000, duration: '60 мин' }
    ]
  },
  {
    id: 3,
    name: 'Елена Сидорова',
    specialization: 'Мастер по макияжу',
    rating: 4.9,
    experience: '7 лет',
    photo: '/api/placeholder/80/80',
    services: [
      { id: 10, name: 'Дневной макияж', price: 2000, duration: '60 мин' },
      { id: 11, name: 'Вечерний макияж', price: 3000, duration: '90 мин' },
      { id: 12, name: 'Свадебный макияж', price: 5000, duration: '120 мин' }
    ]
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function MasterServicesPage() {
  const params = useParams();
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const masterId = parseInt(params.masterId as string);
  const master = masters.find(m => m.id === masterId);

  if (!master) {
    return (
      <Layout 
        title="Мастер не найден" 
        showBackButton={true}
        backButtonHref="/booking/masters"
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
            Мастер не найден
          </h1>
          <p className="text-white/80 mb-6 drop-shadow-sm">
            Выбранный мастер не найден в системе
          </p>
          <NeonButton
            variant="primary"
            size="lg"
            onClick={() => router.push('/booking/masters')}
          >
            Выбрать другого мастера
          </NeonButton>
        </div>
      </Layout>
    );
  }

  const handleServiceSelect = (serviceId: number) => {
    hapticFeedback.impact('light');
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      hapticFeedback.impact('medium');
      // Переход к выбору времени
      router.push(`/booking/masters/${masterId}/services/${selectedService}/time`);
    }
  };

  return (
    <Layout 
      title="Услуги мастера" 
      showBackButton={true}
      backButtonHref="/booking/masters"
    >
      <div className="w-full max-w-sm mx-auto px-4 flex flex-col justify-center min-h-screen py-4 pb-20">
        {/* Информация о мастере - компактная версия */}
        <div className="mb-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {master.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white mb-1 drop-shadow-sm truncate">
                  {master.name}
                </h2>
                <p className="text-white/80 text-xs drop-shadow-sm truncate">
                  {master.specialization}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white/80 text-xs drop-shadow-sm font-medium">
                      {master.rating}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-white/60" />
                    <span className="text-white/80 text-xs drop-shadow-sm">
                      {master.experience}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Список услуг - компактная версия */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 drop-shadow-sm">
            Доступные услуги
          </h3>
          <div className="space-y-2">
            {master.services.map((service) => (
              <div
                key={service.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedService === service.id 
                    ? 'transform scale-[1.01]' 
                    : 'hover:scale-[1.005]'
                }`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <NeonButton
                  variant={selectedService === service.id ? "salon" : "primary"}
                  size="xl"
                  className="w-full flex items-center justify-between p-3 hover:scale-105 active:scale-95 transition-all duration-300 min-h-[48px] touch-manipulation"
                >
                  <div className="flex-1 text-left min-w-0 pr-2">
                    <div className="text-white font-semibold text-sm mb-1 drop-shadow-sm leading-tight">
                      {service.name}
                    </div>
                    <div className="flex items-center justify-between text-white/80 text-xs">
                      <span className="font-medium text-primary-200">
                        {formatPrice(service.price)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedService === service.id
                      ? 'border-white bg-white text-primary-600'
                      : 'border-white/40'
                  }`}>
                    {selectedService === service.id && (
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </NeonButton>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка продолжения - компактная версия */}
        {selectedService && (
          <div className="fixed bottom-2 left-2 right-2 z-10">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-3 font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              onClick={handleContinue}
            >
              Продолжить к выбору времени
            </NeonButton>
          </div>
        )}

        {/* Информационный блок - компактная версия */}
        <div className="mt-4 mb-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
            <div className="p-3">
              <h4 className="text-white font-semibold mb-2 text-xs drop-shadow-sm">
                Информация о записи
              </h4>
              <div className="space-y-1 text-xs text-white/80 drop-shadow-sm">
                <p>• Выберите услугу для продолжения записи</p>
                <p>• После выбора услуги вы сможете выбрать удобное время</p>
                <p>• Отмена записи возможна за 2 часа до приема</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
