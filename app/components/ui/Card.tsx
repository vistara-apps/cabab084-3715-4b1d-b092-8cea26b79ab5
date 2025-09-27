'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = 'default', className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'glass-card',
        variant === 'elevated' && 'shadow-lg hover:shadow-xl',
        onClick && 'cursor-pointer hover:bg-surface/90',
        'transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
