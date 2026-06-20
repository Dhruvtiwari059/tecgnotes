import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FeedbackForm } from '@/components/feedback-form';

export const metadata = {
  title: 'Feedback - TechNotes',
  description: 'Send feedback to TechNotes team.',
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <FeedbackForm />
      <Footer />
    </main>
  );
}
