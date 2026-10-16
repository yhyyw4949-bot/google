import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const quota = db.getQuotaStatus();
    const product = db.getProduct();

    return NextResponse.json({
      success: true,
      quota,
      product,
    });
  } catch (error) {
    console.error('Error fetching admin stock status:', error);
    return NextResponse.json({ error: 'Failed to retrieve stock status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action = 'restock', newQuota } = body;

    const parsedQuota = newQuota ? Number(newQuota) : undefined;
    if (parsedQuota !== undefined && (isNaN(parsedQuota) || parsedQuota <= 0)) {
      return NextResponse.json({ error: 'Invalid quota amount. Must be a positive integer.' }, { status: 400 });
    }

    if (action === 'restock') {
      const result = db.restockBatch(parsedQuota);

      db.addAuditLog({
        id: `audit-${crypto.randomUUID()}`,
        userId: user.id,
        userEmail: user.email,
        action: 'RESTOCK_BATCH',
        resourceType: 'stock',
        resourceId: result.product.id,
        details: {
          batchNumber: result.quota.batchNumber,
          batchResetTimestamp: result.quota.batchResetTimestamp,
          maxQuota: result.quota.maxQuota,
        },
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'تم تجديد الحصة وفتح دفعة طلبات جديدة بنجاح!',
        quota: result.quota,
        product: result.product,
      });
    }

    if (action === 'update_quota') {
      if (!parsedQuota) {
        return NextResponse.json({ error: 'Quota value is required.' }, { status: 400 });
      }

      const updated = db.updateProduct({ maxQuota: parsedQuota });
      const currentQuota = db.getQuotaStatus();

      db.addAuditLog({
        id: `audit-${crypto.randomUUID()}`,
        userId: user.id,
        userEmail: user.email,
        action: 'UPDATE_QUOTA_LIMIT',
        resourceType: 'stock',
        resourceId: updated.id,
        details: { maxQuota: parsedQuota },
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'تم تحديث سقف الحصة بنجاح!',
        quota: currentQuota,
        product: updated,
      });
    }

    return NextResponse.json({ error: 'Unknown stock action.' }, { status: 400 });
  } catch (error) {
    console.error('Admin stock action error:', error);
    return NextResponse.json({ error: 'Failed to process stock action.' }, { status: 500 });
  }
}
