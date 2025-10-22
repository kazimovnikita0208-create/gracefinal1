'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';
import { mockData } from '@/lib/api';

export default function ConfirmationPage() {
  const { hapticFeedback } = useTelegram();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<{
    master: any;
    services: any[];
    date: string;
    time: string;
    totalPrice: number;
  } | null>(null);

  useEffect(() => {
    // Получаем данные из URL параметров
    const masterId = searchParams?.get('masterId');
    const serviceIds = searchParams?.get('serviceIds');
    const date = searchParams?.get('date');
    const time = searchParams?.get('time');

    if (masterId && serviceIds && date && time) {
      const master = mockData.masters.find(m => m.id === parseInt(masterId));
      const services = serviceIds.split(',').map(id => 
        mockData.services.find(s => s.id === parseInt(id))
      ).filter(Boolean);
      
      const totalPrice = services.reduce((sum, service) => sum + (service?.price || 0), 0);

      setBookingData({
        master,
        services,
        date,
        time,
        totalPrice
      });
    }
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleConfirmBooking = () => {
    hapticFeedback.impact('medium');
    // Здесь будет логика подтверждения записи
    console.log('Подтверждение записи:', bookingData);
    // Переходим на главную страницу
    window.location.href = '/';
  };

  if (!bookingData) {
    return (
      <Layout title="Подтверждение записи">
        <div className="container mx-auto max-w-sm px-4 py-4">
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-white/70">Загрузка данных записи...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Подтверждение записи"
      showBackButton={true}
      backButtonHref="/booking"
    >
      <div className="container mx-auto max-w-sm px-4 py-4">
        {/* Заголовок */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
            Подтверждение записи
          </h1>
          <p className="text-white/80">
            Проверьте детали вашей записи
          </p>
        </div>

        {/* Информация о мастере */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white text-lg mb-3 drop-shadow-sm">👩‍💼 Мастер</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {bookingData.master.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold text-white">{bookingData.master.name}</h4>
              <p className="text-white/70 text-sm">{bookingData.master.specialization}</p>
            </div>
          </div>
        </div>

        {/* Выбранные услуги */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white text-lg mb-3 drop-shadow-sm">💅 Услуги</h3>
          <div className="space-y-3">
            {bookingData.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-600/30 last:border-b-0">
                <div>
                  <span className="text-white font-medium">{service.name}</span>
                  <span className="text-white/70 text-sm ml-2">({service.duration} мин)</span>
                </div>
                <span className="text-green-400 font-bold">{formatPrice(service.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-600/30 mt-3">
            <span className="font-bold text-white">Итого:</span>
            <span className="font-bold text-green-400 text-lg">{formatPrice(bookingData.totalPrice)}</span>
          </div>
        </div>

        {/* Дата и время */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white text-lg mb-3 drop-shadow-sm">📅 Дата и время</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Дата:</span>
              <span className="font-semibold text-white">{formatDate(bookingData.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Время:</span>
              <span className="font-semibold text-white">{bookingData.time}</span>
            </div>
          </div>
        </div>

        {/* Информация о записи */}
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-white mb-3 drop-shadow-sm">ℹ️ Информация</h4>
          <div className="space-y-2 text-sm text-white/80">
            <p>• Запись будет подтверждена в течение 15 минут</p>
            <p>• Отмена возможна за 2 часа до записи</p>
            <p>• При опоздании более чем на 15 минут запись может быть отменена</p>
          </div>
        </div>

        {/* Кнопка подтверждения */}
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
          <NeonButton
            variant="salon"
            size="xl"
            className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
            onClick={handleConfirmBooking}
          >
            Подтвердить запись ✨
          </NeonButton>
        </div>
      </div>
    </Layout>
  );
}
