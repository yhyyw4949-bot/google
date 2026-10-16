'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FaqSection from '@/components/FaqSection';
import AwwwardsIntro from '@/components/AwwwardsIntro';
import { useLanguage } from '@/contexts/LanguageContext';
import { Zap } from 'lucide-react';

export default function HomePage() {
  const { language } = useLanguage();
  const [announcement, setAnnouncement] = useState<{ active: boolean; textAr: string; textEn: string } | null>(null);

  useEffect(() => {
    fetch('/api/public/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.isAnnouncementActive) {
          setAnnouncement({
            active: true,
            textAr: data.settings.announcementAr || '',
            textEn: data.settings.announcementEn || '',
          });
        } else {
          setAnnouncement(null);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Awwwards Website Opening Animation */}
      <AwwwardsIntro />

      {/* Announcement Banner */}
      {announcement?.active && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-blue-900/60 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs text-indigo-200 mt-16 md:mt-20 flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
          <span>{language === 'ar' ? announcement.textAr : announcement.textEn}</span>
        </div>
      )}

      {/* Main Sections */}
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
    </div>
  );
}
