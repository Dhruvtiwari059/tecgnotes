'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Eye, Type } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface NoteItem {
  id: string;
  title: string;
  file_name: string;
  pdf_url: string | null;
  unit_number: number | null;
  subject_name: string | null;
  content_type: string;
  text_content: string | null;
}

function renderTextContent(text: string): React.ReactNode {
  // Simple markdown-like rendering
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-md font-bold text-white mt-4 mb-2">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>;
    }
    // Bold
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Code
    processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>');
    // List items
    if (line.startsWith('- ')) {
      return <li key={i} className="text-gray-300 ml-4" dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />;
    }
    // Empty line
    if (line.trim() === '') {
      return <br key={i} />;
    }
    // Regular text
    return <p key={i} className="text-gray-300 mb-1" dangerouslySetInnerHTML={{ __html: processedLine }} />;
  });
}

export function AllNotes() {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchNotes() {
      // First try content_files table
      const { data: contentData } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'notes')
        .order('uploaded_at', { ascending: false });

      if (contentData && contentData.length > 0) {
        const mapped = contentData.map((n: any) => ({
          id: n.id,
          title: n.subject_name || n.file_name,
          file_name: n.file_name,
          pdf_url: n.file_url,
          unit_number: n.unit_number,
          subject_name: n.subject_name,
          content_type: n.content_type || 'file',
          text_content: n.text_content,
        }));
        setNotes(mapped);
        setLoading(false);
        return;
      }

      // Fallback to notes table
      const { data: notesData } = await supabase.from('notes').select('*').order('uploaded_at', { ascending: false }).limit(100);
      if (!notesData || notesData.length === 0) {
        setLoading(false);
        return;
      }
      const subjectIds = Array.from(new Set(notesData.map((n: any) => n.subject_id)));
      const { data: subjectsData } = await supabase.from('subjects').select('id, name, slug').in('id', subjectIds);
      const subMap = new Map((subjectsData || []).map((s: any) => [s.id, s]));
      const mapped = notesData.map((n: any) => {
        const sub = subMap.get(n.subject_id);
        return {
          id: n.id,
          title: n.title,
          file_name: n.title,
          pdf_url: n.pdf_url,
          unit_number: n.unit_number,
          subject_name: sub?.name || null,
          content_type: 'file',
          text_content: null,
        };
      });
      setNotes(mapped);
      setLoading(false);
    }
    fetchNotes();
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

  const cardColors = [
    'border-blue-500/30',
    'border-green-500/30',
    'border-red-500/30',
    'border-orange-500/30',
    'border-purple-500/30',
  ];

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#F97316]" />
            {t('All Notes', 'सभी नोट्स')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Browse all notes across subjects', 'सभी विषयों के नोट्स ब्राउज़ करें')}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No notes available yet.', 'अभी कोई नोट्स उपलब्ध नहीं हैं।')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, i) => (
              <div key={note.id}>
                <Card className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-5 ${note.content_type === 'text' && expandedText.has(note.id) ? '' : 'flex items-center justify-between gap-4 flex-wrap'}`}>
                  <div className={`flex items-center gap-3 ${note.content_type === 'text' && expandedText.has(note.id) ? 'mb-4' : ''}`}>
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {note.content_type === 'text' ? (
                        <Type className="w-5 h-5 text-green-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#F97316]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{note.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {note.content_type === 'text' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                        )}
                        {note.subject_name && (
                          <span className="text-xs text-gray-400">{note.subject_name}</span>
                        )}
                        {note.unit_number && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-gray-500">Unit {note.unit_number}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {note.content_type === 'file' && note.pdf_url && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(note.pdf_url!, '_blank')}>
                        <Eye className="w-4 h-4 mr-1" />
                        {t('View', 'देखें')}
                      </Button>
                      <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                        <a href={note.pdf_url!} download>
                          <Download className="w-4 h-4 mr-1" />
                          {t('Download', 'डाउनलोड')}
                        </a>
                      </Button>
                    </div>
                  )}

                  {note.content_type === 'text' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-300 hover:text-white"
                        onClick={() => toggleText(note.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {expandedText.has(note.id) ? t('Hide', 'छुपाएं') : t('Read', 'पढ़ें')}
                      </Button>
                    </div>
                  )}
                </Card>

                {note.content_type === 'text' && expandedText.has(note.id) && note.text_content && (
                  <Card className="bg-gray-800 border-white/5 p-6 mt-2">
                    <div className="prose prose-invert max-w-none">
                      {renderTextContent(note.text_content)}
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
