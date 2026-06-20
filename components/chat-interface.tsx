'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, ImagePlus, X, Loader2, KeyRound, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const KEY_COUNT = 6;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_PREFIX = 'gemini_key_cooldown_';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  imageData?: string;
  imageMime?: string;
}

interface KeyStatus {
  index: number;
  onCooldown: boolean;
  remainingSeconds: number;
}

function getCooldownExpiry(index: number): number | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(`${COOLDOWN_PREFIX}${index}`);
  if (!raw) return null;
  const expiry = parseInt(raw, 10);
  if (isNaN(expiry)) return null;
  return expiry;
}

function setCooldown(index: number) {
  if (typeof localStorage === 'undefined') return;
  const expiry = Date.now() + COOLDOWN_MS;
  localStorage.setItem(`${COOLDOWN_PREFIX}${index}`, expiry.toString());
}

function getKeyStatuses(): KeyStatus[] {
  const now = Date.now();
  return Array.from({ length: KEY_COUNT }, (_, i) => {
    const expiry = getCooldownExpiry(i);
    const remaining = expiry ? Math.max(0, Math.ceil((expiry - now) / 1000)) : 0;
    return {
      index: i,
      onCooldown: remaining > 0,
      remainingSeconds: remaining,
    };
  });
}

function getNextAvailableKeyIndex(startIndex: number): number | null {
  const statuses = getKeyStatuses();
  for (let offset = 0; offset < KEY_COUNT; offset++) {
    const idx = (startIndex + offset) % KEY_COUNT;
    if (!statuses[idx].onCooldown) return idx;
  }
  return null;
}

function getMinRemainingCooldown(): number {
  const statuses = getKeyStatuses();
  const remaining = statuses.filter(s => s.onCooldown).map(s => s.remainingSeconds);
  return remaining.length > 0 ? Math.min(...remaining) : 0;
}

async function callChatbotAPI(messages: Message[], keyIndex: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chatbot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages, keyIndex }),
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export function ChatInterface({ fullPage = false }: { fullPage?: boolean }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: t('Hi! I am TechNotes AI. Ask me anything about engineering subjects, or upload a PDF/image for analysis.', 'नमस्ते! मैं TechNotes AI हूँ। इंजीनियरिंग विषयों के बारे में कुछ भी पूछें, या विश्लेषण के लिए PDF/इमेज अपलोड करें।') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [keyStatuses, setKeyStatuses] = useState<KeyStatus[]>([]);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [waitingAllCooldown, setWaitingAllCooldown] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    setKeyStatuses(getKeyStatuses());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setKeyStatuses(getKeyStatuses());
    }, 1000);
    return () => clearInterval(interval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !waitingAllCooldown) return;
    const interval = setInterval(() => {
      const minRemaining = getMinRemainingCooldown();
      if (minRemaining <= 0) {
        setWaitingAllCooldown(false);
        setWaitSeconds(0);
        setKeyStatuses(getKeyStatuses());
      } else {
        setWaitSeconds(minRemaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isClient, waitingAllCooldown]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error(t('Image too large. Max 4MB.', 'इमेज बहुत बड़ी है। अधिकतम 4MB।'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageData(base64);
      setImageMime(file.type);
      toast.success(t('Image ready for upload', 'इमेज अपलोड के लिए तैयार'));
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !imageData) return;
    if (waitingAllCooldown) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim() || t('Analyze this image', 'इस इमेज का विश्लेषण करें'),
      imageData: imageData || undefined,
      imageMime: imageMime || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setImageData(null);
    setImageMime(null);

    let keyIdx = getNextAvailableKeyIndex(currentKeyIndex);
    if (keyIdx === null) {
      setWaitingAllCooldown(true);
      setWaitSeconds(getMinRemainingCooldown());
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = KEY_COUNT;

    while (attempts < maxAttempts) {
      setCurrentKeyIndex(keyIdx);
      const result = await callChatbotAPI(newMessages, keyIdx);
      attempts++;

      if (result.ok) {
        setMessages([...newMessages, { role: 'assistant', text: result.data.response || t('No response received.', 'कोई प्रतिक्रिया नहीं मिली।') }]);
        setLoading(false);
        return;
      }

      if (result.status === 429) {
        setCooldown(keyIdx);
        setKeyStatuses(getKeyStatuses());
        keyIdx = getNextAvailableKeyIndex((keyIdx + 1) % KEY_COUNT);
        if (keyIdx === null) {
          setWaitingAllCooldown(true);
          setWaitSeconds(getMinRemainingCooldown());
          setLoading(false);
          return;
        }
        continue;
      }

      toast.error(result.data.error || t('Failed to get response', 'प्रतिक्रिया प्राप्त करने में विफल'));
      setMessages([...newMessages, { role: 'assistant', text: t('Sorry, I am having trouble right now. Please try again later.', 'क्षमा करें, मुझे अभी समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।') }]);
      setLoading(false);
      return;
    }

    setWaitingAllCooldown(true);
    setWaitSeconds(getMinRemainingCooldown());
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col ${fullPage ? 'max-w-4xl mx-auto h-[calc(100vh-200px)]' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#F97316] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white">TechNotes AI</h2>
          <p className="text-xs text-gray-400">{t('Powered by Gemini 1.5 Flash', 'Gemini 1.5 Flash द्वारा संचालित')}</p>
        </div>
        {/* Active key indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <KeyRound className="w-3 h-3 text-gray-400" />
          <div className="flex gap-0.5">
            {keyStatuses.map((status) => (
              <div
                key={status.index}
                className={cn(
                  'w-2 h-2 rounded-full',
                  status.index === currentKeyIndex && !status.onCooldown
                    ? 'bg-green-500 animate-pulse'
                    : status.onCooldown
                    ? 'bg-red-500'
                    : 'bg-gray-600'
                )}
                title={`Key ${status.index + 1}${status.onCooldown ? ` (cooldown ${status.remainingSeconds}s)` : ''}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {keyStatuses[currentKeyIndex]?.onCooldown ? '--' : `Key ${currentKeyIndex + 1}`}
          </span>
        </div>
      </div>

      {/* Key status bar */}
      <div className="flex items-center gap-1 mb-2 px-2 flex-wrap">
        <span className="text-[10px] text-gray-500 font-medium">{t('API Keys:', 'API Keys:')}</span>
        {keyStatuses.map((status) => (
          <div
            key={status.index}
            className={cn(
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors border',
              status.index === currentKeyIndex && !status.onCooldown
                ? 'bg-green-500/20 text-green-400 border-green-500/40'
                : status.onCooldown
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-gray-800/50 text-gray-500 border-gray-700/40'
            )}
          >
            <span>{status.index + 1}</span>
            {status.onCooldown && <span className="text-[8px] opacity-80">{status.remainingSeconds}s</span>}
          </div>
        ))}
      </div>

      {/* Wait countdown */}
      {waitingAllCooldown && (
        <div className="flex items-center gap-2 mb-3 mx-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <Clock className="w-4 h-4 text-orange-400 animate-pulse flex-shrink-0" />
          <span className="text-sm text-orange-300 font-medium">
            {t(`Please wait ${waitSeconds}s`, `${waitSeconds} सेकंड प्रतीक्षा करें`)}
          </span>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 rounded-xl border border-white/10 bg-gray-900/50 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#1E3A8A]' : 'bg-[#F97316]'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-800 text-gray-200'}`}>
                {msg.imageData && (
                  <img src={`data:${msg.imageMime};base64,${msg.imageData}`} alt="uploaded" className="max-w-[200px] rounded-lg mb-2" />
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#F97316] animate-spin" />
                  <span className="text-xs text-gray-400">Key {currentKeyIndex + 1}...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {imageData && (
        <div className="flex items-center gap-2 mt-2 px-2">
          <div className="relative">
            <img src={`data:${imageMime};base64,${imageData}`} alt="preview" className="h-12 w-12 rounded object-cover" />
            <button onClick={() => { setImageData(null); setImageMime(null); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <span className="text-xs text-gray-400">{t('Image attached', 'इमेज अटैच की गई')}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 px-2">
        <input
          type="file"
          accept="image/*,.pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="w-5 h-5" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('Type your question...', 'अपना प्रश्न लिखें...')}
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          disabled={loading || waitingAllCooldown}
        />
        <Button
          onClick={handleSend}
          disabled={loading || waitingAllCooldown || (!input.trim() && !imageData)}
          className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
