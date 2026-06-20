'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Cpu, Monitor, Brain, ArrowLeft } from 'lucide-react';

const branches = [
  { slug: 'cs', name: 'Computer Science', nameHi: 'कंप्यूटर साइंस', icon: Cpu, color: 'from-blue-600 to-blue-700' },
  { slug: 'it', name: 'Information Technology', nameHi: 'इनफार्मेशन टेक्नोलॉजी', icon: Monitor, color: 'from-green-600 to-green-700' },
  { slug: 'aiml', name: 'AI & ML', nameHi: 'AI और ML', icon: Brain, color: 'from-purple-600 to-purple-700' },
];

export function BranchSelector({ year }: { year: number }) {
  const { t } = useLanguage();
  const labels = ['First', 'Second', 'Third', 'Fourth'];

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t(`${labels[year - 1]} Year`, `${labels[year - 1]} Year`)} {t('— Select Branch', '— ब्रांच चुनें')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Choose your branch to continue', 'जारी रखने के लिए अपनी ब्रांच चुनें')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Link href={`/year/${year}/${branch.slug}`} key={branch.slug}>
              <Card className="group relative overflow-hidden bg-gray-900 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer p-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${branch.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${branch.color} flex items-center justify-center shadow-lg`}>
                    <branch.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#F97316] transition-colors">
                      {t(branch.name, branch.nameHi)}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider">{branch.slug}</p>
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
