'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { adminApi, formatPrice } from '@/lib/adminApi';

export default function AdminServicesPage() {
  const { hapticFeedback } = useTelegram();
  const [services, setServices] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    hapticFeedback.impact('light');
    setNewService({ name: '', description: '', price: 0, duration: 0 });
    setShowAddForm(true);
  };

  const handleEditService = (service: any) => {
    hapticFeedback.impact('light');
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration
    });
    setShowAddForm(true);
  };

  const handleDeleteService = async (serviceId: number) => {
    hapticFeedback.impact('medium');
    try {
      await adminApi.deleteService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Ошибка удаления услуги:', error);
    }
  };

  const handleSaveService = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      if (editingService) {
        // Обновление существующей услуги
        const response = await adminApi.updateService(editingService.id, {
          name: newService.name,
          description: newService.description,
          price: newService.price,
          duration: newService.duration
        });
        
        if (response.success) {
          setServices(services.map(s => 
            s.id === editingService.id 
              ? { ...s, ...newService }
              : s
          ));
          setMessage({ type: 'success', text: 'Услуга успешно обновлена!' });
          setEditingService(null);
        } else {
          setMessage({ type: 'error', text: 'Ошибка обновления услуги' });
        }
      } else {
        // Создание новой услуги
        const response = await adminApi.createService({
          name: newService.name,
          description: newService.description,
          price: newService.price,
          duration: newService.duration,
          category: 'general' // Универсальная категория
        });
        
        if (response.success && response.data) {
          setServices([...services, response.data]);
          setMessage({ type: 'success', text: 'Услуга успешно добавлена!' });
        } else {
          setMessage({ type: 'error', text: 'Ошибка создания услуги' });
        }
      }
      
      // Закрываем форму через 2 секунды после успешного сохранения
      if (message?.type === 'success' || !message) {
        setTimeout(() => {
          setShowAddForm(false);
          setNewService({ name: '', description: '', price: 0, duration: 0 });
          setMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Ошибка сохранения услуги:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения услуги' });
    } finally {
      setSaving(false);
    }
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

        {/* Уведомления */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Статистика */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Всего услуг:</span>
            <span className="text-white font-bold">{services.length}</span>
          </div>
        </div>

        {/* Список услуг */}
        <div className="space-y-3 mb-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white/60">Загрузка услуг...</div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/60">Нет услуг</div>
            </div>
          ) : (
            services.map((service, index) => (
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
            ))
          )}
        </div>

        {/* Форма добавления/редактирования услуги */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingService(null);
                    setNewService({ name: '', description: '', price: 0, duration: 0 });
                  }}
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
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите название"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Описание (необязательно)
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Описание услуги"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Цена (₽)
                    </label>
                    <input
                      type="text"
                      value={newService.price}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Только цифры
                        setNewService({...newService, price: parseInt(value) || 0});
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Длительность (мин)
                    </label>
                    <input
                      type="text"
                      value={newService.duration}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Только цифры
                        setNewService({...newService, duration: parseInt(value) || 0});
                      }}
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
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingService(null);
                    setNewService({ name: '', description: '', price: 0, duration: 0 });
                  }}
                >
                  Отмена
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveService}
                  disabled={!newService.name || newService.price <= 0 || newService.duration <= 0 || saving}
                >
                  {saving ? 'Сохранение...' : (editingService ? 'Сохранить' : 'Добавить')}
                </NeonButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
