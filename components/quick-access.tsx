'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { FileText, CircleHelp as HelpCircle, Code as Code2, Briefcase, MessageCircle, Star, ScrollText } from 'lucide-react';

const items = [
  { href: '/notes', label: 'Notes', labelHi: 'नोट्स', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { href: '/pyq', label: 'PYQ', labelHi: 'पी.वाई.क्यू', icon: HelpCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  { href: '/imp-questions', label: 'Imp Questions', labelHi: 'महत्वपूर्ण प्रश्न', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { href: '/syllabus', label: 'Syllabus', labelHi: 'सिलेबस', icon: ScrollText, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { href: '/dsa', label: 'DSA', labelHi: 'डीएसए', icon: Code2, color: 'text-red-400', bg: 'bg-red-400/10' },
  { href: '/placement', label: 'Placement', labelHi: 'प्लेसमेंट', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { href: '/chatbot', label: 'AI Chatbot', labelHi: 'AI चैटबॉट', icon: MessageCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export function QuickAccess() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t('Quick Access', 'त्वरित पहुंच')}
          </h2>
          <p className="text-gray-400">
            {t('Jump to your favorite section', 'अपने पसंदीदा सेक्शन पर जाएं')}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {items.map((item) => (
            <Link href={item.href} key={item.href}>
              <Card className="group bg-gray-900 border-white/10 hover:border-white/20 hover:bg-gray-800 transition-all cursor-pointer p-6 flex flex-col items-center gap-3 text-center">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-[#F97316] transition-colors">
                  {t(item.label, item.labelHi)}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
