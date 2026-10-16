import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/email';
import { PaymentStatus, FulfillmentStatus } from '@/lib/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const order = db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      action,
      rejectionReason,
      dispatchNotes,
      internalNote,
      language = 'ar',
      sendEmail = true,
      customSubject,
      customMessage,
    } = body;

    const now = new Date().toISOString();
    const prevPaymentStatus = order.paymentStatus;
    const prevFulfillmentStatus = order.fulfillmentStatus;

    let newPaymentStatus: PaymentStatus = prevPaymentStatus;
    let newFulfillmentStatus: FulfillmentStatus = prevFulfillmentStatus;
    const updates: Record<string, unknown> = {};

    switch (action) {
      case 'approve_payment':
        newPaymentStatus = 'approved';
        newFulfillmentStatus = 'processing';
        updates.paymentStatus = 'approved';
        updates.fulfillmentStatus = 'processing';
        updates.rejectionReason = undefined;

        // Approve latest payment proof if present
        if (order.proofs && order.proofs.length > 0) {
          const latestProof = order.proofs[order.proofs.length - 1];
          db.updatePaymentProof(latestProof.id, {
            reviewStatus: 'approved',
            reviewerId: user.id,
            reviewTimestamp: now,
          });
        }

        // Email customer with optional custom subject and custom content
        if (sendEmail !== false) {
          await sendTransactionalEmail({
            orderId: order.id,
            recipientEmail: order.customerEmail,
            templateType: 'payment_approved',
            language,
            customSubject,
            customBody: customMessage,
            data: {
              customerName: order.customerName,
              orderId: order.id,
              productName: order.productName,
              priceFormatted: `${(order.priceCents / 100).toFixed(2)} ${order.currency}`,
            },
          });
        }
        break;

      case 'reject_payment':
        newPaymentStatus = 'rejected';
        updates.paymentStatus = 'rejected';
        updates.rejectionReason = rejectionReason || 'تعذر مطابقة إثبات الدفع مع حساب الاستلام.';

        // Reject latest payment proof
        if (order.proofs && order.proofs.length > 0) {
          const latestProof = order.proofs[order.proofs.length - 1];
          db.updatePaymentProof(latestProof.id, {
            reviewStatus: 'rejected',
            reviewerId: user.id,
            reviewTimestamp: now,
            rejectionReason: updates.rejectionReason as string,
          });
        }

        await sendTransactionalEmail({
          orderId: order.id,
          recipientEmail: order.customerEmail,
          templateType: 'payment_rejected',
          language,
          data: {
            customerName: order.customerName,
            orderId: order.id,
            productName: order.productName,
            priceFormatted: `${(order.priceCents / 100).toFixed(2)} ${order.currency}`,
            rejectionReason: updates.rejectionReason as string,
          },
        });
        break;

      case 'request_more_info':
        newPaymentStatus = 'more_info_required';
        updates.paymentStatus = 'more_info_required';
        updates.rejectionReason = rejectionReason || 'يرجى تزويدنا برقم التحويل أو لقطة شاشة أوضح.';

        await sendTransactionalEmail({
          orderId: order.id,
          recipientEmail: order.customerEmail,
          templateType: 'payment_rejected',
          language,
          data: {
            customerName: order.customerName,
            orderId: order.id,
            productName: order.productName,
            priceFormatted: `${(order.priceCents / 100).toFixed(2)} ${order.currency}`,
            rejectionReason: updates.rejectionReason as string,
          },
        });
        break;

      case 'invitation_sent':
        newFulfillmentStatus = 'invitation_sent';
        updates.fulfillmentStatus = 'invitation_sent';
        updates.invitationSentAt = now;
        updates.actualDispatchNotes = dispatchNotes || 'تم إرسال الدعوة الرسمية إلى بريد العميل.';

        if (sendEmail !== false) {
          await sendTransactionalEmail({
            orderId: order.id,
            recipientEmail: order.customerEmail,
            templateType: 'invitation_sent',
            language,
            customSubject,
            customBody: customMessage,
            data: {
              customerName: order.customerName,
              orderId: order.id,
              productName: order.productName,
              priceFormatted: `${(order.priceCents / 100).toFixed(2)} ${order.currency}`,
              dispatchNotes: updates.actualDispatchNotes as string,
            },
          });
        }
        break;

      case 'complete_order':
        newFulfillmentStatus = 'completed';
        updates.fulfillmentStatus = 'completed';
        updates.completedAt = now;

        await sendTransactionalEmail({
          orderId: order.id,
          recipientEmail: order.customerEmail,
          templateType: 'order_completed',
          language,
          data: {
            customerName: order.customerName,
            orderId: order.id,
            productName: order.productName,
            priceFormatted: `${(order.priceCents / 100).toFixed(2)} ${order.currency}`,
          },
        });
        break;

      case 'cancel_order':
        newFulfillmentStatus = 'cancelled';
        updates.fulfillmentStatus = 'cancelled';
        break;

      case 'refund_order':
        newFulfillmentStatus = 'refunded';
        updates.fulfillmentStatus = 'refunded';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
    }

    // Apply updates
    const updatedOrder = db.updateOrder(order.id, updates);

    // Record status history
    db.addStatusHistory({
      id: `hist-${crypto.randomUUID()}`,
      orderId: order.id,
      previousPaymentStatus: prevPaymentStatus,
      newPaymentStatus,
      previousFulfillmentStatus: prevFulfillmentStatus,
      newFulfillmentStatus,
      changedBy: user.fullName || user.email,
      notes: internalNote || `Action: ${action}`,
      createdAt: now,
    });

    // Optional admin internal note
    if (internalNote) {
      db.addAdminNote({
        id: `note-${crypto.randomUUID()}`,
        orderId: order.id,
        adminId: user.id,
        adminName: user.fullName || 'Admin',
        note: internalNote,
        isInternalOnly: true,
        createdAt: now,
      });
    }

    // Audit log
    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: `ORDER_${action.toUpperCase()}`,
      resourceType: 'orders',
      resourceId: order.id,
      details: {
        prevPaymentStatus,
        newPaymentStatus,
        prevFulfillmentStatus,
        newFulfillmentStatus,
        rejectionReason,
        dispatchNotes,
      },
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Admin order status update error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
