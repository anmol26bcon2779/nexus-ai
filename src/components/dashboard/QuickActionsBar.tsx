import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plug,
  Zap,
  PackagePlus,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const QuickActionsBar: React.FC = () => {
  const {
    setActiveTab,
    setIsQuickConnectModalOpen,
    setIsQuickOrderModalOpen,
    setIsQuickAutomationModalOpen,
    openAssistantDrawer,
  } = useApp();

  const actions = [
    {
      id: 'connect-tool',
      title: 'Connect a Tool',
      desc: 'Integrate Shopify, Porter, Slack or WhatsApp',
      icon: <Plug className="w-4 h-4 text-blue-400" />,
      borderGlow: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
      action: () => setIsQuickConnectModalOpen(true),
    },
    {
      id: 'create-automation',
      title: 'Create Automation',
      desc: 'Describe workflow rules in natural language',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      borderGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
      action: () => setIsQuickAutomationModalOpen(true),
    },
    {
      id: 'add-order',
      title: 'Add an Order',
      desc: 'Queue order for auto local/national routing',
      icon: <PackagePlus className="w-4 h-4 text-emerald-400" />,
      borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      action: () => setIsQuickOrderModalOpen(true),
    },
    {
      id: 'assign-delivery',
      title: 'Assign a Delivery',
      desc: 'Compare Porter vs Shiprocket rates & ETA',
      icon: <Truck className="w-4 h-4 text-cyan-400" />,
      borderGlow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
      action: () => setActiveTab('orders'),
    },
    {
      id: 'ask-assistant',
      title: 'Ask AI Assistant',
      desc: 'Query bottlenecks, draft messages, get recommendations',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      borderGlow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      action: openAssistantDrawer,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Operations Quick Actions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
        </h3>
        <span className="text-[11px] text-slate-500">Instant workflow triggers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={act.action}
            className={`p-3.5 rounded-xl bg-[#0F111A]/90 backdrop-blur-md border border-[#1F2438] text-left transition-all duration-200 group hover:bg-[#151824] ${act.borderGlow} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#181C2B] border border-[#252C42] group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                {act.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                {act.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
