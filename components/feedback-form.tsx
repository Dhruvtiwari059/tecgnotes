'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Mail, MessageSquare, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export function FeedbackForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t('Please fill all fields', 'कृपया सभी फ़ील्ड भरें'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('feedback').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Feedback sent successfully!', 'फीडबैक सफलतापूर्वक भेजा गया!'));
      setName('');
      setEmail('');
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#F97316]" />
            {t('Feedback', 'फीडबैक')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('We value your feedback. Let us know how we can improve.', 'हम आपकी फीडबैक का महत्व समझते हैं। हमें बताएं कि हम कैसे बेहतर कर सकते हैं।')}
          </p>
        </div>

        <Card className="bg-gray-900 border-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t('Name', 'नाम')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Your name', 'आपका नाम')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t('Email', 'ईमेल')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Your email address', 'आपका ईमेल पता')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t('Message', 'संदेश')}</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Your feedback, suggestions, or issues...', 'आपकी फीडबैक, सुझाव, या समस्याएं...')}
                rows={5}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {t('Send Feedback', 'फीडबैक भेजें')}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
