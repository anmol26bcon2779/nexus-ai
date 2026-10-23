import { Router } from 'express';
import { dataStore } from '../store/dataStore';
import { deliveryRegistry } from '../adapters/delivery/deliveryRegistry';

export const assistantRouter = Router();

// Conversational AI Business Assistant Endpoint
assistantRouter.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const q = String(message).toLowerCase();

  // Context gathering
  const pendingApprovals = dataStore.approvals.filter((a) => a.status === 'pending');
  const readyOrders = dataStore.orders.filter((o) => o.deliveryStatus === 'ready_for_assignment');
  const inTransitOrders = dataStore.orders.filter((o) => o.deliveryStatus === 'in_transit');

  let replyText = '';
  let structuredActions: Array<{ label: string; actionTab: string; payload?: Record<string, unknown> }> = [];
  let summaryBullets: string[] = [];

  if (q.includes('attention') || q.includes('today') || q.includes('urgent') || q.includes('need')) {
    replyText = `Here is what requires your direct operational attention right now:`;
    summaryBullets = [
      `🚨 **${pendingApprovals.length} High-Value Delivery Approvals:** Order ${pendingApprovals.map((a) => `#${a.orderId || 'NX-8941'}`).join(', ')} exceed your ₹10,000 threshold and need review before booking.`,
      `📦 **${readyOrders.length} Orders Awaiting Dispatch:** Packed and ready for carrier selection.`,
      `🚚 **${inTransitOrders.length} Active Shipments:** On track with 98.9% on-time delivery SLA.`,
    ];
    structuredActions = [
      { label: 'Review Pending Approvals', actionTab: 'approvals' },
      { label: 'Inspect Ready Orders', actionTab: 'orders' },
    ];
  } else if (q.includes('order') || q.includes('delivery') || q.includes('courier') || q.includes('nx-8941')) {
    const highVal = dataStore.orders.find((o) => o.orderNumber === 'NX-8941') || dataStore.orders[0];
    const quotes = deliveryRegistry.getAvailableQuotes(highVal.pickupPincode, highVal.deliveryPincode, highVal.weightKg, highVal.orderValueInr);

    replyText = `Analysis for Order #${highVal.orderNumber} (${highVal.customerName}, Destination: ${highVal.deliveryPincode}):`;
    summaryBullets = [
      `**Logistics Classification:** ${quotes.recommendedQuote?.deliveryType === 'local_express' ? 'Intra-city Local Delivery' : 'Pan-India Multi-Carrier Transit'}.`,
      `**Top Recommendation:** **${quotes.recommendedQuote?.serviceName}** at ₹${quotes.recommendedQuote?.estimatedPriceInr} (ETA: ${quotes.recommendedQuote?.formattedEta}).`,
      `**Reasoning:** ${quotes.recommendationReason}`,
      quotes.requiresApproval ? `⚠️ **Approval Required:** ${quotes.approvalReason}` : '✅ Eligible for automated one-click dispatch.',
    ];
    structuredActions = [
      { label: 'Open in Approvals Gate', actionTab: 'approvals' },
      { label: 'View Order Details', actionTab: 'orders' },
    ];
  } else if (q.includes('summar') || q.includes('week') || q.includes('metric') || q.includes('activity')) {
    replyText = `Weekly Operations Summary:`;
    summaryBullets = [
      `⚡ **Executions:** 1,440 automated workflow runs executed with 99.2% success rate.`,
      `⏱️ **Time Saved:** Estimated 48.5 human labor hours avoided through automated routing & lead follow-ups.`,
      `💰 **Courier Spend Optimization:** Porter Local routing in South Zone saved an estimated ₹4,800 this week.`,
      `🎯 **Lead Qualification:** 3 inbound leads converted with average response time under 4 minutes.`,
    ];
    structuredActions = [
      { label: 'View Full Business Analytics', actionTab: 'analytics' },
      { label: 'Inspect Execution Logs', actionTab: 'logs' },
    ];
  } else {
    replyText = `Nexus AI is actively monitoring your connected business tools (Shopify, Porter, Shiprocket, WhatsApp, Slack, Google Sheets).`;
    summaryBullets = [
      `I can help you review pending approvals, create automations in natural language, compare courier rates between Porter & Shiprocket, and qualify inbound leads.`,
    ];
    structuredActions = [
      { label: 'Create New Automation', actionTab: 'studio' },
      { label: 'Add Demo Order', actionTab: 'orders' },
    ];
  }

  res.json({
    success: true,
    reply: replyText,
    summaryBullets,
    actions: structuredActions,
    isDemo: true,
    engine: 'Nexus Operations Intelligence Core v1.0',
    timestamp: new Date().toISOString(),
  });
});

// Natural Language to Workflow Generator
assistantRouter.post('/generate-workflow', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Workflow prompt description is required' });
  }

  const lower = String(prompt).toLowerCase();

  const generatedSteps = [
    {
      id: 'step-gen-1',
      title: lower.includes('lead') ? 'Inbound Lead Webhook (Instagram/WhatsApp)' : 'New Order Captured Event',
      type: 'trigger',
      provider: lower.includes('lead') ? 'Instagram Direct' : 'Shopify Store',
      actionName: lower.includes('lead') ? 'inbound_message' : 'orders/create',
      config: {},
    },
    {
      id: 'step-gen-2',
      title: lower.includes('lead') ? 'AI Buyer Intent Classification' : 'Address Verification & Intra-City Proximity Check',
      type: lower.includes('lead') ? 'ai_process' : 'condition',
      provider: 'Nexus AI Engine',
      actionName: 'validate_payload',
      config: {},
    },
    {
      id: 'step-gen-3',
      title: lower.includes('lead') ? 'Save Qualified Lead Record' : 'Compare Porter vs Shiprocket Available Rates',
      type: 'transformation',
      provider: 'Nexus Engine',
      actionName: 'compute_rates',
      config: {},
    },
    {
      id: 'step-gen-4',
      title: 'Human-in-the-Loop Safety Gate (if high value)',
      type: 'approval_gate',
      provider: 'Approvals Gate',
      actionName: 'gatekeeper',
      config: { threshold: 10000 },
    },
    {
      id: 'step-gen-5',
      title: lower.includes('lead') ? 'Prepare WhatsApp Follow-up & Task' : 'Dispatch Assigned Courier & Store AWB',
      type: 'action',
      provider: lower.includes('lead') ? 'WhatsApp Cloud' : 'Carrier Adapter',
      actionName: 'execute_action',
      config: {},
    },
  ];

  res.json({
    success: true,
    workflow: {
      name: `Automated: ${prompt.slice(0, 50)}...`,
      description: prompt,
      steps: generatedSteps,
      triggerType: lower.includes('schedule') ? 'schedule' : lower.includes('order') ? 'order_event' : 'webhook',
      isDemo: true,
    },
  });
});
