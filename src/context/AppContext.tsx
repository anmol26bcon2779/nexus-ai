import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NavigationTab, Workspace, AppNotification } from '../types/navigation';
import { mockWorkspaces, mockNotifications, mockDashboardMetrics } from '../data/mockData';
import type { DashboardMetrics } from '../types/dashboard';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  setCurrentWorkspace: (ws: Workspace) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationPanelOpen: boolean;
  setIsNotificationPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  metrics: DashboardMetrics;
  // Quick action modals
  isQuickConnectModalOpen: boolean;
  setIsQuickConnectModalOpen: (open: boolean) => void;
  isQuickOrderModalOpen: boolean;
  setIsQuickOrderModalOpen: (open: boolean) => void;
  isQuickAutomationModalOpen: boolean;
  setIsQuickAutomationModalOpen: (open: boolean) => void;
  openAssistantDrawer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavigationTab>('overview');
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(mockWorkspaces[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [metrics] = useState<DashboardMetrics>(mockDashboardMetrics);

  // Quick modals
  const [isQuickConnectModalOpen, setIsQuickConnectModalOpen] = useState(false);
  const [isQuickOrderModalOpen, setIsQuickOrderModalOpen] = useState(false);
  const [isQuickAutomationModalOpen, setIsQuickAutomationModalOpen] = useState(false);

  // URL Hash Sync for bookmarking and direct navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'overview',
        'assistant',
        'integrations',
        'studio',
        'orders',
        'leads',
        'analytics',
        'logs',
        'approvals',
        'settings',
      ];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
  };

  // Global keyboard shortcuts (Ctrl+K / Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const openAssistantDrawer = () => {
    setActiveTab('assistant');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationPanelOpen,
        setIsNotificationPanelOpen,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        isDemoMode,
        setIsDemoMode,
        metrics,
        isQuickConnectModalOpen,
        setIsQuickConnectModalOpen,
        isQuickOrderModalOpen,
        setIsQuickOrderModalOpen,
        isQuickAutomationModalOpen,
        setIsQuickAutomationModalOpen,
        openAssistantDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
