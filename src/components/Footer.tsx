'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Mail, Phone, MessageSquare, ShieldAlert } from 'lucide-react';

export default function Footer() {
  const { language, t } = useLanguage();

  const [settings, setSettings] = useState<{
    brandNameAr?: string;
    brandNameEn?: string;
    contactEmail?: string;
    supportPhone?: string;
    whatsappNumber?: string;
  }>({
    brandNameAr: 'متجر Google AI Pro مصر',
    brandNameEn: 'Google AI Pro Egypt Store',
    contactEmail: 'support@googleaipro.eg',
    supportPhone: '+20 100 000 0001',
    whatsappNumber: '+20 100 000 0001',
  });
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; nameAr: string; nameEn: string }[]>([]);

  useEffect(() => {
    fetch('/api/public/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.paymentMethods && Array.isArray(data.paymentMethods)) {
          setPaymentMethods(data.paymentMethods);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="relative bg-[#05070e] border-t border-white/10 pt-16 pb-12 overflow-hidden text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#05070e] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">
                {language === 'ar' ? (settings.brandNameAr || 'Google AI Pro Store') : (settings.brandNameEn || 'Google AI Pro Store')}
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {language === 'ar'
                ? 'المنصة المستقلة الأولى في مصر لتوفير وتسهيل دعوات اشتراكات Google AI Pro للأفراد والطلبة والباحثين بأسعار تنافسية ودعم محلي فوري.'
                : 'The premier independent Egyptian platform facilitating Google AI Pro subscription invitations for students, creators, and professionals.'}
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.contactEmail || 'support@googleaipro.eg'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.supportPhone || settings.whatsappNumber || '+20 100 000 0001'} (WhatsApp & Calls)</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-indigo-400 transition-colors">
                  {t('nav.features')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-indigo-400 transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-indigo-400 transition-colors">
                  {t('nav.trackOrder')}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  {t('nav.orderNow')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">
              {language === 'ar' ? 'السياسات والضمان' : 'Policies & Trust'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                  {t('policy.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                  {t('policy.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-indigo-400 transition-colors">
                  {t('policy.refund')}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-indigo-400 transition-colors">
                  {t('policy.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">
              {language === 'ar' ? 'وسائل الدفع في مصر' : 'Payment Methods'}
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              {paymentMethods && paymentMethods.length > 0 ? (
                paymentMethods.map((m, idx) => {
                  const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400', 'bg-cyan-400'];
                  return (
                    <p key={m.id} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${colors[idx % colors.length]}`} />
                      {language === 'ar' ? m.nameAr : (m.nameEn || m.nameAr)}
                    </p>
                  );
                })
              ) : (
                <>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    فودافون كاش (Vodafone Cash)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    إنستاباي مصر (InstaPay)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    اتصالات كاش (Etisalat Cash)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    تحويل بنكي محلي (Bank Transfer)
                  </p>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Legal & Trademark Disclaimer Bar */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>{t('footer.disclaimer')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-2 gap-2">
            <p>{t('footer.copyright')}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  sessionStorage.removeItem('gap_intro_viewed_v1');
                  window.location.reload();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <span>✨ {language === 'ar' ? 'إعادة تشغيل المقدمة' : 'Replay Awwwards Intro'}</span>
              </button>
              <span>•</span>
              <span>{language === 'ar' ? 'مصر - جنيه مصري (EGP)' : 'Egypt - EGP'}</span>
              <span>•</span>
              <span className="text-indigo-400">v1.0 Production Ready</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
