'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  type: 'subject' | 'note';
  slug?: string;
  pdf_url?: string;
  subject_name?: string;
}

export function SearchResults() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const q = query.toLowerCase();
      
      const [subjects, notes] = await Promise.all([
        supabase.from('subjects').select('id, name, slug').ilike('name', `%${q}%`).order('name', { ascending: true }).limit(20),
        supabase.from('notes').select('id, title, pdf_url, subject_id').ilike('title', `%${q}%`).order('title', { ascending: true }).limit(20),
      ]);

      const subjectIds = (notes.data || []).map((n: any) => n.subject_id);
      const { data: subjectNames } = subjectIds.length > 0
        ? await supabase.from('subjects').select('id, name').in('id', subjectIds)
        : { data: [] };
      const nameMap = new Map((subjectNames || []).map((s: any) => [s.id, s.name]));

      const mapped: SearchResult[] = [
        ...(subjects.data || []).map((s: any) => ({ id: s.id, name: s.name, type: 'subject' as const, slug: s.slug })),
        ...(notes.data || []).map((n: any) => ({ id: n.id, name: n.title, type: 'note' as const, pdf_url: n.pdf_url, subject_name: nameMap.get(n.subject_id) || '' })),
      ];
      setResults(mapped);
      setLoading(false);
    }
    search();
  }, [query]);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-[#F97316]" />
            {t('Search Results', 'खोज परिणाम')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('Results for', 'परिणाम')}: <span className="text-white font-medium">"{query}"</span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-gray-800" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('No results found.', 'कोई परिणाम नहीं मिला।')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="bg-gray-900 border-white/10 p-5 flex items-center gap-4 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {result.type === 'subject' ? (
                    <BookOpen className="w-5 h-5 text-[#F97316]" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{result.name}</p>
                  {result.subject_name && (
                    <p className="text-gray-500 text-sm">{result.subject_name}</p>
                  )}
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                    {result.type === 'subject' ? t('Subject', 'विषय') : t('Note', 'नोट')}
                  </span>
                </div>
                {result.type === 'subject' && result.slug && (
                  <Link href={`/subject/${result.slug}`}>
                    <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                      {t('View', 'देखें')}
                    </Button>
                  </Link>
                )}
                {result.type === 'note' && result.pdf_url && (
                  <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" asChild>
                    <a href={result.pdf_url} download>
                      {t('Download', 'डाउनलोड')}
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
