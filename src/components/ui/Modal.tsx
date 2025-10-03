'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ModalProps } from '@/types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up border border-white/20 backdrop-blur-xl">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white drop-shadow-sm">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn(title ? 'p-6' : 'p-6')}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;


