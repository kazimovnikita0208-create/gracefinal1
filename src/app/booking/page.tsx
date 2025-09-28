'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { useTelegram } from '@/hooks/useTelegram';

const bookingSteps = [
  {
    href: '/booking/masters',
    title: 'Выбор мастера',
    description: 'Выберите специалиста для вашей процедуры',
    icon: '👩‍💼',
    step: 1,
  },
  {
    href: '/booking/services',
    title: 'Выбор услуги',
    description: 'Определитесь с типом процедуры',
    icon: '💅',
    step: 2,
  },
  {
    href: '/booking/calendar',
    title: 'Выбор времени',
    description: 'Найдите удобную дату и время',
    icon: '📅',
    step: 3,
  },
];

export default function BookingPage() {
  const { hapticFeedback } = useTelegram();

  const handleStepClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <Layout title="Запись на услуги">
      <div className="container mx-auto max-w-sm">
        {/* Заголовок */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Запись на процедуру
          </h1>
          <p className="text-gray-600">
            Выберите удобный способ записи
          </p>
        </div>

        {/* Шаги записи */}
        <div className="space-y-4 mb-8">
          {bookingSteps.map((step, index) => (
            <Link
              key={step.href}
              href={step.href}
              onClick={handleStepClick}
            >
              <Card className="hover:scale-105 transform transition-all duration-200 animate-slide-up">
                <Card.Content className="py-4">
                  <div className="flex items-center space-x-4">
                    {/* Step number */}
                    <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow */}
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

        {/* Альтернативные способы записи */}
        <div className="animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Другие способы записи</h3>
          
          <div className="space-y-3">
            <Card className="hover:shadow-md transition-shadow">
              <Card.Content className="py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">📞</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Позвонить</p>
                    <p className="text-sm text-gray-500">+7 (999) 123-45-67</p>
                  </div>
                  <button className="text-green-600 font-medium text-sm">
                    Позвонить
                  </button>
                </div>
              </Card.Content>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Card.Content className="py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">💬</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-500">Быстрая запись через мессенджер</p>
                  </div>
                  <button className="text-blue-600 font-medium text-sm">
                    Написать
                  </button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Информация */}
        <div className="mt-8 p-4 bg-primary-50 rounded-xl animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="text-primary-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-primary-900">Время работы</h4>
              <p className="text-sm text-primary-700 mt-1">
                Пн-Пт: 9:00 - 21:00<br />
                Сб-Вс: 10:00 - 20:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

