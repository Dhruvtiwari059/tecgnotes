'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code as Code2, FileText, Download, Eye, CircleHelp as HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DsaTopic {
  id: string;
  name: string;
  notes_pdf_url: string | null;
  questions_pdf_url: string | null;
}

const cardColors = [
  'border-blue-500/30 hover:border-blue-500/60',
  'border-green-500/30 hover:border-green-500/60',
  'border-red-500/30 hover:border-red-500/60',
  'border-orange-500/30 hover:border-orange-500/60',
  'border-purple-500/30 hover:border-purple-500/60',
];

export function DsaList() {
  const { t } = useLanguage();
  const [dsaTopics, setDsaTopics] = useState<DsaTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDsa() {
      // First try content_files table
      const { data: contentData } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'dsa')
        .order('subject_name', { ascending: true });

      if (contentData && contentData.length > 0) {
        // Merge notes and questions for same topic
        const topicMap = new Map<string, DsaTopic>();
        contentData.forEach((item: any) => {
          const name = item.subject_name || item.file_name;
          if (!topicMap.has(name)) {
            topicMap.set(name, {
              id: item.id,
              name,
              notes_pdf_url: null,
              questions_pdf_url: null,
            });
          }
          const topic = topicMap.get(name)!;
          if (item.is_notes_pdf) {
            topic.notes_pdf_url = item.file_url;
          }
          if (item.is_questions_pdf) {
            topic.questions_pdf_url = item.file_url;
          }
          // Use the file_url as notes if neither flag is set
          if (!item.is_notes_pdf && !item.is_questions_pdf) {
            topic.notes_pdf_url = item.file_url;
          }
        });
        setDsaTopics(Array.from(topicMap.values()));
        setLoading(false);
        return;
      }

      // Fallback to dsa_topics table
      const { data } = await supabase.from('dsa_topics').select('*').order('name', { ascending: true });
      setDsaTopics(data || []);
      setLoading(false);
    }
    fetchDsa();
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
            <Code2 className="w-8 h-8 text-[#F97316]" />
            {t('Data Structures & Algorithms', 'डेटा स्ट्रक्चर और एल्गोरिदम')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Notes and practice questions for every topic', 'प्रत्येक विषय के लिए नोट्स और प्रैक्टिस प्रश्न')}
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-gray-800" />
            ))}
          </div>
        ) : dsaTopics.length === 0 ? (
          <div className="text-center py-20">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No DSA topics added yet.', 'अभी कोई DSA विषय नहीं जोड़ा गया।')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dsaTopics.map((topic, i) => (
              <Card key={topic.id} className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-6 flex flex-col gap-4`}>
                <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                <div className="flex flex-col gap-2 mt-auto">
                  {topic.notes_pdf_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300 flex-1">{t('Notes', 'नोट्स')}</span>
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(topic.notes_pdf_url!, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                        <a href={topic.notes_pdf_url!} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                  {topic.questions_pdf_url && (
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300 flex-1">{t('Practice Questions', 'प्रैक्टिस प्रश्न')}</span>
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(topic.questions_pdf_url!, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                        <a href={topic.questions_pdf_url!} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
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
