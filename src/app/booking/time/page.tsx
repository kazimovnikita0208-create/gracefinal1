'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { NeonButton } from '@/components/ui/neon-button';
import Modal from '@/components/ui/Modal';
import { useTelegram } from '@/hooks/useTelegram';

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
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'long' }),
        available: true
      });
    }
  }
  
  return dates;
};

const generateAvailableTimes = (date: string) => {
  const times = [];
  const startHour = 9;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push({
        time: timeString,
        available: Math.random() > 0.3, // 70% вероятность доступности
        duration: '30 мин'
      });
    }
  }
  
  return times;
};

export default function TimePage() {
  const { hapticFeedback } = useTelegram();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);

  const availableDates = generateAvailableDates();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setAvailableTimes(generateAvailableTimes(date));
    setShowTimeModal(true);
    hapticFeedback.impact('light');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    hapticFeedback.impact('light');
  };

  const handleCloseTimeModal = () => {
    setShowTimeModal(false);
  };

  const handleConfirmTime = () => {
    if (selectedTime) {
      setShowTimeModal(false);
      hapticFeedback.impact('medium');
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      hapticFeedback.impact('heavy');
      return;
    }
    hapticFeedback.impact('medium');
    // Переходим к выбору мастеров с выбранным временем
    window.location.href = `/booking/masters?date=${selectedDate}&time=${selectedTime}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <Layout 
      title="Выбор времени"
      showBackButton={true}
      backButtonHref="/booking"
    >
      <div className="container mx-auto max-w-sm px-4 py-4 pb-20">
        {/* Выбор даты */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-sm">📅 Выберите дату</h3>
          <div className="grid grid-cols-2 gap-3">
            {availableDates.map((dateInfo) => (
              <button
                key={dateInfo.date}
                onClick={() => handleDateSelect(dateInfo.date)}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  selectedDate === dateInfo.date
                    ? 'border-primary-400 bg-primary-500/20 text-white'
                    : 'border-white/20 bg-white/10 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{dateInfo.dayNumber}</div>
                  <div className="text-sm capitalize">{dateInfo.dayName}</div>
                  <div className="text-xs opacity-70">{dateInfo.month}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Выбранное время */}
        {selectedDate && selectedTime && (
          <div className="mb-6">
            <div className="bg-primary-500/20 border border-primary-400/30 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3 drop-shadow-sm">
                ✅ Выбранное время
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Дата:</span>
                  <span className="font-semibold text-white">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Время:</span>
                  <span className="font-semibold text-white">{selectedTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Информация о салоне */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-white mb-3 drop-shadow-sm">ℹ️ Информация</h4>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center space-x-2">
              <span>🕒</span>
              <span>Рабочие часы: 9:00 - 18:00</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span>Выходной: воскресенье</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⏱️</span>
              <span>Минимальная длительность: 30 минут</span>
            </div>
          </div>
        </div>

        {/* Всплывающая кнопка продолжения */}
        {selectedDate && selectedTime && (
          <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
            <NeonButton
              variant="salon"
              size="xl"
              className="w-full py-4 text-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
              onClick={handleContinue}
            >
              Продолжить к выбору мастера ({selectedTime})
            </NeonButton>
          </div>
        )}

        {/* Модальное окно выбора времени */}
        <Modal
          isOpen={showTimeModal}
          onClose={handleCloseTimeModal}
          title="Выберите время"
        >
          <div className="p-4 text-white">
            <div className="text-sm text-white/80 mb-4 drop-shadow-sm text-center">
              Выбранная дата: <span className="font-semibold text-white">{formatDate(selectedDate)}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableTimes.map((timeInfo, index) => (
                <button
                  key={`${timeInfo.time}-${index}`}
                  onClick={() => timeInfo.available && handleTimeSelect(timeInfo.time)}
                  disabled={!timeInfo.available}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !timeInfo.available
                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      : selectedTime === timeInfo.time
                      ? 'bg-primary-500 text-white shadow-lg'
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
                    onClick={handleConfirmTime}
                  >
                    Подтвердить время
                  </NeonButton>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
