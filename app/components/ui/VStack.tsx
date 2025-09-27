'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VStackProps {
  children: ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function VStack({ children, spacing = 'md', className }: VStackProps) {
  return (
    <div className={cn(
      'flex flex-col',
      {
        'gap-1': spacing === 'xs',
        'gap-2': spacing === 'sm',
        'gap-4': spacing === 'md',
        'gap-6': spacing === 'lg',
        'gap-8': spacing === 'xl',
      },
      className
    )}>
      {children}
    </div>
  );
}
