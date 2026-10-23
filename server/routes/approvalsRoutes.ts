import { Router } from 'express';
import { dataStore } from '../store/dataStore';
import { deliveryRegistry } from '../adapters/delivery/deliveryRegistry';

export const approvalsRouter = Router();

// GET all approvals
approvalsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: dataStore.approvals.length,
    pendingCount: dataStore.approvals.filter((a) => a.status === 'pending').length,
    approvals: dataStore.approvals,
  });
});

// APPROVE an action
approvalsRouter.post('/:id/approve', async (req, res) => {
  const approval = dataStore.approvals.find((a) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval item not found' });
  }

  approval.status = 'approved';
  approval.resolvedAt = new Date().toISOString();

  // If this was an order delivery booking, execute the booking!
  if (approval.orderId) {
    const order = dataStore.orders.find((o) => o.id === approval.orderId || o.orderNumber === approval.orderId);
    if (order) {
      try {
        const booking = await deliveryRegistry.bookDelivery({
          orderId: order.orderNumber,
          providerId: (order.assignedProviderId as any) || 'shiprocket',
          serviceName: order.assignedProviderName || 'Shiprocket Priority Air',
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          pickupPincode: order.pickupPincode,
          deliveryPincode: order.deliveryPincode,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          packageWeightKg: order.weightKg,
          orderValueInr: order.orderValueInr,
          idempotencyKey: `appr-book-${order.id}`,
        });

        order.deliveryStatus = 'assigned';
        order.requiresApproval = false;
        order.bookingId = booking.bookingId;
        order.trackingId = booking.trackingId;
        order.trackingUrl = booking.trackingUrl;
        order.chargedAmountInr = booking.chargedAmountInr;
        order.updatedAt = new Date().toISOString();

        // Record execution log
        dataStore.executionLogs.unshift({
          id: `exec-${Math.floor(1000 + Math.random() * 9000)}`,
          workflowId: 'wf-approval-execution',
          workflowName: 'Manager Approval Execution: Courier Dispatched',
          triggerType: 'manual',
          sourceTool: 'Approvals Gate',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: 210,
          status: 'success',
          summary: `Approved booking for order #${order.orderNumber} executed. Courier assigned: ${order.assignedProviderName} (Tracking: ${order.trackingId}).`,
          isDemo: true,
          idempotencyKey: `exec-appr-${approval.id}`,
          steps: [
            { stepId: 'st-auth', stepTitle: 'Verify Manager Authorization', status: 'success', durationMs: 20, inputPayload: { approvalId: approval.id }, outputPayload: { authorized: true } },
            { stepId: 'st-dispatch', stepTitle: 'Submit Courier Booking to Carrier Adapter', status: 'success', durationMs: 150, inputPayload: { order: order.orderNumber }, outputPayload: { bookingId: booking.bookingId } },
            { stepId: 'st-audit', stepTitle: 'Update Order Audit Record', status: 'success', durationMs: 40, inputPayload: { status: 'assigned' }, outputPayload: { updated: true } },
          ],
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }
  }

  res.json({
    success: true,
    message: 'Action approved and executed successfully.',
    approval,
  });
});

// REJECT an action
approvalsRouter.post('/:id/reject', (req, res) => {
  const approval = dataStore.approvals.find((a) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval item not found' });
  }

  approval.status = 'rejected';
  approval.resolvedAt = new Date().toISOString();

  if (approval.orderId) {
    const order = dataStore.orders.find((o) => o.id === approval.orderId || o.orderNumber === approval.orderId);
    if (order) {
      order.deliveryStatus = 'cancelled';
      order.updatedAt = new Date().toISOString();
    }
  }

  res.json({
    success: true,
    message: 'Action rejected. No courier booking made.',
    approval,
  });
});
