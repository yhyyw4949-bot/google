import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = db.deletePaymentMethod(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: 'DELETE_PAYMENT_METHOD',
      resourceType: 'payment_methods',
      resourceId: id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}
