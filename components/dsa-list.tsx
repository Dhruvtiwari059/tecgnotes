'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code as Code2, FileText, Download, Eye, CircleHelp as HelpCircle, Type } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DsaTopicItem {
  id: string;
  topic_name: string;
  notes_pdf_url: string | null;
  questions_pdf_url: string | null;
  text_id: string | null;
  text_content: string | null;
  has_text: boolean;
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

export function DsaList() {
  const { t } = useLanguage();
  const [dsaTopics, setDsaTopics] = useState<DsaTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchDsa() {
      const { data: contentData } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'dsa')
        .order('subject_name', { ascending: true });

      if (contentData && contentData.length > 0) {
        // Group by topic name
        const topicMap = new Map<string, DsaTopicItem>();
        contentData.forEach((item: any) => {
          const name = item.subject_name || item.file_name;
          if (!topicMap.has(name)) {
            topicMap.set(name, {
              id: item.id,
              topic_name: name,
              notes_pdf_url: null,
              questions_pdf_url: null,
              text_id: null,
              text_content: null,
              has_text: false,
            });
          }
          const topic = topicMap.get(name)!;

          if (item.content_type === 'text' && item.text_content) {
            topic.text_id = item.id;
            topic.text_content = item.text_content;
            topic.has_text = true;
          } else if (item.file_url) {
            if (item.is_notes_pdf) {
              topic.notes_pdf_url = item.file_url;
            } else if (item.is_questions_pdf) {
              topic.questions_pdf_url = item.file_url;
            } else {
              // Default to notes if neither flag is set
              topic.notes_pdf_url = item.file_url;
            }
          }
        });
        setDsaTopics(Array.from(topicMap.values()));
        setLoading(false);
        return;
      }

      const { data } = await supabase.from('dsa_topics').select('*').order('name', { ascending: true });
      if (data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          topic_name: item.name,
          notes_pdf_url: item.notes_pdf_url,
          questions_pdf_url: item.questions_pdf_url,
          text_id: null,
          text_content: null,
          has_text: false,
        }));
        setDsaTopics(mapped);
      }
      setLoading(false);
    }
    fetchDsa();
  }, []);

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
              <div key={topic.id} className="contents">
                <Card className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-6 flex flex-col gap-4`}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{topic.topic_name}</h3>
                    {topic.has_text && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    {topic.text_content && (
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300 flex-1">{t('Notes', 'नोट्स')}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-300 hover:text-white"
                          onClick={() => toggleText(topic.text_id || topic.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {topic.notes_pdf_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300 flex-1">{topic.text_content ? t('PDF Notes', 'PDF नोट्स') : t('Notes', 'नोट्स')}</span>
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

                {topic.text_content && expandedText.has(topic.text_id || topic.id) && (
                  <Card className="bg-gray-800 border-white/5 p-6 col-span-1 md:col-span-2 lg:col-span-3 mt-[-16px] mb-4">
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
