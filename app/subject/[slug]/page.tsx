import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SubjectDetail } from '@/components/subject-detail';

export default function SubjectPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <SubjectDetail slug={params.slug} />
      <Footer />
    </main>
  );
}
