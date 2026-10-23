import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceSelector } from './WorkspaceSelector';
import { UserProfileMenu } from './UserProfileMenu';
import { NotificationPanel } from './NotificationPanel';
import { SupabaseSetupModal } from '../modals/SupabaseSetupModal';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Command,
  ShieldCheck,
  Plus,
  Database,
} from 'lucide-react';
import { Button } from '../common/Button';

export const TopNav: React.FC = () => {
  const {
    activeTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsSearchOpen,
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    unreadNotificationsCount,
    isDemoMode,
    openAssistantDrawer,
    setIsQuickOrderModalOpen,
  } = useApp();

  const { isSupabaseReady } = useAuth();
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Overview', sub: 'Business Command Center & Live Operations' };
      case 'assistant':
        return { title: 'AI Business Assistant', sub: 'Operational Copilot & Intelligence Engine' };
      case 'integrations':
        return { title: 'Integrations Hub', sub: 'E-commerce, Delivery, Communication & Marketing' };
      case 'studio':
        return { title: 'Automation Studio', sub: 'Natural Language Workflow Builder & Triggers' };
      case 'orders':
        return { title: 'Orders & Deliveries', sub: 'Smart Dispatch for Local Express & Pan-India Freight' };
      case 'leads':
        return { title: 'Leads & Customers', sub: 'Lead Scoring, CRM Records & Auto Follow-up Tasks' };
      case 'analytics':
        return { title: 'Business Analytics', sub: 'Real-time Metrics, Courier SLA & Time Saved' };
      case 'logs':
        return { title: 'Execution Logs', sub: 'Full Audit Trail, Step Payloads & Error Handling' };
      case 'approvals':
        return { title: 'Approvals Gate', sub: 'High-Value Orders, Courier Bookings & Sensitive Ops' };
      case 'settings':
        return { title: 'Settings & Security', sub: 'Delivery Rules, Provider Credentials & Audit Controls' };
      default:
        return { title: 'Overview', sub: 'Command Center' };
    }
  };

  const { title, sub } = getTabTitle();

  return (
    <>
      <header className="h-16 bg-[#090A0F]/85 backdrop-blur-md border-b border-[#1F2438] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Mobile Toggle & Page Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151824] border border-[#282F48] md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Nexus
              </span>
              <span className="text-slate-600">/</span>
              <h1 className="text-sm font-bold text-slate-100">{title}</h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">{sub}</p>
          </div>
        </div>

        {/* Middle/Center: Supabase Connection & Demo Guardrail Notice */}
        <div className="hidden xl:flex items-center gap-3">
          <button
            onClick={() => setIsSetupOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isSupabaseReady
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
            title="Supabase Database Connection Status"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="font-semibold">Supabase:</span>
            <span>{isSupabaseReady ? 'PostgreSQL Live' : 'Connect Database'}</span>
          </button>

          {isDemoMode && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-medium">Sandbox Guardrails Active</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Command Bar Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12141E] hover:bg-[#181C2B] border border-[#252C42] hover:border-purple-500/40 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-sm"
            title="Command Palette (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Search & Actions...</span>
            <div className="hidden sm:flex items-center gap-0.5 ml-1 text-[10px] bg-[#1C2030] px-1.5 py-0.2 rounded border border-[#2A314C] text-slate-400 font-mono">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Ask AI Pill Button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={openAssistantDrawer}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex text-xs shadow-glow-violet"
          >
            Ask AI
          </Button>

          {/* Quick Order trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsQuickOrderModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
            className="hidden md:inline-flex text-xs"
          >
            Add Order
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              className="p-2 rounded-lg bg-[#12141E] hover:bg-[#181C2B] border border-[#252C42] text-slate-300 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#090A0F]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <NotificationPanel />
          </div>

          <div className="h-6 w-[1px] bg-[#1F2438] hidden sm:block" />

          {/* Workspace Selector */}
          <WorkspaceSelector />

          {/* User Profile */}
          <UserProfileMenu />
        </div>
      </header>

      <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </>
  );
};
