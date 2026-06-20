import Navbar from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { QuickAccess } from '@/components/quick-access';
import { YearSelector } from '@/components/year-selector';
import { Footer } from '@/components/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <YearSelector />
      <QuickAccess />
      <Footer />
    </main>
  );
}
