import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethod } from '@/lib/types';

export async function GET() {
  try {
    const methods = db.getPaymentMethods(false);
    return NextResponse.json({ paymentMethods: methods });
  } catch (error) {
    console.error('Admin payment methods get error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payment methods' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const paymentMethod: PaymentMethod = {
      id: body.id || `method-${crypto.randomUUID()}`,
      code: body.code || 'custom',
      nameAr: body.nameAr || 'طريقة دفع جديدة',
      nameEn: body.nameEn || 'New Payment Method',
      recipientName: body.recipientName || '',
      accountIdentifier: body.accountIdentifier || '',
      instructionsAr: body.instructionsAr || '',
      instructionsEn: body.instructionsEn || '',
      qrCodeUrl: body.qrCodeUrl || '',
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
      sortOrder: Number(body.sortOrder) || 1,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const saved = db.savePaymentMethod(paymentMethod);

    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: 'SAVE_PAYMENT_METHOD',
      resourceType: 'payment_methods',
      resourceId: saved.id,
      details: { name: saved.nameAr },
      createdAt: now,
    });

    return NextResponse.json({ success: true, paymentMethod: saved });
  } catch (error) {
    console.error('Admin save payment method error:', error);
    return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 });
  }
}
