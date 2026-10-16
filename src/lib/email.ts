import crypto from 'crypto';
import { db } from './db/store';
import { EmailNotification } from './types';

interface SendEmailParams {
  orderId: string;
  recipientEmail: string;
  templateType: EmailNotification['templateType'];
  language: 'ar' | 'en';
  data: {
    customerName: string;
    orderId: string;
    productName: string;
    priceFormatted: string;
    rejectionReason?: string;
    dispatchNotes?: string;
  };
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<EmailNotification> {
  const { orderId, recipientEmail, templateType, language, data } = params;
  const isAr = language === 'ar';
  const settings = db.getSiteSettings();
  const brandName = isAr ? settings.brandNameAr : settings.brandNameEn;

  let subject = '';
  let contentHtml = '';

  switch (templateType) {
    case 'order_created':
      subject = isAr
        ? `تم إنشاء طلبك بنجاح (${data.orderId}) - ${brandName}`
        : `Order Confirmed (${data.orderId}) - ${brandName}`;
      contentHtml = isAr
        ? `
          <h2 style="color: #6366f1;">مرحباً ${data.customerName}،</h2>
          <p>شكراً لطلبك اشتراك <strong>${data.productName}</strong>.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0;"><strong>رقم الطلب:</strong> <span style="color: #38bdf8;">${data.orderId}</span></p>
            <p style="margin: 4px 0;"><strong>المبلغ المستحق:</strong> ${data.priceFormatted}</p>
          </div>
          <p><strong>الخطوة التالية:</strong> يرجى تحويل المبلغ المطلوب إلى إحدى وسائل الدفع المتاحة ثم رفع إثبات التحويل (سكرين شوت أو إيصال) من خلال صفحة تتبع الطلب.</p>
          <p style="color: #94a3b8; font-size: 13px;">هدف المعالجة التقديري هو 5 دقائق بعد التحقق من الدفع، رهن التوافر.</p>
        `
        : `
          <h2 style="color: #6366f1;">Hello ${data.customerName},</h2>
          <p>Thank you for ordering your <strong>${data.productName}</strong> subscription.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0;"><strong>Order ID:</strong> <span style="color: #38bdf8;">${data.orderId}</span></p>
            <p style="margin: 4px 0;"><strong>Amount Due:</strong> ${data.priceFormatted}</p>
          </div>
          <p><strong>Next Step:</strong> Please transfer the payment using one of the available options and upload your receipt on the order tracking page.</p>
          <p style="color: #94a3b8; font-size: 13px;">Target processing time is 5 minutes following payment verification, subject to availability.</p>
        `;
      break;

    case 'receipt_uploaded':
      subject = isAr
        ? `تم استلام إثبات الدفع لطلبك (${data.orderId})`
        : `Payment Receipt Received for Order (${data.orderId})`;
      contentHtml = isAr
        ? `
          <h2 style="color: #6366f1;">مرحباً ${data.customerName}،</h2>
          <p>لقد استلمنا إثبات الدفع لطلبك رقم <strong>${data.orderId}</strong>.</p>
          <p>يقوم فريق العمل الآن بمراجعة الإيصال ومطابقته مع الحساب. سنقوم بإشعارك فور اكتمال المراجعة.</p>
        `
        : `
          <h2 style="color: #6366f1;">Hello ${data.customerName},</h2>
          <p>We have successfully received your payment receipt for Order <strong>${data.orderId}</strong>.</p>
          <p>Our team is verifying the transaction details. You will receive another notification once reviewed.</p>
        `;
      break;

    case 'payment_approved':
      subject = isAr
        ? `تم تأكيد دفع طلبك بنجاح (${data.orderId}) - جاري تجهيز الدعوة`
        : `Payment Approved (${data.orderId}) - Invitation Processing`;
      contentHtml = isAr
        ? `
          <h2 style="color: #22c55e;">تم تأكيد استلام دفعتك بنجاح!</h2>
          <p>عزيزي ${data.customerName}، تم التحقق من صحة التحويل لطلبك <strong>${data.orderId}</strong> بنجاح.</p>
          <p>بدأ فريق العمل في معالجة وإعداد دعوة تفعيل Google AI Pro الخاصة بك. نهدف إلى إرسالها خلال 5 دقائق رهن توافر الخدمة.</p>
        `
        : `
          <h2 style="color: #22c55e;">Payment Verified Successfully!</h2>
          <p>Dear ${data.customerName}, your payment for Order <strong>${data.orderId}</strong> has been approved.</p>
          <p>Our team has commenced processing your Google AI Pro activation invitation. We aim to dispatch it within 5 minutes subject to availability.</p>
        `;
      break;

    case 'payment_rejected':
      subject = isAr
        ? `تنبيه بشأن دفع طلبك (${data.orderId})`
        : `Notice regarding Payment for Order (${data.orderId})`;
      contentHtml = isAr
        ? `
          <h2 style="color: #ef4444;">تنبيه بشأن إثبات الدفع</h2>
          <p>عزيزي ${data.customerName}، لم نتمكن من مطابقة إثبات الدفع المقدم لطلبك <strong>${data.orderId}</strong>.</p>
          <div style="background: #3b1313; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 4px;">
            <strong>السبب الموضح من الإدارة:</strong> ${data.rejectionReason || 'تعذر مطابقة المبلغ أو رقم العملية.'}
          </div>
          <p>يرجى الدخول إلى صفحة طلبك ورفع إيصال واضح وصحيح أو التواصل مع الدعم الفني.</p>
        `
        : `
          <h2 style="color: #ef4444;">Payment Verification Notice</h2>
          <p>Dear ${data.customerName}, we could not verify the payment proof for Order <strong>${data.orderId}</strong>.</p>
          <div style="background: #3b1313; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 4px;">
            <strong>Reason:</strong> ${data.rejectionReason || 'Unable to reconcile payment or transaction reference.'}
          </div>
          <p>Please visit your order page to upload a valid receipt or reach out to our support team.</p>
        `;
      break;

    case 'invitation_sent':
      subject = isAr
        ? `تم إرسال دعوة Google AI Pro الخاصة بك! (${data.orderId})`
        : `Your Google AI Pro Invitation Has Been Sent! (${data.orderId})`;
      contentHtml = isAr
        ? `
          <h2 style="color: #8b5cf6;">تهانينا! تم إرسال دعوتك الرسمية</h2>
          <p>عزيزي ${data.customerName}، يسعدنا إبلاغك بأنه تم إرسال دعوة تفعيل اشتراك <strong>Google AI Pro</strong> إلى بريدك الإلكتروني.</p>
          ${data.dispatchNotes ? `<p style="background: #1e293b; padding: 10px; border-radius: 6px;"><strong>ملاحظات التفعيل:</strong> ${data.dispatchNotes}</p>` : ''}
          <p>يرجى تفقد صندوق الوارد، وكذلك مجلد الرسائل الترويجية (Promotions) أو غير المرغوب فيها (Spam) للقبول والتفعيل.</p>
          <p style="color: #94a3b8; font-size: 13px;">تنبيه: إرسال هذا الإشعار لا يعوض التحقق الفعلي من استلام الدعوة في صندوق بريد Google الخاص بك.</p>
        `
        : `
          <h2 style="color: #8b5cf6;">Congratulations! Your Invitation is Sent</h2>
          <p>Dear ${data.customerName}, your official invitation for <strong>Google AI Pro</strong> has been dispatched to your email address.</p>
          ${data.dispatchNotes ? `<p style="background: #1e293b; padding: 10px; border-radius: 6px;"><strong>Activation Notes:</strong> ${data.dispatchNotes}</p>` : ''}
          <p>Please check your inbox as well as Promotions or Spam folders to accept and activate.</p>
          <p style="color: #94a3b8; font-size: 13px;">Notice: Notification dispatch status is distinct from delivery within your Google account mailbox.</p>
        `;
      break;

    case 'order_completed':
      subject = isAr
        ? `تم إكمال طلبك بنجاح (${data.orderId}) - نتمنى لك تجربة ممتعة`
        : `Order Completed (${data.orderId}) - Enjoy Your AI Tools`;
      contentHtml = isAr
        ? `
          <h2 style="color: #22c55e;">اكتمل طلبك بنجاح!</h2>
          <p>عزيزي ${data.customerName}، تم إتمام طلبك رقم <strong>${data.orderId}</strong> بنجاح تام.</p>
          <p>نتمنى لك تجربة مثمرة مع أدوات Google AI Pro المتقدمة في الدراسة والعمل والإبداع.</p>
        `
        : `
          <h2 style="color: #22c55e;">Order Completed!</h2>
          <p>Dear ${data.customerName}, your Order <strong>${data.orderId}</strong> has been successfully finalized.</p>
          <p>We hope you enjoy using Google AI Pro advanced capabilities for your learning, work, and productivity.</p>
        `;
      break;

    default:
      subject = `تحديث بخصوص طلبك (${data.orderId})`;
      contentHtml = `<p>يوجد تحديث جديد على طلبك رقم ${data.orderId}.</p>`;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="${language}" dir="${isAr ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070913; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; padding: 32px; }
        .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .footer { margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body dir="${isAr ? 'rtl' : 'ltr'}">
      <div class="container">
        <div class="header">
          <div class="brand">${brandName}</div>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          <p>${brandName} - ${settings.contactEmail} | ${settings.supportPhone}</p>
          <p style="font-size: 11px;">${isAr ? 'خدمة مستقلة غير تابعة رسمياً لشركة Google LLC.' : 'Independent third-party service not affiliated with Google LLC.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const notification: EmailNotification = {
    id: `email-${crypto.randomUUID()}`,
    orderId,
    recipientEmail,
    templateType,
    language,
    subject,
    bodyHtml: emailHtml,
    status: 'sent',
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Optional live dispatch via Resend if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Google AI Pro Store <notifications@googleaipro.eg>',
          to: recipientEmail,
          subject,
          html: emailHtml,
        }),
      });
    } catch (err: unknown) {
      console.warn('Resend live dispatch warning (fallback recorded to db):', err);
    }
  }

  db.addEmailNotification(notification);
  return notification;
}
