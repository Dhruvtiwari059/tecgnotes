'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  semester_id: string;
}

const cardColors = [
  'border-blue-500/30 hover:border-blue-500/60',
  'border-green-500/30 hover:border-green-500/60',
  'border-red-500/30 hover:border-red-500/60',
  'border-orange-500/30 hover:border-orange-500/60',
  'border-purple-500/30 hover:border-purple-500/60',
];

export function SubjectList({ year, branch, sem }: { year: number; branch: string; sem: number }) {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      const { data: years } = await supabase.from('years').select('id').eq('number', year).maybeSingle();
      if (!years) { setLoading(false); return; }
      const { data: branches } = await supabase.from('branches').select('id').eq('slug', branch).maybeSingle();
      if (!branches) { setLoading(false); return; }
      const { data: semesters } = await supabase.from('semesters').select('id').eq('year_id', years.id).eq('branch_id', branches.id).eq('number', sem).maybeSingle();
      if (!semesters) { setLoading(false); return; }
      const { data } = await supabase.from('subjects').select('*').eq('semester_id', semesters.id).order('name', { ascending: true });
      setSubjects(data || []);
      setLoading(false);
    }
    fetchSubjects();
  }, [year, branch, sem]);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={`/year/${year}/${branch}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Semesters', 'सेमेस्टर पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t('Subjects', 'विषय')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Select a subject to view notes and materials', 'नोट्स और सामग्री देखने के लिए विषय चुनें')}
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-gray-800" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No subjects found yet.', 'अभी कोई विषय नहीं मिला।')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, i) => (
              <Link href={`/subject/${subject.slug}`} key={subject.id}>
                <Card className={`group relative overflow-hidden bg-gray-900 border transition-all duration-300 hover:scale-[1.02] cursor-pointer p-6 ${cardColors[i % cardColors.length]}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#F97316] transition-colors leading-tight">
                        {subject.name}
                      </h3>
                      {subject.code && (
                        <p className="text-gray-500 text-sm mt-1">{subject.code}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
