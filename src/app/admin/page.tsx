'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import StyledIcon from '@/components/ui/StyledIcon';
import { useTelegram } from '@/hooks/useTelegram';
import { adminApi, formatPrice } from '@/lib/adminApi';

// Базовые элементы меню (без статистики)
const baseAdminMenuItems = [
  {
    href: '/admin/masters',
    title: 'Мастера',
    description: 'Управление мастерами',
    icon: 'master',
    variant: 'salon' as const,
    stats: '3 мастера'
  },
  {
    href: '/admin/services',
    title: 'Услуги',
    description: 'Управление услугами',
    icon: 'services',
    variant: 'primary' as const,
    stats: '8 услуг'
  },
  {
    href: '/admin/appointments',
    title: 'Записи',
    description: 'Управление записями',
    icon: 'booking',
    variant: 'default' as const,
    stats: 'Все записи'
  },
  {
    href: '/admin/notifications',
    title: 'Уведомления',
    description: 'Настройка уведомлений',
    icon: 'info',
    variant: 'primary' as const,
    stats: 'Активны'
  },
  {
    href: '/admin/recommendations',
    title: 'Рекомендации',
    description: 'Управление рекомендациями',
    icon: 'star',
    variant: 'salon' as const,
    stats: '5 активных'
  },
  {
    href: '/admin/bonuses',
    title: 'Бонусы',
    description: 'Баллы и скидки',
    icon: 'briefcase',
    variant: 'primary' as const,
    stats: '15% скидка'
  }
];

export default function AdminPage() {
  const { hapticFeedback } = useTelegram();
  const [stats, setStats] = useState({
    completedAppointments: 0,
    totalRevenue: 0,
    activeMasters: 3,
    activeServices: 8
  });
  const [loading, setLoading] = useState(false);
  const [adminMenuItems] = useState(baseAdminMenuItems);

  useEffect(() => {
    loadCompletedStats();
  }, []);

  const loadCompletedStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Загружаем статистику завершенных записей...');
      
      // Загружаем только статистику по завершенным записям
      const appointmentsResponse = await adminApi.getAppointments();
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const completedAppointments = appointmentsResponse.data.filter((apt: any) => 
          apt.status === 'COMPLETED'
        );
        
        const totalRevenue = completedAppointments.reduce((sum: number, apt: any) => 
          sum + (apt.totalPrice || 0), 0
        );
        
        setStats({
          completedAppointments: completedAppointments.length,
          totalRevenue: totalRevenue,
          activeMasters: 3,
          activeServices: 8
        });
        
        console.log(`✅ Завершенных записей: ${completedAppointments.length}`);
        console.log(`✅ Общая выручка: ${totalRevenue}`);
      } else {
        // Устанавливаем значения по умолчанию
        setStats({
          completedAppointments: 0,
          totalRevenue: 0,
          activeMasters: 3,
          activeServices: 8
        });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error);
      // Устанавливаем значения по умолчанию при ошибке
      setStats({
        completedAppointments: 0,
        totalRevenue: 0,
        activeMasters: 3,
        activeServices: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    hapticFeedback.impact('light');
  };

  // Обработка критических ошибок
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    });
  }

  return (
    <Layout 
      title="Админ панель" 
      showBackButton={true}
      backButtonHref="/"
    >
      <div className="w-full max-w-sm mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-screen min-h-[100dvh] py-safe-top pb-safe-bottom">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <StyledIcon name="master" size="xl" variant="default" className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-sm">
            Админ панель
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mb-2">
            Управление салоном красоты
          </p>
          <p className="text-white/60 text-sm sm:text-base">
            Grace Beauty Salon
          </p>
        </div>

        {/* Основные разделы */}
        <div className="space-y-3 sm:space-y-4 mb-8">
          {adminMenuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleCardClick}
              className="block w-full"
            >
              <NeonButton 
                variant={item.variant}
                size="xl" 
                className="w-full flex items-center justify-between space-x-3 py-4 sm:py-5 font-semibold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-300 min-h-[56px] touch-manipulation"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <StyledIcon name={item.icon} size="lg" variant={item.variant} className="flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-white drop-shadow-sm">{item.title}</div>
                    <div className="text-white/80 text-sm font-normal">{item.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">{item.stats}</div>
                  <StyledIcon name="arrow-right" size="sm" variant="default" className="ml-2" />
                </div>
              </NeonButton>
            </Link>
          ))}
        </div>

        {/* Статистика по завершенным записям */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 animate-fade-in">
          <h3 className="font-semibold text-white mb-3 drop-shadow-sm">📊 Статистика завершенных записей</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="text-white/60">Загрузка статистики...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white/80">Завершено</div>
                <div className="text-white font-bold">{stats.completedAppointments} записей</div>
              </div>
              <div className="text-center">
                <div className="text-white/80">Выручка</div>
                <div className="text-green-400 font-bold">{formatPrice(stats.totalRevenue)}</div>
              </div>
              <div className="text-center">
                <div className="text-white/80">Мастера</div>
                <div className="text-white font-bold">{stats.activeMasters}</div>
              </div>
              <div className="text-center">
                <div className="text-white/80">Услуги</div>
                <div className="text-white font-bold">{stats.activeServices}</div>
              </div>
            </div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 sm:mt-12 text-center animate-fade-in opacity-80">
          <div className="text-white/40 text-xs sm:text-sm">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span>👥 {stats.activeMasters} мастеров</span>
              <span>💅 {stats.activeServices} услуг</span>
              <span>✅ {stats.completedAppointments} завершено</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-start space-x-3">
                <div className="text-primary-400 mt-0.5">
                  <StyledIcon name="info" size="sm" variant="accent" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Система управления</h4>
                  <p className="text-sm text-white/80 mt-1">
                    Полный контроль над салоном красоты
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
