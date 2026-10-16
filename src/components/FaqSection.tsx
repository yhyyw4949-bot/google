'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

const faqs: FaqItem[] = [
  {
    qAr: 'ما هي طبيعة اشتراك Google AI Pro المعروض؟',
    qEn: 'What is the nature of the Google AI Pro subscription offered?',
    aAr: 'هو عبارة عن دعوة تفعيل رسمية يتم إرسالها إلى بريدك الإلكتروني الشخصي (حساب Google) لتفعيل إمكانيات ومزايا الذكاء الاصطناعي المتاحة وفق شروط Google الحالية وبسعر رمزي 25 جنيه مصري.',
    aEn: 'It is an official activation invitation dispatched directly to your personal Google email account to unlock available AI features under current Google terms for 25 EGP.',
  },
  {
    qAr: 'هل أحتاج لإعطائكم كلمة مرور حساب Google الخاص بي؟',
    qEn: 'Do I need to give you my Google account password?',
    aAr: 'كلا على الإطلاق! لن نطلب منك أبداً كلمة مرور حسابك، ولا رموز التحقق، ولا بيانات الاسترداد. يتم التفعيل فقط من خلال قبول الدعوة التي تصلك على بريدك الإلكتروني مباشرة.',
    aEn: 'Absolutely not! We will NEVER ask for your password, verification codes, or recovery credentials. Activation happens entirely by accepting the invitation sent to your email.',
  },
  {
    qAr: 'ما هي وسائل الدفع المدعومة في مصر؟',
    qEn: 'What payment methods are supported in Egypt?',
    aAr: 'نوفر الدفع عبر جميع المحافظ الإلكترونية المصرية: فودافون كاش، اتصالات كاش، أورنج كاش، وكذلك الدفع اللحظي عبر تطبيق إنستاباي (InstaPay) والتحويلات البنكية.',
    aEn: 'We support all major Egyptian mobile cash wallets (Vodafone Cash, Etisalat Cash, Orange Money), Instant Payments via InstaPay (IPA), and local bank transfers.',
  },
  {
    qAr: 'كم من الوقت يستغرق إرسال الدعوة بعد الدفع؟',
    qEn: 'How long does it take to receive the invitation after payment?',
    aAr: 'الهدف التقديري للمعالجة هو 5 دقائق بعد التحقق من استلام التحويل ومطابقة الإيصال، مع العلم أن هذا التوقيت مرتبط بتوافر الحصص وأهلية الحساب وليس وقتاً مضموناً حتمياً.',
    aEn: 'The estimated processing target is 5 minutes following payment verification, subject to availability and account eligibility (not a guaranteed timeframe).',
  },
  {
    qAr: 'ماذا يحدث إذا لم يصلني الاشتراك أو كان حسابي غير مؤهل؟',
    qEn: 'What happens if the invitation cannot be delivered or my account is ineligible?',
    aAr: 'إذا تعذر إتمام التفعيل بسبب عدم توفر الدعوات أو عدم توافق الحساب، يحق لك استرداد كامل المبلغ المدفوع (25 جنيه) فوراً عبر نفس وسيلة الدفع التي حولت منها وفق سياسة الاسترجاع.',
    aEn: 'If activation cannot be completed due to unavailablity or account restrictions, you are entitled to a full refund of 25 EGP via your original payment method under our refund policy.',
  },
];

export default function FaqSection() {
  const { language, t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-indigo-500/20 text-xs font-medium text-indigo-300">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? 'إجابات واضحة لجميع استفساراتك' : 'Clear Answers'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('policy.faq')}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {language === 'ar'
              ? 'كل ما تود معرفته حول آلية التفعيل ووسائل الدفع والضمانات.'
              : 'Everything you need to know about activation, payments, and warranties.'}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-start flex items-center justify-between gap-4 text-white font-bold text-sm sm:text-base hover:text-indigo-300 transition-colors"
                >
                  <span>{language === 'ar' ? faq.qAr : faq.qEn}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
                    {language === 'ar' ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
