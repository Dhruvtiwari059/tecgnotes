import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PlacementList } from '@/components/placement-list';

export const metadata = {
  title: 'Placement - TechNotes',
  description: 'Company-wise and topic-wise placement preparation materials for RGPV students.',
};

export default function PlacementPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <PlacementList />
      <Footer />
    </main>
  );
}
