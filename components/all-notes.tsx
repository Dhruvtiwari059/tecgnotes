'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface NoteItem {
  id: string;
  title: string;
  pdf_url: string;
  unit_number: number;
  subject_name: string;
  subject_slug: string;
}

export function AllNotes() {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
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
          pdf_url: n.pdf_url,
          unit_number: n.unit_number,
          subject_name: sub?.name || 'Unknown',
          subject_slug: sub?.slug || '',
        };
      });
      setNotes(mapped);
      setLoading(false);
    }
    fetchNotes();
  }, []);

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
              <Card key={note.id} className={`bg-gray-900 border ${cardColors[i % cardColors.length]} p-5 flex items-center justify-between gap-4 flex-wrap`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{note.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{note.subject_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-gray-500">Unit {note.unit_number}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => window.open(note.pdf_url, '_blank')}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('View', 'देखें')}
                  </Button>
                  <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                    <a href={note.pdf_url} download>
                      <Download className="w-4 h-4 mr-1" />
                      {t('Download', 'डाउनलोड')}
                    </a>
                  </Button>
                  {note.subject_slug && (
                    <Link href={`/subject/${note.subject_slug}`}>
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
