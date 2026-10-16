import { db } from '../src/lib/db/store.ts';
import { sendTransactionalEmail } from '../src/lib/email.ts';

console.log('--- TEST 1: Initial Quota Status ---');
const q1 = db.getQuotaStatus();
console.log('Current Quota:', {
  maxQuota: q1.maxQuota,
  activeOrdersCount: q1.activeOrdersCount,
  remainingSlots: q1.remainingSlots,
  batchNumber: q1.batchNumber,
  isSoldOut: q1.isSoldOut,
});

console.log('\n--- TEST 2: Restock Batch ---');
const restocked = db.restockBatch(5);
console.log('Restocked Quota:', {
  maxQuota: restocked.quota.maxQuota,
  activeOrdersCount: restocked.quota.activeOrdersCount,
  remainingSlots: restocked.quota.remainingSlots,
  batchNumber: restocked.quota.batchNumber,
  isSoldOut: restocked.quota.isSoldOut,
  batchResetTimestamp: restocked.quota.batchResetTimestamp,
});

if (restocked.quota.activeOrdersCount !== 0) {
  console.error('FAILED: Active orders in new batch should be 0!');
  process.exit(1);
}
if (restocked.quota.remainingSlots !== 5) {
  console.error('FAILED: Remaining slots should be 5!');
  process.exit(1);
}

console.log('\n--- TEST 3: Custom Email Dispatch on Approval ---');
const customSubject = 'تهانينا أحمد! تم اعتماد دفعتك لاشتراك Google AI Pro بنجاح';
const customBody = 'مرحباً أحمد،\nيسعدنا إبلاغك بأن تحويل فودافون كاش قد تم التحقق منه بنجاح.\nجاري الآن ربط حسابك بالخطة الاحترافية وإرسال الدعوة خلال دقائق معدودة.';

const sentEmail = await sendTransactionalEmail({
  orderId: 'GAP-TEST-2026',
  recipientEmail: 'customer-test@example.com',
  templateType: 'payment_approved',
  language: 'ar',
  customSubject,
  customBody,
  data: {
    customerName: 'أحمد محمود',
    orderId: 'GAP-TEST-2026',
    productName: 'Google AI Pro',
    priceFormatted: '25.00 EGP',
  },
});

console.log('Email Sent Record:');
console.log('ID:', sentEmail.id);
console.log('Subject:', sentEmail.subject);
console.log('Recipient:', sentEmail.recipientEmail);
console.log('Contains custom text in HTML:', sentEmail.bodyHtml.includes('يسعدنا إبلاغك بأن تحويل فودافون كاش'));

if (sentEmail.subject !== customSubject) {
  console.error('FAILED: Custom subject was not applied!');
  process.exit(1);
}
if (!sentEmail.bodyHtml.includes('تحويل فودافون كاش')) {
  console.error('FAILED: Custom body was not included in HTML!');
  process.exit(1);
}

console.log('\n ALL TESTS PASSED SUCCESSFULLY! ✅');
