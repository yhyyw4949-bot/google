import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = db.getOrders();

    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Product Name',
      'Price (EGP)',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'Invitation Sent At',
      'Completed At',
      'Created At',
    ];

    const escapeCsv = (val?: string | number | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map((o) => [
      escapeCsv(o.id),
      escapeCsv(o.customerName),
      escapeCsv(o.customerEmail),
      escapeCsv(o.customerPhone || ''),
      escapeCsv(o.productName),
      escapeCsv((o.priceCents / 100).toFixed(2)),
      escapeCsv(o.paymentMethodName || ''),
      escapeCsv(o.paymentStatus),
      escapeCsv(o.fulfillmentStatus),
      escapeCsv(o.invitationSentAt || ''),
      escapeCsv(o.completedAt || ''),
      escapeCsv(o.createdAt),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
