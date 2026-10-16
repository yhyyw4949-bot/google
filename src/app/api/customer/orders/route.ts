import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = db.getOrders({
      customerEmail: user.email,
    });

    const metrics = {
      total: orders.length,
      active: orders.filter((o) => o.fulfillmentStatus !== 'completed' && o.fulfillmentStatus !== 'cancelled').length,
      awaitingPayment: orders.filter((o) => o.paymentStatus === 'awaiting_payment').length,
      underReview: orders.filter((o) => o.paymentStatus === 'receipt_submitted' || o.paymentStatus === 'under_review').length,
      completed: orders.filter((o) => o.fulfillmentStatus === 'completed').length,
    };

    return NextResponse.json({ orders, metrics });
  } catch (error) {
    console.error('Customer orders error:', error);
    return NextResponse.json({ error: 'Failed to retrieve customer orders' }, { status: 500 });
  }
}
