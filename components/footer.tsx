'use client';

import { useLanguage } from '@/lib/language';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black border-t border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Tech<span className="text-[#F97316]">Notes</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            {t(
              'TechNotes - Built for RGPV students. Free, fast, and no ads.',
              'TechNotes - RGPV छात्रों के लिए बनाया गया। मुफ्त, तेज़ और बिना विज्ञापन।'
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
