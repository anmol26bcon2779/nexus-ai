import React, { useState } from 'react';
import { mockDashboardAlerts } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import type { DashboardAlert } from '../../types/dashboard';
import {
  AlertTriangle,
  ExternalLink,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import type { NavigationTab } from '../../types/navigation';

export const AlertsBanner: React.FC = () => {
  const { setActiveTab } = useApp();
  const [alerts, setAlerts] = useState<DashboardAlert[]>(mockDashboardAlerts);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Operational Attention Required ({alerts.length})</span>
        </h3>
        <span className="text-[11px] text-slate-500">
          Unblock pending automations
        </span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
              alert.severity === 'high'
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                : alert.severity === 'medium'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0">
                {alert.severity === 'high' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-100">
                    {alert.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-slate-300">
                    {alert.source}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-slate-300/90 text-xs mt-0.5">{alert.detail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setActiveTab(alert.actionTab as NavigationTab)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <span>{alert.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
