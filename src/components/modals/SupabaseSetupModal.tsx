import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { testSupabaseConnection, isSupabaseConfigured, getSupabaseConfig, saveRuntimeSupabaseCredentials, clearRuntimeSupabaseCredentials } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, Key, Globe, Shield, Trash2, Check } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseReady, refreshSession } = useAuth();
  const config = getSupabaseConfig();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Runtime connection form state
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.anonKey || '');
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ success: boolean; text: string } | null>(null);

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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCredentials(true);
    setSaveMessage(null);
    try {
      const res = await saveRuntimeSupabaseCredentials(inputUrl, inputKey);
      if (res.success) {
        setSaveMessage({ success: true, text: res.message });
        await refreshSession();
      } else {
        setSaveMessage({ success: false, text: res.message });
      }
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleClearCredentials = () => {
    clearRuntimeSupabaseCredentials();
    setInputUrl('');
    setInputKey('');
    setTestResult(null);
    setSaveMessage({ success: true, text: 'Cleared runtime credentials. Application reverted to safe demo mode.' });
  };

  const handleCopyEnv = () => {
    const envSnippet = `# Supabase Configuration for Nexus AI
VITE_SUPABASE_URL=${inputUrl || 'https://your-project.supabase.co'}
VITE_SUPABASE_ANON_KEY=${inputKey || 'your-supabase-anon-key'}`;

    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  const handleCopySqlMigration = () => {
    // Self-contained schema migration SQL for one-click copy
    const fullSchemaSql = `-- ==============================================================================
-- NEXUS AI — PRODUCTION DATABASE SCHEMA MIGRATION
-- Tables: profiles, workspaces, workspace_members, business_connections,
--         integrations, workflows, workflow_runs, orders, customers, leads,
--         approvals, activity_logs, notifications
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'business_owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  plan TEXT DEFAULT 'Growth' CHECK (plan IN ('Starter', 'Growth', 'Enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

-- 4. BUSINESS CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.business_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'demo_connected' CHECK (status IN ('not_connected', 'demo_connected', 'connected', 'error')),
  account_identifier TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, provider_id)
);

-- 5. INTEGRATIONS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ecommerce', 'logistics', 'communication', 'productivity', 'marketing', 'developer')),
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  supported_triggers JSONB DEFAULT '[]'::jsonb,
  supported_actions JSONB DEFAULT '[]'::jsonb,
  required_permissions JSONB DEFAULT '[]'::jsonb,
  setup_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('webhook', 'schedule', 'manual', 'order_event')),
  source_tool TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKFLOW RUNS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  workflow_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  source_tool TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'waiting_approval', 'retrying')),
  duration_ms INTEGER DEFAULT 0,
  summary TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  idempotency_key TEXT,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 8. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spend_inr NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC(6,2) NOT NULL DEFAULT 1.0,
  order_value_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  pickup_address TEXT NOT NULL,
  pickup_pincode TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_pincode TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('local_express', 'pan_india')),
  delivery_status TEXT NOT NULL DEFAULT 'ready_for_assignment',
  assigned_provider_id TEXT,
  assigned_provider_name TEXT,
  booking_id TEXT,
  tracking_id TEXT,
  tracking_url TEXT,
  charged_amount_inr NUMERIC(10,2) DEFAULT 0.00,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_reason TEXT,
  is_demo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, order_number)
);

-- 10. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  channel TEXT NOT NULL DEFAULT 'instagram' CHECK (channel IN ('instagram', 'whatsapp', 'website', 'referral', 'email')),
  intent_score INTEGER NOT NULL DEFAULT 50 CHECK (intent_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'qualified' CHECK (status IN ('new', 'qualified', 'contacted', 'converted', 'lost')),
  product_interest TEXT,
  message TEXT,
  follow_up_task TEXT,
  follow_up_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. APPROVALS TABLE
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('delivery_booking', 'delivery_cancellation', 'customer_messaging')),
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  cost_inr NUMERIC(10,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload JSONB DEFAULT '{}'::jsonb,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
  read BOOLEAN DEFAULT FALSE,
  action_tab TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_ws_id UUID;
  user_name TEXT;
  safe_slug TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  IF user_name IS NULL OR TRIM(user_name) = '' THEN user_name := 'Business User'; END IF;

  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, 'business_owner')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Profile insert exception: %', SQLERRM; END;

  BEGIN
    safe_slug := LOWER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 4);
    INSERT INTO public.workspaces (owner_id, name, slug, description, plan)
    VALUES (NEW.id, user_name || ' Workspace', safe_slug, 'Primary business operations workspace', 'Growth')
    RETURNING id INTO new_ws_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_ws_id, NEW.id, 'owner') ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Workspace insert exception: %', SQLERRM; END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

    navigator.clipboard.writeText(fullSchemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Supabase Database & Authentication Configuration</span>
        </div>
      }
      description="Connect your Supabase project to activate PostgreSQL persistence, Row Level Security, and live user authentication."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Status card */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isSupabaseReady
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isSupabaseReady ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-white">
                {isSupabaseReady ? 'Supabase Connected & Active' : 'Supabase Not Configured'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {isSupabaseReady
                  ? `Active project: ${config.url} (${config.source === 'storage' ? 'Browser Override' : 'Environment Variable'})`
                  : 'Enter your project credentials below or set them in Vercel environment variables.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {config.source === 'storage' && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleClearCredentials}
                leftIcon={<Trash2 className="w-3 h-3 text-rose-400" />}
              >
                Reset
              </Button>
            )}
            <Button
              variant="secondary"
              size="xs"
              isLoading={testing}
              onClick={handleTestConnection}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Ping Supabase
            </Button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{testResult.message}</span>
            {testResult.latencyMs && (
              <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded">
                {testResult.latencyMs}ms
              </span>
            )}
          </div>
        )}

        {/* Real-time Credential Connector */}
        <form onSubmit={handleSaveCredentials} className="p-4 rounded-xl bg-[#141724] border border-[#23293F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>Connect Project Credentials</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Found in: Supabase Dashboard &gt; Project Settings &gt; API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Project URL"
              placeholder="https://your-project.supabase.co"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              required
            />
            <Input
              label="Anon / Publishable API Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5c... or sb_publishable_..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              required
            />
          </div>

          {saveMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                saveMessage.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {saveMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{saveMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCopyEnv}
              leftIcon={<Copy className="w-3 h-3" />}
            >
              {copiedEnv ? 'Env Snippet Copied!' : 'Copy .env Format'}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="xs"
              isLoading={savingCredentials}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Save & Test Connection
            </Button>
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Run Schema Migration in Supabase SQL Editor</span>
              </span>
              <Button
                variant="gradient"
                size="xs"
                onClick={handleCopySqlMigration}
                leftIcon={<Copy className="w-3 h-3" />}
              >
                {copiedSql ? 'Full SQL Schema Copied!' : 'Copy Full Migration SQL'}
              </Button>
            </div>
            <p className="text-slate-400 text-[11px] pl-7">
              Click the button above to copy the complete schema (13 tables, RLS policies, and safe signup trigger), then open Supabase{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                SQL Editor
              </a>{' '}
              and click <strong>Run</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-1.5">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Configure Vercel Production Environment Variables</span>
            </span>
            <p className="text-slate-400 text-[11px] pl-7 leading-relaxed">
              In your <strong>Vercel Dashboard &gt; Settings &gt; Environment Variables</strong>, add:
            </p>
            <div className="p-2.5 rounded bg-black/50 border border-[#242A40] text-[10px] font-mono text-purple-200 ml-7 space-y-1">
              <div>VITE_SUPABASE_URL=https://&lt;your-project&gt;.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=&lt;your-anon-publishable-key&gt;</div>
            </div>
            <p className="text-slate-400 text-[10px] pl-7">
              Select <strong>Production</strong> and <strong>Preview</strong>, click Save, and trigger a Redeploy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141724] border border-[#23293F] space-y-1.5">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Supabase Auth URL & Email Settings</span>
            </span>
            <p className="text-slate-400 text-[11px] pl-7 leading-relaxed">
              In Supabase Dashboard under <strong>Authentication &gt; URL Configuration</strong>:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-[11px] pl-7 space-y-1">
              <li><strong>Site URL</strong>: <code>https://nexus-ai-self-chi.vercel.app</code></li>
              <li><strong>Redirect URLs</strong>: Add <code>https://nexus-ai-self-chi.vercel.app/**</code> and <code>http://localhost:5173/**</code></li>
              <li><strong>Email Confirmations</strong>: Under Auth &gt; Providers &gt; Email, you can optionally toggle "Confirm email" OFF if you want instant account sign-ins during testing without SMTP.</li>
            </ul>
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
