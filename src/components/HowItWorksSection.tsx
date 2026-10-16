'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, CreditCard, UploadCloud, Send, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function HowItWorksSection() {
  const { language, t } = useLanguage();

  const steps = [
    {
      num: '01',
      icon: Mail,
      titleKey: 'how.step1.title',
      descKey: 'how.step1.desc',
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      num: '02',
      icon: CreditCard,
      titleKey: 'how.step2.title',
      descKey: 'how.step2.desc',
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      num: '03',
      icon: UploadCloud,
      titleKey: 'how.step3.title',
      descKey: 'how.step3.desc',
      accent: 'from-purple-500 to-pink-500',
    },
    {
      num: '04',
      icon: Send,
      titleKey: 'how.step4.title',
      descKey: 'how.step4.desc',
      accent: 'from-pink-500 to-emerald-500',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#090d1a]/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-purple-500/20 text-xs font-medium text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'ar' ? 'بساطة وأمان تام' : 'Simple & Secure Flow'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {t('how.title')}
          </h2>

          <p className="text-base sm:text-lg text-slate-300">
            {t('how.subtitle')}
          </p>
        </div>

        {/* 4-Step Interactive Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex flex-col items-center text-center group">
                
                {/* Step Connector Line for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 start-1/2 w-full h-[2px] bg-gradient-to-r from-indigo-500/40 to-white/5 -z-0 pointer-events-none" />
                )}

                {/* Step Icon Badge */}
                <div className="relative z-10 mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.accent} p-0.5 shadow-xl shadow-indigo-900/30 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-[#0a0f24] rounded-[22px] flex items-center justify-center relative">
                      <Icon className="w-8 h-8 text-white" />
                      <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-slate-900 border border-indigo-400/50 text-[11px] font-bold text-indigo-300 flex items-center justify-center shadow">
                        {step.num}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {t(step.titleKey)}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                  {t(step.descKey)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Distinct Statuses Explanation Card */}
        <div className="mt-16 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <h4 className="text-base sm:text-lg font-bold text-white">
              {t('how.statusLegend')}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-200 block">{t('how.status1')}</span>
              <p className="text-slate-400 text-xs">
                {language === 'ar' ? 'تم استلام وتأكيد الطلب المبدئي في النظام.' : 'Initial order created in system.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="font-semibold text-blue-300 block">{t('how.status2')}</span>
              <p className="text-slate-400 text-xs">
                {language === 'ar' ? 'فريق الإدارة طابق التحويل في الحساب.' : 'Staff verified funds received in wallet.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="font-semibold text-purple-300 block">{t('how.status3')}</span>
              <p className="text-slate-400 text-xs">
                {language === 'ar' ? 'جاري تجهيز رابط الدعوة والتأكد من الأهلية.' : 'Preparing official invitation link.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="font-semibold text-emerald-300 block">{t('how.status4')}</span>
              <p className="text-slate-400 text-xs">
                {language === 'ar' ? 'تم الإرسال الفعلي إلى بريدك الإلكتروني.' : 'Dispatched to customer mailbox.'}
              </p>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>{t('how.speedNotice')}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
