// Comprehensive System Verification Test
import { deliveryRegistry } from '../server/adapters/delivery/deliveryRegistry';
import { workflowEngine } from '../server/engine/workflowEngine';
import { dataStore, BackendOrder } from '../server/store/dataStore';
import { dbService } from '../src/services/db';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 NEXUS AI — SYSTEM VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Logistics Adapter Test - Porter (Local Intra-city)
  try {
    const porterQuote = deliveryRegistry.getAvailableQuotes(
      '560066',
      '560038',
      2.5,
      1200
    );
    assert(porterQuote.quotes.length > 0, 'Logistics: Porter calculates local intra-city quotes');
    assert(porterQuote.recommendedQuote?.providerId === 'porter', 'Logistics: Recommends Porter for intra-city');
    assert((porterQuote.recommendedQuote?.estimatedPriceInr || 0) > 0, 'Logistics: Porter quote has non-zero fare');
  } catch (err) {
    assert(false, `Logistics: Porter test threw error: ${err}`);
  }

  // 2. Logistics Adapter Test - Shiprocket (Pan-India)
  try {
    const shiprocketQuote = deliveryRegistry.getAvailableQuotes(
      '560066',
      '400050',
      5.0,
      8500
    );
    assert(shiprocketQuote.quotes.length > 0, 'Logistics: Shiprocket calculates Pan-India quotes');
    assert(shiprocketQuote.recommendedQuote?.providerId === 'shiprocket', 'Logistics: Recommends Shiprocket for inter-state');
  } catch (err) {
    assert(false, `Logistics: Shiprocket test threw error: ${err}`);
  }

  // 3. Logistics Booking Test
  try {
    const booking = await deliveryRegistry.bookDelivery({
      providerId: 'porter',
      orderId: 'test-ord-1',
      orderNumber: 'NX-TEST-001',
      customerName: 'Aarav Patel',
      customerPhone: '+91 98000 11111',
      pickupAddress: 'Nexus Central Logistics Hub, Whitefield',
      pickupPincode: '560066',
      deliveryAddress: '12 Brigade Road, Bengaluru',
      deliveryPincode: '560025',
      weightKg: 1.5,
      deliveryType: 'local_express',
      serviceName: 'Porter 2-Wheeler Express',
    });
    assert(booking.success === true, 'Logistics Booking: Dispatches courier booking');
    assert(booking.trackingId.includes('PTR'), 'Logistics Booking: Generates valid Porter tracking ID');
    assert(booking.trackingUrl.includes('tracking'), 'Logistics Booking: Generates live tracking URL');
  } catch (err) {
    assert(false, `Logistics Booking test threw error: ${err}`);
  }

  // 4. Workflow Engine & High-Value Approval Gate Test
  try {
    const highValueOrder: BackendOrder = {
      id: `ord-test-hv`,
      orderNumber: 'NX-TEST-HV',
      customerName: 'High Networth Client',
      customerPhone: '+91 99999 00000',
      productName: 'Enterprise Server Rack',
      quantity: 1,
      weightKg: 25.0,
      orderValueInr: 45000,
      pickupAddress: 'Nexus Main Warehouse',
      pickupPincode: '560066',
      deliveryAddress: 'Corporate Towers, Nariman Point, Mumbai',
      deliveryPincode: '400021',
      isPacked: true,
      fulfillmentStatus: 'packed_ready',
      deliveryType: 'pan_india',
      deliveryStatus: 'ready_for_assignment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    };

    const execLog = await workflowEngine.executeWorkflow({
      workflowId: 'wf-order-dispatch',
      workflowName: 'Smart Order Dispatch & Local Courier Booking',
      triggerType: 'order_event',
      sourceTool: 'Shopify Store',
      initialPayload: highValueOrder,
      idempotencyKey: `idem-test-hv-${Date.now()}`,
      isDemo: true,
    });

    assert(execLog.status === 'waiting_approval', 'Approval Gate: Holds high-value order (>₹10k) for team approval');
    assert(execLog.steps.some((s) => s.status === 'waiting_approval'), 'Approval Gate: Step marked as waiting_approval');
  } catch (err) {
    assert(false, `Workflow & Approval test threw error: ${err}`);
  }

  // 5. Client Database Layer (dbService) Tests
  try {
    const orders = await dbService.getOrders();
    assert(Array.isArray(orders) && orders.length > 0, 'dbService: Returns workspace orders array');

    const newOrder = await dbService.createOrder({
      customerName: 'Dev Testing User',
      productName: 'Ergonomic Desk Lamp',
      quantity: 1,
      weightKg: 1.2,
      orderValueInr: 2499,
      deliveryAddress: '42 MG Road, Bengaluru',
      deliveryPincode: '560001',
    });
    assert(newOrder.orderNumber.startsWith('NX-'), 'dbService: Creates new order with valid NX prefix');

    const booked = await dbService.bookDelivery(newOrder.id, 'porter', 'Porter 2-Wheeler Instant');
    assert(booked?.deliveryStatus === 'assigned', 'dbService: Updates order status to assigned on booking');
    assert(!!booked?.trackingId, 'dbService: Attaches courier tracking ID to booked order');
  } catch (err) {
    assert(false, `dbService Order tests threw error: ${err}`);
  }

  // 6. Leads & Intelligent CRM Pipeline Test
  try {
    const leads = await dbService.getLeads();
    assert(Array.isArray(leads) && leads.length > 0, 'dbService: Returns lead pipeline array');

    const urgentLead = await dbService.createLead({
      name: 'Aditi Rao',
      phone: '+91 97777 88888',
      channel: 'instagram',
      productInterest: 'Standing Desk',
      message: 'Hi, need bulk price quote urgently for tomorrow delivery!',
    });
    assert(urgentLead.intentScore >= 80, 'Lead Intelligence: Assigns high intent score (>=80) for urgent inquiry');
    assert(urgentLead.followUpDraft !== undefined && urgentLead.followUpDraft.length > 20, 'Lead Intelligence: Generates automated personalized response draft');
  } catch (err) {
    assert(false, `dbService Lead tests threw error: ${err}`);
  }

  // 7. Workspaces & Tenant Isolation Test
  try {
    const workspaces = await dbService.getWorkspaces();
    assert(workspaces.length >= 3, 'Workspaces: Loads default business workspaces');
    const createdWs = await dbService.createWorkspace({
      name: 'Automated Test Lab',
      description: 'CI/CD verification workspace',
    });
    assert(createdWs.name === 'Automated Test Lab', 'Workspaces: Creates and persists new workspace');
  } catch (err) {
    assert(false, `Workspace test threw error: ${err}`);
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
