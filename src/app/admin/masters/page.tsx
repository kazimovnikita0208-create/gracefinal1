'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { adminApi, formatPrice, formatDuration } from '@/lib/adminApi';
import { Master, Service } from '@/types';

export default function AdminMastersPage() {
  const { hapticFeedback } = useTelegram();
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Состояние для формы добавления мастера
  const [newMaster, setNewMaster] = useState({
    name: '',
    specialization: '',
    description: '',
    experience: 0,
    photoUrl: ''
  });
  
  // Состояние для выбранных услуг
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  // Состояние для формы редактирования мастера
  const [editMasterData, setEditMasterData] = useState({
    name: '',
    specialization: '',
    description: '',
    experience: 0,
    photoUrl: ''
  });

  // Загружаем мастеров и услуги при монтировании компонента
  useEffect(() => {
    loadMasters();
    loadServices();
  }, []);

  const loadMasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getMasters();
      if (response.success && response.data) {
        setMasters(response.data);
      } else {
        setError('Ошибка загрузки мастеров');
      }
    } catch (err) {
      console.error('Ошибка при загрузке мастеров:', err);
      setError('Не удалось загрузить мастеров');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await adminApi.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    console.log('🔍 Переключаем услугу:', serviceId);
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      console.log('🔍 Новые selectedServices:', newServices);
      return newServices;
    });
  };

  const handleAddMaster = () => {
    hapticFeedback.impact('light');
    setShowAddForm(true);
  };

  const handleEditMaster = (master: Master) => {
    hapticFeedback.impact('light');
    setEditingMaster(master);
    setEditMasterData({
      name: master.name || '',
      specialization: master.specialization || '',
      description: (master as any).description || '',
      experience: (master as any).experience || 0,
      photoUrl: (master as any).photoUrl || ''
    });
    const masterServices = ((master as any).services || []).map((s: any) => s.serviceId ?? s.id).filter(Boolean);
    console.log('🔍 Услуги мастера при редактировании:', masterServices);
    setSelectedServices(masterServices);
  };

  const handleDeleteMaster = async (masterId: number) => {
    try {
      hapticFeedback.impact('medium');
      await adminApi.deleteMaster(masterId);
      setMasters(masters.filter(m => m.id !== masterId));
    } catch (err) {
      console.error('Ошибка при удалении мастера:', err);
      setError('Не удалось удалить мастера');
    }
  };

  const handleToggleStatus = async (masterId: number) => {
    try {
      hapticFeedback.impact('light');
      const master = masters.find(m => m.id === masterId);
      if (master) {
        await adminApi.updateMaster(masterId, { isActive: !master.isActive });
        setMasters(masters.map(m => 
          m.id === masterId ? { ...m, isActive: !m.isActive } : m
        ));
      }
    } catch (err) {
      console.error('Ошибка при изменении статуса мастера:', err);
      setError('Не удалось изменить статус мастера');
    }
  };

  const handleSaveMaster = async () => {
    try {
      hapticFeedback.impact('light');
      setSaving(true);
      setError(null);
      setMessage(null);
      
      if (!newMaster.name || !newMaster.specialization) {
        setMessage({ type: 'error', text: 'Заполните обязательные поля' });
        return;
      }

      const response = await adminApi.createMaster({
        name: newMaster.name,
        specialization: newMaster.specialization,
        description: newMaster.description,
        experience: newMaster.experience,
        photoUrl: newMaster.photoUrl || '/images/masters/default.jpg',
        serviceIds: selectedServices
      });

      if (response.success && response.data) {
        setMasters([response.data, ...masters]);
        setMessage({ type: 'success', text: 'Мастер успешно добавлен!' });
        setNewMaster({
          name: '',
          specialization: '',
          description: '',
          experience: 0,
          photoUrl: ''
        });
        setSelectedServices([]);
        
        // Закрываем форму через 2 секунды после успешного сохранения
        setTimeout(() => {
          setShowAddForm(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Не удалось добавить мастера' });
      }
    } catch (err) {
      console.error('Ошибка при добавлении мастера:', err);
      setMessage({ type: 'error', text: 'Ошибка сохранения мастера' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout 
      title="Управление мастерами" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
              Мастера
            </h1>
            <p className="text-white/80 text-xs">
              {masters.length} мастеров в системе
            </p>
          </div>
          <NeonButton
            variant="salon"
            size="sm"
            onClick={handleAddMaster}
            className="flex items-center space-x-1 text-xs px-3 py-1"
          >
            <StyledIcon name="master" size="sm" variant="salon" />
            <span>Добавить</span>
          </NeonButton>
        </div>

        {/* Состояние загрузки */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-white/60">Загрузка мастеров...</div>
          </div>
        )}

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

        {/* Ошибка */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <div className="text-red-400 text-sm">{error}</div>
            <button 
              onClick={loadMasters}
              className="text-red-300 text-xs underline mt-1"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список мастеров */}
        {!loading && !error && (
          <div className="space-y-3 mb-4">
            {masters.map((master, index) => (
            <div
              key={master.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3 hover:border-gray-500/50 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                {/* Аватар мастера */}
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 text-sm">
                  {master.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Информация о мастере */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-base drop-shadow-sm">
                      {master.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${master.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-xs text-white/60">
                        {master.isActive !== false ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-xs mb-1">
                    {master.specialization}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-white/80">
                    <div className="flex items-center space-x-1">
                      <StyledIcon name="star" size="sm" variant="accent" />
                      <span>5.0</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StyledIcon name="briefcase" size="sm" variant="default" />
                      <span>{master.experience || 0} лет</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StyledIcon name="service" size="sm" variant="primary" />
                      <span>{(master as any).services?.length || 0} услуг</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center justify-center space-x-1 mt-3 pt-2 border-t border-gray-600/30">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(master.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  {master.isActive !== false ? 'Выключить' : 'Включить'}
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditMaster(master)}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  Изменить
                </NeonButton>
                <NeonButton
                  variant="default"
                  size="sm"
                  onClick={() => handleDeleteMaster(master.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1 text-red-400 hover:text-red-300"
                >
                  Удалить
                </NeonButton>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Форма добавления мастера */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Добавить мастера</h3>
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
                    Имя мастера
                  </label>
                  <input
                    type="text"
                    value={newMaster.name}
                    onChange={(e) => setNewMaster({...newMaster, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите имя"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Специализация
                  </label>
                  <input
                    type="text"
                    value={newMaster.specialization}
                    onChange={(e) => setNewMaster({...newMaster, specialization: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: Мастер маникюра"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Опыт работы
                  </label>
                  <input
                    type="number"
                    value={newMaster.experience}
                    onChange={(e) => setNewMaster({...newMaster, experience: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: 5"
                  />
                </div>
              </div>
              
              {/* Выбор услуг */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Услуги мастера
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {service.name}
                        </div>
                        <div className="text-white/60 text-xs">
                          {formatPrice(service.price)} • {formatDuration(service.duration)}
                        </div>
                      </div>
                    </label>
                  ))}
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
                  variant="salon"
                  size="sm"
                  onClick={handleSaveMaster}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Добавить'}
                </NeonButton>
              </div>
            </div>
          </div>
        )}

        {/* Форма редактирования мастера */}
        {editingMaster && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Изменить мастера</h3>
                <button
                  onClick={() => setEditingMaster(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <StyledIcon name="arrow-left" size="sm" variant="default" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Имя мастера</label>
                  <input
                    type="text"
                    value={editMasterData.name}
                    onChange={(e) => setEditMasterData({ ...editMasterData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите имя"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Специализация</label>
                  <input
                    type="text"
                    value={editMasterData.specialization}
                    onChange={(e) => setEditMasterData({ ...editMasterData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: Мастер маникюра"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Опыт работы</label>
                  <input
                    type="number"
                    value={editMasterData.experience}
                    onChange={(e) => setEditMasterData({ ...editMasterData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: 5"
                  />
                </div>
              </div>

              {/* Выбор услуг */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-white/80 mb-3">Услуги мастера</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{service.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <NeonButton variant="ghost" size="sm" onClick={() => setEditingMaster(null)}>Отмена</NeonButton>
                <NeonButton
                  variant="salon"
                  size="sm"
                  disabled={saving}
                  onClick={async () => {
                    try {
                      if (!editingMaster) return;
                      setSaving(true);
                      setMessage(null);
                      
                      console.log('🔍 Обновляем мастера с данными:', {
                        ...editMasterData,
                        serviceIds: selectedServices,
                      });
                      console.log('🔍 selectedServices:', selectedServices);
                      console.log('🔍 Тип selectedServices:', typeof selectedServices, 'Длина:', selectedServices?.length);
                      
                      const res = await adminApi.updateMaster(editingMaster.id, {
                        ...editMasterData,
                        serviceIds: selectedServices,
                      } as any);
                      
                      if (res.success && res.data) {
                        setMasters(masters.map(m => (m.id === editingMaster.id ? res.data as any : m)));
                        setMessage({ type: 'success', text: 'Мастер успешно обновлен!' });
                        setEditingMaster(null);
                        
                        // Закрываем форму через 2 секунды после успешного сохранения
                        setTimeout(() => {
                          setMessage(null);
                        }, 2000);
                      } else {
                        setMessage({ type: 'error', text: 'Не удалось сохранить изменения' });
                      }
                    } catch (e) {
                      console.error('Ошибка при обновлении мастера:', e);
                      setMessage({ type: 'error', text: 'Ошибка сохранения мастера' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </NeonButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
