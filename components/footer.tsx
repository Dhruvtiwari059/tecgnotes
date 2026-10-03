'use client';

import { useLanguage } from '@/lib/language';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Tech<span className="text-accent">Notes</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
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
