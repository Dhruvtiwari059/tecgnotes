'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ChatInterface } from '@/components/chat-interface';
import { supabase } from '@/lib/supabase';

export default function ChatbotPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from('admin_users').select('email').eq('email', session.user.email).maybeSingle();
      setIsAdmin(!!data);
    }
    checkAdmin();
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <ChatInterface fullPage isAdmin={isAdmin} />
      </div>
      <Footer />
    </main>
  );
}
