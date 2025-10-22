'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { Layout } from '@/components/layout';
import { NeonButton } from '@/components/ui/neon-button';
import Card from '@/components/ui/Card';
import { Clock, Star, User } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/adminApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Master, Service } from '@/types';

// Используем общий форматер (цены хранятся в копейках, делим на 100)

export default function MasterServicesPage() {
  const params = useParams();
  const router = useRouter();
  const { hapticFeedback, mainButton } = useTelegram();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [master, setMaster] = useState<Master | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const masterId = Number(params?.masterId);

  // Скрываем Telegram Main Button на этой странице
  useEffect(() => {
    mainButton.hide();
    
    // Очищаем при размонтировании
    return () => {
      mainButton.hide();
    };
  }, [mainButton]);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [mRes, sRes] = await Promise.all([
          api.getMaster(masterId),
          api.getServicesByMaster(masterId)
        ]);
        if (!isCancelled) {
          if (mRes.success && mRes.data) setMaster(mRes.data);
          if (sRes.success && sRes.data) setServices(sRes.data);
        }
      } catch (e: any) {
        if (!isCancelled) setError(e?.message || 'Не удалось загрузить данные мастера');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    if (Number.isFinite(masterId)) load();
    return () => { isCancelled = true; };
  }, [masterId]);

  if (!loading && !master) {
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

  if (loading) {
    return (
      <Layout title="Загрузка" showBackButton={true} backButtonHref="/booking/masters">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Загружаем услуги мастера..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Ошибка" showBackButton={true} backButtonHref="/booking/masters">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-white/80 mb-3">{error}</div>
          <NeonButton variant="primary" onClick={() => router.refresh()}>Повторить</NeonButton>
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
                {master?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white mb-1 drop-shadow-sm truncate">
                  {master?.name}
                </h2>
                <p className="text-white/80 text-xs drop-shadow-sm truncate">
                  {master?.specialization}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white/80 text-xs drop-shadow-sm font-medium">
                      5.0
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-white/60" />
                    <span className="text-white/80 text-xs drop-shadow-sm">
                      {(master as any).experience || 0} лет
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Список услуг - компактная версия */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-2 drop-shadow-sm">
            Доступные услуги
          </h3>
          <p className="text-xs text-white/70 mb-3 drop-shadow-sm">
            👆 Выберите услугу для записи
          </p>
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedService === service.id 
                    ? 'transform scale-[1.01]' 
                    : 'hover:scale-[1.005]'
                }`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <div
                  className={`w-full flex items-center justify-between p-3 transition-all duration-300 min-h-[48px] touch-manipulation rounded-xl border-2 ${
                    selectedService === service.id
                      ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-primary-400 shadow-lg shadow-primary-500/20'
                      : 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 hover:border-white/30'
                  }`}
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка продолжения - единственная кнопка на странице */}
        {selectedService && (
          <div className="fixed bottom-20 left-4 right-4 z-50">
            <NeonButton
              variant="salon"
              size="lg"
              className="w-full py-3 font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              onClick={handleContinue}
            >
              ✨ Продолжить к выбору времени
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
