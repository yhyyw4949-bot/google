import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const user = await getCurrentUser();
    const url = new URL(req.url);
    const guestEmail = url.searchParams.get('email');

    // Security check: must be admin OR match customerId OR match customerEmail
    const isAdmin = user?.role === 'admin';
    const isOwner = user && user.id === order.customerId;
    const isEmailMatched =
      (user && user.email.toLowerCase() === order.customerEmail.toLowerCase()) ||
      (guestEmail && guestEmail.trim().toLowerCase() === order.customerEmail.toLowerCase());

    if (!isAdmin && !isOwner && !isEmailMatched) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}
