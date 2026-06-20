'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';

export function SemesterSelector({ year, branch }: { year: number; branch: string }) {
  const { t } = useLanguage();

  const semesterCount = year === 1 ? 2 : year === 2 ? 2 : year === 3 ? 2 : 2;
  const semesters = Array.from({ length: semesterCount }, (_, i) => (year - 1) * 2 + i + 1);

  const branchColors: Record<string, string> = {
    cs: 'from-blue-600 to-blue-700',
    it: 'from-green-600 to-green-700',
    aiml: 'from-purple-600 to-purple-700',
  };

  const color = branchColors[branch] || 'from-gray-600 to-gray-700';

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={`/year/${year}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Branches', 'ब्रांचों पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t('Select Semester', 'सेमेस्टर चुनें')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Choose your semester to see subjects', 'विषय देखने के लिए अपना सेमेस्टर चुनें')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semesters.map((sem) => (
            <Link href={`/year/${year}/${branch}/semester/${sem}`} key={sem}>
              <Card className="group relative overflow-hidden bg-gray-900 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer p-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#F97316] transition-colors">
                      {t(`Semester ${sem}`, `सेमेस्टर ${sem}`)}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {t('View all subjects', 'सभी विषय देखें')}
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
