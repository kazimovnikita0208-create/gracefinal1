'use client';

import React from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import BackgroundEffect from '@/components/ui/BackgroundEffect';
import Header from './Header';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true, 
  title 
}) => {
  const { isReady, colorScheme } = useTelegram();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colorScheme === 'dark' ? 'dark' : ''}`}>
      <BackgroundEffect />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <Header title={title} />
        
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
