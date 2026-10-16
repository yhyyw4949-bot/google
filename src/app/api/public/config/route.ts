import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  try {
    const product = db.getProduct();
    const paymentMethods = db.getPaymentMethods(true);
    const settings = db.getSiteSettings();
    const quota = db.getQuotaStatus();

    return NextResponse.json({
      product,
      paymentMethods,
      settings,
      quota,
    });
  } catch (error) {
    console.error('Error fetching public config:', error);
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
  }
}
