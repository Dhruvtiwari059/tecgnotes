'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, BookOpen, FileText, Download, Eye, HelpCircle,
  MessageCircle, Share2, ChevronDown, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SubjectData {
  id: string;
  name: string;
  code: string | null;
  slug: string;
}

interface SyllabusUnit {
  id: string;
  unit_number: number;
  content: string;
}

interface Note {
  id: string;
  unit_number: number;
  title: string;
  pdf_url: string;
}

interface PYQ {
  id: string;
  year: string;
  pdf_url: string;
  answer_pdf_url: string | null;
}

const unitColors = [
  { border: 'border-blue-500/30', bg: 'bg-blue-500/5', accent: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400' },
  { border: 'border-green-500/30', bg: 'bg-green-500/5', accent: 'text-green-400', badge: 'bg-green-500/10 text-green-400' },
  { border: 'border-red-500/30', bg: 'bg-red-500/5', accent: 'text-red-400', badge: 'bg-red-500/10 text-red-400' },
  { border: 'border-orange-500/30', bg: 'bg-orange-500/5', accent: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400' },
  { border: 'border-purple-500/30', bg: 'bg-purple-500/5', accent: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400' },
];

export function SubjectDetail({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSubject() {
      const { data: sub } = await supabase.from('subjects').select('*').eq('slug', slug).maybeSingle();
      if (!sub) { setLoading(false); return; }
      setSubject(sub);

      const [sylData, notesData, pyqData] = await Promise.all([
        supabase.from('syllabus_units').select('*').eq('subject_id', sub.id).order('unit_number', { ascending: true }),
        supabase.from('notes').select('*').eq('subject_id', sub.id).order('unit_number', { ascending: true }),
        supabase.from('pyq').select('*').eq('subject_id', sub.id).order('year', { ascending: false }),
      ]);

      setSyllabus(sylData.data || []);
      setNotes(notesData.data || []);
      setPyqs(pyqData.data || []);
      setLoading(false);
    }
    fetchSubject();
  }, [slug]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: subject?.name || 'TechNotes', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('Link copied!', 'लिंक कॉपी हो गई!'));
    }
  }, [subject, t]);

  if (loading) {
    return (
      <section className="pt-24 pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 bg-gray-800 mb-4" />
          <Skeleton className="h-6 w-48 bg-gray-800 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!subject) {
    return (
      <section className="pt-24 pb-16 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">{t('Subject not found', 'विषय नहीं मिला')}</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subject.name}</h1>
              {subject.code && <p className="text-gray-400">{subject.code}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/chatbot?subject=${subject.slug}`}>
                <Button variant="outline" size="sm" className="border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/10">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {t('AI Chatbot', 'AI चैटबॉट')}
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                {t('Share', 'शेयर')}
              </Button>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#F97316]" />
            {t('Syllabus', 'पाठ्यक्रम')}
          </h2>
          <div className="space-y-4">
            {syllabus.map((unit, i) => {
              const colors = unitColors[i % unitColors.length];
              const isOpen = expandedUnit === unit.unit_number;
              return (
                <Card key={unit.id} className={`bg-gray-900 border ${colors.border} overflow-hidden`}>
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setExpandedUnit(isOpen ? null : unit.unit_number)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge}`}>
                        {t('Unit', 'यूनिट')} {unit.unit_number}
                      </span>
                    </div>
                    {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className={`px-5 pb-5 ${colors.bg}`}>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{unit.content}</div>
                    </div>
                  )}
                </Card>
              );
            })}
            {syllabus.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t('No syllabus data available yet.', 'पाठ्यक्रम डेटा अभी उपलब्ध नहीं है।')}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#F97316]" />
            {t('Notes', 'नोट्स')}
          </h2>
          <div className="space-y-3">
            {notes.map((note, i) => {
              const colors = unitColors[i % unitColors.length];
              return (
                <Card key={note.id} className={`bg-gray-900 border ${colors.border} p-4 flex items-center justify-between gap-4 flex-wrap`}>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.badge}`}>
                      {t('Unit', 'यूनिट')} {note.unit_number}
                    </span>
                    <span className="text-white font-medium">{note.title}</span>
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
                  </div>
                </Card>
              );
            })}
            {notes.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t('No notes available yet.', 'नोट्स अभी उपलब्ध नहीं हैं।')}</p>
            )}
          </div>
        </div>

        {/* PYQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#F97316]" />
            {t('Previous Year Questions', 'पिछले साल के प्रश्न')}
          </h2>
          <div className="space-y-3">
            {pyqs.map((pyq) => (
              <Card key={pyq.id} className="bg-gray-900 border-white/10 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-[#F97316]/10 text-[#F97316]">
                    {pyq.year}
                  </span>
                  <span className="text-white font-medium">{t('Question Paper', 'प्रश्न पत्र')}</span>
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
                </div>
              </Card>
            ))}
            {pyqs.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t('No PYQs available yet.', 'PYQ अभी उपलब्ध नहीं हैं।')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
