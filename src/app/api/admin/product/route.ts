import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const product = db.getProduct();
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin product get error:', error);
    return NextResponse.json({ error: 'Failed to retrieve product config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates = await req.json();

    // Ensure priceCents is integer
    if (updates.priceEGP !== undefined) {
      updates.priceCents = Math.round(Number(updates.priceEGP) * 100);
      delete updates.priceEGP;
    }

    const updatedProduct = db.updateProduct(updates);

    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: 'UPDATE_PRODUCT_SETTINGS',
      resourceType: 'products',
      resourceId: updatedProduct.id,
      details: updates,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json({ error: 'Failed to update product config' }, { status: 500 });
  }
}
