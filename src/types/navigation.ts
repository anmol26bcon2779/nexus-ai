export type NavigationTab = 
  | 'overview'
  | 'assistant'
  | 'integrations'
  | 'studio'
  | 'orders'
  | 'leads'
  | 'analytics'
  | 'logs'
  | 'approvals'
  | 'settings';

export interface NavItemConfig {
  id: NavigationTab;
  label: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: 'violet' | 'amber' | 'emerald' | 'rose' | 'neutral';
  description?: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  avatarInitials: string;
  activeAutomations: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  actionTab?: NavigationTab;
}
