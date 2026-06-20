import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AllNotes } from '@/components/all-notes';

export const metadata = {
  title: 'All Notes - TechNotes',
  description: 'Browse all notes across subjects on TechNotes.',
};

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <AllNotes />
      <Footer />
    </main>
  );
}
