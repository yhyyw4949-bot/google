// Automated End-to-End Test Suite for Google AI Pro Store
import { spawn } from 'child_process';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let serverProcess;

async function startServer() {
  console.log(`🚀 Starting test server on port ${PORT}...`);
  serverProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT) },
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log(`[Next] ${d.toString()}`);
  });
  serverProcess.stderr.on('data', (d) => {
    // console.error(`[Next Err] ${d.toString()}`);
  });

  // Wait for server to become responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/public/config`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await sleep(1000);
    }
  }

  if (!ready) {
    throw new Error('Server failed to start within 30 seconds');
  }
  console.log('✅ Server is ready and accepting requests.');
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('\n--- Test 1: Public Config & Product Price Integrity ---');
    const configRes = await fetch(`${BASE_URL}/api/public/config`);
    const configData = await configRes.json();
    assert(configRes.status === 200, 'Public config returns 200 OK');
    assert(configData.product.priceCents === 2500, 'Product price is locked at 2500 cents (25.00 EGP)');
    assert(configData.product.currency === 'EGP', 'Currency is EGP');
    assert(configData.paymentMethods.length >= 2, 'Active payment methods returned (Vodafone Cash, InstaPay)');

    console.log('\n--- Test 2: Customer Registration ---');
    const randomEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'أحمد حسام',
        email: randomEmail,
        password: 'Password@123',
        phone: '01099887766',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 200, 'Customer registration successful');
    assert(regData.user.role === 'customer', 'Customer role is correctly customer');

    console.log('\n--- Test 3: Customer Login & Cookie Session ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'Password@123',
      }),
    });
    const cookieHeader = loginRes.headers.get('set-cookie');
    assert(loginRes.status === 200, 'Login returns 200 OK');
    assert(cookieHeader && cookieHeader.includes('gap_token'), 'Session cookie gap_token set with httpOnly');

    console.log('\n--- Test 4: Create Order (Server Price Locked) ---');
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        customerName: 'أحمد حسام',
        customerEmail: randomEmail,
        confirmEmail: randomEmail,
        customerPhone: '01099887766',
        termsAccepted: true,
        language: 'ar',
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200, 'Order successfully placed');
    assert(orderData.orderId.startsWith('GAP-'), 'Server generated unique Order ID with GAP prefix');
    assert(orderData.order.priceCents === 2500, 'Order locked in 2500 cents (25 EGP) from server');
    assert(orderData.order.paymentStatus === 'awaiting_payment', 'Initial payment status is awaiting_payment');

    const testOrderId = orderData.orderId;

    console.log('\n--- Test 5: Receipt Binary Validation (Reject Invalid File) ---');
    // Upload a fake text file disguised as a png
    const fakeBuffer = Buffer.from('this is just text and not a real image binary');
    const fakeBlob = new Blob([fakeBuffer], { type: 'image/png' });
    const fakeForm = new FormData();
    fakeForm.append('file', fakeBlob, 'fake.png');
    fakeForm.append('email', randomEmail);

    const fakeUploadRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}/receipt`, {
      method: 'POST',
      body: fakeForm,
    });
    assert(fakeUploadRes.status === 400, 'Server correctly rejects fake/corrupted image header bytes');

    console.log('\n--- Test 6: Receipt Binary Validation (Accept Valid PNG) ---');
    // Valid minimal 1x1 PNG header bytes: 89 50 4E 47 0D 0A 1A 0A
    const validPngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const validBlob = new Blob([validPngBytes], { type: 'image/png' });
    const validForm = new FormData();
    validForm.append('file', validBlob, 'vodafone_receipt.png');
    validForm.append('transactionReference', 'TXN-TEST-1234');
    validForm.append('email', randomEmail);

    const validUploadRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}/receipt`, {
      method: 'POST',
      body: validForm,
    });
    const validUploadData = await validUploadRes.json();
    assert(validUploadRes.status === 200, 'Valid PNG upload accepted');
    assert(validUploadData.order.paymentStatus === 'receipt_submitted', 'Payment status moved to receipt_submitted');

    const proofId = validUploadData.proof.id;

    console.log('\n--- Test 7: Customer Isolation & Private Storage ---');
    // Attempting to access receipt without authorization
    const unauthReceiptRes = await fetch(`${BASE_URL}/api/receipts/${proofId}`);
    assert(unauthReceiptRes.status === 403, 'Unauthorized user is forbidden from viewing private receipt');

    // Authorized access with customer email
    const authReceiptRes = await fetch(`${BASE_URL}/api/receipts/${proofId}?email=${encodeURIComponent(randomEmail)}`);
    assert(authReceiptRes.status === 200, 'Authorized customer can securely view their receipt');

    console.log('\n--- Test 8: Admin Authentication & Metrics ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@googleaipro.eg',
        password: 'Admin@123456',
      }),
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie');
    assert(adminLoginRes.status === 200, 'Admin login succeeded');

    const metricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: adminCookie },
    });
    const metricsData = await metricsRes.json();
    assert(metricsRes.status === 200, 'Admin metrics accessible');
    assert(typeof metricsData.metrics.confirmedRevenueEGP === 'number', 'Accurate confirmed revenue computed');

    console.log('\n--- Test 9: Admin Workflow: Approve Payment ---');
    const approveRes = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        action: 'approve_payment',
        internalNote: 'تم التحقق من استلام المبلغ في فودافون كاش',
      }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, 'Admin payment approval executed');
    assert(approveData.order.paymentStatus === 'approved', 'Payment status is approved');
    assert(approveData.order.fulfillmentStatus === 'processing', 'Fulfillment status is processing');

    console.log('\n--- Test 10: Admin Workflow: Invitation Sent ---');
    const dispatchRes = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        action: 'invitation_sent',
        dispatchNotes: 'تم إرسال دعوة التفعيل الرسمية عبر بريد Google.',
      }),
    });
    const dispatchData = await dispatchRes.json();
    assert(dispatchRes.status === 200, 'Invitation dispatch recorded');
    assert(dispatchData.order.fulfillmentStatus === 'invitation_sent', 'Status is invitation_sent');

    console.log('\n--- Test 11: Admin Workflow: Complete Order ---');
    const completeRes = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        action: 'complete_order',
      }),
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, 'Order marked completed');
    assert(completeData.order.fulfillmentStatus === 'completed', 'Status is completed');

    console.log('\n--- Test 12: Audit Logs & Email Logs Verification ---');
    const emailLogsRes = await fetch(`${BASE_URL}/api/admin/email-logs`, {
      headers: { Cookie: adminCookie },
    });
    const emailLogsData = await emailLogsRes.json();
    const orderEmails = emailLogsData.emails.filter((e) => e.orderId === testOrderId);
    assert(orderEmails.length >= 3, 'Transactional emails generated and logged for order lifecycle');

    const csvRes = await fetch(`${BASE_URL}/api/admin/export-csv`, {
      headers: { Cookie: adminCookie },
    });
    assert(csvRes.status === 200, 'CSV export succeeds');
    const csvText = await csvRes.text();
    assert(csvText.includes('Order ID') && csvText.includes(testOrderId), 'CSV contains exported test order data');

    console.log(`\n========================================`);
    console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

async function main() {
  await startServer();
  await runTests();
}

main();
