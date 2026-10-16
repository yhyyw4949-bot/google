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

    // Parse multipart form data
    const user = await getCurrentUser();
    const formData = await req.formData();
    const guestEmail = formData.get('email') as string | null;

    // Check if order allows receipt upload (not already approved or completed)
    if (order.paymentStatus === 'approved' || order.fulfillmentStatus === 'completed') {
      return NextResponse.json(
        { error: 'تم تأكيد الدفع أو اكتمال هذا الطلب بالفعل. لا حاجة لرفع إيصال جديد.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const transactionReference = formData.get('transactionReference') as string | null;
    const paymentMethodId = formData.get('paymentMethodId') as string | null;
    const language = (formData.get('language') as string) || 'ar';

    if (!file) {
      return NextResponse.json({ error: 'يرجى اختيار ملف الإيصال أولاً.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate binary content
    const validation = validateReceiptFileBuffer(buffer, file.name);
    if (!validation.isValid || !validation.mimeType || !validation.extension) {
      return NextResponse.json({ error: validation.error || 'صيغة الملف غير مدعومة.' }, { status: 400 });
    }

    // Save file to disk with fallback
    const randomName = `${crypto.randomUUID()}.${validation.extension}`;
    try {
      if (!fs.existsSync(RECEIPTS_DIR)) {
        fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
      }
      const filePath = path.join(RECEIPTS_DIR, randomName);
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn('Receipt disk write warning (base64 fallback active):', fsErr);
    }

    // Create PaymentProof record with base64 backup
    const proofId = `proof-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const proof: PaymentProof = {
      id: proofId,
      orderId: order.id,
      filePath: randomName, // Private identifier
      originalFilename: file.name,
      mimeType: validation.mimeType,
      fileSizeBytes: buffer.length,
      base64Data: buffer.toString('base64'),
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

    // Dispatch email safely without blocking receipt upload
    try {
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
    } catch (emailErr) {
      console.warn('Receipt uploaded notification email warning:', emailErr);
    }

    return NextResponse.json({
      success: true,
      proof,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    const message = error instanceof Error ? error.message : 'تعذر رفع الإيصال، يرجى المحاولة مجدداً.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
