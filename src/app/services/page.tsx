'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Service } from '@/types';
import { api, mockData } from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice, formatDuration } from '@/lib/utils';

// Категории услуг
const serviceCategories = [
  { id: 'hair', name: 'Парикмахерские услуги', icon: '✂️' },
  { id: 'nails', name: 'Маникюр и педикюр', icon: '💅' },
  { id: 'face', name: 'Косметология', icon: '🧴' },
  { id: 'all', name: 'Все услуги', icon: '📋' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { hapticFeedback } = useTelegram();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      try {
        const response = await api.getServices();
        if (response.success && response.data) {
          setServices(response.data);
        } else {
          throw new Error('Failed to load services');
        }
      } catch (apiError) {
        console.warn('API недоступен, используем моковые данные:', apiError);
        setServices(mockData.services);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      setServices(mockData.services);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    hapticFeedback.impact('light');
    setSelectedCategory(categoryId);
  };

  const handleServiceClick = () => {
    hapticFeedback.impact('light');
  };

  const getFilteredServices = () => {
    if (selectedCategory === 'all') return services;
    
    return services.filter(service => {
      switch (selectedCategory) {
        case 'hair':
          return service.name.toLowerCase().includes('стрижка') || 
                 service.name.toLowerCase().includes('окрашивание') ||
                 service.name.toLowerCase().includes('укладка');
        case 'nails':
          return service.name.toLowerCase().includes('маникюр') || 
                 service.name.toLowerCase().includes('педикюр');
        case 'face':
          return service.name.toLowerCase().includes('лица') || 
                 service.name.toLowerCase().includes('чистка') ||
                 service.name.toLowerCase().includes('массаж');
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <Layout title="Услуги и цены">
        <div className="container mx-auto max-w-sm">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredServices = getFilteredServices();

  return (
    <Layout title="Услуги и цены">
      <div className="container mx-auto max-w-sm">
        {/* Заголовок */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Услуги и цены
          </h1>
          <p className="text-gray-600">
            Выберите категорию для просмотра услуг
          </p>
        </div>

        {/* Фильтр по категориям */}
        <div className="mb-6 animate-fade-in">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Список услуг */}
        <div className="space-y-4">
          {filteredServices.map((service, index) => (
            <Card
              key={service.id}
              className="animate-slide-up hover:shadow-lg cursor-pointer"
              onClick={handleServiceClick}
            >
              <Card.Content className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400">⏱️</span>
                        <span className="text-sm text-gray-600">
                          {formatDuration(service.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      {formatPrice(service.price)}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        hapticFeedback.impact('medium');
                      }}
                    >
                      Записаться
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Услуги не найдены
            </h3>
            <p className="text-gray-500">
              В выбранной категории пока нет доступных услуг
            </p>
          </div>
        )}

        {/* Информационный блок */}
        <div className="mt-8 space-y-4 animate-fade-in">
          <Card className="bg-gradient-to-r from-primary-50 to-accent-50">
            <Card.Content className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-primary-500 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-primary-900">Важная информация</h4>
                  <ul className="text-sm text-primary-700 mt-1 space-y-1">
                    <li>• Цены указаны без учета скидок и акций</li>
                    <li>• Время может варьироваться в зависимости от сложности</li>
                    <li>• Консультация входит в стоимость услуги</li>
                  </ul>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <Card.Content className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-500 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Акции и скидки</h4>
                  <p className="text-sm text-green-700 mt-1">
                    При записи через приложение действует скидка 10% на первое посещение!
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

