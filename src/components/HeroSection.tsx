'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Flame,
  AlertOctagon,
} from 'lucide-react';

export default function HeroSection() {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [quota, setQuota] = useState<{
    maxQuota: number;
    activeOrdersCount: number;
    remainingSlots: number;
    isSoldOut: boolean;
  }>({
    maxQuota: 5,
    activeOrdersCount: 0,
    remainingSlots: 5,
    isSoldOut: false,
  });

  useEffect(() => {
    fetch('/api/public/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.quota) {
          setQuota(data.quota);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 flex items-center justify-center overflow-hidden">
      {/* Background Animated Gradient Orbs & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right Purple Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/25 rounded-full blur-[128px] animate-pulse-slow" />
        {/* Bottom-left Blue Glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse-slow" />
        {/* Center Cyan Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Tech Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-start space-y-6">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-indigo-500/30 text-xs font-medium text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t('hero.badge')}</span>
              </div>

              {/* 5-Orders Limited Batch Quota Badge */}
              {quota.isSoldOut ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 animate-pulse">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>
                    {language === 'ar'
                      ? 'نفدت الكمية بالكامل (5/5 طلبات)'
                      : 'SOLD OUT (Batch Limit 5/5 Reached)'}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>
                    {language === 'ar'
                      ? `دفعة محدودة: متبقي ${quota.remainingSlots} من ${quota.maxQuota} طلبات فقط!`
                      : `Limited Batch: Only ${quota.remainingSlots} of ${quota.maxQuota} orders left!`}
                  </span>
                </div>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.2] text-white">
              {language === 'ar' ? (
                <>
                  افتح عالم الذكاء الاصطناعي مع{' '}
                  <span className="text-gradient-purple">Google AI Pro</span>
                </>
              ) : (
                <>
                  Unlock the World of AI with{' '}
                  <span className="text-gradient-purple">Google AI Pro</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Delivery Target Notice Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{t('hero.deliveryTarget')}</span>
            </div>

            {/* Feature Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('hero.featuresList1')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('hero.featuresList2')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('hero.featuresList3')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  {language === 'ar'
                    ? `حصة محددة (${quota.maxQuota} طلبات لكل دفعة)`
                    : `Strict batch limit (${quota.maxQuota} orders only)`}
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4 w-full sm:w-auto">
              {quota.isSoldOut ? (
                <button
                  disabled
                  className="px-7 py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm sm:text-base flex items-center justify-center gap-2 w-full sm:w-auto border border-slate-700 cursor-not-allowed"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <span>{language === 'ar' ? 'نفدت الكمية الحالية (Sold Out)' : 'Sold Out - Quota Reached'}</span>
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="glow-btn px-7 py-3.5 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-indigo-500/30"
                >
                  <span>{t('hero.ctaPrimary')}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="#features"
                className="px-6 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white hover:border-white/20 font-medium text-sm sm:text-base flex items-center justify-center w-full sm:w-auto transition-all"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            {/* Independent Third Party Disclosure */}
            <div className="pt-2 flex items-start gap-2 text-[11px] sm:text-xs text-slate-400 max-w-xl">
              <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t('hero.disclaimer')}</p>
            </div>
          </div>

          {/* Futuristic Product Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md animate-float">
              
              {/* Outer Glow Halo */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 ${
                  quota.isSoldOut
                    ? 'from-rose-600 via-pink-600 to-amber-500'
                    : 'from-purple-600 via-indigo-500 to-cyan-400'
                }`}
              />
              
              <div className="relative glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/15 overflow-hidden">
                
                {/* Header inside card */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md shadow-purple-500/30">
                      <div className="w-full h-full bg-[#070913] rounded-[14px] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Google AI Pro</h3>
                      <p className="text-xs text-indigo-300">
                        {language === 'ar' ? 'دعوة تفعيل الاشتراك' : 'Subscription Invitation'}
                      </p>
                    </div>
                  </div>
                  {quota.isSoldOut ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                      {language === 'ar' ? 'نفدت الكمية (5/5)' : 'Sold Out'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      {language === 'ar' ? 'متاح للطلب' : 'Available'}
                    </span>
                  )}
                </div>

                {/* Quota Progress Bar Indicator */}
                <div className="py-4 border-b border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      {language === 'ar' ? 'حصة الدفعة الحالية:' : 'Batch Order Quota:'}
                    </span>
                    <span className={quota.isSoldOut ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                      {quota.activeOrdersCount} / {quota.maxQuota} {language === 'ar' ? 'طلبات' : 'orders'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        quota.isSoldOut
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (quota.activeOrdersCount / quota.maxQuota) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Price Display */}
                <div className="py-5 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tight">25</span>
                    <span className="text-xl font-bold text-indigo-300">
                      {language === 'ar' ? 'جنيه مصري' : 'EGP'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {language === 'ar' ? '/ للطلب' : '/ order'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {language === 'ar'
                      ? 'الدفع بالجنيه المصري عبر فودافون كاش أو إنستاباي'
                      : 'Payment in EGP via Vodafone Cash or InstaPay'}
                  </p>
                </div>

                {/* Key Plan Highlights */}
                <div className="py-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">
                      {language === 'ar' ? 'طريقة الاستلام:' : 'Delivery Method:'}
                    </span>
                    <span className="font-medium text-white">
                      {language === 'ar' ? 'دعوة رسمية على بريدك' : 'Official invite to your email'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">
                      {language === 'ar' ? 'الهدف الزمني:' : 'Target Timeframe:'}
                    </span>
                    <span className="font-medium text-cyan-300">
                      {language === 'ar' ? '5 دقائق بعد التحقق' : '5 mins after verification'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">
                      {language === 'ar' ? 'الكمية الإجمالية:' : 'Batch Limit:'}
                    </span>
                    <span className="font-medium text-amber-300">
                      {quota.maxQuota} {language === 'ar' ? 'طلبات فقط' : 'orders only'}
                    </span>
                  </div>
                </div>

                {/* Card CTA */}
                {quota.isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-not-allowed"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    <span>{language === 'ar' ? 'نفدت الكمية (5/5)' : 'Out of Stock (5/5)'}</span>
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 rounded-xl glow-btn text-white text-center font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    <span>{t('hero.ctaPrimary')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </Link>
                )}

                <p className="text-[10px] text-center text-slate-500 mt-3">
                  {language === 'ar'
                    ? 'ضمان المراجعة الفورية واسترجاع المبلغ في حال تعذر التفعيل'
                    : 'Prompt review guarantee with refund eligibility if unfulfillable'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
