'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { SparklesCore } from '@/components/ui/sparkles';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';

const mainMenuItems = [
  {
    href: '/booking',
    title: 'Записаться',
    icon: '📅',
    variant: 'salon' as const,
  },
  {
    href: '/services',
    title: 'Цены и услуги',
    icon: '💅',
    variant: 'primary' as const,
  },
  {
    href: '/profile',
    title: 'Личный кабинет',
    icon: '👤',
    variant: 'default' as const,
  },
  {
    href: '/contacts',
    title: 'Контакты',
    icon: '📍',
    variant: 'ghost' as const,
  },
];

export default function HomePage() {
  const { user, hapticFeedback } = useTelegram();

  const handleCardClick = () => {
    hapticFeedback.impact('light');
  };

  const getDescription = (href: string) => {
    switch (href) {
      case '/booking':
        return 'Выбор мастера и времени';
      case '/services':
        return 'Каталог всех услуг и цены';
      case '/profile':
        return 'Мои записи и история';
      case '/contacts':
        return 'Адрес и телефоны салона';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] relative w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Полноэкранный анимированный фон со sparkles */}
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id="grace-salon-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#ec4899"
          speed={0.8}
        />
      </div>

      {/* Safe area для мобильных устройств */}
      <div className="relative z-20 w-full max-w-sm mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-screen min-h-[100dvh] py-safe-top pb-safe-bottom">
        {/* Заголовок с адаптивными размерами */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center text-white relative z-20 mb-4 sm:mb-6">
            Grace
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mb-2">
            {user ? `Привет, ${user.first_name}!` : 'Салон красоты'}
          </p>
          <p className="text-white/60 text-sm sm:text-base">
            Профессиональные услуги красоты
          </p>
        </div>

        {/* Основные неоновые кнопки с мобильной оптимизацией */}
        <div className="flex flex-col space-y-3 sm:space-y-4 animate-slide-up px-2 sm:px-0">
          {mainMenuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleCardClick}
              className="block w-full"
            >
              <NeonButton 
                variant={item.variant}
                size="xl" 
                className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.title}</span>
              </NeonButton>
            </Link>
          ))}
        </div>

        {/* Дополнительная информация для мобильных */}
        <div className="mt-8 sm:mt-12 text-center animate-fade-in opacity-80">
          <div className="text-white/40 text-xs sm:text-sm">
            {user && (
              <p className="mb-2">
                Добро пожаловать в мобильное приложение Grace
              </p>
            )}
            <div className="flex items-center justify-center space-x-4">
              <span>⭐ 4.9</span>
              <span>👥 500+</span>
              <span>💄 3 мастера</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}