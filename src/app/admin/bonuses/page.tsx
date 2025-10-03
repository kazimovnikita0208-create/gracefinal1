'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';

export default function AdminBonusesPage() {
  const { hapticFeedback } = useTelegram();
  const [bonusSettings, setBonusSettings] = useState({
    pointsPerRub: 1, // баллов за рубль
    pointsForRegistration: 100, // баллов за регистрацию
    pointsForReview: 50, // баллов за отзыв
    pointsForReferral: 200, // баллов за приглашение
    minPointsToUse: 100, // минимальное количество баллов для использования
    maxDiscountPercent: 30, // максимальный процент скидки от баллов
    pointsExpiryDays: 365 // срок действия баллов в днях
  });

  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      name: 'Скидка 10%',
      type: 'percentage',
      value: 10,
      minAmount: 0,
      isActive: true,
      description: 'Скидка 10% на все услуги'
    },
    {
      id: 2,
      name: 'Скидка 500₽',
      type: 'fixed',
      value: 500,
      minAmount: 2000,
      isActive: true,
      description: 'Скидка 500₽ при заказе от 2000₽'
    },
    {
      id: 3,
      name: 'Скидка 20%',
      type: 'percentage',
      value: 20,
      minAmount: 5000,
      isActive: false,
      description: 'Скидка 20% при заказе от 5000₽'
    }
  ]);

  const [showAddDiscount, setShowAddDiscount] = useState(false);

  const handleBonusSettingChange = (key: string, value: number) => {
    hapticFeedback.impact('light');
    setBonusSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDiscountToggle = (id: number) => {
    hapticFeedback.impact('light');
    setDiscounts(prev => prev.map(discount => 
      discount.id === id ? { ...discount, isActive: !discount.isActive } : discount
    ));
  };

  const handleDeleteDiscount = (id: number) => {
    hapticFeedback.impact('medium');
    setDiscounts(prev => prev.filter(discount => discount.id !== id));
  };

  const formatDiscount = (discount: any) => {
    if (discount.type === 'percentage') {
      return `${discount.value}%`;
    } else {
      return `${discount.value}₽`;
    }
  };

  return (
    <Layout 
      title="Бонусы и скидки" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
            Бонусы и скидки
          </h1>
          <p className="text-white/80 text-xs">
            Управление бонусной системой
          </p>
        </div>

        {/* Настройки бонусов */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/20">
          <h3 className="font-semibold text-white mb-3 drop-shadow-sm text-sm">🎁 Настройки бонусов</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Баллов за рубль
              </label>
              <input
                type="number"
                value={bonusSettings.pointsPerRub}
                onChange={(e) => handleBonusSettingChange('pointsPerRub', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Баллов за регистрацию
              </label>
              <input
                type="number"
                value={bonusSettings.pointsForRegistration}
                onChange={(e) => handleBonusSettingChange('pointsForRegistration', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Баллов за отзыв
              </label>
              <input
                type="number"
                value={bonusSettings.pointsForReview}
                onChange={(e) => handleBonusSettingChange('pointsForReview', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Баллов за приглашение
              </label>
              <input
                type="number"
                value={bonusSettings.pointsForReferral}
                onChange={(e) => handleBonusSettingChange('pointsForReferral', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Минимум баллов для использования
              </label>
              <input
                type="number"
                value={bonusSettings.minPointsToUse}
                onChange={(e) => handleBonusSettingChange('minPointsToUse', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Максимальная скидка от баллов (%)
              </label>
              <input
                type="number"
                value={bonusSettings.maxDiscountPercent}
                onChange={(e) => handleBonusSettingChange('maxDiscountPercent', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Срок действия баллов (дни)
              </label>
              <input
                type="number"
                value={bonusSettings.pointsExpiryDays}
                onChange={(e) => handleBonusSettingChange('pointsExpiryDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="30"
                max="1095"
              />
            </div>
          </div>
        </div>

        {/* Скидки */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white drop-shadow-sm">💰 Скидки</h3>
            <NeonButton
              variant="primary"
              size="sm"
              onClick={() => setShowAddDiscount(true)}
              className="flex items-center space-x-2"
            >
              <StyledIcon name="briefcase" size="sm" variant="primary" />
              <span>Добавить</span>
            </NeonButton>
          </div>

          <div className="space-y-4">
            {discounts.map((discount, index) => (
              <div
                key={discount.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 hover:border-gray-500/50 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                      <StyledIcon name="briefcase" size="sm" variant="primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg drop-shadow-sm">
                        {discount.name}
                      </h4>
                      <p className="text-white/70 text-sm">
                        {discount.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${discount.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-white/60">
                      {discount.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-white/80 text-sm">Размер скидки:</div>
                  <div className="text-green-400 font-bold text-lg">
                    {formatDiscount(discount)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-white/80 text-sm">Минимальная сумма:</div>
                  <div className="text-white font-medium">
                    {discount.minAmount}₽
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-600/30">
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDiscountToggle(discount.id)}
                    className="text-xs"
                  >
                    {discount.isActive ? 'Деактивировать' : 'Активировать'}
                  </NeonButton>
                  <NeonButton
                    variant="primary"
                    size="sm"
                    onClick={() => {/* Редактирование */}}
                    className="text-xs"
                  >
                    Редактировать
                  </NeonButton>
                  <NeonButton
                    variant="default"
                    size="sm"
                    onClick={() => handleDeleteDiscount(discount.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Удалить
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика бонусов */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <h3 className="font-semibold text-white mb-3 drop-shadow-sm">📊 Статистика бонусов</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/80">Активных скидок</div>
              <div className="text-green-400 font-bold">
                {discounts.filter(d => d.isActive).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Выданных баллов</div>
              <div className="text-blue-400 font-bold">15,420</div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Использованных баллов</div>
              <div className="text-yellow-400 font-bold">8,750</div>
            </div>
            <div className="text-center">
              <div className="text-white/80">Экономия клиентов</div>
              <div className="text-green-400 font-bold">₽12,500</div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between">
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={() => {
              // Сброс настроек
              setBonusSettings({
                pointsPerRub: 1,
                pointsForRegistration: 100,
                pointsForReview: 50,
                pointsForReferral: 200,
                minPointsToUse: 100,
                maxDiscountPercent: 30,
                pointsExpiryDays: 365
              });
            }}
          >
            Сбросить
          </NeonButton>
          <NeonButton
            variant="primary"
            size="sm"
            onClick={() => {
              hapticFeedback.impact('medium');
              // Сохранение настроек
              console.log('Настройки сохранены');
            }}
          >
            Сохранить
          </NeonButton>
        </div>

        {/* Форма добавления скидки */}
        {showAddDiscount && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Добавить скидку</h3>
                <button
                  onClick={() => setShowAddDiscount(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <StyledIcon name="arrow-left" size="sm" variant="default" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Название скидки
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите название"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Тип скидки
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="percentage">Процентная</option>
                    <option value="fixed">Фиксированная</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Размер скидки
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Минимальная сумма заказа
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddDiscount(false)}
                >
                  Отмена
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Логика добавления скидки
                    setShowAddDiscount(false);
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
