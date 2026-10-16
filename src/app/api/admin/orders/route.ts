import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';
import { PaymentStatus, FulfillmentStatus } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const paymentStatus = url.searchParams.get('paymentStatus') as PaymentStatus | null;
    const fulfillmentStatus = url.searchParams.get('fulfillmentStatus') as FulfillmentStatus | null;

    let orders = db.getOrders({
      paymentStatus: paymentStatus || undefined,
      fulfillmentStatus: fulfillmentStatus || undefined,
    });

    if (q) {
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          (o.customerPhone && o.customerPhone.includes(q))
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
