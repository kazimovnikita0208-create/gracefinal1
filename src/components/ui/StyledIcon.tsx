'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StyledIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'primary' | 'salon' | 'accent';
  set?: 'minimal' | 'duotone' | 'circle' | 'gradient';
}

const colorByVariant: Record<NonNullable<StyledIconProps['variant']>, { stroke: string; fill: string; glow: string; }>= {
  default: { stroke: '#EEF2FFCC', fill: '#EEF2FF80', glow: '#94A3B8' },
  primary: { stroke: '#60A5FA', fill: '#3B82F6', glow: '#60A5FA' },
  salon:   { stroke: '#FB7185', fill: '#EC4899', glow: '#FB7185' },
  accent:  { stroke: '#38BDF8', fill: '#06B6D4', glow: '#38BDF8' },
};

const sizePx = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

const StyledIcon: React.FC<StyledIconProps> = ({ 
  name, 
  size = 'md', 
  className, 
  variant = 'default',
  set = 'minimal'
}) => {
  const classSize = sizeClasses[size];
  const { stroke, fill } = colorByVariant[variant];
  const strokeWidth = set === 'minimal' ? 1.5 : 1.8;
  const px = sizePx[size];

  // helpers for wrappers
  const withCircle = (child: JSX.Element) => (
    <svg className={cn(classSize, className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`grad-${name}-${variant}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={fill} stopOpacity="0.1"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#grad-${name}-${variant})`} />
      <g stroke={stroke}>
        {child.props.children}
      </g>
    </svg>
  );

  const withGradientFill = (paths: JSX.Element) => (
    <svg className={cn(classSize, className)} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`lg-${name}-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stroke} />
          <stop offset="100%" stopColor={fill} />
        </linearGradient>
      </defs>
      <g fill={`url(#lg-${name}-${variant})`} stroke="none">
        {paths.props.children}
      </g>
    </svg>
  );

  // ICON DEFINITIONS (paths only)
  const minimal = {
    // Главная страница
    booking: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <circle cx="12" cy="12" r="2" fill={stroke} />
      </g>
    ),
    services: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </g>
    ),
    profile: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </g>
    ),
    contacts: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </g>
    ),
    
    // Страница записи
    master: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </g>
    ),
    service: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h6a2 2 0 012 2v12a4 4 0 01-4 4H9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8l2 2-2 2" />
      </g>
    ),
    time: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </g>
    ),
    
    // UI элементы
    star: (
      <g strokeWidth={strokeWidth}>
        <path fill={fill} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </g>
    ),
    briefcase: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </g>
    ),
    info: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </g>
    ),
    phone: (
      <g strokeWidth={strokeWidth} fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </g>
    ),
    whatsapp: (
      <g>
        <path fill={fill} d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </g>
    ),
    'arrow-right': (
      <g strokeWidth={strokeWidth} fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></g>
    ),
    'arrow-left': (
      <g strokeWidth={strokeWidth} fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></g>
    ),
    check: (
      <g strokeWidth={strokeWidth} fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></g>
    ),
    clock: (
      <g strokeWidth={strokeWidth} fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></g>
    ),
    calendar: (
      <g strokeWidth={strokeWidth} fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></g>
    ),
  } as const;

  // RENDER based on set
  const paths = minimal[name as keyof typeof minimal];
  if (!paths) return null;

  if (set === 'circle') return withCircle(<g>{paths}</g>);
  if (set === 'gradient') return withGradientFill(<g>{paths}</g>);

  // minimal and duotone as inline stroke svg
  return (
    <svg className={cn(classSize, className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={stroke}>
      {paths}
      {set === 'duotone' && (
        <circle cx="12" cy="12" r="11" fill={fill} opacity="0.06" />
      )}
    </svg>
  );
};

export default StyledIcon;
