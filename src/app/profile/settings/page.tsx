'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

export default function SettingsPage() {
  const { user, hapticFeedback } = useTelegram();
  const [settings, setSettings] = useState({
    notifications: {
      appointments: true,
      promotions: true,
      reminders: true,
      sms: false,
      email: true
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      allowRecommendations: true
    },
    preferences: {
      language: 'ru',
      theme: 'dark',
      timezone: 'Europe/Moscow'
    }
  });

  const handleNotificationToggle = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    hapticFeedback.impact('light');
  };

  const handlePrivacyToggle = (key: keyof typeof settings.privacy) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
    hapticFeedback.impact('light');
  };

  const handleSaveSettings = () => {
    hapticFeedback.impact('medium');
    // Здесь будет логика сохранения настроек
    console.log('Сохранение настроек:', settings);
  };

  const handleLogout = () => {
    hapticFeedback.impact('heavy');
    // Здесь будет логика выхода
    console.log('Выход из аккаунта');
  };

  const handleDeleteAccount = () => {
    hapticFeedback.impact('heavy');
    // Здесь будет логика удаления аккаунта
    console.log('Удаление аккаунта');
  };

  return (
    <Layout 
      title="Настройки"
      showBackButton={true}
      backButtonHref="/profile"
    >
      <div className="container mx-auto max-w-sm px-4 py-4">
        {/* Профиль пользователя */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user?.first_name?.charAt(0) || 'П'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white drop-shadow-sm">
                {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Пользователь'}
              </h3>
              {user?.username && (
                <p className="text-white/70 text-sm">@{user.username}</p>
              )}
              <p className="text-white/60 text-xs">ID: {user?.id || 'Неизвестно'}</p>
            </div>
          </div>
        </div>

        {/* Уведомления */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">Уведомления</h3>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Напоминания о записях</span>
                <p className="text-white/70 text-sm">Уведомления за день и час до записи</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('appointments')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.notifications.appointments ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.notifications.appointments ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Акции и скидки</span>
                <p className="text-white/70 text-sm">Уведомления о специальных предложениях</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('promotions')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.notifications.promotions ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.notifications.promotions ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Напоминания о процедурах</span>
                <p className="text-white/70 text-sm">Советы по уходу и рекомендации</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('reminders')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.notifications.reminders ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.notifications.reminders ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">SMS уведомления</span>
                <p className="text-white/70 text-sm">Получать уведомления по SMS</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('sms')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.notifications.sms ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Конфиденциальность */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">Конфиденциальность</h3>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Показывать номер телефона</span>
                <p className="text-white/70 text-sm">Мастерам будет доступен ваш номер</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showPhone')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.privacy.showPhone ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.privacy.showPhone ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Персональные рекомендации</span>
                <p className="text-white/70 text-sm">Получать советы на основе истории посещений</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('allowRecommendations')}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  settings.privacy.allowRecommendations ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  settings.privacy.allowRecommendations ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Дополнительные настройки */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">Дополнительно</h3>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Язык интерфейса</span>
              <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Часовой пояс</span>
              <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Europe/Kiev">Киев (UTC+2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-4">
          <NeonButton
            variant="salon"
            size="xl"
            className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300"
            onClick={handleSaveSettings}
          >
            💾 Сохранить настройки
          </NeonButton>

          <div className="flex space-x-3">
            <NeonButton
              variant="ghost"
              size="lg"
              className="flex-1 text-yellow-400 border-yellow-400/50 hover:bg-yellow-500/20"
              onClick={handleLogout}
            >
              🚪 Выйти
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="lg"
              className="flex-1 text-red-400 border-red-400/50 hover:bg-red-500/20"
              onClick={handleDeleteAccount}
            >
              🗑️ Удалить аккаунт
            </NeonButton>
          </div>
        </div>

        {/* Информация о приложении */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2 drop-shadow-sm">Grace Beauty Salon</h4>
            <p className="text-white/70 text-sm mb-2">Версия 1.0.0</p>
            <p className="text-white/60 text-xs">
              © 2024 Grace Beauty Salon. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
