'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { mockData } from '@/lib/api';

export default function AdminMastersPage() {
  const { hapticFeedback } = useTelegram();
  const [masters, setMasters] = useState(mockData.masters);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<any>(null);

  const handleAddMaster = () => {
    hapticFeedback.impact('light');
    setShowAddForm(true);
  };

  const handleEditMaster = (master: any) => {
    hapticFeedback.impact('light');
    setEditingMaster(master);
  };

  const handleDeleteMaster = (masterId: number) => {
    hapticFeedback.impact('medium');
    setMasters(masters.filter(m => m.id !== masterId));
  };

  const handleToggleStatus = (masterId: number) => {
    hapticFeedback.impact('light');
    setMasters(masters.map(m => 
      m.id === masterId ? { ...m, isActive: !m.isActive } : m
    ));
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

        {/* Список мастеров */}
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
                      <span>4.9</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StyledIcon name="briefcase" size="sm" variant="default" />
                      <span>5 лет</span>
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: Мастер маникюра"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Опыт работы
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Например: 5 лет"
                  />
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
                  onClick={() => {
                    // Логика добавления мастера
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
