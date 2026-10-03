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
  file_url: string | null;
  file_type: string | null;
  unit_number: number | null;
  subject_name: string | null;
  content_type: string;
  text_content: string | null;
}

function renderTextContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-md font-bold text-foreground mt-4 mb-2">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="text-xl font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h2>;
    }
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-code-bg px-1 rounded text-sm">$1</code>');
    if (line.startsWith('- ')) {
      return <li key={i} className="text-muted-foreground ml-4" dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="text-muted-foreground mb-1" dangerouslySetInnerHTML={{ __html: processedLine }} />;
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
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 bg-secondary mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-secondary" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            {t('All Notes', 'सभी नोट्स')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('Browse notes by Year, Semester, and Subject', 'वर्ष, सेमेस्टर और विषय के अनुसार नोट्स ब्राउज़ करें')}
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        {(selectedYear || selectedSemester || selectedSubject) && (
          <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
            <button
              onClick={() => { setSelectedYear(null); setSelectedSemester(null); setSelectedSubject(null); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('All Years', 'सभी वर्ष')}
            </button>
            {selectedYear && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => { setSelectedSemester(null); setSelectedSubject(null); }}
                  className={selectedSemester ? 'text-muted-foreground hover:text-foreground transition-colors' : 'text-accent'}
                >
                  {selectedYear.label}
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={selectedSubject ? 'text-muted-foreground hover:text-foreground transition-colors' : 'text-accent'}
                >
                  {getSemesterLabel(selectedSemester.number)} {selectedSemester.branch_name !== 'Common' && `- ${selectedSemester.branch_name}`}
                </button>
              </>
            )}
            {selectedSubject && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-accent">{selectedSubject.name}</span>
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
                className="bg-card border-border p-6 cursor-pointer hover:border-accent/50 hover:bg-secondary transition-all group"
                onClick={() => setSelectedYear(year)}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform">
                    {year.number}
                  </div>
                  <div className="text-foreground font-semibold">{year.label}</div>
                  <div className="text-muted-foreground text-sm mt-1">{t('Year', 'वर्ष')}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Semester Selection */}
        {selectedYear && !selectedSemester && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{t('Select Semester', 'सेमेस्टर चुनें')}</h2>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedYear(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>
            {loadingSemesters ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 bg-secondary" />
                ))}
              </div>
            ) : semesters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('No semesters available', 'कोई सेमेस्टर उपलब्ध नहीं')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semesters.map((sem) => (
                  <Card
                    key={sem.id}
                    className="bg-card border-border p-6 cursor-pointer hover:border-accent/50 hover:bg-secondary transition-all"
                    onClick={() => setSelectedSemester(sem)}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {t('Sem', 'सेम')} {sem.number}
                      </div>
                      {sem.branch_name && sem.branch_name !== 'Common' && (
                        <div className="text-xs text-muted-foreground">{sem.branch_name}</div>
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
              <h2 className="text-xl font-bold text-foreground">{t('Select Subject', 'विषय चुनें')}</h2>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedSemester(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>
            {loadingSubjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-secondary" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('No subjects available for this semester', 'इस सेमेस्टर के लिए कोई विषय उपलब्ध नहीं')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="bg-card border-border p-5 cursor-pointer hover:border-accent/50 hover:bg-secondary transition-all"
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-foreground font-semibold">{subject.name}</p>
                        {subject.code && (
                          <p className="text-muted-foreground text-sm">{subject.code}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
                <h2 className="text-xl font-bold text-foreground">{selectedSubject.name}</h2>
                {selectedSubject.code && (
                  <p className="text-muted-foreground text-sm">{selectedSubject.code}</p>
                )}
              </div>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedSubject(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('Back', 'वापस')}
              </Button>
            </div>

            {loadingNotes ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 bg-secondary" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t('No notes uploaded for this subject yet.', 'इस विषय के लिए अभी कोई नोट्स अपलोड नहीं किए गए।')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id}>
                    <Card className="bg-card border-border p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            {note.content_type === 'text' ? (
                              <Type className="w-5 h-5 text-green-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-accent" />
                            )}
                          </div>
                          <div>
                            <p className="text-foreground font-semibold">{note.file_name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {note.content_type === 'text' && (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                              )}
                              {note.unit_number && (
                                <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">{t('Unit', 'यूनिट')} {note.unit_number}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {note.content_type === 'file' && note.file_url && (
                            <>
                              {(note.file_type === 'pdf' || note.file_type === 'image') && (
                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.open(note.file_url!, '_blank')}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  {t('View', 'देखें')}
                                </Button>
                              )}
                              {(note.file_type === 'docx' || note.file_type === 'pptx' || note.file_type === 'doc' || note.file_type === 'ppt') && (
                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(note.file_url!)}`, '_blank')}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  {t('View', 'देखें')}
                                </Button>
                              )}
                              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                                <a href={note.file_url!} download>
                                  <Download className="w-4 h-4 mr-1" />
                                  {t('Download', 'डाउनलोड')}
                                </a>
                              </Button>
                            </>
                          )}
                          {note.content_type === 'text' && (
                            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => toggleText(note.id)}>
                              <Eye className="w-4 h-4 mr-1" />
                              {expandedText.has(note.id) ? t('Hide', 'छुपाएं') : t('Read', 'पढ़ें')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>

                    {note.content_type === 'text' && expandedText.has(note.id) && note.text_content && (
                      <Card className="bg-secondary border-border p-6 mt-2">
                        <div className="prose  max-w-none">
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
