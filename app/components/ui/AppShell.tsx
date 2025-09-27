'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  variant?: 'glass' | 'compact';
  className?: string;
}

export function AppShell({ children, variant = 'glass', className }: AppShellProps) {
  return (
    <div className={cn(
      'min-h-screen',
      variant === 'glass' && 'bg-gradient-to-br from-bg via-bg to-surface',
      variant === 'compact' && 'bg-bg',
      className
    )}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {children}
      </div>
    </div>
  );
}
