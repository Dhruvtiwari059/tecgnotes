'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleHelp as HelpCircle, Download, Eye, Type } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PyqItem {
  id: string;
  year: string;
  pdf_url: string | null;
  answer_pdf_url: string | null;
  subject_name: string | null;
  content_type: string;
  text_content: string | null;
}

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

export function AllPYQ() {
  const { t } = useLanguage();
  const [pyqs, setPyqs] = useState<PyqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPYQ() {
      const { data: contentData } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'pyq')
        .order('uploaded_at', { ascending: false });

      if (contentData && contentData.length > 0) {
        const mapped = contentData.map((n: any) => ({
          id: n.id,
          year: n.pyq_year || 'Unknown',
          pdf_url: n.file_url,
          answer_pdf_url: n.answer_pdf_url,
          subject_name: n.subject_name,
          content_type: n.content_type || 'file',
          text_content: n.text_content,
        }));
        setPyqs(mapped);
        setLoading(false);
        return;
      }

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
          subject_name: sub?.name || null,
          content_type: 'file',
          text_content: null,
        };
      });
      setPyqs(mapped);
      setLoading(false);
    }
    fetchPYQ();
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
              <div key={pyq.id}>
                <Card className={`bg-gray-900 border-white/10 p-5 ${pyq.content_type === 'text' && expandedText.has(pyq.id) ? '' : 'flex items-center justify-between gap-4 flex-wrap'} hover:border-white/20 transition-colors`}>
                  <div className={`flex items-center gap-3 ${pyq.content_type === 'text' && expandedText.has(pyq.id) ? 'mb-4' : ''}`}>
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {pyq.content_type === 'text' ? (
                        <Type className="w-5 h-5 text-green-400" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-[#F97316]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#F97316]/10 text-[#F97316]">{pyq.year}</span>
                        <span className="text-white font-semibold">{pyq.subject_name || 'Unknown'}</span>
                        {pyq.content_type === 'text' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{t('Previous Year Question Paper', 'पिछले साल का प्रश्न पत्र')}</p>
                    </div>
                  </div>

                  {pyq.content_type === 'file' && pyq.pdf_url && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(pyq.pdf_url!, '_blank')}>
                        <Eye className="w-4 h-4 mr-1" />
                        {t('View', 'देखें')}
                      </Button>
                      <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                        <a href={pyq.pdf_url!} download>
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
                    </div>
                  )}

                  {pyq.content_type === 'text' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-300 hover:text-white"
                        onClick={() => toggleText(pyq.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {expandedText.has(pyq.id) ? t('Hide', 'छुपाएं') : t('Read', 'पढ़ें')}
                      </Button>
                    </div>
                  )}
                </Card>

                {pyq.content_type === 'text' && expandedText.has(pyq.id) && pyq.text_content && (
                  <Card className="bg-gray-800 border-white/5 p-6 mt-2">
                    <div className="prose prose-invert max-w-none">
                      {renderTextContent(pyq.text_content)}
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
