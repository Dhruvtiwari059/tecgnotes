import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SubjectList } from '@/components/subject-list';

export default function SemesterPage({ params }: { params: { year: string; branch: string; sem: string } }) {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <SubjectList year={parseInt(params.year)} branch={params.branch} sem={parseInt(params.sem)} />
      <Footer />
    </main>
  );
}
