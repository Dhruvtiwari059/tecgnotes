import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/lib/language';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <LanguageProvider>
          {children}
          <FloatingChat />
          <Toaster position="bottom-right" richColors theme="dark" />
        </LanguageProvider>
      </body>
    </html>
  );
}
