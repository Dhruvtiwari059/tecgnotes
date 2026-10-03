import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/lib/language';
import { ThemeProvider } from '@/lib/theme';
import { FloatingChat } from '@/components/floating-chat';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechNotes - RGPV University Notes & Study Hub',
  description: 'TechNotes is your one-stop study hub for RGPV University. Get notes, PYQs, DSA materials, placement prep, and AI study assistance.',
  keywords: 'RGPV, TechNotes, university notes, engineering notes, CS, IT, AIML, previous year questions, DSA, placement',
  openGraph: {
    title: 'TechNotes - RGPV University Notes & Study Hub',
    description: 'Your smart study companion for RGPV University.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechNotes',
    description: 'RGPV University Notes & Study Hub',
  },
};

const themeInitScript = `
(function() {
  try {
    var raw = localStorage.getItem('technotes-theme');
    var prefs = raw ? JSON.parse(raw) : { mode: 'dark', theme: 'blue', brightness: 100, textSize: 'medium' };
    var root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(prefs.mode || 'dark');
    root.setAttribute('data-theme', prefs.theme || 'blue');
    root.style.filter = 'brightness(' + (prefs.brightness || 100) + '%)';
    var ts = prefs.textSize || 'medium';
    root.style.fontSize = ts === 'small' ? '14px' : ts === 'large' ? '18px' : '16px';
  } catch(e) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'blue');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="blue" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <FloatingChat />
            <Toaster position="bottom-right" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
