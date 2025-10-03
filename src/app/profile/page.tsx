'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

const profileSections = [
  {
    href: '/profile/appointments',
    title: 'Мои записи',
    description: 'Предстоящие и прошлые посещения',
    icon: '📅',
    badge: '2',
    color: 'from-primary-500 to-primary-600',
  },
  {
    href: '/profile/history',
    title: 'История посещений',
    description: 'Все ваши визиты в салон',
    icon: '📋',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    href: '/profile/recommendations',
    title: 'Рекомендации',
    description: 'Персональные советы по уходу',
    icon: '💡',
    color: 'from-accent-500 to-accent-600',
  },
  {
    href: '/profile/settings',
    title: 'Настройки',
    description: 'Личная информация и уведомления',
    icon: '⚙️',
    color: 'from-gray-500 to-gray-600',
  },
];

const quickStats = [
  { label: 'Визитов', value: '12', icon: '🏪' },
  { label: 'Потрачено', value: '24 500₽', icon: '💰' },
  { label: 'Скидка', value: '10%', icon: '🎁' },
];

export default function ProfilePage() {
  const { user, hapticFeedback } = useTelegram();

  const handleSectionClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <Layout 
      title="Личный кабинет"
      showBackButton={true}
      backButtonHref="/"
    >
      <div className="container mx-auto max-w-sm">
        {/* Профиль пользователя */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6 animate-fade-in">
          <div className="text-center">
            {/* Аватар */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.first_name?.charAt(0) || 'П'}
            </div>
            
            {/* Информация о пользователе */}
            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
              {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Пользователь'}
            </h2>
            {user?.username && (
              <p className="text-white/70 mb-3">@{user.username}</p>
            )}
            
            {/* Статус клиента */}
            <div className="inline-flex items-center space-x-2 bg-primary-500/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-primary-400/30">
              <span>⭐</span>
              <span>VIP клиент</span>
            </div>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-bold text-white text-lg drop-shadow-sm">{stat.value}</div>
              <div className="text-xs text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Разделы профиля */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {profileSections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={handleSectionClick}
              className="block w-full"
            >
              <NeonButton 
                variant="primary"
                size="xl" 
                className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">{section.icon}</span>
                <span className="truncate">{section.title}</span>
                {section.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                    {section.badge}
                  </span>
                )}
              </NeonButton>
            </Link>
          ))}
        </div>

        {/* Быстрые действия */}
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold text-white drop-shadow-sm">Быстрые действия</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <Link href="/booking" className="block w-full">
              <NeonButton 
                variant="salon" 
                size="xl" 
                className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                onClick={handleSectionClick}
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">📅</span>
                <span className="truncate">Записаться</span>
              </NeonButton>
            </Link>
            
            <Link href="/services" className="block w-full">
              <NeonButton 
                variant="primary" 
                size="xl" 
                className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                onClick={handleSectionClick}
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">💅</span>
                <span className="truncate">Услуги</span>
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Программа лояльности */}
        <div className="mt-6 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-sm border border-primary-400/30 rounded-xl p-4 text-white animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white drop-shadow-sm">Программа лояльности</h4>
              <p className="text-sm text-white/80 mt-1">
                До следующей скидки осталось 3 визита
              </p>
              
              {/* Прогресс бар */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Контакты салона */}
        <div className="mt-6 animate-fade-in bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <h4 className="font-semibold text-white mb-3 drop-shadow-sm">Контакты салона</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-green-400">📞</span>
              <span className="text-sm text-white/80">+7 (999) 123-45-67</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-400">📍</span>
              <span className="text-sm text-white/80">г. Москва, ул. Примерная, 1</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-orange-400">🕒</span>
              <span className="text-sm text-white/80">Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


