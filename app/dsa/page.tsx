import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DsaList } from '@/components/dsa-list';

export const metadata = {
  title: 'DSA - TechNotes',
  description: 'Data Structures and Algorithms notes and practice questions for RGPV students.',
};

export default function DsaPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <DsaList />
      <Footer />
    </main>
  );
}
