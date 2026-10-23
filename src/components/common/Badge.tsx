import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'violet' | 'blue' | 'amber' | 'rose' | 'neutral' | 'cyan';
  dot?: boolean;
  pulseDot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  dot = false,
  pulseDot = false,
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';

  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    violet: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    blue: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    violet: 'bg-purple-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulseDot && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
};
