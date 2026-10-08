'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsPanel } from '@/components/settings-panel';
import { BookOpen, Search, Menu, X, Languages, GraduationCap, Code as Code2, Briefcase, MessageCircle, Mail, FileText, CircleHelp as HelpCircle, Shield, Chrome as Home, Star, ScrollText, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { mode, toggleMode } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: t('Home', 'होम'), icon: Home },
    { href: '/notes', label: t('Notes', 'नोट्स'), icon: FileText },
    { href: '/pyq', label: t('PYQ', 'पी.वाई.क्यू'), icon: HelpCircle },
    { href: '/imp-questions', label: t('Imp Questions', 'महत्वपूर्ण प्रश्न'), icon: Star },
    { href: '/syllabus', label: t('Syllabus', 'सिलेबस'), icon: ScrollText },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Tech<span className="text-accent">Notes</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-4 2xl:gap-6 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-accent',
                  pathname === link.href ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden xl:flex items-center relative shrink-0">
              <Input
                type="search"
                placeholder={t('Search notes...', 'नोट्स खोजें...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 2xl:w-48 bg-secondary border-border text-foreground placeholder:text-muted-foreground pr-9"
              />
              <button type="submit" className="absolute right-2 text-muted-foreground hover:text-foreground">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
            >
              <Languages className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">{lang === 'en' ? 'EN' : 'HI'}</span>
            </Button>

            {mounted && (
              <button
                onClick={toggleMode}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                title={mode === 'dark' ? t('Light mode', 'लाइट मोड') : t('Dark mode', 'डार्क मोड')}
              >
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            <SettingsPanel />

            <button
              className="xl:hidden text-foreground p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden bg-background/95 border-t border-border px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <Input
              type="search"
              placeholder={t('Search notes...', 'नोट्स खोजें...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border-border text-foreground placeholder:text-muted-foreground pr-9"
            />
            <button type="submit" className="absolute right-2 text-muted-foreground hover:text-foreground">
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
                pathname === link.href ? 'text-accent bg-foreground/5' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
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
