import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SearchResults } from '@/components/search-results';

export const metadata = {
  title: 'Search - TechNotes',
  description: 'Search notes by subject or title on TechNotes.',
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <SearchResults />
      <Footer />
    </main>
  );
}
