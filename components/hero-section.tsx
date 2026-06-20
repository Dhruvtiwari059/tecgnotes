'use client';

import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { ArrowDown, GraduationCap } from 'lucide-react';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A]/20 to-black/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-sm font-medium mb-6">
          <GraduationCap className="w-4 h-4" />
          {t('For RGPV University Students', 'RGPV यूनिवर्सिटी छात्रों के लिए')}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          {t('Your Smart Study', 'आपका स्मार्ट स्टडी')}{' '}
          <span className="text-[#F97316]">{t('Companion', 'साथी')}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t(
            'Access notes, previous year papers, DSA materials, placement prep, and an AI chatbot — all in one place.',
            'नोट्स, पिछले साल के पेपर, DSA सामग्री, प्लेसमेंट तैयारी, और AI चैटबॉट — सब एक ही जगह पर।'
          )}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-8"
            onClick={() => document.getElementById('year-selector')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('Get Started', 'शुरू करें')}
            <ArrowDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
