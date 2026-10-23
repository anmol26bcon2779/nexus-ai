import { Router } from 'express';
import { dataStore, BackendOrder } from '../store/dataStore';
import { deliveryRegistry } from '../adapters/delivery/deliveryRegistry';
import { workflowEngine } from '../engine/workflowEngine';

export const ordersRouter = Router();

// GET all orders
ordersRouter.get('/', (req, res) => {
  const { status, search } = req.query;
  let result = [...dataStore.orders];

  if (status && status !== 'all') {
    result = result.filter((o) => o.deliveryStatus === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: result.length,
    orders: result,
  });
});

// GET single order with tracking timeline
ordersRouter.get('/:id', (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const timeline = order.trackingId && order.assignedProviderId
    ? deliveryRegistry.getTrackingTimeline(order.assignedProviderId, order.trackingId, order.createdAt)
    : [];

  res.json({
    success: true,
    order,
    timeline,
  });
});

// GET live courier quotes for an order
ordersRouter.get('/:id/quotes', (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const quoteData = deliveryRegistry.getAvailableQuotes(
    order.pickupPincode,
    order.deliveryPincode,
    order.weightKg,
    order.orderValueInr
  );

  res.json({
    success: true,
    orderId: order.id,
    ...quoteData,
  });
});

// CREATE a new order and trigger smart delivery automation
ordersRouter.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      productName,
      quantity = 1,
      weightKg = 1.0,
      orderValueInr = 2000,
      pickupAddress = 'Nexus Central Fulfillment Hub, Whitefield, Bengaluru 560066',
      pickupPincode = '560066',
      deliveryAddress,
      deliveryPincode,
    } = req.body;

    if (!deliveryAddress || !deliveryPincode) {
      return res.status(400).json({ success: false, message: 'Delivery address and pin code are required' });
    }

    const orderNumber = `NX-${Math.floor(8945 + Math.random() * 1000)}`;
    const newOrder: BackendOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '+91 98765 00000',
      productName: productName || 'Standard Goods',
      quantity: Number(quantity),
      weightKg: Number(weightKg),
      orderValueInr: Number(orderValueInr),
      pickupAddress,
      pickupPincode,
      deliveryAddress,
      deliveryPincode,
      isPacked: true,
      fulfillmentStatus: 'packed_ready',
      deliveryType: pickupPincode.substring(0, 3) === deliveryPincode.substring(0, 3) ? 'local_express' : 'pan_india',
      deliveryStatus: 'ready_for_assignment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    };

    // Run the Smart Order Dispatch Workflow
    const execLog = await workflowEngine.executeWorkflow({
      workflowId: 'wf-order-dispatch',
      workflowName: 'Smart Order Dispatch & Local Courier Booking',
      triggerType: 'order_event',
      sourceTool: 'Shopify Store',
      initialPayload: newOrder,
      idempotencyKey: `idem-${orderNumber}`,
      isDemo: true,
    });

    // Update order status if approval needed or booked
    if (execLog.status === 'waiting_approval') {
      newOrder.deliveryStatus = 'awaiting_approval';
      newOrder.requiresApproval = true;
      newOrder.approvalReason = `Order value (₹${newOrder.orderValueInr}) holds for manager confirmation.`;
    } else {
      const stepBooking = execLog.steps.find((s) => s.stepId === 'step-book-carrier');
      if (stepBooking) {
        newOrder.deliveryStatus = 'assigned';
        newOrder.assignedProviderName = stepBooking.inputPayload.provider as string;
        newOrder.bookingId = stepBooking.outputPayload.bookingId as string;
        newOrder.trackingId = stepBooking.outputPayload.trackingId as string;
        newOrder.trackingUrl = stepBooking.outputPayload.trackingUrl as string;
        newOrder.chargedAmountInr = stepBooking.outputPayload.chargedAmount as number;
      }
    }

    dataStore.orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      workflowLog: execLog,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BOOK delivery with chosen provider
ordersRouter.post('/:id/book', async (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const { providerId = 'porter', serviceName = 'Porter 2-Wheeler Express' } = req.body;

  try {
    const bookingResult = await deliveryRegistry.bookDelivery({
      orderId: order.orderNumber,
      providerId,
      serviceName,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      pickupPincode: order.pickupPincode,
      deliveryPincode: order.deliveryPincode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      packageWeightKg: order.weightKg,
      orderValueInr: order.orderValueInr,
      idempotencyKey: `manual-book-${order.id}-${Date.now()}`,
    });

    order.deliveryStatus = 'assigned';
    order.assignedProviderId = providerId;
    order.assignedProviderName = bookingResult.providerName;
    order.bookingId = bookingResult.bookingId;
    order.trackingId = bookingResult.trackingId;
    order.trackingUrl = bookingResult.trackingUrl;
    order.chargedAmountInr = bookingResult.chargedAmountInr;
    order.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      booking: bookingResult,
      order,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE delivery status (progress timeline in demo)
ordersRouter.put('/:id/status', (req, res) => {
  const order = dataStore.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  order.deliveryStatus = status;
  order.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    order,
  });
});
