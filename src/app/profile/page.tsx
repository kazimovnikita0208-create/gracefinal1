'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { NeonButton } from '@/components/ui/neon-button';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const SectionIcon = ({ type }: { type:
  'appointments' | 'history' | 'recommendations' | 'settings' |
  'book' | 'services' | 'gift' | 'phone' | 'location' | 'time' }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'appointments':
    case 'book':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      );
    case 'history':
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.708" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'recommendations':
      return (
        <svg {...common}>
          <path d="M12 3v2" />
          <path d="M5.22 5.22l1.42 1.42" />
          <path d="M18.78 5.22l-1.42 1.42" />
          <path d="M12 8a5 5 0 0 0-5 5v2h10v-2a5 5 0 0 0-5-5Z" />
          <path d="M10 17v2a2 2 0 0 0 4 0v-2" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
          <circle cx="9" cy="7" r="2" />
          <circle cx="14" cy="12" r="2" />
          <circle cx="7" cy="17" r="2" />
        </svg>
      );
    case 'services':
      return (
        <svg {...common}>
          <circle cx="6.5" cy="7.5" r="2.2" />
          <circle cx="6.5" cy="16.5" r="2.2" />
          <path d="M8.2 9l9.3-4" />
          <path d="M8.2 15l9.3 4" />
          <path d="M12 12l4-4" opacity="0.35" />
          <path d="M12 12l4 4" opacity="0.35" />
        </svg>
      );
    case 'gift':
      return (
        <svg {...common}>
          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
          <path d="M3 7h18v5H3z" />
          <path d="M12 7v15" />
          <path d="M7.5 7a2.5 2.5 0 1 1 5 0" />
          <path d="M11.5 7a2.5 2.5 0 1 1 5 0" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.46-1.16a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.61.59A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case 'location':
      return (
        <svg {...common}>
          <path d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10Z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      );
    case 'time':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
};

const profileSections = [
  {
    href: '/profile/appointments',
    title: 'Мои записи',
    description: 'Предстоящие и прошлые посещения',
    iconType: 'appointments',
    color: 'from-primary-500 to-primary-600',
  },
  {
    href: '/profile/history',
    title: 'История посещений',
    description: 'Все ваши визиты в салон',
    iconType: 'history',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    href: '/profile/recommendations',
    title: 'Рекомендации',
    description: 'Персональные советы по уходу',
    iconType: 'recommendations',
    color: 'from-accent-500 to-accent-600',
  },
  {
    href: '/profile/settings',
    title: 'Настройки',
    description: 'Личная информация и уведомления',
    iconType: 'settings',
    color: 'from-gray-500 to-gray-600',
  },
];

const StatIcon = ({ type }: { type: 'visits' | 'spent' | 'discount' }) => {
  // минималистичные outline-иконки, строго выровненные в 24x24
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const
  };

  if (type === 'visits') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M7 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  if (type === 'spent') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9h4.5a2 2 0 1 1 0 4H10a2 2 0 1 0 0 4h5" />
        <path d="M12 6v2m0 8v2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3l2.2 4.45 4.9.71-3.55 3.46.84 4.87L12 14.9l-4.39 2.59.84-4.87L4.9 8.16l4.9-.71L12 3Z" />
      <circle cx="12" cy="12" r="9" opacity="0.15" />
    </svg>
  );
};

const StatCard = ({
  iconType,
  value,
  label,
  color
}: {
  iconType: 'visits' | 'spent' | 'discount';
  value: React.ReactNode;
  label: string;
  color: 'primary' | 'green' | 'amber';
}) => {
  const colorClasses = {
    primary: {
      ring: 'ring-primary-400/25',
      iconBg: 'from-primary-500/20 to-primary-600/10',
      iconBorder: 'border-primary-400/30',
      iconText: 'text-primary-300'
    },
    green: {
      ring: 'ring-green-400/25',
      iconBg: 'from-green-500/20 to-green-600/10',
      iconBorder: 'border-green-400/30',
      iconText: 'text-green-300'
    },
    amber: {
      ring: 'ring-amber-400/25',
      iconBg: 'from-amber-500/20 to-amber-600/10',
      iconBorder: 'border-amber-400/30',
      iconText: 'text-amber-300'
    }
  }[color];

  return (
    <div className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/15 rounded-xl p-4 text-center shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 ring-1 ${colorClasses.ring}`}>
      <div className={`mx-auto mb-2 w-10 h-10 rounded-full border ${colorClasses.iconBorder} bg-gradient-to-br ${colorClasses.iconBg} flex items-center justify-center ${colorClasses.iconText} shadow-inner`}> 
        <StatIcon type={iconType} />
      </div>
      <div className="font-bold text-white text-lg drop-shadow-sm tabular-nums tracking-tight">{value}</div>
      <div className="text-xs text-white/70">{label}</div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, hapticFeedback } = useTelegram();
  const [visits, setVisits] = useState<number>(0);
  const [spent, setSpent] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMyAppointments();
        if (res.success && res.data) {
          const all = res.data;
          setVisits(all.length);
          const totalSpent = all
            .filter(a => String(a.status).toLowerCase() !== 'cancelled')
            .reduce((sum, a) => sum + (a.service?.price || a.totalPrice || 0), 0);
          setSpent(totalSpent);
          // простая модель скидки: 1% за каждые 5 завершенных визитов, максимум 20%
          const completedCount = all.filter(a => String(a.status).toLowerCase() === 'completed').length;
          setDiscount(Math.min(20, Math.floor(completedCount / 5) * 1));
        }
      } catch {}
    })();
  }, []);

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
          <StatCard iconType="visits" value={visits} label="Визитов" color="primary" />
          <StatCard iconType="spent" value={formatPrice(spent)} label="Потрачено" color="green" />
          <StatCard iconType="discount" value={`${discount}%`} label="Скидка" color="amber" />
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
                <span className="flex-shrink-0 text-white/90">
                  <SectionIcon type={section.iconType as any} />
                </span>
                <span className="truncate">{section.title}</span>
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
                <span className="flex-shrink-0 text-white/90"><SectionIcon type="book" /></span>
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
                <span className="flex-shrink-0 text-white/90"><SectionIcon type="services" /></span>
                <span className="truncate">Услуги</span>
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Программа лояльности */}
        <div className="mt-6 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-sm border border-primary-400/30 rounded-xl p-4 text-white animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="text-white/90"><SectionIcon type="gift" /></div>
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
              <span className="text-green-400"><SectionIcon type="phone" /></span>
              <span className="text-sm text-white/80">+7 (999) 123-45-67</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-400"><SectionIcon type="location" /></span>
              <span className="text-sm text-white/80">г. Москва, ул. Примерная, 1</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-orange-400"><SectionIcon type="time" /></span>
              <span className="text-sm text-white/80">Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


