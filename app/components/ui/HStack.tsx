'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HStackProps {
  children: ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

export function HStack({ 
  children, 
  spacing = 'md', 
  align = 'center',
  justify = 'start',
  className 
}: HStackProps) {
  return (
    <div className={cn(
      'flex',
      {
        'gap-1': spacing === 'xs',
        'gap-2': spacing === 'sm',
        'gap-4': spacing === 'md',
        'gap-6': spacing === 'lg',
        'gap-8': spacing === 'xl',
      },
      {
        'items-start': align === 'start',
        'items-center': align === 'center',
        'items-end': align === 'end',
      },
      {
        'justify-start': justify === 'start',
        'justify-center': justify === 'center',
        'justify-end': justify === 'end',
        'justify-between': justify === 'between',
        'justify-around': justify === 'around',
      },
      className
    )}>
      {children}
    </div>
  );
}
