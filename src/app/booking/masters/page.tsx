'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { NeonButton } from '@/components/ui/neon-button';
import { MasterCard } from '@/components/ui';
import { Master } from '@/types';
import { api, mockData } from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';
import { useApiCache } from '@/hooks/useApiCache';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/lib/utils';

export default function MastersPage() {
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<{date: string, time: string} | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hapticFeedback, mainButton } = useTelegram();

  // Кэшированная загрузка мастеров
  const { data: mastersResponse, loading, error } = useApiCache(
    'masters',
    () => api.getMasters(),
    { ttl: 5 * 60 * 1000 } // 5 минут кэш
  );
  
  const masters = mastersResponse?.data || [];

  // Функции должны быть объявлены до useEffect
  const handleContinue = useCallback(() => {
    if (selectedMaster) {
      hapticFeedback.impact('medium');
      if (selectedServices.length > 0) {
        // Если есть выбранные услуги, переходим к выбору времени
        const serviceIds = selectedServices.join(',');
        router.push(`/booking/masters/${selectedMaster.id}/services/${serviceIds}/time`);
      } else if (selectedDateTime) {
        // Если есть выбранное время, переходим к выбору услуг
        router.push(`/booking/services?masterId=${selectedMaster.id}&masterName=${encodeURIComponent(selectedMaster.name)}&date=${selectedDateTime.date}&time=${selectedDateTime.time}`);
      } else {
        // Обычный переход к выбору услуг
        router.push(`/booking/masters/${selectedMaster.id}/services`);
      }
    }
  }, [selectedMaster, selectedServices, selectedDateTime, hapticFeedback, router]);


  const handleMasterSelect = (master: Master) => {
    hapticFeedback.impact('light');
    setSelectedMaster(master);
    hapticFeedback.notification('success');
  };

  // Фильтрация мастеров по услугам и времени
  const getFilteredMasters = () => {
    let filtered = masters || [];

    // Фильтрация по услугам - показываем только мастеров, которые могут выполнить выбранные услуги
    if (selectedServices.length > 0) {
      filtered = filtered.filter(master => {
        return selectedServices.every(serviceId => {
          const service = mockData.services.find(s => s.id === serviceId);
          if (!service) return false;
          
          // Логика сопоставления услуг и специализаций мастеров
          const serviceName = service.name.toLowerCase();
          const masterSpecialization = master.specialization.toLowerCase();
          
          // Проверяем, может ли мастер выполнить эту услугу
          if (serviceName.includes('маникюр') && masterSpecialization.includes('маникюр')) {
            return true;
          }
          if (serviceName.includes('педикюр') && masterSpecialization.includes('педикюр')) {
            return true;
          }
          if (serviceName.includes('стрижка') && masterSpecialization.includes('парикмахер')) {
            return true;
          }
          if (serviceName.includes('бров') && masterSpecialization.includes('бров')) {
            return true;
          }
          if (serviceName.includes('ресниц') && masterSpecialization.includes('ресниц')) {
            return true;
          }
          if (serviceName.includes('лиц') && masterSpecialization.includes('косметолог')) {
            return true;
          }
          
          return false;
        });
      });
    }

    // Фильтрация по времени (простая логика - мастер свободен в выбранное время)
    if (selectedDateTime) {
      filtered = filtered.filter(master => {
        // Моковая логика: мастер свободен в 70% случаев
        const hash = master.id + selectedDateTime.date + selectedDateTime.time;
        return hash.length % 3 !== 0; // Простая логика доступности
      });
    }

    return filtered;
  };

  // useEffect hooks после объявления функций
  useEffect(() => {
    // Обработка параметров URL
    const servicesParam = searchParams?.get('services');
    const dateParam = searchParams?.get('date');
    const timeParam = searchParams?.get('time');
    
    console.log('URL параметры:', { servicesParam, dateParam, timeParam });
    
    if (servicesParam) {
      const serviceIds = servicesParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      console.log('Выбранные услуги:', serviceIds);
      setSelectedServices(serviceIds);
    }
    
    if (dateParam && timeParam) {
      console.log('Выбранное время:', { date: dateParam, time: timeParam });
      setSelectedDateTime({ date: dateParam, time: timeParam });
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedMaster) {
      mainButton.setText('Продолжить');
      mainButton.show();
      mainButton.onClick(handleContinue);
    } else {
      mainButton.hide();
    }

    return () => {
      mainButton.offClick(handleContinue);
    };
  }, [selectedMaster, mainButton, handleContinue]);

  if (loading) {
    return (
      <Layout title="Выбор мастера">
        <div className="container mx-auto max-w-sm">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" text="Загружаем мастеров..." />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Выбор мастера"
      showBackButton={true}
      backButtonHref="/booking"
    >
      <div className="container mx-auto max-w-sm pb-20">
        {/* Заголовок */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
            Выберите мастера
          </h1>
          <p className="text-white/80">
            {selectedServices.length > 0 
              ? `Для выбранных услуг (${selectedServices.length})`
              : 'Шаг 1 из 3 • Выберите специалиста'
            }
          </p>
          {/* Отладочная информация */}
          <div className="mt-2 text-xs text-white/60">
            Загружено мастеров: {masters.length}, Отфильтровано: {getFilteredMasters().length}
          </div>
        </div>

        {/* Выбранные услуги */}
        {selectedServices.length > 0 && (
          <div className="bg-primary-500/20 border border-primary-400/30 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 drop-shadow-sm">
              ✅ Выбранные услуги
            </h4>
            <div className="space-y-2">
              {selectedServices.map(serviceId => {
                // Здесь нужно получить информацию об услуге по ID
                const service = mockData.services.find(s => s.id === serviceId);
                if (!service) return null;
                return (
                  <div key={serviceId} className="flex items-center justify-between text-sm">
                    <span className="text-white">{service.name}</span>
                    <span className="text-green-400 font-medium">{formatPrice(service.price)}</span>
                  </div>
                );
              })}
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

        {/* Список мастеров */}
        <div className="space-y-3">
          {getFilteredMasters().length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-sm">
                Мастера не найдены
              </h3>
              <p className="text-white/70">
                Попробуйте выбрать другую услугу или время
              </p>
            </div>
          ) : (
            getFilteredMasters().map((master, index) => (
              <MasterCard
                key={master.id}
                master={master}
                isSelected={selectedMaster?.id === master.id}
                onClick={() => handleMasterSelect(master)}
                className="animate-slide-up"
              />
            ))
          )}
        </div>

        {/* Информация */}
        <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl animate-fade-in border border-white/20">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-white">Совет</h4>
              <p className="text-sm text-white/80 mt-1">
                Каждый мастер специализируется на определенных услугах. 
                После выбора мастера вы увидите доступные процедуры.
              </p>
            </div>
          </div>
        </div>

        {/* Дополнительные действия для мобильных устройств без Telegram */}
        {selectedMaster && (
          <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
            <NeonButton
              onClick={handleContinue}
              variant="salon"
              size="xl"
              className="w-full py-4 font-semibold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
            >
              {selectedDateTime 
                ? `Продолжить к выбору услуг с ${selectedMaster.name.split(' ')[0]} ✨`
                : `Продолжить с ${selectedMaster.name.split(' ')[0]} ✨`
              }
            </NeonButton>
          </div>
        )}
      </div>
    </Layout>
  );
}
