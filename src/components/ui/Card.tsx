'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CardProps } from '@/types';

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Content: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
}

const Card: CardComponent = ({ children, className, onClick }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100',
        onClick && 'cursor-pointer hover:scale-105 transform transition-transform duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('p-6 pb-3', className)}>
      {children}
    </div>
  );
};

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
};

// Назначаем составные компоненты
(Card as CardComponent).Header = CardHeader;
(Card as CardComponent).Content = CardContent;
(Card as CardComponent).Footer = CardFooter;

export default Card;
