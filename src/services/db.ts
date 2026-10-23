import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  description?: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  owner_id?: string;
  created_at?: string;
}

export interface OrderRecord {
  id: string;
  workspace_id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  weightKg: number;
  orderValueInr: number;
  pickupAddress: string;
  pickupPincode: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryType: 'local_express' | 'pan_india';
  deliveryStatus: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  bookingId?: string;
  trackingId?: string;
  trackingUrl?: string;
  chargedAmountInr?: number;
  requiresApproval?: boolean;
  approvalReason?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  workspace_id?: string;
  name: string;
  phone: string;
  email?: string;
  channel: string;
  intentScore: number;
  status: string;
  productInterest?: string;
  message?: string;
  followUpTask?: string;
  followUpDraft?: string;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  workspace_id?: string;
  orderId?: string;
  workflowId?: string;
  type: string;
  title: string;
  reason: string;
  costInr?: number;
  status: 'pending' | 'approved' | 'rejected';
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface WorkflowRecord {
  id: string;
  workspace_id?: string;
  name: string;
  description: string;
  triggerType: string;
  sourceTool: string;
  isActive: boolean;
  steps: any[];
  totalExecutions: number;
  successfulExecutions: number;
  createdAt: string;
}

// -------------------------------------------------------------
// DEFAULT SEED DATA FOR DEMO / SANDBOX MODE
// -------------------------------------------------------------
const DEFAULT_WORKSPACES: WorkspaceRecord[] = [
  { id: 'ws-1', name: 'Nexus Corp Global', slug: 'nexus-corp', plan: 'Enterprise', website_url: 'https://nexus-corp.com', description: 'Enterprise operations command center' },
  { id: 'ws-2', name: 'Apex D2C Logistics', slug: 'apex-d2c', plan: 'Growth', website_url: 'https://apexd2c.in', description: 'D2C Brand Fulfillment Hub' },
  { id: 'ws-3', name: 'Urban Essentials Store', slug: 'urban-essentials', plan: 'Starter', website_url: 'https://urbanessentials.shop', description: 'Retail e-commerce storefront' },
];

const DEFAULT_ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    orderNumber: 'NX-8941',
    customerName: 'Priya Iyer',
    customerPhone: '+91 98200 11223',
    productName: 'Ergonomic Mesh Chair (Black)',
    quantity: 1,
    weightKg: 14.2,
    orderValueInr: 8500,
    pickupAddress: 'Nexus Central Warehouse, Whitefield',
    pickupPincode: '560066',
    deliveryAddress: 'Flat 402, Sea Green Apts, Bandra West, Mumbai',
    deliveryPincode: '400050',
    deliveryType: 'pan_india',
    deliveryStatus: 'ready_for_assignment',
    isDemo: true,
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-102',
    orderNumber: 'NX-8942',
    customerName: 'Vikram Mehta',
    customerPhone: '+91 97112 34567',
    productName: 'Single Origin Espresso Beans (1kg)',
    quantity: 2,
    weightKg: 2.1,
    orderValueInr: 1650,
    pickupAddress: 'Nexus Micro Hub, Indiranagar',
    pickupPincode: '560038',
    deliveryAddress: '24 Richmond Road, Bengaluru',
    deliveryPincode: '560025',
    deliveryType: 'local_express',
    deliveryStatus: 'awaiting_approval',
    requiresApproval: true,
    approvalReason: 'Express 2-Hour Porter courier estimate ₹480 exceeds threshold policy ₹400',
    isDemo: true,
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-103',
    orderNumber: 'NX-8943',
    customerName: 'Sneha Rao',
    customerPhone: '+91 98450 99887',
    productName: 'Wireless Noise-Canceling Headphones',
    quantity: 1,
    weightKg: 0.6,
    orderValueInr: 14999,
    pickupAddress: 'Nexus Hub Indiranagar',
    pickupPincode: '560038',
    deliveryAddress: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
    deliveryPincode: '560066',
    deliveryType: 'local_express',
    deliveryStatus: 'in_transit',
    assignedProviderId: 'porter',
    assignedProviderName: 'Porter 2-Wheeler Express',
    bookingId: 'CR-PTR-99410',
    trackingId: 'PTR-EXP-89420',
    trackingUrl: 'https://track.porter.in/PTR-EXP-89420',
    chargedAmountInr: 185,
    isDemo: true,
    createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-104',
    orderNumber: 'NX-8944',
    customerName: 'Rohan Desai',
    customerPhone: '+91 99220 54321',
    productName: 'Mechanical Gaming Keyboard (RGB)',
    quantity: 1,
    weightKg: 1.4,
    orderValueInr: 4200,
    pickupAddress: 'Nexus Central Warehouse',
    pickupPincode: '560066',
    deliveryAddress: '102 Model Colony, Shivajinagar, Pune',
    deliveryPincode: '411016',
    deliveryType: 'pan_india',
    deliveryStatus: 'delivered',
    assignedProviderId: 'shiprocket',
    assignedProviderName: 'Shiprocket Air Express (Bluedart)',
    bookingId: 'SR-BK-77124',
    trackingId: 'SR-AIR-99214',
    trackingUrl: 'https://shiprocket.co/tracking/SR-AIR-99214',
    chargedAmountInr: 210,
    isDemo: true,
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_LEADS: LeadRecord[] = [
  {
    id: 'lead-1',
    name: 'Deepak Singhania',
    phone: '+91 99880 12345',
    email: 'deepak.singhania@corpmail.com',
    channel: 'instagram',
    intentScore: 92,
    status: 'qualified',
    productInterest: 'Dual Motor Standing Desk (Walnut)',
    message: 'Hi, what is the best corporate discount for 12 standing desks? Can you deliver to Koramangala this week?',
    followUpTask: 'Schedule 15-min enterprise bulk quote call and share spec sheet',
    followUpDraft: 'Hi Deepak! Thanks for reaching out to Nexus. For 12 Dual Motor Standing Desks, you qualify for our 18% Tier-1 B2B discount with next-day White-Glove delivery to Koramangala. Would 2:30 PM today suit you for a quick 5-min alignment?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    email: 'ananya.sharma@designcraft.in',
    channel: 'whatsapp',
    intentScore: 78,
    status: 'qualified',
    productInterest: 'Ergonomic Mesh Chair (Grey Edition)',
    message: 'Hello, looking for comfortable desk chairs for our studio team. Do you provide GST invoice?',
    followUpTask: 'Send GST quotation and ergonomics guide via WhatsApp',
    followUpDraft: 'Hello Ananya! Yes, all Nexus business orders include 18% GST Input Tax Credit compliant invoices. What quantity are you looking to equip for your studio team?',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Rahul Verma',
    phone: '+91 91234 56789',
    channel: 'website',
    intentScore: 54,
    status: 'contacted',
    productInterest: 'Desk Mat & Cable Management Kit',
    message: 'Do you deliver to tier-2 cities like Nashik and what is the return policy?',
    followUpTask: 'Automated email sequence sent with 7-day return policy overview',
    createdAt: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_APPROVALS: ApprovalRecord[] = [
  {
    id: 'app-101',
    orderId: 'ord-102',
    type: 'delivery_booking',
    title: 'High-Cost Porter Express Delivery Review',
    reason: 'Porter Express quote ₹480 exceeds automated threshold ₹400 for Order NX-8942.',
    costInr: 480,
    status: 'pending',
    payload: {
      orderNumber: 'NX-8942',
      customerName: 'Vikram Mehta',
      provider: 'Porter',
      estimatedDistanceKm: 14.8,
      packageWeightKg: 2.1,
    },
    createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-102',
    type: 'customer_messaging',
    title: 'Automated Bulk Delivery WhatsApp Update',
    reason: 'Workflow scheduled to broadcast tracking SMS/WhatsApp to 48 delayed shipments.',
    status: 'pending',
    payload: {
      recipientCount: 48,
      channel: 'WhatsApp Business API',
      templateName: 'dispatch_status_update_v2',
    },
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_WORKFLOWS: WorkflowRecord[] = [
  {
    id: 'wf-1',
    name: 'Smart Delivery Routing & Courier Booking',
    description: 'Auto-detects distance and weight: routes local intra-city orders to Porter and pan-India packages to Shiprocket Air.',
    triggerType: 'order_event',
    sourceTool: 'Shopify',
    isActive: true,
    steps: [
      { id: 's1', title: 'Order Ready Trigger', type: 'trigger', provider: 'Shopify', actionName: 'Order Packed' },
      { id: 's2', title: 'Location Classifier', type: 'condition', provider: 'Nexus Engine', actionName: 'Same City Check' },
      { id: 's3', title: 'Dispatch Courier', type: 'action', provider: 'Porter / Shiprocket', actionName: 'Generate AWB' },
      { id: 's4', title: 'Customer Tracking SMS', type: 'action', provider: 'WhatsApp Business', actionName: 'Send Template' },
    ],
    totalExecutions: 482,
    successfulExecutions: 479,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'wf-2',
    name: 'Inbound Lead Qualification & Auto-Draft',
    description: 'Listens to Instagram DMs and WhatsApp inquiries, calculates purchase intent score, and prepares reply for agent review.',
    triggerType: 'webhook',
    sourceTool: 'Instagram',
    isActive: true,
    steps: [
      { id: 'w2-1', title: 'Inbound Message', type: 'trigger', provider: 'Instagram', actionName: 'New DM Received' },
      { id: 'w2-2', title: 'AI Intent Analyzer', type: 'ai_process', provider: 'Nexus Intelligence', actionName: 'Score 1-100' },
      { id: 'w2-3', title: 'Draft WhatsApp Reply', type: 'transformation', provider: 'Nexus AI', actionName: 'Generate Personalized Text' },
      { id: 'w2-4', title: 'Slack Sales Alert', type: 'action', provider: 'Slack', actionName: 'Post to #hot-leads' },
    ],
    totalExecutions: 294,
    successfulExecutions: 291,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'wf-3',
    name: 'High-Value Order Protection Gate',
    description: 'Holds orders above ₹5,000 for team authorization prior to triggering non-refundable logistics pickup.',
    triggerType: 'order_event',
    sourceTool: 'WooCommerce',
    isActive: true,
    steps: [
      { id: 'w3-1', title: 'New High Value Order', type: 'trigger', provider: 'WooCommerce', actionName: 'Order Created' },
      { id: 'w3-2', title: 'Threshold Condition (> ₹5k)', type: 'condition', provider: 'Nexus Engine', actionName: 'Value Check' },
      { id: 'w3-3', title: 'Approval Gate', type: 'approval_gate', provider: 'Nexus Approvals', actionName: 'Require Admin Approval' },
      { id: 'w3-4', title: 'Fulfillment Dispatch', type: 'action', provider: 'Shiprocket', actionName: 'Generate Label' },
    ],
    totalExecutions: 118,
    successfulExecutions: 117,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// In-memory memory fallback if localStorage is unavailable (Node.js test runners / SSR)
const memoryCache: Record<string, any> = {};

// Helper to get/set local storage safely
function getStorage<T>(key: string, defaultVal: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } else if (memoryCache[key]) {
      return memoryCache[key];
    }
  } catch {}
  return defaultVal;
}

function setStorage<T>(key: string, val: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    } else {
      memoryCache[key] = val;
    }
  } catch {}
}

export const dbService = {
  // ----------------------------------------------------
  // WORKSPACES
  // ----------------------------------------------------
  async getWorkspaces(): Promise<WorkspaceRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: true });

        if (data && !error && data.length > 0) {
          // Sync with local cache for offline/instant hydration
          setStorage('nexus_workspaces', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getWorkspaces fallback:', err);
      }
    }
    const ws = getStorage('nexus_workspaces', DEFAULT_WORKSPACES);
    setStorage('nexus_workspaces', ws);
    return ws;
  },

  async createWorkspace(params: {
    name: string;
    website_url?: string;
    description?: string;
    plan?: 'Starter' | 'Growth' | 'Enterprise';
    userId?: string;
  }): Promise<WorkspaceRecord> {
    const cleanName = params.name.trim();
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Workspace name must be at least 2 characters long.');
    }

    const baseSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newWs: WorkspaceRecord = {
      id: `ws-${Date.now()}`,
      name: cleanName,
      slug,
      website_url: params.website_url?.trim() || '',
      description: params.description?.trim() || 'Business operations workspace',
      plan: params.plan || 'Growth',
      created_at: new Date().toISOString(),
    };

    // If Supabase is configured, resolve user and persist to PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        let activeUserId = params.userId;
        if (!activeUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          activeUserId = user?.id;
        }

        if (activeUserId) {
          const { data, error } = await supabase
            .from('workspaces')
            .insert({
              owner_id: activeUserId,
              name: cleanName,
              slug,
              website_url: newWs.website_url,
              description: newWs.description,
              plan: newWs.plan,
            })
            .select()
            .single();

          if (data && !error) {
            // Add owner membership record
            try {
              await supabase.from('workspace_members').insert({
                workspace_id: data.id,
                user_id: activeUserId,
                role: 'owner',
              });
            } catch (memberErr) {
              console.warn('workspace_members insert warning:', memberErr);
            }

            const current = getStorage<WorkspaceRecord[]>('nexus_workspaces', []);
            const updated = [...current.filter((w) => w.id !== data.id), data];
            setStorage('nexus_workspaces', updated);
            return data;
          } else if (error) {
            console.warn('Supabase createWorkspace error, using local persistence:', error);
          }
        }
      } catch (err) {
        console.warn('Supabase createWorkspace exception, using local persistence:', err);
      }
    }

    // Local / Demo persistence fallback
    const current = await this.getWorkspaces();
    const updated = [...current, newWs];
    setStorage('nexus_workspaces', updated);
    return newWs;
  },

  async updateWorkspace(id: string, updates: Partial<WorkspaceRecord>): Promise<WorkspaceRecord | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (data && !error) {
          const current = getStorage<WorkspaceRecord[]>('nexus_workspaces', DEFAULT_WORKSPACES);
          const cached = current.map((w) => (w.id === id ? { ...w, ...data } : w));
          setStorage('nexus_workspaces', cached);
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateWorkspace fallback:', err);
      }
    }

    const current = await this.getWorkspaces();
    const updated = current.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setStorage('nexus_workspaces', updated);
    return updated.find((w) => w.id === id) || null;
  },

  async deleteWorkspace(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('workspaces').delete().eq('id', id);
        if (!error) {
          const current = getStorage<WorkspaceRecord[]>('nexus_workspaces', DEFAULT_WORKSPACES);
          const updated = current.filter((w) => w.id !== id);
          setStorage('nexus_workspaces', updated);
          return true;
        }
      } catch (err) {
        console.warn('Supabase deleteWorkspace fallback:', err);
      }
    }

    const current = await this.getWorkspaces();
    const updated = current.filter((w) => w.id !== id);
    setStorage('nexus_workspaces', updated);
    return true;
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  async getOrders(params?: { status?: string; search?: string }): Promise<OrderRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (params?.status && params.status !== 'all') {
          query = query.eq('delivery_status', params.status);
        }
        const { data, error } = await query;
        if (data && !error && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            orderNumber: d.order_number,
            customerName: d.customer_name,
            customerPhone: d.customer_phone || '',
            productName: d.product_name,
            quantity: d.quantity,
            weightKg: Number(d.weight_kg),
            orderValueInr: Number(d.order_value_inr),
            pickupAddress: d.pickup_address,
            pickupPincode: d.pickup_pincode,
            deliveryAddress: d.delivery_address,
            deliveryPincode: d.delivery_pincode,
            deliveryType: d.delivery_type,
            deliveryStatus: d.delivery_status,
            assignedProviderId: d.assigned_provider_id,
            assignedProviderName: d.assigned_provider_name,
            bookingId: d.booking_id,
            trackingId: d.tracking_id,
            trackingUrl: d.tracking_url,
            chargedAmountInr: d.charged_amount_inr,
            requiresApproval: d.requires_approval,
            approvalReason: d.approval_reason,
            isDemo: d.is_demo,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getOrders fallback:', err);
      }
    }

    let orders = getStorage<OrderRecord[]>('nexus_orders', DEFAULT_ORDERS);
    if (!orders || orders.length === 0) {
      orders = DEFAULT_ORDERS;
      setStorage('nexus_orders', orders);
    }

    if (params?.status && params.status !== 'all') {
      orders = orders.filter((o) => o.deliveryStatus === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q)
      );
    }
    return orders;
  },

  async createOrder(payload: {
    customerName: string;
    customerPhone?: string;
    productName: string;
    quantity: number;
    weightKg: number;
    orderValueInr: number;
    pickupAddress?: string;
    pickupPincode?: string;
    deliveryAddress: string;
    deliveryPincode: string;
    deliveryType?: 'local_express' | 'pan_india';
  }): Promise<OrderRecord> {
    const pickupPincode = payload.pickupPincode || '560066';
    const isSameCity = pickupPincode.slice(0, 3) === payload.deliveryPincode.slice(0, 3);
    const deliveryType = payload.deliveryType || (isSameCity ? 'local_express' : 'pan_india');
    const orderNumber = `NX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone || '+91 98000 00000',
      productName: payload.productName,
      quantity: Number(payload.quantity) || 1,
      weightKg: Number(payload.weightKg) || 1.0,
      orderValueInr: Number(payload.orderValueInr) || 0,
      pickupAddress: payload.pickupAddress || 'Nexus Central Logistics Center, Whitefield',
      pickupPincode,
      deliveryAddress: payload.deliveryAddress,
      deliveryPincode: payload.deliveryPincode,
      deliveryType,
      deliveryStatus: 'ready_for_assignment',
      isDemo: true,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            order_number: newOrder.orderNumber,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            product_name: newOrder.productName,
            quantity: newOrder.quantity,
            weight_kg: newOrder.weightKg,
            order_value_inr: newOrder.orderValueInr,
            pickup_address: newOrder.pickupAddress,
            pickup_pincode: newOrder.pickupPincode,
            delivery_address: newOrder.deliveryAddress,
            delivery_pincode: newOrder.deliveryPincode,
            delivery_type: newOrder.deliveryType,
            delivery_status: newOrder.deliveryStatus,
            is_demo: true,
          })
          .select()
          .single();

        if (data && !error) {
          return {
            ...newOrder,
            id: data.id,
          };
        }
      } catch (err) {
        console.warn('Supabase createOrder fallback:', err);
      }
    }

    const current = await this.getOrders();
    const updated = [newOrder, ...current];
    setStorage('nexus_orders', updated);
    return newOrder;
  },

  async bookDelivery(orderId: string, providerId: string, serviceName: string): Promise<OrderRecord | null> {
    const bookingId = `BK-${providerId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingId = `TRK-${providerId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingUrl =
      providerId === 'porter'
        ? `https://track.porter.in/${trackingId}`
        : `https://shiprocket.co/tracking/${trackingId}`;

    const updates = {
      delivery_status: 'assigned',
      assigned_provider_id: providerId,
      assigned_provider_name: serviceName,
      booking_id: bookingId,
      tracking_id: trackingId,
      tracking_url: trackingUrl,
      charged_amount_inr: providerId === 'porter' ? 185 : 210,
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').update(updates).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase bookDelivery fallback:', err);
      }
    }

    const current = await this.getOrders();
    const updatedList = current.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          deliveryStatus: 'assigned',
          assignedProviderId: providerId,
          assignedProviderName: serviceName,
          bookingId,
          trackingId,
          trackingUrl,
          chargedAmountInr: updates.charged_amount_inr,
        };
      }
      return ord;
    });
    setStorage('nexus_orders', updatedList);
    return updatedList.find((o) => o.id === orderId) || null;
  },

  // ----------------------------------------------------
  // LEADS
  // ----------------------------------------------------
  async getLeads(): Promise<LeadRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            email: d.email,
            channel: d.channel,
            intentScore: d.intent_score,
            status: d.status,
            productInterest: d.product_interest,
            message: d.message,
            followUpTask: d.follow_up_task,
            followUpDraft: d.follow_up_draft,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getLeads fallback:', err);
      }
    }

    const leads = getStorage('nexus_leads', DEFAULT_LEADS);
    setStorage('nexus_leads', leads);
    return leads;
  },

  async createLead(payload: {
    name: string;
    phone: string;
    channel?: string;
    message?: string;
    productInterest?: string;
  }): Promise<LeadRecord> {
    const rawMsg = (payload.message || '').toLowerCase();
    let score = 65;
    if (rawMsg.includes('bulk') || rawMsg.includes('price') || rawMsg.includes('buy') || rawMsg.includes('urgent')) {
      score = 90;
    } else if (rawMsg.includes('tomorrow') || rawMsg.includes('order')) {
      score = 80;
    }

    const followUpDraft = `Hi ${payload.name}! Thank you for inquiring about ${payload.productInterest || 'our business catalog'}. We would love to share instant delivery estimates and wholesale pricing. What timeframe are you targeting?`;

    const newLead: LeadRecord = {
      id: `lead-${Date.now()}`,
      name: payload.name,
      phone: payload.phone,
      channel: payload.channel || 'instagram',
      intentScore: score,
      status: 'qualified',
      productInterest: payload.productInterest || 'General Inquiry',
      message: payload.message || '',
      followUpTask: 'Reach out via WhatsApp Business with catalog quote',
      followUpDraft,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert({
            name: newLead.name,
            phone: newLead.phone,
            channel: newLead.channel,
            intent_score: newLead.intentScore,
            status: newLead.status,
            product_interest: newLead.productInterest,
            message: newLead.message,
            follow_up_task: newLead.followUpTask,
            follow_up_draft: newLead.followUpDraft,
          })
          .select()
          .single();

        if (data && !error) {
          return { ...newLead, id: data.id };
        }
      } catch (err) {
        console.warn('Supabase createLead fallback:', err);
      }
    }

    const current = await this.getLeads();
    const updated = [newLead, ...current];
    setStorage('nexus_leads', updated);
    return newLead;
  },

  // ----------------------------------------------------
  // APPROVALS
  // ----------------------------------------------------
  async getApprovals(): Promise<ApprovalRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('approvals')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            orderId: d.order_id,
            workflowId: d.workflow_id,
            type: d.type,
            title: d.title,
            reason: d.reason,
            costInr: Number(d.cost_inr),
            status: d.status,
            payload: d.payload,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getApprovals fallback:', err);
      }
    }

    const approvals = getStorage('nexus_approvals', DEFAULT_APPROVALS);
    setStorage('nexus_approvals', approvals);
    return approvals;
  },

  async resolveApproval(id: string, decision: 'approved' | 'rejected'): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('approvals')
          .update({
            status: decision,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase resolveApproval fallback:', err);
      }
    }

    const current = await this.getApprovals();
    const updated = current.map((a) => (a.id === id ? { ...a, status: decision } : a));
    setStorage('nexus_approvals', updated);
    return true;
  },

  // ----------------------------------------------------
  // WORKFLOWS
  // ----------------------------------------------------
  async getWorkflows(): Promise<WorkflowRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            triggerType: d.trigger_type,
            sourceTool: d.source_tool,
            isActive: d.is_active,
            steps: d.steps || [],
            totalExecutions: d.total_executions || 0,
            successfulExecutions: d.successful_executions || 0,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getWorkflows fallback:', err);
      }
    }

    const wfs = getStorage('nexus_workflows', DEFAULT_WORKFLOWS);
    setStorage('nexus_workflows', wfs);
    return wfs;
  },
};
