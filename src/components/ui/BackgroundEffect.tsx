'use client';

import React from 'react';
import { SparklesCore } from './sparkles';

const BackgroundEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Градиентный фон для салона красоты */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-accent-50/80" />
      
      {/* Sparkles анимация */}
      <div className="absolute inset-0">
        <SparklesCore
          id="salon-background"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#ec4899"
          speed={0.5}
        />
      </div>
      
      {/* Дополнительные декоративные элементы для салона */}
      <div className="absolute inset-0">
        {/* Розовые блики */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/30 rounded-full blur-xl animate-pulse-gentle" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent-200/20 rounded-full blur-2xl animate-pulse-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary-300/25 rounded-full blur-lg animate-pulse-gentle" style={{ animationDelay: '0.5s' }} />
        
        {/* Дополнительные светящиеся элементы */}
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-accent-300/30 rounded-full blur-md animate-pulse-gentle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-20 h-20 bg-primary-200/25 rounded-full blur-lg animate-pulse-gentle" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Тонкие градиентные полосы для элегантности */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-300/50 to-transparent" />
    </div>
  );
};

export default BackgroundEffect;
