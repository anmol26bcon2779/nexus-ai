import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { testSupabaseConnection, isSupabaseConfigured } from '../../lib/supabase';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, Sparkles, Terminal } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    const sqlNotice = `-- Run this in Supabase SQL Editor:
-- File located at: supabase/migrations/20261024_init_nexus_schema.sql
-- Creates all 13 tables: profiles, workspaces, workspace_members, business_connections,
-- integrations, workflows, workflow_runs, orders, customers, leads, approvals, activity_logs, notifications
-- with Row Level Security (RLS) and auto-signup trigger.`;

    navigator.clipboard.writeText(sqlNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Supabase Database & Backend Setup</span>
        </div>
      }
      description="Connect your Supabase project to activate persistent PostgreSQL tables, Row Level Security, and user authentication."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Status card */}
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
          isSupabaseConfigured()
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-start gap-2.5">
            {isSupabaseConfigured() ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-white">
                {isSupabaseConfigured() ? 'Supabase Credentials Detected' : 'Supabase Not Connected Yet'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {isSupabaseConfigured()
                  ? 'Your environment variables are recognized. Run a live query check below.'
                  : 'Follow the 3 quick steps below to connect your free Supabase project.'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            isLoading={testing}
            onClick={handleTestConnection}
            leftIcon={<RefreshCw className="w-3 h-3" />}
          >
            Test Connection
          </Button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <span>{testResult.message}</span>
            {testResult.latencyMs && (
              <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded">
                {testResult.latencyMs}ms
              </span>
            )}
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Create a Project on Supabase</span>
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>Open Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-[11px] pl-7">
              Log in with GitHub, click <strong>"New Project"</strong>, choose a name (e.g. <code>nexus-ai-db</code>), and select your closest region.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Run Schema Migration in SQL Editor</span>
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={handleCopySql}
                leftIcon={<Copy className="w-3 h-3" />}
              >
                {copied ? 'Migration Info Copied!' : 'Copy Migration Info'}
              </Button>
            </div>
            <p className="text-slate-400 text-[11px] pl-7">
              Go to Supabase <strong>SQL Editor</strong> &gt; paste and execute the schema located in this repo at:
              <code className="text-purple-300 bg-black/40 px-1 py-0.5 rounded ml-1 font-mono text-[10px]">
                supabase/migrations/20261024_init_nexus_schema.sql
              </code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-1.5">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Set Environment Variables</span>
            </span>
            <p className="text-slate-400 text-[11px] pl-7 leading-relaxed">
              Navigate to Supabase <strong>Project Settings &gt; API</strong>. Copy your <strong>Project URL</strong> and <strong>anon public API key</strong>.
            </p>
            <div className="p-2.5 rounded bg-black/50 border border-[#242A40] text-[10px] font-mono text-purple-200 ml-7 space-y-1">
              <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...</div>
            </div>
            <p className="text-slate-500 text-[10px] pl-7">
              Add these variables to your <strong>Vercel Project Settings &gt; Environment Variables</strong> and local <code>.env.local</code>.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
