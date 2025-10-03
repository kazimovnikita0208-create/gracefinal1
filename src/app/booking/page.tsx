'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';

const bookingSteps = [
  {
    href: '/booking/masters',
    title: 'Выбор мастера',
    description: 'Сначала выберите мастера',
    icon: 'master',
    variant: 'salon' as const,
  },
  {
    href: '/booking/services',
    title: 'Выбор услуги',
    description: 'Сначала выберите услугу',
    icon: 'service',
    variant: 'primary' as const,
  },
  {
    href: '/booking/time',
    title: 'Выбор времени',
    description: 'Сначала выберите время',
    icon: 'time',
    variant: 'default' as const,
  },
];

export default function BookingPage() {
  const { hapticFeedback } = useTelegram();

  const handleStepClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <Layout 
      title="Запись на услуги" 
      showBackButton={true}
      backButtonHref="/"
    >
      <div className="w-full max-w-sm mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-screen min-h-[100dvh] py-safe-top pb-safe-bottom">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-sm">
            Запись на процедуру
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mb-2">
            Выберите удобный способ записи
          </p>
          <p className="text-white/60 text-sm sm:text-base">
            Профессиональные услуги красоты
          </p>
        </div>

        {/* Шаги записи */}
        <div className="space-y-3 sm:space-y-4 mb-8">
          {bookingSteps.map((step, index) => (
            <Link
              key={step.href}
              href={step.href}
              onClick={handleStepClick}
              className="block w-full"
            >
              <NeonButton 
                variant={step.variant}
                size="xl" 
                className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StyledIcon name={step.icon} size="lg" variant={step.variant} className="flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-bold text-white drop-shadow-sm">{step.title}</div>
                  <div className="text-white/80 text-sm font-normal">{step.description}</div>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NeonButton>
            </Link>
          ))}
        </div>

        {/* Альтернативные способы записи */}
        <div className="animate-fade-in">
          <h3 className="font-semibold text-white mb-4 drop-shadow-sm">Другие способы записи</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <NeonButton 
              variant="ghost"
              size="xl"
              className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
              onClick={() => window.open('tel:+79991234567')}
            >
              <StyledIcon name="phone" size="lg" variant="default" className="flex-shrink-0" />
              <span className="truncate">Позвонить</span>
            </NeonButton>

            <NeonButton 
              variant="ghost"
              size="xl"
              className="w-full flex items-center justify-center space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
              onClick={() => window.open('https://wa.me/79991234567')}
            >
              <StyledIcon name="whatsapp" size="lg" variant="default" className="flex-shrink-0" />
              <span className="truncate">WhatsApp</span>
            </NeonButton>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 sm:mt-12 text-center animate-fade-in opacity-80">
          <div className="text-white/40 text-xs sm:text-sm">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span>⭐ 4.9</span>
              <span>👥 500+</span>
              <span>💄 3 мастера</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-start space-x-3">
                <div className="text-primary-400 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-white">Время работы</h4>
                  <p className="text-sm text-white/80 mt-1">
                    Пн-Пт: 9:00 - 21:00<br />
                    Сб-Вс: 10:00 - 20:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


