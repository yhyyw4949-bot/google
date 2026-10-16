import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Order ID and email are required.' }, { status: 400 });
    }

    const order = db.getOrderById(orderId.trim());

    if (!order || order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'No order found matching this Order ID and email combination.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ error: 'Failed to search order' }, { status: 500 });
  }
}
