import { Router } from 'express';
import { dataStore, BackendWorkflow } from '../store/dataStore';
import { workflowEngine } from '../engine/workflowEngine';

export const workflowsRouter = Router();

const defaultWorkflows: BackendWorkflow[] = [
  {
    id: 'wf-order-dispatch',
    name: 'Smart Order Dispatch & Local Courier Booking',
    description: 'When a new order arrives, validate address, classify local vs national, compare Porter & Shiprocket rates, request approval if >₹10k, and book courier.',
    triggerType: 'order_event',
    sourceTool: 'Shopify Store',
    isActive: true,
    totalExecutions: 842,
    successfulExecutions: 838,
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      { id: 'st-1', title: 'Validate Order & Packaging', type: 'trigger', provider: 'Shopify', actionName: 'order/create', config: {} },
      { id: 'st-2', title: 'Classify Intra-city vs Pan-India', type: 'condition', provider: 'Nexus Router', actionName: 'check_pincode_zone', config: {} },
      { id: 'st-3', title: 'Compare Porter & Shiprocket Quotes', type: 'transformation', provider: 'Logistics Engine', actionName: 'fetch_rates', config: {} },
      { id: 'st-4', title: 'High-Value Approval Check (>₹10,000)', type: 'approval_gate', provider: 'Nexus Guard', actionName: 'check_threshold', config: { threshold: 10000 } },
      { id: 'st-5', title: 'Dispatch Courier & Generate Tracking', type: 'action', provider: 'Delivery Adapter', actionName: 'book_shipment', config: {} },
      { id: 'st-6', title: 'Record in Google Sheets & Alert Slack', type: 'action', provider: 'Productivity', actionName: 'sync_audit', config: {} },
    ],
  },
  {
    id: 'wf-lead-followup',
    name: 'Inbound Lead Qualification & Instant Outreach',
    description: 'When a customer inquires on Instagram or WhatsApp, analyze intent score with AI, draft tailored WhatsApp reply, and create a high-priority task for sales.',
    triggerType: 'webhook',
    sourceTool: 'Instagram Direct',
    isActive: true,
    totalExecutions: 312,
    successfulExecutions: 310,
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      { id: 'st-1', title: 'Inbound Message Webhook', type: 'trigger', provider: 'Instagram', actionName: 'dm_received', config: {} },
      { id: 'st-2', title: 'AI Intent Scoring & Extraction', type: 'ai_process', provider: 'Nexus AI', actionName: 'score_intent', config: {} },
      { id: 'st-3', title: 'Save Lead to CRM Record', type: 'action', provider: 'Nexus CRM', actionName: 'create_lead', config: {} },
      { id: 'st-4', title: 'Draft Tailored WhatsApp Reply', type: 'action', provider: 'WhatsApp Business', actionName: 'draft_message', config: {} },
      { id: 'st-5', title: 'Create Sales Follow-up Task', type: 'action', provider: 'Nexus Tasks', actionName: 'create_task', config: {} },
    ],
  },
  {
    id: 'wf-freight-optimization',
    name: 'Pan-India Freight Rate Optimization',
    description: 'Compares Surface vs Air Express rates across Indian pin codes. Minimizes courier expenditure while adhering to customer SLAs.',
    triggerType: 'order_event',
    sourceTool: 'WooCommerce Store',
    isActive: true,
    totalExecutions: 198,
    successfulExecutions: 194,
    createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      { id: 'st-1', title: 'Inter-state Order Event', type: 'trigger', provider: 'WooCommerce', actionName: 'new_order', config: {} },
      { id: 'st-2', title: 'Calculate Weight Slabs & Volumetrics', type: 'transformation', provider: 'Logistics Engine', actionName: 'compute_slabs', config: {} },
      { id: 'st-3', title: 'Query Shiprocket Multi-Carrier Rates', type: 'action', provider: 'Shiprocket', actionName: 'query_rates', config: {} },
      { id: 'st-4', title: 'Auto-Select Optimal SLA Partner', type: 'action', provider: 'Nexus Router', actionName: 'select_carrier', config: {} },
    ],
  },
  {
    id: 'wf-stock-alert',
    name: 'Inventory Depletion Alert & Supplier Draft',
    description: 'Hourly check on SKU inventories in Google Sheets. Triggers low-stock alert on Slack and prepares supplier purchase order draft if below threshold.',
    triggerType: 'schedule',
    sourceTool: 'Google Sheets DB',
    isActive: true,
    totalExecutions: 88,
    successfulExecutions: 86,
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      { id: 'st-1', title: 'Hourly Stock Check Schedule', type: 'trigger', provider: 'Cron Scheduler', actionName: 'every_1_hour', config: {} },
      { id: 'st-2', title: 'Filter SKUs Below Threshold (< 5)', type: 'condition', provider: 'Google Sheets', actionName: 'query_inventory', config: {} },
      { id: 'st-3', title: 'Format Supplier Restock Draft', type: 'transformation', provider: 'Nexus Engine', actionName: 'draft_po', config: {} },
      { id: 'st-4', title: 'Post Operational Slack Notification', type: 'action', provider: 'Slack Alerts', actionName: 'post_alert', config: {} },
    ],
  },
];

workflowsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    workflows: defaultWorkflows,
  });
});

workflowsRouter.post('/execute', async (req, res) => {
  try {
    const { workflowId, payload = {} } = req.body;
    const wf = defaultWorkflows.find((w) => w.id === workflowId) || defaultWorkflows[0];

    const result = await workflowEngine.executeWorkflow({
      workflowId: wf.id,
      workflowName: wf.name,
      triggerType: wf.triggerType,
      sourceTool: wf.sourceTool,
      initialPayload: payload,
      isDemo: true,
    });

    res.json({
      success: true,
      log: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
