'use client';

import React from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBackClick 
}) => {
  const { user, backButton } = useTelegram();

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
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {title || 'Grace'}
              </h1>
              <p className="text-xs text-gray-500">Салон красоты</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name}
                </p>
                {user.username && (
                  <p className="text-xs text-gray-500">@{user.username}</p>
                )}
              </div>
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.first_name.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

