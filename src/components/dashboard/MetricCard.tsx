import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  badge?: string;
  badgeVariant?: 'violet' | 'emerald' | 'amber' | 'rose' | 'blue' | 'cyan';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBgColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  badge,
  badgeVariant = 'neutral',
  onClick,
}) => {
  return (
    <Card
      variant={onClick ? 'interactive' : 'glass'}
      onClick={onClick}
      className={cn('p-4 sm:p-5 flex flex-col justify-between group')}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold tracking-tight text-white group-hover:text-purple-200 transition-colors">
              {value}
            </h4>
            {badge && (
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  badgeVariant === 'emerald' && 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
                  badgeVariant === 'amber' && 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
                  badgeVariant === 'rose' && 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
                  badgeVariant === 'violet' && 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
                  badgeVariant === 'blue' && 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
                  badgeVariant === 'cyan' && 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                )}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={cn('p-2.5 rounded-xl transition-all duration-200 group-hover:scale-105', iconBgColor)}>
          {icon}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-[#1F2438]/60 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">{subtext}</span>
          {trend && (
            <span
              className={cn(
                'font-semibold text-xs ml-2 shrink-0',
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
