import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const allOrders = db.getOrders();
    const now = Date.now();

    // Accurate revenue calculations: Only approved or completed orders, subtract refunded
    let confirmedRevenueCents = 0;
    allOrders.forEach((o) => {
      if (o.paymentStatus === 'approved') {
        if (o.fulfillmentStatus === 'refunded') {
          // Exclude refunded
        } else {
          confirmedRevenueCents += o.priceCents;
        }
      }
    });

    const totalOrders = allOrders.length;
    const awaitingPayment = allOrders.filter((o) => o.paymentStatus === 'awaiting_payment').length;
    const receiptsUnderReview = allOrders.filter(
      (o) => o.paymentStatus === 'receipt_submitted' || o.paymentStatus === 'under_review'
    ).length;
    const approvedPayments = allOrders.filter((o) => o.paymentStatus === 'approved').length;
    const invitationsAwaitingProcessing = allOrders.filter(
      (o) => o.paymentStatus === 'approved' && (o.fulfillmentStatus === 'pending' || o.fulfillmentStatus === 'processing')
    ).length;
    const completedOrders = allOrders.filter((o) => o.fulfillmentStatus === 'completed').length;
    const cancelledOrders = allOrders.filter((o) => o.fulfillmentStatus === 'cancelled').length;
    const refundedOrders = allOrders.filter((o) => o.fulfillmentStatus === 'refunded').length;

    // Delayed orders (> 5 minutes since order creation or payment approval and still not invitation sent)
    const delayedOrders = allOrders.filter((o) => {
      if (o.paymentStatus === 'approved' && o.fulfillmentStatus === 'processing') {
        const historyApproval = o.history?.find((h) => h.newPaymentStatus === 'approved');
        const approvalTime = historyApproval ? new Date(historyApproval.createdAt).getTime() : new Date(o.createdAt).getTime();
        return now - approvalTime > 5 * 60 * 1000;
      }
      return false;
    });

    // Recent activity feed
    const auditLogs = db.getAuditLogs(15);

    // Simple 7-day orders trend
    const last7Days: Record<string, { date: string; count: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      last7Days[dateKey] = { date: dateKey, count: 0, revenue: 0 };
    }

    allOrders.forEach((o) => {
      const day = o.createdAt.slice(0, 10);
      if (last7Days[day]) {
        last7Days[day].count += 1;
        if (o.paymentStatus === 'approved' && o.fulfillmentStatus !== 'refunded') {
          last7Days[day].revenue += o.priceCents / 100;
        }
      }
    });

    return NextResponse.json({
      metrics: {
        confirmedRevenueCents,
        confirmedRevenueEGP: confirmedRevenueCents / 100,
        totalOrders,
        awaitingPayment,
        receiptsUnderReview,
        approvedPayments,
        invitationsAwaitingProcessing,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        delayedOrdersCount: delayedOrders.length,
      },
      quota: db.getQuotaStatus(),
      delayedOrders,
      activityFeed: auditLogs,
      chartData: Object.values(last7Days),
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to compute admin metrics' }, { status: 500 });
  }
}
