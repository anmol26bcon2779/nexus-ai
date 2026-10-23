import React from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationTab, NavItemConfig } from '../../types/navigation';
import {
  LayoutDashboard,
  Bot,
  Plug,
  Workflow,
  Truck,
  Users,
  BarChart3,
  ScrollText,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isDemoMode,
  } = useApp();

  const navItems: NavItemConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      iconName: 'LayoutDashboard',
      description: 'Command Center & Status',
    },
    {
      id: 'assistant',
      label: 'AI Business Assistant',
      iconName: 'Bot',
      badge: 'AI',
      badgeColor: 'violet',
      description: 'Copilot for Operations',
    },
    {
      id: 'integrations',
      label: 'Integrations Hub',
      iconName: 'Plug',
      badge: 8,
      badgeColor: 'emerald',
      description: 'Shopify, Porter, Slack...',
    },
    {
      id: 'studio',
      label: 'Automation Studio',
      iconName: 'Workflow',
      badge: 'PRO',
      badgeColor: 'blue',
      description: 'Workflow Builder & Triggers',
    },
    {
      id: 'orders',
      label: 'Orders & Deliveries',
      iconName: 'Truck',
      badge: 9,
      badgeColor: 'cyan',
      description: 'Local & Pan-India Dispatch',
    },
    {
      id: 'leads',
      label: 'Leads & Customers',
      iconName: 'Users',
      description: 'CRM & Automated Follow-ups',
    },
    {
      id: 'analytics',
      label: 'Business Analytics',
      iconName: 'BarChart3',
      description: 'ROI, Delivery & SLA Metrics',
    },
    {
      id: 'logs',
      label: 'Execution Logs',
      iconName: 'ScrollText',
      description: 'Live Audit & Webhook History',
    },
    {
      id: 'approvals',
      label: 'Approvals',
      iconName: 'CheckSquare',
      badge: 2,
      badgeColor: 'rose',
      description: 'Gatekeeper for High-Risk Actions',
    },
    {
      id: 'settings',
      label: 'Settings',
      iconName: 'Settings',
      description: 'Rules, Keys & Safety Rails',
    },
  ];

  const renderIcon = (name: string, active: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-transform duration-200 ${
      active ? 'text-purple-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
    }`;

    switch (name) {
      case 'LayoutDashboard':
        return <LayoutDashboard className={iconClass} />;
      case 'Bot':
        return <Bot className={iconClass} />;
      case 'Plug':
        return <Plug className={iconClass} />;
      case 'Workflow':
        return <Workflow className={iconClass} />;
      case 'Truck':
        return <Truck className={iconClass} />;
      case 'Users':
        return <Users className={iconClass} />;
      case 'BarChart3':
        return <BarChart3 className={iconClass} />;
      case 'ScrollText':
        return <ScrollText className={iconClass} />;
      case 'CheckSquare':
        return <CheckSquare className={iconClass} />;
      case 'Settings':
        return <Settings className={iconClass} />;
      default:
        return <LayoutDashboard className={iconClass} />;
    }
  };

  return (
    <aside
      className={`relative h-screen flex flex-col bg-[#0D0E15] border-r border-[#1F2438] transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1F2438] justify-between">
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          {/* Logo Icon */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-[1px] shrink-0 shadow-lg shadow-purple-600/30 group-hover:shadow-purple-500/50 transition-all duration-300">
            <div className="w-full h-full bg-[#0A0B10] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-200 fill-purple-400/20" />
            </div>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  NEXUS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                Business Automater
              </span>
            </div>
          )}
        </div>

        {/* Collapse button on desktop */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1E2F] border border-transparent hover:border-[#282F48] transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {!isSidebarCollapsed && (
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Core Workspace
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group relative flex items-center rounded-xl transition-all duration-150 ${
                isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'
              } ${
                isActive
                  ? 'bg-purple-600/15 text-white font-semibold border border-purple-500/35 shadow-sm shadow-purple-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151824] border border-transparent'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {/* Active vertical pill indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-r-full" />
              )}

              {renderIcon(item.iconName, isActive)}

              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate text-xs font-medium text-left">
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <Badge
                      variant={item.badgeColor || 'neutral'}
                      size="sm"
                      className="ml-2 font-bold px-1.5 py-0.2"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tagline & Demo Guardrail Footer */}
      <div className="p-3 border-t border-[#1F2438] bg-[#0A0B10]/60 space-y-2">
        {!isSidebarCollapsed ? (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-[#141724] border border-[#23293F]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold text-slate-200">
                  One workspace. Every tool.
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Connects tools, automates workflows & coordinates local/national deliveries.
              </p>
            </div>

            {isDemoMode && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-300">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold">Demo Sandbox Active</span>
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 font-mono">
                  SAFE
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="w-3 h-3 rounded-full bg-emerald-500 shadow-glow-subtle"
              title="Nexus Core Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
