'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';

export default function AdminNotificationsPage() {
  const { hapticFeedback } = useTelegram();
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    pushNotifications: true,
    appointmentConfirmations: true,
    cancellationAlerts: true,
    newBookingAlerts: true,
    dailyReports: true,
    weeklyReports: false,
    monthlyReports: false,
    lowStockAlerts: true,
    systemAlerts: true
  });

  const [reminderSettings, setReminderSettings] = useState({
    beforeAppointment: 24, // часы
    confirmationDeadline: 2, // часы
    cancellationDeadline: 2 // часы
  });

  const handleToggle = (key: string) => {
    hapticFeedback.impact('light');
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleReminderChange = (key: string, value: number) => {
    hapticFeedback.impact('light');
    setReminderSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const notificationCategories = [
    {
      title: 'Напоминания клиентам',
      items: [
        { key: 'emailReminders', label: 'Email напоминания', description: 'Отправка напоминаний на email' },
        { key: 'smsReminders', label: 'SMS напоминания', description: 'Отправка SMS клиентам' },
        { key: 'pushNotifications', label: 'Push уведомления', description: 'Уведомления в приложении' }
      ]
    },
    {
      title: 'Уведомления о записях',
      items: [
        { key: 'appointmentConfirmations', label: 'Подтверждения записей', description: 'Уведомления о новых записях' },
        { key: 'cancellationAlerts', label: 'Отмены записей', description: 'Уведомления об отменах' },
        { key: 'newBookingAlerts', label: 'Новые записи', description: 'Мгновенные уведомления о записях' }
      ]
    },
    {
      title: 'Отчеты и аналитика',
      items: [
        { key: 'dailyReports', label: 'Ежедневные отчеты', description: 'Отчеты о работе за день' },
        { key: 'weeklyReports', label: 'Еженедельные отчеты', description: 'Сводка за неделю' },
        { key: 'monthlyReports', label: 'Ежемесячные отчеты', description: 'Аналитика за месяц' }
      ]
    },
    {
      title: 'Системные уведомления',
      items: [
        { key: 'lowStockAlerts', label: 'Низкие остатки', description: 'Уведомления о заканчивающихся материалах' },
        { key: 'systemAlerts', label: 'Системные ошибки', description: 'Уведомления о проблемах в системе' }
      ]
    }
  ];

  return (
    <Layout 
      title="Настройки уведомлений" 
      showBackButton={true}
      backButtonHref="/admin"
    >
      <div className="w-full max-w-sm mx-auto px-4 py-4">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
            Уведомления
          </h1>
          <p className="text-white/80 text-sm">
            Настройка системы уведомлений
          </p>
        </div>

        {/* Настройки напоминаний */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <h3 className="font-semibold text-white mb-4 drop-shadow-sm">⏰ Настройки напоминаний</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Напоминание перед записью (часы)
              </label>
              <input
                type="number"
                value={reminderSettings.beforeAppointment}
                onChange={(e) => handleReminderChange('beforeAppointment', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Срок подтверждения записи (часы)
              </label>
              <input
                type="number"
                value={reminderSettings.confirmationDeadline}
                onChange={(e) => handleReminderChange('confirmationDeadline', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Срок отмены записи (часы)
              </label>
              <input
                type="number"
                value={reminderSettings.cancellationDeadline}
                onChange={(e) => handleReminderChange('cancellationDeadline', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="24"
              />
            </div>
          </div>
        </div>

        {/* Категории уведомлений */}
        <div className="space-y-6">
          {notificationCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4 drop-shadow-sm">
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <StyledIcon name="info" size="sm" variant="primary" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {item.label}
                          </div>
                          <div className="text-white/60 text-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-primary-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between mt-8">
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={() => {
              // Сброс настроек
              setNotifications({
                emailReminders: true,
                smsReminders: true,
                pushNotifications: true,
                appointmentConfirmations: true,
                cancellationAlerts: true,
                newBookingAlerts: true,
                dailyReports: true,
                weeklyReports: false,
                monthlyReports: false,
                lowStockAlerts: true,
                systemAlerts: true
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

        {/* Информация о настройках */}
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <StyledIcon name="info" size="sm" variant="accent" />
            <div>
              <h4 className="font-semibold text-white mb-2">ℹ️ Информация</h4>
              <div className="space-y-1 text-sm text-white/80">
                <p>• Настройки применяются ко всем уведомлениям</p>
                <p>• Клиенты могут отключить уведомления в личном кабинете</p>
                <p>• Системные уведомления отправляются только администраторам</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
