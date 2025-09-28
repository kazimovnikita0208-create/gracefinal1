'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
    <Layout title="Личный кабинет">
      <div className="container mx-auto max-w-sm">
        {/* Профиль пользователя */}
        <Card className="mb-6 animate-fade-in">
          <Card.Content className="p-6">
            <div className="text-center">
              {/* Аватар */}
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.first_name?.charAt(0) || 'П'}
              </div>
              
              {/* Информация о пользователе */}
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Пользователь'}
              </h2>
              {user?.username && (
                <p className="text-gray-500 mb-3">@{user.username}</p>
              )}
              
              {/* Статус клиента */}
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                <span>⭐</span>
                <span>VIP клиент</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          {quickStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <Card.Content className="p-4">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="font-bold text-gray-900 text-lg">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Разделы профиля */}
        <div className="space-y-4 mb-6">
          {profileSections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={handleSectionClick}
            >
              <Card className="hover:scale-105 transform transition-all duration-200 animate-slide-up">
                <Card.Content className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Иконка */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center text-white text-xl shadow-lg`}>
                      {section.icon}
                    </div>
                    
                    {/* Контент */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        {section.badge && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {section.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {section.description}
                      </p>
                    </div>
                    
                    {/* Стрелка */}
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Link>
          ))}
        </div>

        {/* Быстрые действия */}
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Быстрые действия</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/booking">
              <Button className="w-full" size="lg" onClick={handleSectionClick}>
                📅 Записаться
              </Button>
            </Link>
            
            <Link href="/services">
              <Button variant="secondary" className="w-full" size="lg" onClick={handleSectionClick}>
                💅 Услуги
              </Button>
            </Link>
          </div>
        </div>

        {/* Программа лояльности */}
        <Card className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white animate-fade-in">
          <Card.Content className="p-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h4 className="font-semibold">Программа лояльности</h4>
                <p className="text-sm opacity-90 mt-1">
                  До следующей скидки осталось 3 визита
                </p>
                
                {/* Прогресс бар */}
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Контакты салона */}
        <Card className="mt-6 animate-fade-in">
          <Card.Content className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Контакты салона</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">📞</span>
                <span className="text-sm text-gray-600">+7 (999) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-500">📍</span>
                <span className="text-sm text-gray-600">г. Москва, ул. Примерная, 1</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-orange-500">🕒</span>
                <span className="text-sm text-gray-600">Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
}

