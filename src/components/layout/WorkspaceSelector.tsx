import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Check, Building2, Plus } from 'lucide-react';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#151824] hover:bg-[#1C2030] border border-[#282F48] transition-all duration-150 text-left group"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {currentWorkspace.avatarInitials}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
            <span className="truncate max-w-[130px]">{currentWorkspace.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {currentWorkspace.plan}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 ml-1 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#0F111A] border border-[#282F48] shadow-2xl shadow-purple-950/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
          <div className="space-y-0.5 px-1.5">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  ws.id === currentWorkspace.id
                    ? 'bg-purple-600/15 text-purple-200 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-[#181C2A] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-md bg-[#23283E] flex items-center justify-center text-purple-300 font-semibold text-xs border border-purple-500/20">
                    {ws.avatarInitials}
                  </div>
                  <div className="text-left truncate">
                    <p className="font-medium truncate">{ws.name}</p>
                    <p className="text-[10px] text-slate-400">{ws.activeAutomations} active automations</p>
                  </div>
                </div>
                {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-[#1F2438] px-1.5">
            <button
              onClick={() => {
                alert('Workspace creation is simulated in this environment.');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Create new workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
