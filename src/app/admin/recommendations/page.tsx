'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';

export default function AdminRecommendationsPage() {
  const { hapticFeedback } = useTelegram();
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      title: 'Маникюр + Педикюр',
      description: 'Комплексный уход за ногтями',
      services: ['Маникюр классический', 'Педикюр классический'],
      discount: 15,
      isActive: true,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Стрижка + Укладка',
      description: 'Полный образ для важного события',
      services: ['Стрижка', 'Укладка'],
      discount: 10,
      isActive: true,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Чистка лица + Массаж',
      description: 'Уход за кожей лица',
      services: ['Чистка лица', 'Массаж лица'],
      discount: 20,
      isActive: false,
      priority: 'low'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggleRecommendation = (id: number) => {
    hapticFeedback.impact('light');
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, isActive: !rec.isActive } : rec
    ));
  };

  const handleDeleteRecommendation = (id: number) => {
    hapticFeedback.impact('medium');
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const handlePriorityChange = (id: number, priority: string) => {
    hapticFeedback.impact('light');
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, priority } : rec
    ));
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const priorityLabels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  return (
    <Layout 
      title="Управление рекомендациями" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        {/* Заголовок с кнопкой добавления */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
              Рекомендации
            </h1>
            <p className="text-white/80 text-xs">
              {recommendations.length} рекомендаций в системе
            </p>
          </div>
          <NeonButton
            variant="salon"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 text-xs px-3 py-1"
          >
            <StyledIcon name="star" size="sm" variant="salon" />
            <span>Добавить</span>
          </NeonButton>
        </div>

        {/* Список рекомендаций */}
        <div className="space-y-3 mb-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3 hover:border-gray-500/50 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Заголовок рекомендации */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${priorityColors[recommendation.priority as keyof typeof priorityColors]}`}></div>
                  <h3 className="font-bold text-white text-base drop-shadow-sm">
                    {recommendation.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${recommendation.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-white/60">
                    {recommendation.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
              </div>

              {/* Описание */}
              <p className="text-white/70 text-xs mb-2">
                {recommendation.description}
              </p>

              {/* Услуги и скидка */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-wrap gap-1">
                  {recommendation.services.map((service, serviceIndex) => (
                    <span
                      key={serviceIndex}
                      className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                <div className="text-green-400 font-bold text-sm">
                  {recommendation.discount}%
                </div>
              </div>

              {/* Приоритет */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/80 text-xs">Приоритет:</div>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[recommendation.priority as keyof typeof priorityColors]}`}></div>
                  <select
                    value={recommendation.priority}
                    onChange={(e) => handlePriorityChange(recommendation.id, e.target.value)}
                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 backdrop-blur-sm"
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center justify-center space-x-1 pt-2 border-t border-gray-600/30">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRecommendation(recommendation.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  {recommendation.isActive ? 'Выключить' : 'Включить'}
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => {/* Редактирование */}}
                  className="text-xs px-2 py-1 min-w-0 flex-1"
                >
                  Изменить
                </NeonButton>
                <NeonButton
                  variant="default"
                  size="sm"
                  onClick={() => handleDeleteRecommendation(recommendation.id)}
                  className="text-xs px-2 py-1 min-w-0 flex-1 text-red-400 hover:text-red-300"
                >
                  Удалить
                </NeonButton>
              </div>
            </div>
          ))}
        </div>

        {/* Статистика рекомендаций */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/20">
          <h3 className="font-semibold text-white mb-2 drop-shadow-sm text-sm">📊 Статистика</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-white/80">Активных</div>
              <div className="text-green-400 font-bold text-sm">
                {recommendations.filter(r => r.isActive).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Средняя скидка</div>
              <div className="text-yellow-400 font-bold text-sm">
                {Math.round(recommendations.reduce((sum, r) => sum + r.discount, 0) / recommendations.length)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Высокий приоритет</div>
              <div className="text-red-400 font-bold text-sm">
                {recommendations.filter(r => r.priority === 'high').length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Использований</div>
              <div className="text-blue-400 font-bold text-sm">24</div>
            </div>
          </div>
        </div>

        {/* Форма добавления рекомендации */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Добавить рекомендацию</h3>
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
                    Название рекомендации
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите название"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Описание
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Описание рекомендации"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="1"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Приоритет
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
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
                    // Логика добавления рекомендации
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
