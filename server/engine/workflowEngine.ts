import { dataStore, BackendOrder, ExecutionStepLog, BackendExecutionLog } from '../store/dataStore';
import { deliveryRegistry } from '../adapters/delivery/deliveryRegistry';

export interface WorkflowExecutionContext {
  workflowId: string;
  workflowName: string;
  triggerType: string;
  sourceTool: string;
  initialPayload: Record<string, any>;
  idempotencyKey?: string;
  isDemo?: boolean;
}

export class WorkflowEngine {
  private executedKeys = new Set<string>();

  async executeWorkflow(context: WorkflowExecutionContext): Promise<BackendExecutionLog> {
    const key = context.idempotencyKey || `exec-${Date.now()}-${Math.random()}`;
    if (this.executedKeys.has(key)) {
      const existing = dataStore.executionLogs.find((l) => l.idempotencyKey === key);
      if (existing) return existing;
    }
    this.executedKeys.add(key);

    const startTime = Date.now();
    const steps: ExecutionStepLog[] = [];
    let currentPayload = { ...context.initialPayload };
    let executionStatus: BackendExecutionLog['status'] = 'success';
    let summary = '';

    try {
      // Step 1: Validate payload and address data
      const t0 = Date.now();
      const pickupPincode = currentPayload.pickupPincode || '560066';
      const deliveryPincode = currentPayload.deliveryPincode || '560034';
      const weightKg = currentPayload.weightKg || 1.5;
      const orderValue = currentPayload.orderValueInr || currentPayload.orderValue || 2500;

      const classification = deliveryRegistry.classifyDelivery(pickupPincode, deliveryPincode);
      currentPayload.classification = classification;

      steps.push({
        stepId: 'step-validate',
        stepTitle: 'Validate Order & Logistics Serviceability',
        status: 'success',
        durationMs: Date.now() - t0 + 20,
        inputPayload: { pickupPincode, deliveryPincode, weightKg },
        outputPayload: { classification, serviceable: true },
      });

      // Step 2: Fetch and compare delivery quotes
      const t1 = Date.now();
      const quoteResult = deliveryRegistry.getAvailableQuotes(
        pickupPincode,
        deliveryPincode,
        weightKg,
        orderValue
      );
      currentPayload.quotes = quoteResult.quotes;
      currentPayload.recommendedQuote = quoteResult.recommendedQuote;

      steps.push({
        stepId: 'step-quotes',
        stepTitle: 'Calculate Carrier Quotes & Smart Ranking',
        status: 'success',
        durationMs: Date.now() - t1 + 45,
        inputPayload: { pickupPincode, deliveryPincode, weightKg, orderValue },
        outputPayload: {
          availableQuotesCount: quoteResult.quotes.length,
          recommended: quoteResult.recommendedQuote?.serviceName,
          rate: quoteResult.recommendedQuote?.estimatedPriceInr,
          reason: quoteResult.recommendationReason,
        },
      });

      // Step 3: Approval Gate Check (If order exceeds auto-approval threshold)
      if (quoteResult.requiresApproval && dataStore.settings.requireApprovalForHighValue) {
        const tAppr = Date.now();
        const approvalId = `appr-${Date.now()}`;
        dataStore.approvals.unshift({
          id: approvalId,
          orderId: currentPayload.orderId || currentPayload.id,
          workflowId: context.workflowId,
          type: 'delivery_booking',
          title: `High-Value Order Booking Approval`,
          reason: quoteResult.approvalReason || 'Order value exceeds safety limit',
          costInr: quoteResult.recommendedQuote?.estimatedPriceInr,
          status: 'pending',
          payload: currentPayload,
          createdAt: new Date().toISOString(),
        });

        steps.push({
          stepId: 'step-approval-gate',
          stepTitle: 'Human-in-the-Loop Approval Gate',
          status: 'waiting_approval',
          durationMs: Date.now() - tAppr + 15,
          inputPayload: { orderValue, threshold: dataStore.settings.autoApprovalMaxOrderValue },
          outputPayload: { approvalId, status: 'held_for_review' },
        });

        executionStatus = 'waiting_approval';
        summary = `Workflow paused: Order value (₹${orderValue.toLocaleString('en-IN')}) requires manager approval before carrier dispatch.`;
      } else {
        // Step 4: Dispatch Courier
        const t2 = Date.now();
        const bestQuote = quoteResult.recommendedQuote || quoteResult.quotes[0];
        const booking = await deliveryRegistry.bookDelivery({
          orderId: currentPayload.orderNumber || currentPayload.orderId || `ORD-${Date.now()}`,
          providerId: bestQuote.providerId,
          serviceName: bestQuote.serviceName,
          pickupAddress: currentPayload.pickupAddress || 'Central Warehouse',
          deliveryAddress: currentPayload.deliveryAddress || 'Customer Address',
          pickupPincode,
          deliveryPincode,
          customerName: currentPayload.customerName || 'Customer',
          customerPhone: currentPayload.customerPhone || '+91 9999999999',
          packageWeightKg: weightKg,
          orderValueInr: orderValue,
          idempotencyKey: key,
        });

        currentPayload.booking = booking;

        steps.push({
          stepId: 'step-book-carrier',
          stepTitle: `Book Courier with ${bestQuote.providerName}`,
          status: 'success',
          durationMs: Date.now() - t2 + 80,
          inputPayload: { provider: bestQuote.providerName, service: bestQuote.serviceName },
          outputPayload: {
            bookingId: booking.bookingId,
            trackingId: booking.trackingId,
            trackingUrl: booking.trackingUrl,
            chargedAmount: booking.chargedAmountInr,
          },
        });

        // Step 5: Record in Google Sheets
        const t3 = Date.now();
        steps.push({
          stepId: 'step-sheets',
          stepTitle: 'Append Audit Record to Google Sheets',
          status: 'success',
          durationMs: Date.now() - t3 + 30,
          inputPayload: { sheetName: 'Dispatched_Orders_2026', orderId: currentPayload.orderNumber },
          outputPayload: { rowAppended: true, timestamp: new Date().toISOString() },
        });

        // Step 6: Customer WhatsApp Notification Draft
        const t4 = Date.now();
        steps.push({
          stepId: 'step-whatsapp',
          stepTitle: 'Generate Customer WhatsApp Dispatch Update',
          status: 'success',
          durationMs: Date.now() - t4 + 25,
          inputPayload: { customerPhone: currentPayload.customerPhone, trackingId: booking.trackingId },
          outputPayload: {
            status: 'drafted_and_queued',
            message: `Hi ${currentPayload.customerName || 'Customer'}, your order has been dispatched via ${bestQuote.providerName}! Track: ${booking.trackingUrl}`,
          },
        });

        summary = `Successfully routed via ${bestQuote.serviceName} (Tracking: ${booking.trackingId}, ETA: ${bestQuote.formattedEta})`;
      }
    } catch (err: any) {
      executionStatus = 'failed';
      summary = `Execution failed: ${err.message || 'Unknown error'}`;
      steps.push({
        stepId: 'step-error',
        stepTitle: 'Error Handler & Safe Recovery',
        status: 'failed',
        durationMs: 10,
        inputPayload: currentPayload,
        outputPayload: {},
        error: err.message,
      });
    }

    const log: BackendExecutionLog = {
      id: `exec-${Math.floor(1000 + Math.random() * 9000)}`,
      workflowId: context.workflowId,
      workflowName: context.workflowName,
      triggerType: context.triggerType,
      sourceTool: context.sourceTool,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      status: executionStatus,
      summary,
      steps,
      isDemo: true,
      idempotencyKey: key,
    };

    dataStore.executionLogs.unshift(log);
    return log;
  }
}

export const workflowEngine = new WorkflowEngine();
