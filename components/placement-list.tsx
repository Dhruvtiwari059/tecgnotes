'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, FileText, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PlacementTopic {
  id: string;
  company: string;
  category: string;
  title: string;
  pdf_url: string;
}

const cardColors = [
  'border-blue-500/30 hover:border-blue-500/60',
  'border-green-500/30 hover:border-green-500/60',
  'border-red-500/30 hover:border-red-500/60',
  'border-orange-500/30 hover:border-orange-500/60',
  'border-purple-500/30 hover:border-purple-500/60',
];

export function PlacementList() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<PlacementTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchPlacement() {
      // First try content_files table
      const { data: contentData } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'placement')
        .order('company', { ascending: true });

      if (contentData && contentData.length > 0) {
        const mapped = contentData.map((item: any) => ({
          id: item.id,
          company: item.company || 'General',
          category: item.category || 'General',
          title: item.subject_name || item.file_name,
          pdf_url: item.file_url,
        }));
        setTopics(mapped);
        setLoading(false);
        return;
      }

      // Fallback to placement_topics table
      const { data } = await supabase.from('placement_topics').select('*').order('company', { ascending: true });
      setTopics(data || []);
      setLoading(false);
    }
    fetchPlacement();
  }, []);

  const companies = Array.from(new Set(topics.map(t => t.company)));
  const categories = Array.from(new Set(topics.map(t => t.category)));

  const filtered = filter === 'all' ? topics : topics.filter(t => t.company === filter || t.category === filter);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#F97316]" />
            {t('Placement Preparation', 'प्लेसमेंट तैयारी')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Company-wise and topic-wise materials', 'कंपनी-वार और विषय-वार सामग्री')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#F97316] text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            {t('All', 'सभी')}
          </button>
          {companies.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-[#F97316] text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-[#1E3A8A] text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-gray-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No placement materials yet.', 'अभी कोई प्लेसमेंट सामग्री नहीं।')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((topic, i) => (
              <Card key={topic.id} className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-5 flex flex-col gap-3`}>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#F97316]/10 text-[#F97316]">{topic.company}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1E3A8A]/10 text-blue-400">{topic.category}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{topic.title}</h3>
                <div className="flex items-center gap-2 mt-auto">
                  <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(topic.pdf_url, '_blank')}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('View', 'देखें')}
                  </Button>
                  <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                    <a href={topic.pdf_url} download>
                      <Download className="w-4 h-4 mr-1" />
                      {t('Download', 'डाउनलोड')}
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
