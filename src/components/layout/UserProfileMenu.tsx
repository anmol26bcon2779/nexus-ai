import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, ToggleLeft, ToggleRight, Sparkles, LogOut, Database, LogIn, ExternalLink } from 'lucide-react';
import { SupabaseSetupModal } from '../modals/SupabaseSetupModal';

export const UserProfileMenu: React.FC = () => {
  const { isDemoMode, setIsDemoMode, setActiveTab } = useApp();
  const { user, profile, signOut, setIsAuthModalOpen, isSupabaseReady } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Swechha S.';
  const displayEmail = profile?.email || user?.email || 'founder@nexus-ai.biz';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-[#151824] border border-transparent hover:border-[#282F48] transition-all"
          title="Account Profile"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-purple-500/30">
              {initials}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#090A0F] ${
              user ? 'bg-emerald-500' : 'bg-purple-500'
            }`} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">{displayName}</p>
            <p className="text-[10px] text-slate-400">{user ? 'Authenticated' : 'Demo Founder'}</p>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0F111A] border border-[#282F48] shadow-2xl shadow-purple-950/40 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-[#1F2438]">
              <p className="text-xs font-semibold text-slate-200">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-medium">
                    {user ? 'Verified User' : 'Demo Administrator'}
                  </span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isSupabaseReady
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  {isSupabaseReady ? 'SUPABASE LIVE' : 'DEMO MODE'}
                </span>
              </div>
            </div>

            {/* Supabase status shortcut */}
            <div className="px-3 py-2 border-b border-[#1F2438]">
              <button
                onClick={() => {
                  setIsSetupModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-[#141724] hover:bg-[#1C2032] border border-[#252C42] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Database & Backend</p>
                    <p className="text-[10px] text-slate-400">
                      {isSupabaseReady ? 'PostgreSQL Connected' : 'Setup Project & Schema'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-purple-400 font-bold">Inspect →</span>
              </button>
            </div>

            {/* Demo Mode Toggle */}
            <div className="px-3 py-2 border-b border-[#1F2438]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#151824] border border-[#282F48]">
                <div>
                  <p className="text-xs font-medium text-slate-200">Demo Simulation</p>
                  <p className="text-[10px] text-slate-400">Safety guardrails on</p>
                </div>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title={isDemoMode ? 'Demo Mode active' : 'Live Mode active'}
                >
                  {isDemoMode ? (
                    <ToggleRight className="w-6 h-6 text-purple-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="px-1.5 py-1 space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-[#181C2A] hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Workspace Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('assistant');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Ask Nexus Assistant</span>
              </button>
            </div>

            <div className="mt-1 pt-1 border-t border-[#1F2438] px-1.5">
              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-purple-300 hover:bg-purple-500/15 font-semibold transition-colors"
                >
                  <LogIn className="w-4 h-4 text-purple-400" />
                  <span>Sign In or Create Account</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </>
  );
};
