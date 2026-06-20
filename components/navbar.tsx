'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen, Search, Menu, X, Languages, GraduationCap,
  Code2, Briefcase, MessageCircle, Mail, FileText, HelpCircle, Shield, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: t('Home', 'होम'), icon: Home },
    { href: '/notes', label: t('Notes', 'नोट्स'), icon: FileText },
    { href: '/pyq', label: t('PYQ', 'पी.वाई.क्यू'), icon: HelpCircle },
    { href: '/dsa', label: t('DSA', 'डीएसए'), icon: Code2 },
    { href: '/placement', label: t('Placement', 'प्लेसमेंट'), icon: Briefcase },
    { href: '/chatbot', label: t('AI Chatbot', 'AI चैटबॉट'), icon: MessageCircle },
    { href: '/feedback', label: t('Feedback', 'फीडबैक'), icon: Mail },
    { href: '/admin', label: t('Admin', 'एडमिन'), icon: Shield },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Tech<span className="text-[#F97316]">Notes</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-[#F97316]',
                  pathname === link.href ? 'text-[#F97316]' : 'text-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <Input
                type="search"
                placeholder={t('Search notes...', 'नोट्स खोजें...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-9"
              />
              <button type="submit" className="absolute right-2 text-gray-400 hover:text-white">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <Languages className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">{lang === 'en' ? 'EN' : 'HI'}</span>
            </Button>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <Input
              type="search"
              placeholder={t('Search notes...', 'नोट्स खोजें...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-9"
            />
            <button type="submit" className="absolute right-2 text-gray-400 hover:text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg',
                pathname === link.href ? 'text-[#F97316] bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
