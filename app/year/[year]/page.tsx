import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BranchSelector } from '@/components/branch-selector';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { year: string } }) {
  const year = params.year;
  return {
    title: `Year ${year} - TechNotes`,
  };
}

export default function YearPage({ params }: { params: { year: string } }) {
  const yearNum = parseInt(params.year, 10);
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <BranchSelector year={yearNum} />
      <Footer />
    </main>
  );
}
