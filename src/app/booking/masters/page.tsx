'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Master } from '@/types';
import { api, mockData } from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice } from '@/lib/utils';

export default function MastersPage() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const router = useRouter();
  const { hapticFeedback, mainButton } = useTelegram();

  useEffect(() => {
    loadMasters();
  }, []);

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

  const loadMasters = async () => {
    try {
      setLoading(true);
      // Пробуем загрузить с API, если не получается - используем моковые данные
      try {
        const response = await api.getMasters();
        if (response.success && response.data) {
          setMasters(response.data);
        } else {
          throw new Error('Failed to load masters');
        }
      } catch (apiError) {
        console.warn('API недоступен, используем моковые данные:', apiError);
        setMasters(mockData.masters);
      }
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
      setMasters(mockData.masters);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = useCallback(() => {
    if (selectedMaster) {
      hapticFeedback.impact('medium');
      router.push(`/booking/services?masterId=${selectedMaster.id}`);
    }
  }, [selectedMaster, hapticFeedback, router]);

  const handleMasterSelect = (master: Master) => {
    hapticFeedback.impact('light');
    setSelectedMaster(master);
    hapticFeedback.notification('success');
  };

  if (loading) {
    return (
      <Layout title="Выбор мастера">
        <div className="container mx-auto max-w-sm">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Выбор мастера">
      <div className="container mx-auto max-w-sm">
        {/* Заголовок */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Выберите мастера
          </h1>
          <p className="text-gray-600">
            Шаг 1 из 3 • Выберите специалиста
          </p>
        </div>

        {/* Список мастеров */}
        <div className="space-y-4">
          {masters.map((master, index) => (
            <Card
              key={master.id}
              className={`animate-slide-up cursor-pointer transition-all duration-200 ${
                selectedMaster?.id === master.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleMasterSelect(master)}
            >
              <Card.Content className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Фото мастера */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {master.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Информация о мастере */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {master.name}
                    </h3>
                    <p className="text-sm text-primary-600 font-medium mb-1">
                      {master.specialization}
                    </p>
                    {master.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {master.description}
                      </p>
                    )}
                    
                    {/* Рейтинг и статистика */}
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-xs text-gray-600">4.9</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        100+ отзывов
                      </div>
                    </div>
                  </div>
                  
                  {/* Индикатор выбора */}
                  {selectedMaster?.id === master.id && (
                    <div className="text-primary-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Информация */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Совет</h4>
              <p className="text-sm text-blue-700 mt-1">
                Каждый мастер специализируется на определенных услугах. 
                После выбора мастера вы увидите доступные процедуры.
              </p>
            </div>
          </div>
        </div>

        {/* Дополнительные действия для мобильных устройств без Telegram */}
        {selectedMaster && (
          <div className="mt-6 animate-slide-up">
            <Button
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Продолжить с {selectedMaster.name.split(' ')[0]}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
