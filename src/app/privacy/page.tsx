'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lock, ShieldCheck, EyeOff, Server, FileCheck } from 'lucide-react';

export default function PrivacyPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs text-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'حماية بياناتك أولويتنا' : 'Data Protection & Security'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {t('policy.privacy')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'ar' ? 'كيف نتعامل مع بياناتك وإيصالات الدفع الخاصة بك بأمان' : 'How we securely handle your order details and payment proofs'}
          </p>
        </div>

        {/* Content */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? '1. ما هي البيانات التي لا نطلبها مطلقاً؟' : '1. Data We Never Collect'}</span>
            </h2>
            <p className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-200">
              {language === 'ar'
                ? 'نؤكد بشكل قاطع: لا نطلب مطلقاً كلمة مرور بريدك الإلكتروني، ولا رموز المصادقة الثنائية (OTP)، ولا بطاقات الائتمان البنكية أو رموز CVV. التفعيل يتم حصرياً عبر دعوة Google الرسمية المستقلة.'
                : 'We strictly state: We NEVER request your email password, two-factor authentication codes (OTP), or credit card PIN/CVV. Activation is processed solely via an independent Google invitation.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              <span>{language === 'ar' ? '2. البيانات التي يتم جمعها وكيفية استخدامها' : '2. Data Collected & How We Use It'}</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 ps-2 text-slate-300">
              <li>
                <strong>{language === 'ar' ? 'الاسم والبريد الإلكتروني:' : 'Name & Email:'}</strong>{' '}
                {language === 'ar' ? 'لإرسال دعوة التفعيل الرسمية وإشعارات حالة الطلب.' : 'Used to send your activation invitation and status notifications.'}
              </li>
              <li>
                <strong>{language === 'ar' ? 'رقم الهاتف (اختياري):' : 'Phone Number (Optional):'}</strong>{' '}
                {language === 'ar' ? 'للتواصل الفوري عبر واتساب في حالة الحاجة لاستيضاح بشأن التحويل.' : 'Used for WhatsApp contact if transaction clarification is required.'}
              </li>
              <li>
                <strong>{language === 'ar' ? 'إيصالات الدفع المحملة:' : 'Uploaded Payment Receipts:'}</strong>{' '}
                {language === 'ar' ? 'تُستخدم حصراً للتحقق من استلام المبلغ في فودافون كاش أو إنستاباي.' : 'Used strictly to reconcile cash transfer into our accounts.'}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>{language === 'ar' ? '3. التخزين الخاص وحماية الإيصالات' : '3. Private File Storage & Access Isolation'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'يتم تخزين إيصالات الدفع في حاويات تخزين مشفرة بأسماء عشوائية (UUID) معزولة تماماً عن الوصول العام. لا يمكن لأي عميل آخر أو جهة خارجية استعراض ملفاتك أو معلوماتك المالية، ويقتصر الوصول على مسؤولي المنظمة المعتمدين والمستخدم صاحب الطلب فقط.'
                : 'Payment receipts are stored in private storage containers using randomized UUID identifiers inaccessible to the public. Customer isolation prevents unauthorized viewing.'}
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
