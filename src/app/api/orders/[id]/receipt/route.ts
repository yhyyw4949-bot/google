import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';
import { validateReceiptFileBuffer } from '@/lib/file-validator';
import { PaymentProof } from '@/lib/types';
import { sendTransactionalEmail } from '@/lib/email';

const RECEIPTS_DIR = path.join(process.cwd(), 'data', 'receipts');

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Permission check
    const user = await getCurrentUser();
    const formData = await req.formData();
    const guestEmail = formData.get('email') as string | null;

    const isAdmin = user?.role === 'admin';
    const isOwner = user && user.id === order.customerId;
    const isEmailMatched =
      (user && user.email.toLowerCase() === order.customerEmail.toLowerCase()) ||
      (guestEmail && guestEmail.trim().toLowerCase() === order.customerEmail.toLowerCase());

    if (!isAdmin && !isOwner && !isEmailMatched) {
      return NextResponse.json({ error: 'Unauthorized to upload receipt for this order.' }, { status: 403 });
    }

    // Check if order allows receipt upload
    if (order.paymentStatus === 'approved' || order.fulfillmentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payment is already approved or order is completed. No receipt replacement needed.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const transactionReference = formData.get('transactionReference') as string | null;
    const paymentMethodId = formData.get('paymentMethodId') as string | null;
    const language = (formData.get('language') as string) || 'ar';

    if (!file) {
      return NextResponse.json({ error: 'Please choose a receipt file to upload.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate binary content
    const validation = validateReceiptFileBuffer(buffer, file.name);
    if (!validation.isValid || !validation.mimeType || !validation.extension) {
      return NextResponse.json({ error: validation.error || 'Invalid file format.' }, { status: 400 });
    }

    // Ensure receipts directory exists
    if (!fs.existsSync(RECEIPTS_DIR)) {
      fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
    }

    // Generate randomized private filename
    const randomName = `${crypto.randomUUID()}.${validation.extension}`;
    const filePath = path.join(RECEIPTS_DIR, randomName);
    fs.writeFileSync(filePath, buffer);

    // Create PaymentProof record
    const proofId = `proof-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const proof: PaymentProof = {
      id: proofId,
      orderId: order.id,
      filePath: randomName, // Private identifier
      originalFilename: file.name,
      mimeType: validation.mimeType,
      fileSizeBytes: buffer.length,
      transactionReference: transactionReference?.trim() || undefined,
      reviewStatus: 'pending',
      createdAt: now,
    };

    db.addPaymentProof(proof);

    // Update order status to receipt_submitted
    const prevPaymentStatus = order.paymentStatus;
    const updates: {
      paymentStatus: 'receipt_submitted';
      paymentMethodId?: string;
      paymentMethodName?: string;
    } = {
      paymentStatus: 'receipt_submitted',
    };

    if (paymentMethodId) {
      const method = db.getPaymentMethodById(paymentMethodId);
      if (method) {
        updates.paymentMethodId = method.id;
        updates.paymentMethodName = language === 'ar' ? method.nameAr : method.nameEn;
      }
    }

    const updatedOrder = db.updateOrder(order.id, updates);

    // Record status history
    db.addStatusHistory({
      id: `hist-${crypto.randomUUID()}`,
      orderId: order.id,
      previousPaymentStatus: prevPaymentStatus,
      newPaymentStatus: 'receipt_submitted',
      previousFulfillmentStatus: order.fulfillmentStatus,
      newFulfillmentStatus: order.fulfillmentStatus,
      changedBy: user ? user.fullName : order.customerName,
      notes: language === 'ar' ? 'تم رفع إثبات الدفع للمراجعة' : 'Payment receipt uploaded for review',
      createdAt: now,
    });

    // Audit log
    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userEmail: order.customerEmail,
      action: 'UPLOAD_RECEIPT',
      resourceType: 'payment_proofs',
      resourceId: proofId,
      details: {
        orderId: order.id,
        fileSize: buffer.length,
        mimeType: validation.mimeType,
        txRef: transactionReference,
      },
      createdAt: now,
    });

    // Dispatch email
    const priceFormatted = `${(order.priceCents / 100).toFixed(2)} ${order.currency}`;
    await sendTransactionalEmail({
      orderId: order.id,
      recipientEmail: order.customerEmail,
      templateType: 'receipt_uploaded',
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
      proof,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}
