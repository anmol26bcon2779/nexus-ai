import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationTab } from '../../types/navigation';
import {
  Search,
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
  ArrowRight,
  PackagePlus,
  Zap,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Quick Action' | 'Workflows';
  icon: React.ReactNode;
  action: () => void;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveTab,
    setIsQuickOrderModalOpen,
    setIsQuickConnectModalOpen,
    setIsQuickAutomationModalOpen,
  } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  const searchItems: SearchItem[] = [
    {
      id: 'nav-overview',
      title: 'Command Center Overview',
      description: 'Business metrics, orders in progress, recent workflow runs',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-purple-400" />,
      action: () => {
        setActiveTab('overview');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-assistant',
      title: 'AI Business Assistant',
      description: 'Ask Nexus AI to analyze bottlenecks, create workflows, query deliveries',
      category: 'Navigation',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
      action: () => {
        setActiveTab('assistant');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-integrations',
      title: 'Integrations Hub',
      description: 'Manage Shopify, Porter, Shiprocket, Slack, Gmail, WhatsApp',
      category: 'Navigation',
      icon: <Plug className="w-4 h-4 text-blue-400" />,
      action: () => {
        setActiveTab('integrations');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-studio',
      title: 'Automation Studio',
      description: 'Natural language workflow builder, visual steps, triggers & actions',
      category: 'Navigation',
      icon: <Workflow className="w-4 h-4 text-cyan-400" />,
      action: () => {
        setActiveTab('studio');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-orders',
      title: 'Orders & Deliveries Hub',
      description: 'Local express couriers (Porter) and pan-India shipping (Shiprocket)',
      category: 'Navigation',
      icon: <Truck className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab('orders');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-leads',
      title: 'Leads & Customers',
      description: 'Lead records, follow-up automations, message drafts',
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-amber-400" />,
      action: () => {
        setActiveTab('leads');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-analytics',
      title: 'Business Analytics',
      description: 'Fulfillment rates, delivery costs, time saved, success breakdown',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-violet-400" />,
      action: () => {
        setActiveTab('analytics');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-logs',
      title: 'Execution Logs',
      description: 'Complete audit trail of automation steps and provider payloads',
      category: 'Navigation',
      icon: <ScrollText className="w-4 h-4 text-slate-400" />,
      action: () => {
        setActiveTab('logs');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-approvals',
      title: 'Pending Approvals (2)',
      description: 'Review high-value delivery bookings, cancellations & customer messages',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-rose-400" />,
      action: () => {
        setActiveTab('approvals');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'nav-settings',
      title: 'Business Settings & Security',
      description: 'Delivery rules, provider priorities, API keys & audit preferences',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => {
        setActiveTab('settings');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'act-new-order',
      title: 'Create Demo Order',
      description: 'Add a new customer order for instant local/national courier matching',
      category: 'Quick Action',
      icon: <PackagePlus className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setIsSearchOpen(false);
        setIsQuickOrderModalOpen(true);
      },
    },
    {
      id: 'act-connect-tool',
      title: 'Connect Business Tool',
      description: 'Set up Shopify, Porter, Slack or WhatsApp integration',
      category: 'Quick Action',
      icon: <Plug className="w-4 h-4 text-blue-400" />,
      action: () => {
        setIsSearchOpen(false);
        setIsQuickConnectModalOpen(true);
      },
    },
    {
      id: 'act-new-automation',
      title: 'Build Automation from Prompt',
      description: 'Describe what you want to automate in plain English',
      category: 'Quick Action',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => {
        setIsSearchOpen(false);
        setIsQuickAutomationModalOpen(true);
      },
    },
  ];

  const filteredItems = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0F111A] border border-[#282F48] shadow-2xl shadow-purple-950/60 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[#1F2438] gap-3">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, section, or action... (e.g., 'Porter', 'Order', 'AI')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-[#1A1E2F] border border-[#2E3552] rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching actions or navigation items found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-purple-600/15 text-white border border-purple-500/30'
                      : 'text-slate-300 hover:bg-[#151824]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-purple-500/20' : 'bg-[#181C2B]'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C2030] text-slate-400 border border-[#2A314C]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 ml-2 transition-transform ${
                      isSelected ? 'text-purple-400 translate-x-0.5' : 'text-transparent'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#090A0F]/80 border-t border-[#1F2438] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#171A28] rounded border border-[#2B314C] text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#171A28] rounded border border-[#2B314C] text-[10px]">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="text-purple-400 font-medium">NEXUS Command Palette</span>
        </div>
      </div>
    </div>
  );
};
