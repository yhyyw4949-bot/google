'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RefreshCcw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function RefundPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs text-amber-300">
            <RefreshCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'ضمان حق العميل الكامل' : 'Customer Protection Guarantee'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {t('policy.refund')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'ar' ? 'شروط وضوابط استرداد الأموال في متجر Google AI Pro' : 'Terms and procedures for refunds'}
          </p>
        </div>

        {/* Content */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? '1. الحالات المؤهلة لاسترداد كامل المبلغ (100%)' : '1. Cases Eligible for 100% Refund'}</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 ps-2 text-slate-300">
              <li>
                {language === 'ar'
                  ? 'إذا تم تأكيد دفعك وتعذر إرسال دعوة التفعيل الرسمية لأي سبب تقني من جانبنا.'
                  : 'If payment was verified but invitation could not be dispatched due to technical constraints on our side.'}
              </li>
              <li>
                {language === 'ar'
                  ? 'إذا كان حساب العميل غير مؤهل جغرافياً أو نظامياً لقبول الدعوة ولم يتم استهلاك الاشتراك.'
                  : 'If the customer Google account is ineligible to receive the invite and no benefits were activated.'}
              </li>
              <li>
                {language === 'ar'
                  ? 'إذا طلب العميل الإلغاء قبل بدء معالجة الدعوة أو إرسالها.'
                  : 'If the customer requests cancellation before processing has commenced.'}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-indigo-400" />
              <span>{language === 'ar' ? '2. آلية وسرعة رد الأموال' : '2. Refund Method & Timelines'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'يتم تحويل المبلغ المسترد كاملاً (25 جنيهاً مصرياً) إلى نفس المحفظة أو الحساب الذي تم التحويل منه (فودافون كاش، اتصالات كاش، أو إنستاباي) خلال مدة أقصاها 24 ساعة من تاريخ اعتماد طلب الاسترجاع.'
                : 'Refunds (full 25 EGP) are transferred back to the original source wallet or account (Vodafone Cash, InstaPay) within 24 hours of approval.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{language === 'ar' ? '3. الحالات غير المؤهلة للاسترداد' : '3. Non-refundable Cases'}</span>
            </h2>
            <p>
              {language === 'ar'
                ? 'بعد إرسال الدعوة وقبولها بنجاح على بريد العميل وظهور مزايا Google AI Pro في حسابه، تعتبر الخدمة مكتملة ومسلمة ولا يمكن إلغاؤها بعد استهلاكها وفقاً لطبيعة المنتجات الرقمية والتراخيص البرمجية.'
                : 'Once the invitation is successfully dispatched and accepted into the customer account, the digital fulfillment is deemed complete.'}
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
