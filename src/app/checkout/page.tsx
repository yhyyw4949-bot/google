'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  CreditCard,
  UserPlus,
  UserCheck,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmEmail, setConfirmEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [productData, setProductData] = useState<{
    priceEGP: number;
    title: string;
    duration: string;
    isAvailable: boolean;
    isSoldOut: boolean;
    remainingSlots: number;
    maxQuota: number;
  }>({
    priceEGP: 25,
    title: 'Google AI Pro',
    duration: 'دعوة تفعيل للاشتراك المتاح',
    isAvailable: true,
    isSoldOut: false,
    remainingSlots: 5,
    maxQuota: 5,
  });

  useEffect(() => {
    fetch('/api/public/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProductData({
            priceEGP: data.product.priceCents / 100,
            title: language === 'ar' ? data.product.titleAr : data.product.titleEn,
            duration: language === 'ar' ? data.product.durationAr : data.product.durationEn,
            isAvailable: data.product.isAvailable,
            isSoldOut: data.quota ? data.quota.isSoldOut : false,
            remainingSlots: data.quota ? data.quota.remainingSlots : 5,
            maxQuota: data.quota ? data.quota.maxQuota : 5,
          });
        }
      })
      .catch(() => {});
  }, [language]);

  // Autofill if user logs in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName);
      if (!email) {
        setEmail(user.email);
        setConfirmEmail(user.email);
      }
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user, fullName, email, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg(
        language === 'ar'
          ? 'يجب تسجيل الدخول أو إنشاء حساب أولاً لإتمام عملية الشراء ومتابعة الطلب.'
          : 'Please sign in or create an account first to complete your purchase.'
      );
      router.push('/register?redirect=/checkout');
      return;
    }

    if (!fullName.trim() || !email.trim() || !confirmEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all required fields.');
      return;
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMsg(t('checkout.errorEmailMismatch'));
      return;
    }

    if (!termsAccepted) {
      setErrorMsg(t('checkout.errorTermsRequired'));
      return;
    }

    if (!productData.isAvailable || productData.isSoldOut) {
      setErrorMsg(
        language === 'ar'
          ? `عذراً، نفدت الكمية المتاحة لهذه الدفعة (${productData.maxQuota}/${productData.maxQuota} طلبات). يرجى الانتظار لفتح الدفعة القادمة.`
          : `Sorry, this batch is sold out (${productData.maxQuota}/${productData.maxQuota} orders reached).`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: email,
          confirmEmail,
          customerPhone: phone,
          termsAccepted,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Redirect to the payment & receipt upload screen
      router.push(`/order/${data.orderId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during order creation';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? 'خطوة واحدة تفصلك عن الذكاء الاصطناعي' : 'Checkout & Activation'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('checkout.title')}
          </h1>
          <p className="text-sm text-slate-300">
            {t('checkout.subtitle')}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Auth Gate vs Form */}
          {authLoading ? (
            <div className="lg:col-span-7 glass-panel rounded-3xl p-12 text-center text-slate-400 text-sm space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>{language === 'ar' ? 'جاري التحقق من الجلسة...' : 'Verifying session...'}</p>
            </div>
          ) : !user ? (
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-10 border border-indigo-500/30 space-y-6 text-center shadow-2xl shadow-indigo-950/40">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/20">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'خطوة إلزامية: تسجيل حساب مطلوب للطلب' : 'Mandatory: Account Registration Required'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {language === 'ar' ? 'سجل حسابك أولاً للبدء في طلب الاشتراك' : 'Register or Sign In to Purchase'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {language === 'ar'
                    ? 'لحماية اشتراكك، وتأكيد وصول دعوة تفعيل Google AI Pro لبريدك الشخصي المعتمد، ومتابعة إيصالات الدفع وحالة طلبك لحظة بلحظة، يجب أن تمتلك حساباً مسجلاً في متجرنا قبل إتمام الطلب.'
                    : 'To protect your subscription, verify invitation dispatch to your official email, and track your payment receipt in real time, you must register or sign in before placing an order.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link
                  href="/register?redirect=/checkout"
                  className="glow-btn px-6 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 flex-1 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إنشاء حساب جديد (تسجيل)' : 'Register New Account'}</span>
                </Link>
                <Link
                  href="/login?redirect=/checkout"
                  className="px-6 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 hover:border-slate-500 transition-colors flex-1"
                >
                  <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs text-start space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'ar' ? 'لماذا يشترط تسجيل الحساب للطلب؟' : 'Why is an account required to order?'}</span>
                </div>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{language === 'ar' ? 'ربط دعوة تفعيل Google AI Pro ببريدك الشخصي المسجل بدقة' : 'Securely link the Google AI Pro invitation to your verified email'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{language === 'ar' ? 'لوحة تحكم خاصة بك لمتابعة حالة المراجعة وإرسال الدعوة وتحميل الإيصالات' : 'Dedicated customer dashboard to track review status and dispatch'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{language === 'ar' ? 'حماية بياناتك وحسابك من أي وصول غير مصرح به' : 'Full security and protection for your orders and personal data'}</span>
                </p>
              </div>
            </div>
          ) : (
            /* Form */
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-lg font-bold text-white">
                  {language === 'ar' ? 'بيانات المستلم والطلب' : 'Customer & Order Details'}
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'ar' ? 'حساب مسجل وموثق' : 'Verified Account'}</span>
                </div>
              </div>

              {/* Logged in badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-300">
                    {language === 'ar' ? 'مسجل باسم:' : 'Ordering as:'}{' '}
                    <strong className="text-white">{user.fullName}</strong> ({user.email})
                  </span>
                </div>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('checkout.fullName')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: محمد أحمد علي' : 'e.g. Mohamed Ahmed'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('checkout.email')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ar'
                      ? 'ستصلك دعوة التفعيل الرسمية على هذا البريد الإلكتروني.'
                      : 'The official activation invitation will be dispatched to this email.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('checkout.confirmEmail')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('checkout.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ar' ? 'اختياري للتواصل السريع عبر واتساب في حال الحاجة.' : 'Optional for WhatsApp updates.'}
                  </p>
                </div>

                {/* Strict Security Disclosure */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{t('checkout.securityNote')}</p>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      {language === 'ar' ? (
                        <>
                          أوافق على{' '}
                          <Link href="/terms" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            الشروط والأحكام
                          </Link>
                          ، و
                          <Link href="/privacy" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            سياسة الخصوصية
                          </Link>
                          ، و
                          <Link href="/refund" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            سياسة الاسترجاع
                          </Link>
                          ، وأفهم أن هذه خدمة وسيطة مستقلة.
                        </>
                      ) : (
                        <>
                          I agree to the{' '}
                          <Link href="/terms" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            Terms of Service
                          </Link>
                          ,{' '}
                          <Link href="/privacy" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            Privacy Policy
                          </Link>
                          , and{' '}
                          <Link href="/refund" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
                            Refund Policy
                          </Link>
                          , and acknowledge this is an independent service.
                        </>
                      )}
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading || productData.isSoldOut}
                  className={`w-full py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                    productData.isSoldOut
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'glow-btn text-white shadow-indigo-500/20 cursor-pointer disabled:opacity-60'
                  }`}
                >
                  {loading ? (
                    <span>{t('checkout.creating')}</span>
                  ) : productData.isSoldOut ? (
                    <span>
                      {language === 'ar'
                        ? 'نفدت الكمية الحالية بالكامل (5/5 طلبات)'
                        : 'Out of Stock (Batch Quota 5/5 Reached)'}
                    </span>
                  ) : (
                    <>
                      <span>{t('checkout.submit')}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Live Order Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>{t('checkout.orderSummary')}</span>
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-300 pb-3 border-b border-white/5">
                  <span className="text-slate-400">{t('checkout.product')}:</span>
                  <span className="font-semibold text-white">{productData.title}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pb-3 border-b border-white/5">
                  <span className="text-slate-400">{t('checkout.paymentMethod')}:</span>
                  <span className="font-medium text-slate-200">
                    {language === 'ar' ? 'تحويل كاش / إنستاباي' : 'Cash Transfer / InstaPay'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pb-3 border-b border-white/5">
                  <span className="text-slate-400">
                    {language === 'ar' ? 'مدة الاشتراك:' : 'Duration:'}
                  </span>
                  <span className="text-xs text-indigo-300 text-end max-w-[200px]">
                    {productData.duration}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-base font-bold text-white">{t('checkout.price')}:</span>
                  <div className="text-end">
                    <span className="text-3xl font-black text-white">{productData.priceEGP}</span>{' '}
                    <span className="text-sm font-bold text-indigo-400">
                      {language === 'ar' ? 'جنيه مصري' : 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclosures Checklist */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'ar' ? 'تفاصيل هامة قبل الدفع' : 'Important Disclosures'}</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {language === 'ar'
                      ? 'الدعوة تعمل على حسابات Google الشخصية المتوافقة.'
                      : 'Invitation works on compatible personal Google accounts.'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {language === 'ar'
                      ? 'مراجعة يدوية فورية وإرسال الدعوة خلال دقائق بعد التحقق.'
                      : 'Manual prompt verification with dispatch in target 5 minutes.'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {language === 'ar'
                      ? 'استرداد كامل للمبلغ إذا كان الحساب غير مؤهل أو تعذر الإرسال.'
                      : 'Full refund guaranteed if account ineligible or unfulfillable.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
