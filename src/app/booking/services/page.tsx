'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

// Моковые данные для услуг
const mockServices = [
  {
    id: 1,
    name: 'Маникюр классический',
    description: 'Обрезной маникюр с покрытием гель-лаком',
    duration: '60 мин',
    price: 2000,
    category: 'manicure',
    image: '💅',
    popular: true
  },
  {
    id: 2,
    name: 'Маникюр + покрытие',
    description: 'Маникюр с укрепляющим покрытием',
    duration: '90 мин',
    price: 2500,
    category: 'manicure',
    image: '💅',
    popular: true
  },
  {
    id: 3,
    name: 'Педикюр классический',
    description: 'Обрезной педикюр с покрытием',
    duration: '120 мин',
    price: 3000,
    category: 'pedicure',
    image: '🦶',
    popular: false
  },
  {
    id: 4,
    name: 'Коррекция бровей',
    description: 'Коррекция формы бровей воском',
    duration: '30 мин',
    price: 1000,
    category: 'eyebrows',
    image: '👁️',
    popular: true
  },
  {
    id: 5,
    name: 'Окрашивание бровей',
    description: 'Окрашивание бровей краской',
    duration: '45 мин',
    price: 1500,
    category: 'eyebrows',
    image: '👁️',
    popular: false
  },
  {
    id: 6,
    name: 'Ламинирование ресниц',
    description: 'Ламинирование ресниц для объема',
    duration: '60 мин',
    price: 3500,
    category: 'eyelashes',
    image: '👁️',
    popular: true
  },
  {
    id: 7,
    name: 'Наращивание ресниц',
    description: 'Наращивание ресниц пореснично',
    duration: '120 мин',
    price: 4000,
    category: 'eyelashes',
    image: '👁️',
    popular: false
  },
  {
    id: 8,
    name: 'Массаж лица',
    description: 'Расслабляющий массаж лица',
    duration: '45 мин',
    price: 2500,
    category: 'face',
    image: '😌',
    popular: false
  }
];

const categories = [
  { key: 'all', label: 'Все услуги', icon: '💅' },
  { key: 'manicure', label: 'Маникюр', icon: '💅' },
  { key: 'pedicure', label: 'Педикюр', icon: '🦶' },
  { key: 'eyebrows', label: 'Брови', icon: '👁️' },
  { key: 'eyelashes', label: 'Ресницы', icon: '👁️' },
  { key: 'face', label: 'Лицо', icon: '😌' }
];

export default function ServicesPage() {
  const { hapticFeedback } = useTelegram();
  const searchParams = useSearchParams();
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<{date: string, time: string} | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<{id: number, name: string} | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };


  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    hapticFeedback.impact('light');
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      hapticFeedback.impact('heavy');
      return;
    }
    hapticFeedback.impact('medium');
    
    if (selectedMaster && selectedDateTime) {
      // Если есть выбранный мастер и время, переходим к подтверждению записи
      const serviceIds = selectedServices.join(',');
      window.location.href = `/booking/confirmation?masterId=${selectedMaster.id}&serviceIds=${serviceIds}&date=${selectedDateTime.date}&time=${selectedDateTime.time}`;
    } else if (selectedDateTime) {
      // Если есть выбранное время, переходим к выбору мастера
      const serviceIds = selectedServices.join(',');
      window.location.href = `/booking/masters?services=${serviceIds}&date=${selectedDateTime.date}&time=${selectedDateTime.time}`;
    } else {
      // Обычный переход к выбору мастера
      const serviceIds = selectedServices.join(',');
      window.location.href = `/booking/masters?services=${serviceIds}`;
    }
  };

  useEffect(() => {
    // Обработка параметров URL
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const masterIdParam = searchParams.get('masterId');
    const masterNameParam = searchParams.get('masterName');
    
    if (dateParam && timeParam) {
      setSelectedDateTime({ date: dateParam, time: timeParam });
    }
    
    if (masterIdParam && masterNameParam) {
      setSelectedMaster({ 
        id: parseInt(masterIdParam), 
        name: decodeURIComponent(masterNameParam) 
      });
    }
  }, [searchParams]);

  // Показываем все услуги
  const filteredServices = mockServices;

  return (
    <Layout 
      title="Выбор услуги"
      showBackButton={true}
      backButtonHref="/booking"
    >
      <div className="container mx-auto max-w-sm px-4 py-4 pb-20">
        {/* Выбранный мастер */}
        {selectedMaster && (
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 drop-shadow-sm">
              👩‍💼 Выбранный мастер
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Мастер:</span>
                <span className="font-semibold text-white">{selectedMaster.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Выбранное время */}
        {selectedDateTime && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 drop-shadow-sm">
              ⏰ Выбранное время
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Дата:</span>
                <span className="font-semibold text-white">
                  {new Date(selectedDateTime.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Время:</span>
                <span className="font-semibold text-white">{selectedDateTime.time}</span>
              </div>
            </div>
          </div>
        )}


        {/* Список услуг */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold text-white drop-shadow-sm mb-4">
            Доступные услуги
          </h3>
          
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-white/70">Услуги не найдены</p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedServices.includes(service.id)
                    ? 'border-primary-400 bg-primary-500/20'
                    : 'border-gray-600/30 hover:border-gray-500/50'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-base mb-1 drop-shadow-sm">{service.name}</h4>
                    <p className="text-white text-sm">{formatPrice(service.price)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-white text-sm">
                      <span>🕒</span>
                      <span>{service.duration}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedServices.includes(service.id)
                        ? 'border-primary-400 bg-primary-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedServices.includes(service.id) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Выбранные услуги */}
        {selectedServices.length > 0 && (
          <div className="bg-primary-500/20 border border-primary-400/30 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 drop-shadow-sm">
              Выбрано услуг: {selectedServices.length}
            </h4>
            <div className="space-y-2">
              {selectedServices.map(serviceId => {
                const service = mockServices.find(s => s.id === serviceId);
                if (!service) return null;
                return (
                  <div key={serviceId} className="flex items-center justify-between text-sm">
                    <span className="text-white">{service.name}</span>
                    <span className="text-green-400 font-medium">{formatPrice(service.price)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-primary-400/20 mt-3">
              <span className="font-semibold text-white">Итого:</span>
              <span className="font-bold text-green-400 text-lg">
                {formatPrice(selectedServices.reduce((sum, id) => {
                  const service = mockServices.find(s => s.id === id);
                  return sum + (service?.price || 0);
                }, 0))}
              </span>
            </div>
          </div>
        )}

        {/* Всплывающая кнопка продолжения */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
              onClick={handleContinue}
            >
              {selectedMaster && selectedDateTime
                ? `Подтвердить запись (${selectedServices.length})`
                : `Продолжить к выбору мастера (${selectedServices.length})`
              }
            </NeonButton>
          </div>
        )}
      </div>
    </Layout>
  );
}
