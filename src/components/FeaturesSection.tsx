'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sparkles,
  Search,
  BookOpen,
  Image as ImageIcon,
  LayoutGrid,
  Cloud,
  ExternalLink,
  Info,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  titleKey: string;
  descKey: string;
  officialUrl: string;
}

const features: FeatureItem[] = [
  {
    id: 'gemini',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-500',
    titleKey: 'features.card1.title',
    descKey: 'features.card1.desc',
    officialUrl: 'https://gemini.google.com',
  },
  {
    id: 'research',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    titleKey: 'features.card2.title',
    descKey: 'features.card2.desc',
    officialUrl: 'https://blog.google/technology/ai/',
  },
  {
    id: 'notebooklm',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    titleKey: 'features.card3.title',
    descKey: 'features.card3.desc',
    officialUrl: 'https://notebooklm.google',
  },
  {
    id: 'media',
    icon: ImageIcon,
    color: 'from-amber-500 to-rose-500',
    titleKey: 'features.card4.title',
    descKey: 'features.card4.desc',
    officialUrl: 'https://deepmind.google/technologies/imagen-3/',
  },
  {
    id: 'apps',
    icon: LayoutGrid,
    color: 'from-emerald-500 to-teal-500',
    titleKey: 'features.card5.title',
    descKey: 'features.card5.desc',
    officialUrl: 'https://workspace.google.com',
  },
  {
    id: 'storage',
    icon: Cloud,
    color: 'from-sky-500 to-indigo-500',
    titleKey: 'features.card6.title',
    descKey: 'features.card6.desc',
    officialUrl: 'https://one.google.com',
  },
];

export default function FeaturesSection() {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-900/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? 'إمكانيات لا محدودة' : 'Advanced Capabilities'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {t('features.title')}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t('features.subtitle')}
          </p>

          {/* Legal / Accuracy Disclaimer */}
          <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 text-start mt-2">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{t('features.disclaimer')}</span>
          </div>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl p-6 sm:p-8 glass-card border border-white/10 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 shadow-lg shadow-black/30"
              >
                {/* Hover subtle glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Icon with glowing gradient container */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <div className="w-full h-full bg-[#0a0e1c] rounded-[14px] flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                    {t(item.titleKey)}
                  </h3>

                  {/* Card Description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>

                {/* Card Footer with Official Link and Action */}
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs">
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>{t('features.officialLink')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Link
                    href="/checkout"
                    className="inline-flex items-center gap-1 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                  >
                    <span>{t('hero.ctaPrimary')}</span>
                    <ArrowIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside Features */}
        <div className="mt-16 glass-panel rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-start">
            <h4 className="text-xl font-bold text-white">
              {language === 'ar' ? 'جاهز لتجربة Google AI Pro الآن؟' : 'Ready to experience Google AI Pro now?'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              {language === 'ar'
                ? 'فقط 25 جنيه مصري للدعوة، مع إمكانية الدفع عبر محفظتك الإلكترونية أو إنستاباي.'
                : 'Just 25 EGP per invitation, payable with any Egyptian e-wallet or InstaPay.'}
            </p>
          </div>
          <Link
            href="/checkout"
            className="glow-btn px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>{t('hero.ctaPrimary')}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
