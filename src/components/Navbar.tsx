'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Menu, X, Globe, User, LogOut, ShieldCheck, ShoppingCart, Search } from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070913]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-500 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
              <div className="w-full h-full bg-[#070913] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Google AI Pro
              </span>
              <span className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-mono">
                {language === 'ar' ? 'متجر الاشتراكات المستقل' : 'Independent Store'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/#features" className="hover:text-indigo-400 transition-colors">
              {t('nav.features')}
            </Link>
            <Link href="/#how-it-works" className="hover:text-indigo-400 transition-colors">
              {t('nav.howItWorks')}
            </Link>
            <Link href="/#faq" className="hover:text-indigo-400 transition-colors">
              {t('nav.faq')}
            </Link>
            <Link href="/track" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-cyan-400">
              <Search className="w-3.5 h-3.5" />
              {t('nav.trackOrder')}
            </Link>
          </nav>

          {/* Actions & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition-colors"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('nav.switchLang')}</span>
            </button>

            {/* User auth state */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('nav.admin')}
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs hover:bg-white/10 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {user.fullName.split(' ')[0]}
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/checkout"
                  className="glow-btn px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {t('nav.orderNow')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl glass-panel border border-white/10 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-indigo-400 text-sm py-1"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-indigo-400 text-sm py-1"
            >
              {t('nav.features')}
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-indigo-400 text-sm py-1"
            >
              {t('nav.howItWorks')}
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-indigo-400 text-sm py-1"
            >
              {t('nav.faq')}
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 text-sm py-1 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('nav.trackOrder')}
            </Link>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-amber-400 text-sm py-1 font-semibold"
                    >
                      {t('nav.admin')}
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-slate-200 text-sm py-1"
                    >
                      {t('nav.dashboard')} ({user.fullName})
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-rose-400 text-left text-sm py-1"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-200 text-sm py-1"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-200 text-sm py-1"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className="glow-btn text-center py-2.5 rounded-xl text-white text-sm font-semibold mt-2"
              >
                {t('nav.orderNow')} (25 EGP)
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
