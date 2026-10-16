import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, generateOrderId } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';
import { Order } from '@/lib/types';
import { sendTransactionalEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      confirmEmail,
      customerPhone,
      paymentMethodId,
      termsAccepted,
      language = 'ar',
    } = body;

    // 1. Validation
    if (!customerName || !customerEmail || !confirmEmail) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }

    if (customerEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Email addresses do not match.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ error: 'You must accept the terms and policies to proceed.' }, { status: 400 });
    }

    // 2. Fetch server-side product config to lock in price
    const product = db.getProduct();
    if (!product.isAvailable) {
      return NextResponse.json({ error: 'This product is currently unavailable for new orders.' }, { status: 400 });
    }

    // Enforce 5 orders batch limit
    const quota = db.getQuotaStatus();
    if (quota.isSoldOut) {
      return NextResponse.json(
        {
          error:
            language === 'ar'
              ? 'عذراً، نفدت الكمية المتاحة لهذه الدفعة (5 طلبات فقط). يرجى الانتظار لحين فتح الحصة الجديدة.'
              : 'Sorry, this batch is sold out (5 orders limit reached). Please check back when a new batch opens.',
        },
        { status: 400 }
      );
    }

    // 3. Optional payment method verification
    let paymentMethodName = '';
    if (paymentMethodId) {
      const method = db.getPaymentMethodById(paymentMethodId);
      if (method && method.isEnabled) {
        paymentMethodName = language === 'ar' ? method.nameAr : method.nameEn;
      }
    }

    // 4. Generate order
    const now = new Date().toISOString();
    const orderId = generateOrderId();

    const order: Order = {
      id: orderId,
      customerId: user ? user.id : undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      productId: product.id,
      productName: language === 'ar' ? product.titleAr : product.titleEn,
      priceCents: product.priceCents, // Locked-in server price
      currency: product.currency,
      paymentMethodId,
      paymentMethodName,
      paymentStatus: 'awaiting_payment',
      fulfillmentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    db.createOrder(order);

    // 5. Initial status history
    db.addStatusHistory({
      id: `hist-${crypto.randomUUID()}`,
      orderId: order.id,
      previousPaymentStatus: 'awaiting_payment',
      newPaymentStatus: 'awaiting_payment',
      previousFulfillmentStatus: 'pending',
      newFulfillmentStatus: 'pending',
      changedBy: 'customer',
      notes: language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order successfully placed',
      createdAt: now,
    });

    // 6. Audit log
    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userEmail: customerEmail.trim(),
      action: 'CREATE_ORDER',
      resourceType: 'orders',
      resourceId: order.id,
      details: { priceCents: order.priceCents, currency: order.currency },
      createdAt: now,
    });

    // 7. Dispatch order confirmation email
    const priceFormatted = `${(order.priceCents / 100).toFixed(2)} ${order.currency}`;
    await sendTransactionalEmail({
      orderId: order.id,
      recipientEmail: order.customerEmail,
      templateType: 'order_created',
      language: language === 'ar' ? 'ar' : 'en',
      data: {
        customerName: order.customerName,
        orderId: order.id,
        productName: order.productName,
        priceFormatted,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
