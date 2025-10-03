'use client';

import React from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonHref?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBackClick,
  backButtonHref
}) => {
  const { user, backButton } = useTelegram();

  // Управляем Telegram back button если нужно
  React.useEffect(() => {
    if (showBackButton && onBackClick) {
      backButton.onClick(onBackClick);
      backButton.show();
    } else {
      backButton.hide();
    }

    return () => {
      if (onBackClick) {
        backButton.offClick(onBackClick);
      }
    };
  }, [showBackButton, onBackClick, backButton]);

  return (
    <header className="relative z-40">
      {/* Прозрачный header с glassmorphism эффектом */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button + Logo/Title */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <BackButton 
                  variant="minimal"
                  onClick={onBackClick}
                  href={backButtonHref}
                />
              )}
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">G</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white drop-shadow-sm">
                    {title || 'Grace'}
                  </h1>
                  <p className="text-xs text-white/70">Салон красоты</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white drop-shadow-sm">
                    {user.first_name}
                  </p>
                  {user.username && (
                    <p className="text-xs text-white/70">@{user.username}</p>
                  )}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                  <span className="text-white text-sm font-bold">
                    {user.first_name.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


