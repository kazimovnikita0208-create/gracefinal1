'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { Layout } from '@/components/layout';
import { NeonButton } from '@/components/ui/neon-button';
import Modal from '@/components/ui/Modal';
import { Clock, Calendar, User, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Данные загружаем из API

// Моковые данные для доступных дат и времени
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Исключаем воскресенья
    if (date.getDay() !== 0) {
      dates.push({
        date: date,
        dateString: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('ru-RU', { month: 'short' }),
        available: Math.random() > 0.2 // 80% вероятность доступности
      });
    }
  }
  
  return dates;
};

// Моковые данные для доступного времени
const generateAvailableTimes = (date: string) => {
  console.log('generateAvailableTimes called with date:', date);
  
  // Простой массив фиксированных времен
  const times = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true }
  ];
  
  console.log('Generated times:', times);
  return times;
};

// formatPrice берем из utils (переводит копейки → рубли)

export default function TimeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);

  const masterId = parseInt(params.masterId as string);
  const serviceId = parseInt(params.serviceId as string);
  
  const [master, setMaster] = useState<any | null>(null);
  const [service, setService] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        const [mRes, sRes] = await Promise.all([
          api.getMaster(masterId),
          api.getServicesByMaster(masterId)
        ]);
        if (cancelled) return;
        if (mRes.success && mRes.data) setMaster(mRes.data);
        if (sRes.success && sRes.data) {
          const found = sRes.data.find((s: any) => s.id === serviceId);
          setService(found || null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Не удалось загрузить данные');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (Number.isFinite(masterId) && Number.isFinite(serviceId)) load();
    return () => { cancelled = true; };
  }, [masterId, serviceId]);

  useEffect(() => {
    setAvailableDates(generateAvailableDates());
  }, []);

  const handleDateSelect = (dateString: string) => {
    hapticFeedback.impact('light');
    setSelectedDate(dateString);
    const times = generateAvailableTimes(dateString);
    console.log('Generated times for date', dateString, ':', times);
    setAvailableTimes(times);
    setShowTimeModal(true);
  };

  const handleTimeSelect = (time: string) => {
    hapticFeedback.impact('light');
    setSelectedTime(time);
  };

  const handleCloseTimeModal = () => {
    setShowTimeModal(false);
  };

  const handleConfirmBooking = async () => {
    if (selectedDate && selectedTime && master && service) {
      try {
        hapticFeedback.impact('medium');
        const iso = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
        await api.createAppointment({
          masterId: masterId,
          serviceId: serviceId,
          appointmentDate: iso,
        });
        // перенаправляем в личный кабинет на предстоящие записи
        setShowTimeModal(false);
        router.push('/profile/appointments');
      } catch (e) {
        // если что-то пошло не так, оставим старое поведение с подтверждением
        setShowTimeModal(false);
        setShowConfirmModal(true);
      }
    }
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    // Переходим на главную страницу после подтверждения
    router.push('/');
  };

  if (loading) {
    return (
      <Layout 
        title="Загрузка" 
        showBackButton={true}
        backButtonHref="/booking/masters"
      >
        <div className="w-full max-w-sm mx-auto px-4 flex flex-col justify-center min-h-screen py-4 pb-20">
          <LoadingSpinner size="lg" text="Загружаем данные мастера и услуги..." />
        </div>
      </Layout>
    );
  }

  if (error || !master || !service) {
    return (
      <Layout 
        title="Ошибка" 
        showBackButton={true}
        backButtonHref="/booking/masters"
      >
        <div className="w-full max-w-sm mx-auto px-4 flex flex-col justify-center min-h-screen py-4 pb-20">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
              Мастер или услуга не найдены
            </h1>
            <p className="text-white/80 mb-6 drop-shadow-sm">
              Выбранный мастер или услуга не найдены в системе
            </p>
            <NeonButton
              variant="primary"
              size="lg"
              onClick={() => router.push('/booking/masters')}
            >
              Выбрать заново
            </NeonButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Выбор времени" 
      showBackButton={true}
      backButtonHref={`/booking/masters/${masterId}/services`}
    >
      <div className="w-full max-w-sm mx-auto px-4 flex flex-col justify-center min-h-screen py-4 pb-20">
        {/* Информация о записи */}
        <div className="mb-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {master.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white mb-1 drop-shadow-sm truncate">
                  {master.name}
                </h2>
                <p className="text-white/80 text-xs drop-shadow-sm truncate">
                  {service.name}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="font-medium text-primary-200">
                {formatPrice(service.price)}
              </span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{service.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Выбор даты */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 drop-shadow-sm">
            Выберите дату
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((dateInfo) => (
              <div
                key={dateInfo.dateString}
                className={`cursor-pointer transition-all duration-300 ${
                  !dateInfo.available ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={() => dateInfo.available && handleDateSelect(dateInfo.dateString)}
              >
                <NeonButton
                  variant={selectedDate === dateInfo.dateString ? "salon" : "primary"}
                  size="xl"
                  className={`w-full p-3 hover:scale-105 active:scale-95 transition-all duration-300 min-h-[60px] touch-manipulation ${
                    !dateInfo.available ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!dateInfo.available}
                >
                  <div className="text-center">
                    <div className="text-xs text-white/80 mb-1">
                      {dateInfo.dayName}
                    </div>
                    <div className="text-lg font-bold text-white mb-1">
                      {dateInfo.dayNumber}
                    </div>
                    <div className="text-xs text-white/80">
                      {dateInfo.monthName}
                    </div>
                  </div>
                </NeonButton>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка подтверждения */}
        {selectedDate && selectedTime && (
          <div className="fixed bottom-2 left-2 right-2 z-10">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-3 font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              onClick={handleConfirmBooking}
            >
              Подтвердить запись
            </NeonButton>
          </div>
        )}

        {/* Информационный блок */}
        <div className="mt-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
            <h4 className="text-white font-semibold mb-2 text-xs drop-shadow-sm">
              Информация о записи
            </h4>
            <div className="space-y-1 text-xs text-white/80 drop-shadow-sm">
              <p>• Выберите удобную дату и время</p>
              <p>• Запись подтверждается автоматически</p>
              <p>• Отмена возможна за 2 часа до приема</p>
            </div>
          </div>
        </div>

        {/* Модальное окно выбора времени */}
        <Modal
          isOpen={showTimeModal}
          onClose={handleCloseTimeModal}
          title="Выберите время"
        >
          <div className="p-4 text-white">
            <div className="text-sm text-white/80 mb-4 drop-shadow-sm">
              Выбранная дата: {selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableTimes.map((timeInfo, index) => (
                <button
                  key={`${timeInfo.time}-${index}`}
                  onClick={() => handleTimeSelect(timeInfo.time)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTime === timeInfo.time
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {timeInfo.time}
                </button>
              ))}
            </div>
            
            {selectedTime && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-sm text-white/80 mb-3 drop-shadow-sm">
                    Выбрано время: <span className="font-semibold text-white">{selectedTime}</span>
                  </div>
                  <NeonButton
                    variant="salon"
                    size="lg"
                    className="w-full hover:scale-105 active:scale-95 transition-all duration-300"
                    onClick={handleConfirmBooking}
                  >
                    Записаться
                  </NeonButton>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Модальное окно подтверждения записи */}
        <Modal
          isOpen={showConfirmModal}
          onClose={handleCloseConfirmModal}
          title="Запись подтверждена"
        >
          <div className="p-6 text-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
                Запись успешно создана!
              </h3>
              <p className="text-white/80 drop-shadow-sm">
                Мы свяжемся с вами для подтверждения
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6 border border-white/20 shadow-lg">
              <h4 className="font-bold text-white mb-4 text-center drop-shadow-sm">Детали записи</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/80 font-medium">Мастер:</span>
                  <span className="font-bold text-white">{master?.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/80 font-medium">Услуга:</span>
                  <span className="font-bold text-white">{service?.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/80 font-medium">Дата:</span>
                  <span className="font-bold text-white">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/80 font-medium">Время:</span>
                  <span className="font-bold text-white">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/80 font-medium">Стоимость:</span>
                  <span className="font-bold text-green-400 text-lg">{formatPrice(service?.price || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/80 font-medium">Длительность:</span>
                  <span className="font-bold text-white">{service?.duration}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <NeonButton
                variant="salon"
                size="xl"
                className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                onClick={handleCloseConfirmModal}
              >
                Отлично! ✨
              </NeonButton>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
