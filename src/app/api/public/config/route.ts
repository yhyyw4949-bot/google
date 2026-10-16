import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db/store';

export async function GET(req: Request) {
  await headers();
  try {
    const product = db.getProduct();
    const paymentMethods = db.getPaymentMethods(true);
    const settings = db.getSiteSettings();
    const quota = db.getQuotaStatus();

    return NextResponse.json(
      {
        product,
        paymentMethods,
        settings,
        quota,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public config:', error);
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
  }
}
