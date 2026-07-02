'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Eye, Type, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Year {
  id: string;
  number: number;
  label: string;
}

interface Semester {
  id: string;
  number: number;
  year_id: string;
  branch_id: string;
  branch_name?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  semester_id: string;
}

interface NoteItem {
  id: string;
  file_name: string;
  pdf_url: string | null;
  unit_number: number | null;
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

export function AllNotes() {
  const { t } = useLanguage();
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchYears() {
      const { data } = await supabase.from('years').select('*').order('number');
      setYears(data || []);
      setLoading(false);
    }
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setSemesters([]);
      setSelectedSemester(null);
      setSubjects([]);
      setSelectedSubject(null);
      setNotes([]);
      return;
    }
    async function fetchSemesters() {
      setLoadingSemesters(true);
      const { data: semData } = await supabase
        .from('semesters')
        .select('id, number, year_id, branch_id, branches(name)')
        .eq('year_id', selectedYear!.id)
        .order('number');
      const mapped = (semData || []).map((s: any) => ({
        id: s.id,
        number: s.number,
        year_id: s.year_id,
        branch_id: s.branch_id,
        branch_name: s.branches?.name || 'Common',
      }));
      setSemesters(mapped);
      setLoadingSemesters(false);
    }
    fetchSemesters();
    setSelectedSemester(null);
    setSubjects([]);
    setSelectedSubject(null);
    setNotes([]);
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedSemester) {
      setSubjects([]);
      setSelectedSubject(null);
      setNotes([]);
      return;
    }
    async function fetchSubjects() {
      setLoadingSubjects(true);
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('semester_id', selectedSemester!.id)
        .order('name');
      setSubjects(data || []);
      setLoadingSubjects(false);
    }
    fetchSubjects();
    setSelectedSubject(null);
    setNotes([]);
  }, [selectedSemester]);

  useEffect(() => {
    if (!selectedSubject) {
      setNotes([]);
      return;
    }
    async function fetchNotes() {
      setLoadingNotes(true);
      const { data } = await supabase
        .from('content_files')
        .select('*')
        .eq('section', 'notes')
        .eq('subject_id', selectedSubject!.id)
        .order('unit_number', { ascending: false, nullsFirst: false });
      setNotes(data || []);
      setLoadingNotes(false);
    }
    fetchNotes();
  }, [selectedSubject]);

  const toggleText = (id: string) => {
    const newExpanded = new Set(expandedText);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedText(newExpanded);
  };

  const getSemesterLabel = (semNumber: number) => {
    return `${t('Semester', 'सेमेस्टर')} ${semNumber}`;
  };

  if (loading) {
    return (
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 bg-gray-800 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#F97316]" />
            {t('All Notes', 'सभी नोट्स')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Browse notes by Year, Semester, and Subject', 'वर्ष, सेमेस्टर और विषय के अनुसार नोट्स ब्राउज़ करें')}
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        {(selectedYear || selectedSemester || selectedSubject) && (
          <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
            <button
              onClick={() => { setSelectedYear(null); setSelectedSemester(null); setSelectedSubject(null); }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t('All Years', 'सभी वर्ष')}
            </button>
            {selectedYear && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <button
                  onClick={() => { setSelectedSemester(null); setSelectedSubject(null); }}
                  className={selectedSemester ? 'text-gray-400 hover:text-white transition-colors' : 'text-[#F97316]'}
                >
                  {selectedYear.label}
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={selectedSubject ? 'text-gray-400 hover:text-white transition-colors' : 'text-[#F97316]'}
                >
                  {getSemesterLabel(selectedSemester.number)} {selectedSemester.branch_name !== 'Common' && `- ${selectedSemester.branch_name}`}
                </button>
              </>
            )}
            {selectedSubject && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className="text-[#F97316]">{selectedSubject.name}</span>
              </>
            )}
          </div>
        )}

        {/* Year Selection */}
        {!selectedYear && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {years.map((year) => (
              <Card
                key={year.id}
                className="bg-gray-900 border-white/10 p-6 cursor-pointer hover:border-[#F97316]/50 hover:bg-gray-800 transition-all group"
                onClick={() => setSelectedYear(year)}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#F97316] mb-2 group-hover:scale-110 transition-transform">
                    {year.number}
                  </div>
                  <div className="text-white font-semibold">{year.label}</div>
                  <div className="text-gray-500 text-sm mt-1">{t('Year', 'वर्ष')}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Semester Selection */}
        {selectedYear && !selectedSemester && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{t('Select Semester', 'सेमेस्टर चुनें')}</h2>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setSelectedYear(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>
            {loadingSemesters ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 bg-gray-800" />
                ))}
              </div>
            ) : semesters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('No semesters available', 'कोई सेमेस्टर उपलब्ध नहीं')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semesters.map((sem) => (
                  <Card
                    key={sem.id}
                    className="bg-gray-900 border-white/10 p-6 cursor-pointer hover:border-[#F97316]/50 hover:bg-gray-800 transition-all"
                    onClick={() => setSelectedSemester(sem)}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {t('Sem', 'सेम')} {sem.number}
                      </div>
                      {sem.branch_name && sem.branch_name !== 'Common' && (
                        <div className="text-xs text-gray-400">{sem.branch_name}</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subject Selection */}
        {selectedSemester && !selectedSubject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{t('Select Subject', 'विषय चुनें')}</h2>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setSelectedSemester(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>
            {loadingSubjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-gray-800" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('No subjects available for this semester', 'इस सेमेस्टर के लिए कोई विषय उपलब्ध नहीं')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="bg-gray-900 border-white/10 p-5 cursor-pointer hover:border-[#F97316]/50 hover:bg-gray-800 transition-all"
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">{subject.name}</p>
                        {subject.code && (
                          <p className="text-gray-500 text-sm">{subject.code}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes List for Selected Subject */}
        {selectedSubject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSubject.name}</h2>
                {selectedSubject.code && (
                  <p className="text-gray-500 text-sm">{selectedSubject.code}</p>
                )}
              </div>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setSelectedSubject(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>

            {loadingNotes ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 bg-gray-800" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">{t('No notes uploaded for this subject yet.', 'इस विषय के लिए अभी कोई नोट्स अपलोड नहीं किए गए।')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id}>
                    <Card className="bg-gray-900 border-white/10 p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            {note.content_type === 'text' ? (
                              <Type className="w-5 h-5 text-green-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-[#F97316]" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{note.file_name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {note.content_type === 'text' && (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                              )}
                              {note.unit_number && (
                                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">{t('Unit', 'यूनिट')} {note.unit_number}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {note.content_type === 'file' && note.pdf_url && (
                            <>
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
                            </>
                          )}
                          {note.content_type === 'text' && (
                            <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white" onClick={() => toggleText(note.id)}>
                              <Eye className="w-4 h-4 mr-1" />
                              {expandedText.has(note.id) ? t('Hide', 'छुपाएं') : t('Read', 'पढ़ें')}
                            </Button>
                          )}
                        </div>
                      </div>
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
        )}
      </div>
    </section>
  );
}
