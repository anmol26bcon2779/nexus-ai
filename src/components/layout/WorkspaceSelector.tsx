import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Check, Building2, Plus, Settings2, Globe } from 'lucide-react';
import { CreateWorkspaceModal } from '../modals/CreateWorkspaceModal';
import { ManageWorkspaceModal } from '../modals/ManageWorkspaceModal';
import { dbService } from '../../services/db';
import type { WorkspaceRecord } from '../../services/db';

export const WorkspaceSelector: React.FC = () => {
  const { currentWorkspace, setCurrentWorkspace, workspaces, loadWorkspaces } = useApp();
  const [dbWorkspaces, setDbWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageTarget, setManageTarget] = useState<WorkspaceRecord | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRecords = async () => {
    try {
      const records = await dbService.getWorkspaces();
      setDbWorkspaces(records);
    } catch (err) {
      console.warn('Failed to fetch full workspace records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [workspaces]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreated = async (ws: WorkspaceRecord) => {
    await fetchRecords();
    await loadWorkspaces();
    setCurrentWorkspace({
      id: ws.id,
      name: ws.name,
      plan: ws.plan,
      avatarInitials: ws.name.substring(0, 2).toUpperCase(),
      activeAutomations: ws.plan === 'Enterprise' ? 18 : ws.plan === 'Growth' ? 12 : 5,
    });
    setIsOpen(false);
  };

  const handleUpdated = async (ws: WorkspaceRecord) => {
    await fetchRecords();
    await loadWorkspaces();
    if (currentWorkspace.id === ws.id) {
      setCurrentWorkspace({
        ...currentWorkspace,
        name: ws.name,
        plan: ws.plan,
        avatarInitials: ws.name.substring(0, 2).toUpperCase(),
      });
    }
  };

  const handleDeleted = async (deletedId: string) => {
    await fetchRecords();
    await loadWorkspaces();
    if (currentWorkspace.id === deletedId) {
      const remaining = dbWorkspaces.filter((w) => w.id !== deletedId);
      if (remaining.length > 0) {
        const next = remaining[0];
        setCurrentWorkspace({
          id: next.id,
          name: next.name,
          plan: next.plan,
          avatarInitials: next.name.substring(0, 2).toUpperCase(),
          activeAutomations: next.plan === 'Enterprise' ? 18 : 12,
        });
      }
    }
  };

  const avatar = currentWorkspace.name ? currentWorkspace.name.substring(0, 2).toUpperCase() : 'NX';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#151824] hover:bg-[#1C2030] border border-[#282F48] transition-all duration-150 text-left group"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
            {avatar}
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
          <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0F111A] border border-[#282F48] shadow-2xl shadow-purple-950/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Your Workspaces</span>
              <span className="text-[10px] text-purple-400 font-bold">{workspaces.length} active</span>
            </div>
            <div className="space-y-0.5 px-1.5 max-h-64 overflow-y-auto">
              {workspaces.map((ws) => {
                const isSelected = ws.id === currentWorkspace.id;
                const fullRecord = dbWorkspaces.find((w) => w.id === ws.id);

                return (
                  <div
                    key={ws.id}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors group ${
                      isSelected
                        ? 'bg-purple-600/15 text-purple-200 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-[#181C2A] hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 truncate flex-1 text-left"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#23283E] flex items-center justify-center text-purple-300 font-semibold text-xs border border-purple-500/20 shrink-0">
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate">{ws.name}</p>
                        {fullRecord?.website_url ? (
                          <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            <span>{fullRecord.website_url.replace(/^https?:\/\//, '')}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500">{ws.plan} Plan</p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetRecord: WorkspaceRecord = fullRecord || {
                            id: ws.id,
                            name: ws.name,
                            slug: ws.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            plan: ws.plan,
                          };
                          setManageTarget(targetRecord);
                          setIsOpen(false);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title="Workspace Settings"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-[#1F2438] px-1.5">
              <button
                onClick={() => {
                  setIsCreateOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-purple-300 hover:bg-purple-500/10 transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>Create new business workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onWorkspaceCreated={handleCreated}
      />

      {manageTarget && (
        <ManageWorkspaceModal
          isOpen={!!manageTarget}
          onClose={() => setManageTarget(null)}
          workspace={manageTarget}
          onWorkspaceUpdated={handleUpdated}
          onWorkspaceDeleted={handleDeleted}
        />
      )}
    </>
  );
};
