import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'outline' | 'interactive';
  glowEffect?: 'violet' | 'blue' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  glowEffect = 'none',
  ...props
}) => {
  const base = 'rounded-xl transition-all duration-200 relative overflow-hidden';

  const variants = {
    glass: 'bg-[#0F111A]/80 backdrop-blur-md border border-[#1F2438]',
    elevated: 'bg-[#151824]/90 backdrop-blur-lg border border-[#282F48] shadow-xl',
    outline: 'bg-transparent border border-[#1F2438] hover:border-slate-700',
    interactive: 'bg-[#0F111A]/80 backdrop-blur-md border border-[#1F2438] hover:border-purple-500/40 hover:bg-[#151824]/90 cursor-pointer hover:shadow-glow-violet',
  };

  const glows = {
    none: '',
    violet: 'shadow-glow-violet border-purple-500/30',
    blue: 'shadow-glow-blue border-blue-500/30',
  };

  return (
    <div className={cn(base, variants[variant], glows[glowEffect], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5 border-b border-[#1F2438] flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold text-slate-100 flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);
