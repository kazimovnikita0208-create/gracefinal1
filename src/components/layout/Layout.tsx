'use client';

import React from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { SparklesCore } from '@/components/ui/sparkles';
import Header from './Header';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonHref?: string;
  backgroundVariant?: 'default' | 'minimal' | 'dark';
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true,
  showHeader = true,
  title,
  showBackButton = false,
  onBackClick,
  backButtonHref,
  backgroundVariant = 'default'
}) => {
  const { isReady, colorScheme } = useTelegram();

  if (!isReady) {
    return (
      <div className="min-h-screen min-h-[100dvh] relative w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Фон как на главной для загрузки */}
        <div className="w-full absolute inset-0 h-full">
          <SparklesCore
            id="loading-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#ec4899"
            speed={0.8}
          />
        </div>
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Варианты фона
  const backgroundVariants = {
    default: 'bg-slate-950', // Как на главной странице
    minimal: 'bg-gradient-to-br from-slate-900 to-slate-950',
    dark: 'bg-slate-900'
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] relative w-full overflow-hidden ${backgroundVariants[backgroundVariant]} ${colorScheme === 'dark' ? 'dark' : ''}`}>
      {/* Полноэкранный анимированный фон со sparkles - такой же как на главной */}
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id={`layout-sparkles-${title || 'page'}`}
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={backgroundVariant === 'minimal' ? 40 : 60}
          className="w-full h-full"
          particleColor="#ec4899"
          speed={0.8}
        />
      </div>
      
      <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col">
        {/* Header */}
        {showHeader && (
          <Header 
            title={title}
            showBackButton={showBackButton}
            onBackClick={onBackClick}
            backButtonHref={backButtonHref}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 px-4 py-6">
          {children}
        </main>
        
        {/* Navigation */}
        {showNavigation && <Navigation />}
      </div>
    </div>
  );
};

export default Layout;


