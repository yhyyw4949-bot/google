'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs text-indigo-300">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? 'الوثائق القانونية والشفافية' : 'Legal & Trust'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {t('policy.terms')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'ar' ? 'آخر تحديث: 16 أكتوبر 2026' : 'Last updated: October 16, 2026'}
          </p>
        </div>

        {/* Content */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'ar' ? '1. طبيعة الخدمة والصفة القانونية' : '1. Nature of Service & Entity'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'يقدم هذا الموقع خدمة وساطة وتيسير رقمية مستقلة لتوفير دعوات تفعيل اشتراك Google AI Pro للأفراد في مصر. الموقع منصة تجارية مستقلة ولا يمثل شركة Google LLC ولا يدعي أي صفة وكالة رسمية عنها. جميع العلامات التجارية وحقوق الملكية الفكرية لمنتجات Google وGemini محفوظة لشركة Google LLC.'
                : 'This website operates as an independent third-party facilitation platform providing Google AI Pro subscription invitations to individuals in Egypt. We do not represent Google LLC and are not an authorized agent. All Google and Gemini trademarks are the property of Google LLC.'}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'ar' ? '2. المنتج المباع والأسعار' : '2. Product Offered & Pricing'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'المنتج المقدم هو دعوة تفعيل رسمية يتم توجيهها إلى البريد الإلكتروني الذي يدخله العميل أثناء الطلب. السعر المعلن هو 25 جنيهاً مصرياً للدعوة (أو السعر المحدد والمعتمد في ملخص الطلب وقت الشراء)، وهو سعر نهائي يشمل خدمة التجهيز والمتابعة.'
                : 'The product offered is an official activation invitation sent to the email provided by the customer during checkout. The confirmed price is 25 EGP per invitation (or the confirmed price at checkout).'}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'ar' ? '3. أهلية الحساب والحدود التقنية' : '3. Account Eligibility & Technical Limits'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'يجب على العميل تقديم بريد إلكتروني صالح يعمل على خدمات Google الشخصية. لا نطلب بأي حال من الأحوال كلمة مرور العميل أو رموز التحقق. تخضع مزايا الذكاء الاصطناعي (مثل Gemini Advanced وسعة التخزين وأدوات البرمجة) لسياسات Google وشروط الخدمة المعمول بها وقدرات السيرفرات في النطاق الجغرافي للعميل.'
                : 'Customers must supply a valid personal Google email. We never request account passwords or OTPs. AI features and cloud storage are governed by Google current platform policies and regional availability.'}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'ar' ? '4. التوقيت المستهدف والتسليم' : '4. Processing Target & Delivery'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'الهدف التقديري لإرسال الدعوة هو 5 دقائق بعد التحقق من استلام المبلغ في وسيلة الدفع المعنية (فودافون كاش أو إنستاباي). هذا التوقيت هو هدف عملي تقريبي يخضع لتوفر الدعوات وأوقات عمل مراجعي الدفع، ولا يمثل ضماناً زمنياً إلزامياً حتمياً.'
                : 'The target timeframe for dispatching an invitation is 5 minutes following successful payment verification in our cash or InstaPay account. This is an operational target subject to quota availability and does not constitute an absolute guarantee.'}
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === 'ar' ? '5. الدعم الفني والنزاعات' : '5. Support & Inquiries'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'يلتزم فريق العمل بتقديم الدعم الفني الكامل ومساعدة العميل حتى إتمام تفعيل الاشتراك أو استرداد أمواله في حال تعذر التفعيل وفق سياسة الاسترجاع.'
                : 'Our support team commits to helping every customer until successful invitation activation or full refund according to our Refund Policy.'}
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
