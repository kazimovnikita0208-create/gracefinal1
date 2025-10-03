'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'floating' | 'minimal';
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({
  href,
  onClick,
  className,
  variant = 'default',
  children
}) => {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();

  const handleClick = () => {
    hapticFeedback.impact('light');
    
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white/90 hover:text-gray-900 shadow-lg hover:shadow-xl',
    floating: 'bg-gradient-to-r from-primary-500/90 to-primary-600/90 backdrop-blur-sm border border-white/20 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl',
    minimal: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/30'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 active:scale-95',
        variants[variant],
        className
      )}
      aria-label="Назад"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      {children && (
        <span className="ml-2 font-medium">
          {children}
        </span>
      )}
    </button>
  );
};

export default BackButton;

