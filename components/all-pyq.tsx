'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Download, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PyqItem {
  id: string;
  year: string;
  pdf_url: string;
  answer_pdf_url: string | null;
  subject_name: string;
  subject_slug: string;
}

export function AllPYQ() {
  const { t } = useLanguage();
  const [pyqs, setPyqs] = useState<PyqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPYQ() {
      const { data: pyqData } = await supabase.from('pyq').select('*').order('uploaded_at', { ascending: false }).limit(100);
      if (!pyqData || pyqData.length === 0) {
        setLoading(false);
        return;
      }
      const subjectIds = Array.from(new Set(pyqData.map((n: any) => n.subject_id)));
      const { data: subjectsData } = await supabase.from('subjects').select('id, name, slug').in('id', subjectIds);
      const subMap = new Map((subjectsData || []).map((s: any) => [s.id, s]));
      const mapped = pyqData.map((n: any) => {
        const sub = subMap.get(n.subject_id);
        return {
          id: n.id,
          year: n.year,
          pdf_url: n.pdf_url,
          answer_pdf_url: n.answer_pdf_url,
          subject_name: sub?.name || 'Unknown',
          subject_slug: sub?.slug || '',
        };
      });
      setPyqs(mapped);
      setLoading(false);
    }
    fetchPYQ();
  }, []);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-[#F97316]" />
            {t('Previous Year Questions', 'पिछले साल के प्रश्न')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('All previous year question papers with answers', 'सभी पिछले साल के प्रश्न पत्र उत्तरों के साथ')}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        ) : pyqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No PYQs available yet.', 'अभी कोई PYQ उपलब्ध नहीं हैं।')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pyqs.map((pyq) => (
              <Card key={pyq.id} className="bg-gray-900 border-white/10 p-5 flex items-center justify-between gap-4 flex-wrap hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#F97316]/10 text-[#F97316]">{pyq.year}</span>
                      <span className="text-white font-semibold">{pyq.subject_name}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{t('Previous Year Question Paper', 'पिछले साल का प्रश्न पत्र')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(pyq.pdf_url, '_blank')}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('View', 'देखें')}
                  </Button>
                  <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                    <a href={pyq.pdf_url} download>
                      <Download className="w-4 h-4 mr-1" />
                      {t('Download', 'डाउनलोड')}
                    </a>
                  </Button>
                  {pyq.answer_pdf_url && (
                    <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" asChild>
                      <a href={pyq.answer_pdf_url} download>
                        {t('Answer', 'उत्तर')}
                      </a>
                    </Button>
                  )}
                  {pyq.subject_slug && (
                    <Link href={`/subject/${pyq.subject_slug}`}>
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {t('Subject', 'विषय')}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
