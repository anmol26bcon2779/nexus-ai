import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Info, Sparkles, ExternalLink } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, setIsDemoMode, setActiveTab } = useApp();

  if (!isDemoMode) {
    return (
      <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold">Live Mode Enabled:</span>
          <span className="text-slate-300">
            Real external API requests will be dispatched to connected services.
          </span>
        </div>
        <button
          onClick={() => setIsDemoMode(true)}
          className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
        >
          Return to Demo Sandbox
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-950/40 via-[#151828]/80 to-blue-950/30 border border-purple-500/20 p-3.5 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Interactive Demo Sandbox
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                SAFE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Metrics, orders, and courier assignments (Shiprocket & Porter) run in simulated mode without charging live accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setActiveTab('integrations')}
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181C2C] hover:bg-[#20253B] border border-[#2B324D] transition-colors flex items-center gap-1.5"
          >
            <span>Config API Keys</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <button
            onClick={() => setIsDemoMode(false)}
            className="text-xs text-purple-400 hover:text-purple-300 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 font-semibold transition-colors"
          >
            Switch to Live
          </button>
        </div>
      </div>
    </div>
  );
};
