'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110',
          open ? 'bg-secondary text-foreground' : 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col p-4 overflow-hidden">
          <ChatInterface isAdmin={false} />
        </div>
      )}
    </>
  );
}
