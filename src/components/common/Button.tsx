import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded-lg active:scale-[0.98]';

  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 border border-purple-500/30',
    gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30',
    secondary: 'bg-[#151824] hover:bg-[#1E2335] text-slate-200 border border-[#282F48] hover:border-slate-600 shadow-sm',
    outline: 'bg-transparent hover:bg-white/[0.04] text-slate-300 border border-[#282F48] hover:border-purple-500/50',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:border-rose-500',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
    sm: 'text-xs px-3 py-1.5 gap-2 rounded-md',
    md: 'text-sm px-4 py-2 gap-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl font-semibold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
