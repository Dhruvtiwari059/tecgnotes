import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ChatInterface } from '@/components/chat-interface';

export const metadata = {
  title: 'AI Chatbot - TechNotes',
  description: 'TechNotes AI study assistant powered by Gemini.',
};

export default function ChatbotPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <ChatInterface fullPage />
      </div>
      <Footer />
    </main>
  );
}
