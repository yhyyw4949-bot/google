'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { language, t } = useLanguage();
  const { login } = useAuth();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@googleaipro.eg');
    setPassword('Admin@123456');
  };

  const handleDemoUser = () => {
    setEmail('ahmed@example.com');
    setPassword('User@123456');
  };

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 mx-auto shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#070913] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('nav.login')}
        </h1>
        <p className="text-xs text-slate-400">
          {language === 'ar' ? 'سجل دخولك لمتابعة طلباتك أو إدارة المتجر' : 'Sign in to access your orders or dashboard'}
        </p>
      </div>

      {/* Demo Quick-Fill Buttons */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-[11px] text-slate-400 block font-medium">
          {language === 'ar' ? 'تسجيل دخول سريع للتجربة:' : 'Quick Demo Logins:'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            {language === 'ar' ? 'حساب المدير (Admin)' : 'Admin Demo'}
          </button>
          <button
            type="button"
            onClick={handleDemoUser}
            className="py-1.5 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors"
          >
            {language === 'ar' ? 'حساب عميل (Customer)' : 'Customer Demo'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl glow-btn text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <span>{loading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : t('nav.login')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-slate-400">
          <span>{language === 'ar' ? 'ليس لديك حساب بعد؟' : "Don't have an account?"}</span>{' '}
          <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
