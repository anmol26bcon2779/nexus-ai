import { initialIntegrations } from '../adapters/integrations/registry';
import { IntegrationProvider } from '../adapters/integrations/types';

export interface BackendOrder {
  id: string;
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
  isPacked: boolean;
  fulfillmentStatus: 'unpacked' | 'packed_ready';
  deliveryType: 'local_express' | 'pan_india';
  deliveryStatus:
    | 'awaiting_fulfillment'
    | 'ready_for_assignment'
    | 'awaiting_approval'
    | 'booking_in_progress'
    | 'assigned'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'failed'
    | 'cancelled';
  assignedProviderId?: string;
  assignedProviderName?: string;
  bookingId?: string;
  trackingId?: string;
  trackingUrl?: string;
  chargedAmountInr?: number;
  requiresApproval?: boolean;
  approvalReason?: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  type: 'trigger' | 'condition' | 'transformation' | 'ai_process' | 'action' | 'approval_gate';
  provider: string;
  actionName: string;
  config: Record<string, unknown>;
}

export interface BackendWorkflow {
  id: string;
  name: string;
  description: string;
  triggerType: 'webhook' | 'schedule' | 'manual' | 'order_event';
  sourceTool: string;
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  totalExecutions: number;
  successfulExecutions: number;
}

export interface ExecutionStepLog {
  stepId: string;
  stepTitle: string;
  status: 'success' | 'failed' | 'skipped' | 'waiting_approval';
  durationMs: number;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown>;
  error?: string;
}

export interface BackendExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: string;
  sourceTool: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  status: 'success' | 'failed' | 'running' | 'waiting_approval' | 'retrying';
  summary: string;
  steps: ExecutionStepLog[];
  isDemo: boolean;
  idempotencyKey: string;
}

export interface BackendApproval {
  id: string;
  orderId?: string;
  workflowId?: string;
  executionId?: string;
  type: 'delivery_booking' | 'delivery_cancellation' | 'customer_messaging';
  title: string;
  reason: string;
  costInr?: number;
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

export interface BackendLead {
  id: string;
  name: string;
  phone: string;
  channel: 'instagram' | 'whatsapp' | 'website' | 'referral';
  intentScore: number;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  productInterest: string;
  followUpTask: string;
  followUpDraft?: string;
  createdAt: string;
}

export interface SystemSettings {
  autoApprovalMaxOrderValue: number;
  localRadiusKmPriority: number;
  preferredLocalProvider: string;
  preferredNationalProvider: string;
  isDemoMode: boolean;
  requireApprovalForHighValue: boolean;
  slackWebhookActive: boolean;
}

// In-Memory Data Store with Initial Seed Data
class DataStore {
  orders: BackendOrder[] = [];
  workflows: BackendWorkflow[] = [];
  executionLogs: BackendExecutionLog[] = [];
  approvals: BackendApproval[] = [];
  leads: BackendLead[] = [];
  integrations: IntegrationProvider[] = [...initialIntegrations];
  settings: SystemSettings = {
    autoApprovalMaxOrderValue: 10000,
    localRadiusKmPriority: 15,
    preferredLocalProvider: 'porter',
    preferredNationalProvider: 'shiprocket',
    isDemoMode: true,
    requireApprovalForHighValue: true,
    slackWebhookActive: true,
  };

  constructor() {
    this.seed();
  }

  private seed() {
    // Initial Orders
    this.orders = [
      {
        id: 'ord-8941',
        orderNumber: 'NX-8941',
        customerName: 'Priya Iyer',
        customerPhone: '+91 98200 11223',
        productName: 'Ergonomic Executive High-Back Chair',
        quantity: 1,
        weightKg: 14.5,
        orderValueInr: 14500,
        pickupAddress: 'Nexus Central Warehouse, Whitefield, Bengaluru 560066',
        pickupPincode: '560066',
        deliveryAddress: 'Flat 402, Bandra West, Mumbai, Maharashtra 400050',
        deliveryPincode: '400050',
        isPacked: true,
        fulfillmentStatus: 'packed_ready',
        deliveryType: 'pan_india',
        deliveryStatus: 'awaiting_approval',
        assignedProviderId: 'shiprocket',
        assignedProviderName: 'Shiprocket Priority Air',
        chargedAmountInr: 340,
        requiresApproval: true,
        approvalReason: 'Order value (₹14,500) exceeds auto-dispatch limit of ₹10,000.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isDemo: true,
      },
      {
        id: 'ord-8942',
        orderNumber: 'NX-8942',
        customerName: 'Karthik Rao',
        customerPhone: '+91 98450 33445',
        productName: 'Dual Monitor Aluminum Riser',
        quantity: 1,
        weightKg: 2.1,
        orderValueInr: 3200,
        pickupAddress: 'Nexus Central Warehouse, Whitefield, Bengaluru 560066',
        pickupPincode: '560066',
        deliveryAddress: '302, 1st Cross, Koramangala 5th Block, Bengaluru, Karnataka 560034',
        deliveryPincode: '560034',
        isPacked: true,
        fulfillmentStatus: 'packed_ready',
        deliveryType: 'local_express',
        deliveryStatus: 'in_transit',
        assignedProviderId: 'porter',
        assignedProviderName: 'Porter 2-Wheeler Express',
        bookingId: 'PTR-BK-49210',
        trackingId: 'DEMO-PTR-9921',
        trackingUrl: 'https://nexus-demo.internal/tracking/DEMO-PTR-9921',
        chargedAmountInr: 142,
        requiresApproval: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isDemo: true,
      },
      {
        id: 'ord-8943',
        orderNumber: 'NX-8943',
        customerName: 'Ananya Verma',
        customerPhone: '+91 99110 55667',
        productName: 'Solid Walnut Electric Standing Desk (Pro 140cm)',
        quantity: 1,
        weightKg: 28.0,
        orderValueInr: 24900,
        pickupAddress: 'Nexus Central Warehouse, Whitefield, Bengaluru 560066',
        pickupPincode: '560066',
        deliveryAddress: 'C-12, Hauz Khas Enclave, New Delhi 110016',
        deliveryPincode: '110016',
        isPacked: true,
        fulfillmentStatus: 'packed_ready',
        deliveryType: 'pan_india',
        deliveryStatus: 'awaiting_approval',
        assignedProviderId: 'shiprocket',
        assignedProviderName: 'Shiprocket Priority Air',
        chargedAmountInr: 680,
        requiresApproval: true,
        approvalReason: 'Order value (₹24,900) exceeds auto-dispatch limit of ₹10,000.',
        createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isDemo: true,
      },
      {
        id: 'ord-8944',
        orderNumber: 'NX-8944',
        customerName: 'Vikram Mehta',
        customerPhone: '+91 97230 77889',
        productName: 'Wireless Desk Charging Pad (Walnut)',
        quantity: 2,
        weightKg: 0.8,
        orderValueInr: 1850,
        pickupAddress: 'Nexus Central Warehouse, Whitefield, Bengaluru 560066',
        pickupPincode: '560066',
        deliveryAddress: '14, Infantry Road, Shivaji Nagar, Bengaluru, Karnataka 560001',
        deliveryPincode: '560001',
        isPacked: true,
        fulfillmentStatus: 'packed_ready',
        deliveryType: 'local_express',
        deliveryStatus: 'ready_for_assignment',
        requiresApproval: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isDemo: true,
      },
    ];

    // Initial Approvals
    this.approvals = [
      {
        id: 'appr-1',
        orderId: 'ord-8941',
        type: 'delivery_booking',
        title: 'High-Value Order Courier Booking',
        reason: 'Order #NX-8941 value (₹14,500) exceeds auto-dispatch threshold of ₹10,000.',
        costInr: 340,
        status: 'pending',
        payload: {
          customerName: 'Priya Iyer',
          deliveryAddress: 'Flat 402, Bandra West, Mumbai 400050',
          proposedCarrier: 'Shiprocket Priority Air',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      },
      {
        id: 'appr-2',
        orderId: 'ord-8943',
        type: 'delivery_booking',
        title: 'High-Value Order Courier Booking',
        reason: 'Order #NX-8943 value (₹24,900) exceeds auto-dispatch threshold of ₹10,000.',
        costInr: 680,
        status: 'pending',
        payload: {
          customerName: 'Ananya Verma',
          deliveryAddress: 'C-12, Hauz Khas Enclave, New Delhi 110016',
          proposedCarrier: 'Shiprocket Priority Air',
        },
        createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
    ];

    // Initial Leads
    this.leads = [
      {
        id: 'lead-1',
        name: 'Rohan Mehra',
        phone: '+91 98765 12345',
        channel: 'instagram',
        intentScore: 92,
        status: 'qualified',
        productInterest: 'Ergonomic Standing Desk',
        followUpTask: 'Send product dimension specs & WhatsApp catalog',
        followUpDraft: 'Hi Rohan! Thanks for reaching out on Instagram about our Standing Desk. We have 3 motorized sizes in stock with free same-day dispatch in Bengaluru.',
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'lead-2',
        name: 'Sneha Patel',
        phone: '+91 98190 67890',
        channel: 'whatsapp',
        intentScore: 78,
        status: 'new',
        productInterest: 'Custom Corporate Bulk Order (12 desks)',
        followUpTask: 'Schedule 15-min B2B commercial consultation',
        followUpDraft: 'Hello Sneha, we received your inquiry regarding bulk seating. Our corporate account manager is available for a quick consultation today.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: 'lead-3',
        name: 'Amitabh Sen',
        phone: '+91 99201 44556',
        channel: 'website',
        intentScore: 89,
        status: 'contacted',
        productInterest: 'Dual Monitor Aluminum Riser',
        followUpTask: 'Track delivery query answered',
        followUpDraft: 'Hi Amitabh, your order #NX-8942 has been dispatched via Porter Express and will arrive in approx 35 mins.',
        createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      },
    ];

    // Initial Execution Logs
    this.executionLogs = [
      {
        id: 'exec-901',
        workflowId: 'wf-order-dispatch',
        workflowName: 'Smart Order Dispatch & Local Courier Booking',
        triggerType: 'order_event',
        sourceTool: 'Shopify Store',
        startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 8 * 60 * 1000 + 420).toISOString(),
        durationMs: 420,
        status: 'success',
        summary: 'Order #NX-8942 matched to Porter 2-Wheeler (₹142, ETA: 35 mins). Tracking ID DEMO-PTR-9921 created.',
        isDemo: true,
        idempotencyKey: 'idem-ord-8942',
        steps: [
          { stepId: 'step-1', stepTitle: 'Verify Order & Pin Code', status: 'success', durationMs: 45, inputPayload: { orderId: 'NX-8942' }, outputPayload: { verified: true, isLocal: true } },
          { stepId: 'step-2', stepTitle: 'Fetch Courier Quotes', status: 'success', durationMs: 120, inputPayload: { pincode: '560034' }, outputPayload: { quotesFound: 3, best: 'Porter 2-Wheeler' } },
          { stepId: 'step-3', stepTitle: 'Book Courier via Adapter', status: 'success', durationMs: 180, inputPayload: { provider: 'porter' }, outputPayload: { bookingId: 'PTR-BK-49210', tracking: 'DEMO-PTR-9921' } },
          { stepId: 'step-4', stepTitle: 'Append Spreadsheet Row', status: 'success', durationMs: 75, inputPayload: { sheet: 'Orders_2026' }, outputPayload: { row: 184 } },
        ],
      },
    ];
  }
}

export const dataStore = new DataStore();
