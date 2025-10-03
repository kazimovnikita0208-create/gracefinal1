'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { mockData } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminServicesPage() {
  const { hapticFeedback } = useTelegram();
  const [services, setServices] = useState(mockData.services);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все услуги' },
    { id: 'hair', name: 'Парикмахерские' },
    { id: 'nails', name: 'Маникюр и педикюр' },
    { id: 'face', name: 'Косметология' }
  ];

  const filteredServices = selectedCategory === 'all'    
    ? services
    : services.filter(service => service.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleAddService = () => {
    hapticFeedback.impact('light');
    setShowAddForm(true);
  };

  const handleEditService = (service: any) => {
    hapticFeedback.impact('light');
    setEditingService(service);
  };

  const handleDeleteService = (serviceId: number) => {
    hapticFeedback.impact('medium');
    setServices(services.filter(s => s.id !== serviceId));
  };

  const handleToggleStatus = (serviceId: number) => {
    hapticFeedback.impact('light');
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  return (
    <Layout 
      title="Управление услугами" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
              Услуги
            </h1>
            <p className="text-white/80 text-xs">
              {services.length} услуг в системе
            </p>
          </div>
          <NeonButton
            variant="primary"
            size="sm"
            onClick={handleAddService}
            className="flex items-center space-x-1 text-xs px-3 py-1"
          >
            <StyledIcon name="services" size="sm" variant="primary" />
            <span>Добавить</span>
          </NeonButton>
        </div>

        {/* Фильтры категорий */}
        <div className="flex space-x-1 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border border-primary-400/30 backdrop-blur-sm'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Список услуг */}
        <div className="space-y-3 mb-4">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3 hover:border-gray-500/50 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    <StyledIcon name="service" size="sm" variant="primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base drop-shadow-sm">
                      {service.name}
                    </h3>
                    <p className="text-white/70 text-xs">
                      Услуга
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${service.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-white/60">
                    {service.isActive !== false ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 text-xs text-white/80">
                  <div className="flex items-center space-x-1">
                    <StyledIcon name="clock" size="sm" variant="default" />
                    <span>{service.duration} мин</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StyledIcon name="star" size="sm" variant="accent" />
                    <span>Популярная</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">
                    {formatPrice(service.price)}
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center justify-center space-x-1 pt-2 border-t border-gray-600/30">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(service.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  {service.isActive !== false ? 'Выключить' : 'Включить'}
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditService(service)}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  Изменить
                </NeonButton>
                <NeonButton
                  variant="default"
                  size="sm"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1 text-red-400 hover:text-red-300"
                >
                  Удалить
                </NeonButton>
              </div>
            </div>
          ))}
        </div>

        {/* Форма добавления услуги */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Добавить услугу</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <StyledIcon name="arrow-left" size="sm" variant="default" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Название услуги
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите название"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Категория
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="hair">Парикмахерские услуги</option>
                    <option value="nails">Маникюр и педикюр</option>
                    <option value="face">Косметология</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Цена (₽)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Длительность (мин)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Логика добавления услуги
                    setShowAddForm(false);
                  }}
                >
                  Добавить
                </NeonButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
