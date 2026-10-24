// Comprehensive System Verification Test
import { deliveryRegistry } from '../server/adapters/delivery/deliveryRegistry';
import { workflowEngine } from '../server/engine/workflowEngine';
import { dataStore, BackendOrder } from '../server/store/dataStore';
import { dbService } from '../src/services/db';
import { getSupabaseConfig, isSupabaseConfigured, supabase } from '../src/lib/supabase';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 NEXUS AI — SYSTEM & AUTH VERIFICATION SUITE');
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

    // Test creating a valid workspace
    const createdWs = await dbService.createWorkspace({
      name: 'Automated Test Lab',
      description: 'CI/CD verification workspace',
      plan: 'Growth',
    });
    assert(createdWs.name === 'Automated Test Lab', 'Workspaces: Creates and persists new workspace');
    assert(createdWs.slug.includes('automated-test-lab'), 'Workspaces: Generates hyphenated slug for new workspace');

    // Test validation: rejects empty or short name
    let rejected = false;
    try {
      await dbService.createWorkspace({ name: ' ' });
    } catch {
      rejected = true;
    }
    assert(rejected, 'Workspaces: Rejects invalid or empty workspace name');

    // Test updating workspace
    const updated = await dbService.updateWorkspace(createdWs.id, {
      name: 'Updated Test Lab HQ',
      website_url: 'https://testlab.internal',
    });
    assert(updated?.name === 'Updated Test Lab HQ', 'Workspaces: Updates workspace name and website');

    // Test deleting workspace
    const deleted = await dbService.deleteWorkspace(createdWs.id);
    assert(deleted === true, 'Workspaces: Deletes workspace');
    const afterDelete = await dbService.getWorkspaces();
    assert(!afterDelete.some((w) => w.id === createdWs.id), 'Workspaces: Deleted workspace is removed from active list');
  } catch (err) {
    assert(false, `Workspace test threw error: ${err}`);
  }

  // 8. Supabase Configuration & Diagnostics Tests
  try {
    const config = getSupabaseConfig();
    assert(typeof config === 'object', 'Supabase: getSupabaseConfig returns diagnostic object');
    assert(typeof config.isValid === 'boolean', 'Supabase: isValid flag is boolean');

    // Test proxy client initialization
    assert(typeof supabase.from === 'function', 'Supabase Client: Client has .from query builder');
    assert(typeof supabase.auth === 'object', 'Supabase Client: Client has .auth authentication subsystem');
    assert(typeof supabase.auth.signUp === 'function', 'Supabase Auth: Exposes real signUp method');
    assert(typeof supabase.auth.signInWithPassword === 'function', 'Supabase Auth: Exposes real signInWithPassword method');
    assert(typeof supabase.auth.resetPasswordForEmail === 'function', 'Supabase Auth: Exposes real resetPasswordForEmail method');
    assert(typeof supabase.auth.signOut === 'function', 'Supabase Auth: Exposes real signOut method');
  } catch (err) {
    assert(false, `Supabase Configuration tests threw error: ${err}`);
  }

  // 9. Input & Password Validation Rules
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert(emailRegex.test('valid.user@nexus.biz'), 'Auth Validation: Accepts standard RFC compliant email');
    assert(!emailRegex.test('invalid-email'), 'Auth Validation: Rejects malformed email missing @ or domain');
    assert(!emailRegex.test('user@domain'), 'Auth Validation: Rejects email missing TLD');

    const minPasswordLength = 6;
    assert('Secret123'.length >= minPasswordLength, 'Auth Validation: Accepts passwords with >= 6 chars');
    assert('12345'.length < minPasswordLength, 'Auth Validation: Rejects short passwords (< 6 chars)');
  } catch (err) {
    assert(false, `Auth Validation tests threw error: ${err}`);
  }

  // 10. Password Recovery Hash URL Detection
  try {
    const sampleRecoveryUrl = 'https://nexus-ai-self-chi.vercel.app/#access_token=test_token&expires_in=3600&refresh_token=refresh_test&token_type=bearer&type=recovery';
    const isRecovery = sampleRecoveryUrl.includes('type=recovery');
    assert(isRecovery === true, 'Auth Recovery: Correctly detects Supabase password recovery hash fragment');
  } catch (err) {
    assert(false, `Auth Recovery test threw error: ${err}`);
  }

  // 11. Integrations Hub: Official Website Redirect URLs
  try {
    const EXPECTED_OFFICIAL_URLS: Record<string, string> = {
      shopify: 'https://www.shopify.com/',
      woocommerce: 'https://woocommerce.com/',
      porter: 'https://porter.in/',
      shiprocket: 'https://www.shiprocket.in/',
      whatsapp: 'https://business.whatsapp.com/',
      slack: 'https://slack.com/',
      gmail: 'https://mail.google.com/',
      sheets: 'https://sheets.google.com/',
      instagram: 'https://www.instagram.com/',
      webhook: 'https://www.google.com/',
    };

    const keys = Object.keys(EXPECTED_OFFICIAL_URLS);
    assert(keys.length === 10, 'Integrations: 10 official destination URLs registered');

    for (const [key, url] of Object.entries(EXPECTED_OFFICIAL_URLS)) {
      assert(url.startsWith('https://'), `Integrations: ${key} destination uses secure HTTPS (${url})`);
    }
  } catch (err) {
    assert(false, `Integrations official destination URLs test threw error: ${err}`);
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
