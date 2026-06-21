'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, FileText, Download, Eye, Type } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PlacementTopic {
  id: string;
  company: string;
  category: string;
  title: string;
  pdf_url: string | null;
  content_type: string;
  text_content: string | null;
}

const cardColors = [
  'border-blue-500/30 hover:border-blue-500/60',
  'border-green-500/30 hover:border-green-500/60',
  'border-red-500/30 hover:border-red-500/60',
  'border-orange-500/30 hover:border-orange-500/60',
  'border-purple-500/30 hover:border-purple-500/60',
];

function renderTextContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-md font-bold text-white mt-4 mb-2">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>;
    }
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>');
    if (line.startsWith('- ')) {
      return <li key={i} className="text-gray-300 ml-4" dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="text-gray-300 mb-1" dangerouslySetInnerHTML={{ __html: processedLine }} />;
  });
}

export function PlacementList() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<PlacementTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPlacement() {
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
          content_type: item.content_type || 'file',
          text_content: item.text_content,
        }));
        setTopics(mapped);
        setLoading(false);
        return;
      }

      const { data } = await supabase.from('placement_topics').select('*').order('company', { ascending: true });
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          company: item.company || 'General',
          category: item.category || 'General',
          title: item.title || item.file_name,
          pdf_url: item.pdf_url,
          content_type: 'file',
          text_content: null,
        }));
        setTopics(mapped);
      } else {
        setTopics([]);
      }
      setLoading(false);
    }
    fetchPlacement();
  }, []);

  const companies = Array.from(new Set(topics.map(t => t.company)));
  const categories = Array.from(new Set(topics.map(t => t.category)));

  const filtered = filter === 'all' ? topics : topics.filter(t => t.company === filter || t.category === filter);

  const toggleText = (id: string) => {
    const newExpanded = new Set(expandedText);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedText(newExpanded);
  };

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
          <div className="space-y-6">
            {filtered.map((topic, i) => (
              <div key={topic.id}>
                <Card className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#F97316]/10 text-[#F97316]">{topic.company}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1E3A8A]/10 text-blue-400">{topic.category}</span>
                        {topic.content_type === 'text' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">{topic.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {topic.content_type === 'file' && topic.pdf_url && (
                        <>
                          <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(topic.pdf_url!, '_blank')}>
                            <Eye className="w-4 h-4 mr-1" />
                            {t('View', 'देखें')}
                          </Button>
                          <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                            <a href={topic.pdf_url!} download>
                              <Download className="w-4 h-4 mr-1" />
                              {t('Download', 'डाउनलोड')}
                            </a>
                          </Button>
                        </>
                      )}
                      {topic.content_type === 'text' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-300 hover:text-white"
                          onClick={() => toggleText(topic.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {expandedText.has(topic.id) ? t('Hide', 'छुपाएं') : t('Read', 'पढ़ें')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {topic.content_type === 'text' && expandedText.has(topic.id) && topic.text_content && (
                  <Card className="bg-gray-800 border-white/5 p-6 mt-2">
                    <div className="prose prose-invert max-w-none">
                      {renderTextContent(topic.text_content)}
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
