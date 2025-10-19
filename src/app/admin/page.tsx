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
    stats: 'Загрузка...'
  },
  {
    href: '/admin/services',
    title: 'Услуги',
    description: 'Управление услугами',
    icon: 'services',
    variant: 'primary' as const,
    stats: 'Загрузка...'
  },
  {
    href: '/admin/appointments',
    title: 'Записи',
    description: 'Управление записями',
    icon: 'booking',
    variant: 'default' as const,
    stats: 'Загрузка...'
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
    todayAppointments: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeMasters: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [adminMenuItems, setAdminMenuItems] = useState(baseAdminMenuItems);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Загружаем статистику админ панели...');
      
      // Устанавливаем значения по умолчанию
      setStats({
        todayAppointments: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        averageRating: 0,
        activeMasters: 0,
        activeServices: 0
      });

      // Временно отключаем загрузку данных для диагностики
      console.log('⚠️ Временно отключаем загрузку данных для диагностики');
      setLoading(false);
      return;

      // Загружаем статистику дашборда
      try {
        console.log('🔄 Загружаем dashboard...');
        const dashboardResponse = await adminApi.getDashboardStats();
        console.log('📊 Dashboard response:', dashboardResponse);
        if (dashboardResponse.success && dashboardResponse.data) {
          setStats(dashboardResponse.data);
          console.log('✅ Dashboard загружен успешно');
        } else {
          console.log('⚠️ Dashboard не загружен, используем значения по умолчанию');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки dashboard:', error);
        console.log('⚠️ Продолжаем с значениями по умолчанию');
      }

      // Загружаем данные для меню
      console.log('🔄 Загружаем данные для меню...');
      const [mastersResponse, servicesResponse, appointmentsResponse] = await Promise.allSettled([
        adminApi.getMasters(),
        adminApi.getServices(),
        adminApi.getAppointments()
      ]);
      
      console.log('📋 Responses:', { mastersResponse, servicesResponse, appointmentsResponse });

      // Обновляем меню с реальными данными
      console.log('🔄 Обновляем меню с данными...');
      const updatedMenuItems = baseAdminMenuItems.map(item => {
        let stats = '';
        
        try {
          switch (item.href) {
            case '/admin/masters':
              if (mastersResponse.status === 'fulfilled' && mastersResponse.value.success) {
                const mastersCount = mastersResponse.value.data?.length || 0;
                stats = `${mastersCount} мастеров`;
                console.log(`✅ Мастера: ${mastersCount}`);
              } else {
                stats = 'Ошибка загрузки';
                console.log('❌ Ошибка загрузки мастеров');
              }
              break;
            case '/admin/services':
              if (servicesResponse.status === 'fulfilled' && servicesResponse.value.success) {
                const servicesCount = servicesResponse.value.data?.length || 0;
                stats = `${servicesCount} услуг`;
                console.log(`✅ Услуги: ${servicesCount}`);
              } else {
                stats = 'Ошибка загрузки';
                console.log('❌ Ошибка загрузки услуг');
              }
              break;
            case '/admin/appointments':
              if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value.success) {
                const todayAppointments = appointmentsResponse.value.data?.filter((apt: any) => {
                  const aptDate = new Date(apt.appointmentDate);
                  const today = new Date();
                  return aptDate.toDateString() === today.toDateString();
                }).length || 0;
                stats = `${todayAppointments} сегодня`;
                console.log(`✅ Записи: ${todayAppointments} сегодня`);
              } else {
                stats = 'Ошибка загрузки';
                console.log('❌ Ошибка загрузки записей');
              }
              break;
            case '/admin/notifications':
              stats = 'Активны';
              break;
            case '/admin/recommendations':
              stats = '5 активных';
              break;
            case '/admin/bonuses':
              stats = '15% скидка';
              break;
            default:
              stats = '';
          }
        } catch (menuError) {
          console.error(`❌ Ошибка обработки меню для ${item.href}:`, menuError);
          stats = 'Ошибка';
        }

        return { ...item, stats };
      });

      setAdminMenuItems(updatedMenuItems);
      console.log('✅ Админ панель загружена успешно');
    } catch (err) {
      console.error('❌ Критическая ошибка при загрузке статистики:', err);
      // Устанавливаем значения по умолчанию при ошибке
      setStats({
        todayAppointments: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        averageRating: 0,
        activeMasters: 0,
        activeServices: 0
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

        {/* Статистика */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 animate-fade-in">
          <h3 className="font-semibold text-white mb-3 drop-shadow-sm">📊 Быстрая статистика</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="text-white/60">Загрузка статистики...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white/80">Сегодня</div>
                <div className="text-white font-bold">{stats.todayAppointments} записей</div>
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
                <div className="text-white/80">Рейтинг</div>
                <div className="text-yellow-400 font-bold">{stats.averageRating.toFixed(1)}⭐</div>
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
              <span>📅 {stats.todayAppointments} записей</span>
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
