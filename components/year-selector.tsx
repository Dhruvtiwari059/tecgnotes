'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { BookOpen, GraduationCap } from 'lucide-react';

const years = [
  { number: 1, label: 'First Year', labelHi: 'प्रथम वर्ष', color: 'from-blue-600 to-blue-700' },
  { number: 2, label: 'Second Year', labelHi: 'द्वितीय वर्ष', color: 'from-green-600 to-green-700' },
  { number: 3, label: 'Third Year', labelHi: 'तृतीय वर्ष', color: 'from-red-600 to-red-700' },
  { number: 4, label: 'Fourth Year', labelHi: 'चतुर्थ वर्ष', color: 'from-purple-600 to-purple-700' },
];

export function YearSelector() {
  const { t } = useLanguage();

  return (
    <section id="year-selector" className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('Select Your Year', 'अपना वर्ष चुनें')}
          </h2>
          <p className="text-gray-400 text-lg">
            {t('Choose your academic year to explore notes', 'नोट्स देखने के लिए अपना शैक्षणिक वर्ष चुनें')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {years.map((year) => (
            <Link href={`/year/${year.number}`} key={year.number}>
              <Card className="group relative overflow-hidden bg-gray-900 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer p-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${year.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${year.color} flex items-center justify-center shadow-lg`}>
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#F97316] transition-colors">
                      {t(year.label, year.labelHi)}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {t('View Notes', 'नोट्स देखें')}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
