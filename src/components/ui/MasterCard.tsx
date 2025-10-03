'use client';

import React from 'react';
import { Master } from '@/types';
import StyledIcon from '@/components/ui/StyledIcon';

interface MasterCardProps {
  master: Master;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MasterCard({ master, isSelected, onClick, className = '' }: MasterCardProps) {
  return (
    <div 
      className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-primary-400 bg-primary-500/20' 
          : 'border-gray-600/30 hover:border-gray-500/50'
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Аватар мастера */}
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
          {master.name.split(' ').map(n => n[0]).join('')}
        </div>
        
        {/* Информация о мастере */}
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg drop-shadow-sm">
            {master.name}
          </h3>
          <p className="text-white/70 text-sm mb-2">
            {master.specialization}
          </p>
          <div className="flex items-center space-x-4 text-sm text-white/80">
            <div className="flex items-center space-x-1">
              <StyledIcon name="star" size="sm" variant="accent" />
              <span>4.9</span>
            </div>
            <div className="flex items-center space-x-1">
              <StyledIcon name="briefcase" size="sm" variant="default" />
              <span>5 лет</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
