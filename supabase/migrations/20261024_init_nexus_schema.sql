-- ==============================================================================
-- NEXUS AI — PRODUCTION DATABASE SCHEMA MIGRATION
-- Tables: profiles, workspaces, workspace_members, business_connections,
--         integrations, workflows, workflow_runs, orders, customers, leads,
--         approvals, activity_logs, notifications
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Mirrors auth.users)
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
  delivery_status TEXT NOT NULL DEFAULT 'ready_for_assignment' CHECK (
    delivery_status IN (
      'awaiting_fulfillment',
      'ready_for_assignment',
      'awaiting_approval',
      'booking_in_progress',
      'assigned',
      'picked_up',
      'in_transit',
      'delivered',
      'failed',
      'cancelled'
    )
  ),
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

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE WORKSPACE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_workspace ON public.orders(workspace_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON public.leads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workspace ON public.workflow_runs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_workspace ON public.approvals(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace ON public.activity_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Workspaces Policies
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id));

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- 3. Workspace Members Policies
CREATE POLICY "Members can view other members of their workspace"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins or owners can manage workspace members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_members.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 4. Integrations Catalog Policies (Publicly readable)
CREATE POLICY "All authenticated users can read integrations catalog"
  ON public.integrations FOR SELECT
  TO authenticated
  USING (TRUE);

-- 5. Business Connections Policies
CREATE POLICY "Workspace members can view connections"
  ON public.business_connections FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage connections"
  ON public.business_connections FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 6. Workflows Policies
CREATE POLICY "Workspace members can view workflows"
  ON public.workflows FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage workflows"
  ON public.workflows FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 7. Workflow Runs Policies
CREATE POLICY "Workspace members can view workflow runs"
  ON public.workflow_runs FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create workflow runs"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));

-- 8. Orders Policies
CREATE POLICY "Workspace members can view orders"
  ON public.orders FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage orders"
  ON public.orders FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 9. Customers Policies
CREATE POLICY "Workspace members can view customers"
  ON public.customers FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage customers"
  ON public.customers FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 10. Leads Policies
CREATE POLICY "Workspace members can view leads"
  ON public.leads FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage leads"
  ON public.leads FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 11. Approvals Policies
CREATE POLICY "Workspace members can view approvals"
  ON public.approvals FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can manage approvals"
  ON public.approvals FOR ALL
  USING (public.is_workspace_member(workspace_id));

-- 12. Activity Logs Policies
CREATE POLICY "Workspace members can view activity logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));

-- 13. Notifications Policies
CREATE POLICY "Users can view and manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC SIGNUP TRIGGER: Safe Profile & Default Workspace Generation
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_ws_id UUID;
  user_name TEXT;
  safe_slug TEXT;
BEGIN
  -- Extract user full name or fallback to email prefix
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  IF user_name IS NULL OR TRIM(user_name) = '' THEN
    user_name := 'Business User';
  END IF;

  -- 1. Insert Profile safely (idempotent, won't crash on duplicate)
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, 'business_owner')
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
          updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Profile insert exception for %: %', NEW.id, SQLERRM;
  END;

  -- 2. Create Default Business Workspace (isolated block: failure never aborts signup)
  BEGIN
    safe_slug := LOWER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]+', '-', 'g'));
    IF safe_slug IS NULL OR safe_slug = '' OR safe_slug = '-' THEN
      safe_slug := 'workspace-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    ELSE
      safe_slug := safe_slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 4);
    END IF;

    INSERT INTO public.workspaces (owner_id, name, slug, description, plan)
    VALUES (NEW.id, user_name || ' Workspace', safe_slug, 'Primary business operations workspace', 'Growth')
    RETURNING id INTO new_ws_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_ws_id, NEW.id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Workspace auto-creation skipped for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- SEED DEFAULT INTEGRATIONS CATALOG
-- ==============================================================================
INSERT INTO public.integrations (id, name, category, description, icon_name, is_active)
VALUES
  ('shopify', 'Shopify Store', 'ecommerce', 'Sync online store orders, inventory items, and fulfillment updates.', 'ShoppingBag', true),
  ('woocommerce', 'WooCommerce', 'ecommerce', 'Connect WordPress store products, customer details, and checkout webhooks.', 'Store', true),
  ('porter', 'Porter Local Delivery', 'logistics', 'On-demand 2-wheelers and mini trucks for same-day intra-city delivery in Indian metros.', 'Truck', true),
  ('shiprocket', 'Shiprocket Pan-India', 'logistics', 'Multi-courier logistics aggregator across 28,000+ pin codes with Blue Dart & Delhivery.', 'Package', true),
  ('whatsapp', 'WhatsApp Business Platform', 'communication', 'Customer order confirmations, tracking links, and interactive lead follow-ups.', 'MessageSquare', true),
  ('slack', 'Slack Alerts & Approvals', 'communication', 'Executive channel notifications, pending approval alerts, and daily digests.', 'Bell', true),
  ('sheets', 'Google Sheets DB', 'productivity', 'Append live order rows, update courier tracking numbers, and check inventory thresholds.', 'FileSpreadsheet', true),
  ('gmail', 'Gmail & Workspace', 'productivity', 'Automated supplier emails, invoice parsing, and customer notifications.', 'Mail', true),
  ('instagram', 'Instagram Direct', 'marketing', 'Capture inbound DM leads, score buyer intent with AI, and automate outreach.', 'Instagram', true)
ON CONFLICT (id) DO NOTHING;
