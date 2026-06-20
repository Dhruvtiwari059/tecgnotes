import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AllPYQ } from '@/components/all-pyq';

export const metadata = {
  title: 'All PYQ - TechNotes',
  description: 'Browse all previous year question papers on TechNotes.',
};

export default function PYQPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <AllPYQ />
      <Footer />
    </main>
  );
}
