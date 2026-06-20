import Navbar from '@/components/navbar';
import { AdminPanel } from '@/components/admin-panel';

export const metadata = {
  title: 'Admin Panel - TechNotes',
  description: 'Admin panel for managing TechNotes content.',
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <AdminPanel />
    </main>
  );
}
