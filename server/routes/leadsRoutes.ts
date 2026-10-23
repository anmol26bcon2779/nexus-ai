import { Router } from 'express';
import { dataStore, BackendLead } from '../store/dataStore';

export const leadsRouter = Router();

// GET all leads
leadsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: dataStore.leads.length,
    leads: dataStore.leads,
  });
});

// CREATE a new lead and execute the Lead Automation Workflow
leadsRouter.post('/', (req, res) => {
  try {
    const { name, phone, channel = 'instagram', message = 'Interested in catalog and prices', productInterest = 'Standing Desk' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    // Step 1: AI Intent Scoring
    const isHighIntent = message.toLowerCase().includes('price') || message.toLowerCase().includes('buy') || message.toLowerCase().includes('order');
    const intentScore = isHighIntent ? Math.floor(88 + Math.random() * 10) : Math.floor(65 + Math.random() * 20);

    // Step 2: Prepare Follow-up Message
    const followUpDraft = `Hi ${name}! Thanks for contacting us about our ${productInterest}. We have active stock in Bengaluru with same-day express delivery. Would you like our catalog and quick quote?`;

    // Step 3: Create Task
    const followUpTask = `Send WhatsApp catalog to ${name} (${phone}) - High Intent Lead`;

    const newLead: BackendLead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      channel,
      intentScore,
      status: 'qualified',
      productInterest,
      followUpTask,
      followUpDraft,
      createdAt: new Date().toISOString(),
    };

    dataStore.leads.unshift(newLead);

    // Record execution log in audit trail
    dataStore.executionLogs.unshift({
      id: `exec-${Math.floor(1000 + Math.random() * 9000)}`,
      workflowId: 'wf-lead-followup',
      workflowName: 'Inbound Lead Qualification & Instant Outreach',
      triggerType: 'webhook',
      sourceTool: `${channel.toUpperCase()} Lead Inbound`,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 290,
      status: 'success',
      summary: `Lead "${name}" qualified with Intent Score ${intentScore}. WhatsApp follow-up drafted and task created for sales.`,
      isDemo: true,
      idempotencyKey: `lead-idem-${newLead.id}`,
      steps: [
        { stepId: 'st-1', stepTitle: 'Receive Inbound Message', status: 'success', durationMs: 30, inputPayload: { from: phone, text: message }, outputPayload: { received: true } },
        { stepId: 'st-2', stepTitle: 'AI Intent Scoring', status: 'success', durationMs: 140, inputPayload: { message }, outputPayload: { intentScore, priority: 'High' } },
        { stepId: 'st-3', stepTitle: 'Save Lead to CRM', status: 'success', durationMs: 40, inputPayload: { name, phone }, outputPayload: { leadId: newLead.id } },
        { stepId: 'st-4', stepTitle: 'Draft WhatsApp Follow-up', status: 'success', durationMs: 50, inputPayload: { draft: followUpDraft }, outputPayload: { ready: true } },
        { stepId: 'st-5', stepTitle: 'Create Sales Follow-up Task', status: 'success', durationMs: 30, inputPayload: { task: followUpTask }, outputPayload: { taskCreated: true } },
      ],
    });

    res.status(201).json({
      success: true,
      lead: newLead,
      message: 'Lead automation completed: validated, scored, drafted follow-up and task created.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
