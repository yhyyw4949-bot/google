import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const profiles = db.getAllProfiles();
    const orders = db.getOrders();

    // Attach order count to each customer
    const customersWithStats = profiles.map((p) => {
      const userOrders = orders.filter((o) => o.customerEmail.toLowerCase() === p.email.toLowerCase());
      return {
        ...p,
        ordersCount: userOrders.length,
        totalSpentEGP: userOrders
          .filter((o) => o.paymentStatus === 'approved' && o.fulfillmentStatus !== 'refunded')
          .reduce((sum, o) => sum + o.priceCents / 100, 0),
      };
    });

    return NextResponse.json({ customers: customersWithStats });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Failed to retrieve customers' }, { status: 500 });
  }
}
