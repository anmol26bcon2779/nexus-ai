import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Info, Sparkles, ExternalLink } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const {
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
    setActiveTab,
  } = useApp();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsNotificationPanelOpen(false);
      }
    };
    if (isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationPanelOpen, setIsNotificationPanelOpen]);

  if (!isNotificationPanelOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0F111A] border border-[#282F48] shadow-2xl shadow-purple-950/50 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-4 pb-3 border-b border-[#1F2438] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Notifications
          </h3>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {unreadNotificationsCount} new
            </span>
          )}
        </div>
        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto divide-y divide-[#1F2438]/50">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No notifications right now.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.actionTab) {
                  setActiveTab(item.actionTab);
                  setIsNotificationPanelOpen(false);
                }
              }}
              className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                !item.read ? 'bg-purple-950/15 hover:bg-purple-950/25' : 'hover:bg-[#151824]'
              }`}
            >
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs font-semibold truncate ${!item.read ? 'text-slate-100' : 'text-slate-300'}`}>
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
                {item.actionTab && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-purple-400 font-medium hover:text-purple-300">
                    <span>Jump to view</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0 shadow-sm" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-2 px-3 border-t border-[#1F2438] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Real-time webhook sync</span>
        </span>
        <button
          onClick={() => {
            setActiveTab('logs');
            setIsNotificationPanelOpen(false);
          }}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          View audit logs →
        </button>
      </div>
    </div>
  );
};
