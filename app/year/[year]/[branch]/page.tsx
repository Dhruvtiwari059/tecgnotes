import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SemesterSelector } from '@/components/semester-selector';

export async function generateMetadata({ params }: { params: { year: string; branch: string } }) {
  return {
    title: `Year ${params.year} - ${params.branch.toUpperCase()} - TechNotes`,
  };
}

export default function BranchPage({ params }: { params: { year: string; branch: string } }) {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <SemesterSelector year={parseInt(params.year)} branch={params.branch} />
      <Footer />
    </main>
  );
}
