import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { QuickOrderModal } from './components/modals/QuickOrderModal';
import { QuickConnectModal } from './components/modals/QuickConnectModal';
import { QuickAutomationModal } from './components/modals/QuickAutomationModal';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { OverviewView } from './views/OverviewView';
import { AssistantView } from './views/AssistantView';
import { IntegrationsView } from './views/IntegrationsView';
import { StudioView } from './views/StudioView';
import { OrdersView } from './views/OrdersView';
import { LeadsView } from './views/LeadsView';
import { AnalyticsView } from './views/AnalyticsView';
import { LogsView } from './views/LogsView';
import { ApprovalsView } from './views/ApprovalsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'assistant':
        return <AssistantView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'studio':
        return <StudioView />;
      case 'orders':
        return <OrdersView />;
      case 'leads':
        return <LeadsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'logs':
        return <LogsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#090A0F] text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Workspace Region */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <TopNav />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}

            {/* Subtle Platform Footer */}
            <footer className="pt-8 pb-4 border-t border-[#1F2438]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">NEXUS AI</span>
                <span>•</span>
                <span>One workspace. Every tool. Smarter business.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-mono text-[11px]">v1.0.0-hackathon</span>
                <span>•</span>
                <span className="text-slate-400">Production Ready</span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Modals & Command Palette */}
      <GlobalSearchModal />
      <QuickOrderModal />
      <QuickConnectModal />
      <QuickAutomationModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
