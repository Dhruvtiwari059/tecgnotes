'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, MessageSquare, Send, Loader as Loader2 } from 'lucide-react';
import Link from 'next/link';

export function FeedbackForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error(t('Please fill in name and message', 'कृपया नाम और संदेश भरें'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(t('Too many submissions. Please try again tomorrow.', 'बहुत अधिक सबमिशन। कृपया कल पुन: प्रयास करें।'));
        } else {
          toast.error(data.error || t('Failed to submit feedback', 'फीडबैक भेजने में विफल'));
        }
      } else {
        toast.success(t('Feedback sent successfully!', 'फीडबैक सफलतापूर्वक भेजा गया!'));
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      toast.error(t('Failed to submit feedback', 'फीडबैक भेजने में विफल'));
    }
    setLoading(false);
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-accent" />
            {t('Feedback', 'फीडबैक')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('We value your feedback. Let us know how we can improve.', 'हम आपकी फीडबैक का महत्व समझते हैं। हमें बताएं कि हम कैसे बेहतर कर सकते हैं।')}
          </p>
        </div>

        <Card className="bg-card border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('Name', 'नाम')} <span className="text-red-400">*</span></label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Your name', 'आपका नाम')}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('Email (Optional)', 'ईमेल (वैकल्पिक)')}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Your email address (optional)', 'आपका ईमेल पता (वैकल्पिक)')}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-muted-foreground text-xs mt-1">{t('Provide email if you want us to follow up', 'यदि आप चाहते हैं कि हम आपसे संपर्क करें तो ईमेल दें')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('Message', 'संदेश')} <span className="text-red-400">*</span></label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Your feedback, suggestions, or issues...', 'आपकी फीडबैक, सुझाव, या समस्याएं...')}
                rows={5}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-foreground">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {t('Send Feedback', 'फीडबैक भेजें')}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
