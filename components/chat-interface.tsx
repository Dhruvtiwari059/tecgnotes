'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, ImagePlus, X, Loader as Loader2, KeyRound, Clock, Paperclip, Mic, FileText, File as FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const KEY_COUNT = 6;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_PREFIX = 'gemini_key_cooldown_';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  data: string;
  size: number;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  attachments?: AttachedFile[];
}

interface KeyStatus {
  index: number;
  onCooldown: boolean;
  remainingSeconds: number;
}

function formatResponseText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();

    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,3})/)?.[1]?.length || 1;
      const content = trimmed.replace(/^#{1,3}\s*/, '');
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      const sizeClass = level === 1 ? 'text-lg font-bold mt-4 mb-2' : level === 2 ? 'text-base font-semibold mt-3 mb-1' : 'text-sm font-medium mt-2 mb-1';
      return <Tag key={i} className={`${sizeClass} text-foreground`}>{content}</Tag>;
    }

    if (/^[-*•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*•]\s*/, '');
      const styledContent = content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return (
        <div key={i} className="flex items-start gap-2 my-1">
          <span className="text-accent mt-1">✦</span>
          <span className="text-foreground" dangerouslySetInnerHTML={{ __html: styledContent }} />
        </div>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, '');
      const styledContent = content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return (
        <div key={i} className="flex items-start gap-2 my-1">
          <span className="text-primary font-medium min-w-[20px]">{line.match(/^\d+/)?.[0]}.</span>
          <span className="text-foreground" dangerouslySetInnerHTML={{ __html: styledContent }} />
        </div>
      );
    }

    if (trimmed.startsWith('━') || trimmed.startsWith('─') || trimmed.startsWith('═')) {
      return <hr key={i} className="border-t border-border my-2" />;
    }

    if (trimmed === '') {
      return <div key={i} className="h-2" />;
    }

    const styledLine = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="text-muted-foreground">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-code-bg px-1.5 py-0.5 rounded text-sm text-accent">$1</code>');

    return <p key={i} className="text-foreground my-0.5" dangerouslySetInnerHTML={{ __html: styledLine }} />;
  });
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImagePlus className="w-4 h-4" />;
  if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
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

export function ChatInterface({ fullPage = false, isAdmin = false }: { fullPage?: boolean; isAdmin?: boolean }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: t('Hi! I am TechNotes AI. Ask me anything about any engineering subject — CSE, Civil, Electrical, Electronics, Mechanical, or upload a PDF/image for analysis.', 'नमस्ते! मैं TechNotes AI हूँ। किसी भी इंजीनियरिंग विषय — CSE, सिविल, इलेक्ट्रिकल, इलेक्ट्रॉनिक्स, मैकेनिकल — के बारे में पूछें, या विश्लेषण के लिए PDF/इमेज अपलोड करें।') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('File too large. Max 10MB per file.', 'फाइल बहुत बड़ी है। अधिकतम 10MB प्रति फाइल।'));
        return;
      }

      const allowedTypes = ['image/', 'application/pdf'];
      if (!allowedTypes.some(type => file.type.startsWith(type) || file.type === type)) {
        toast.error(t('Only images and PDF files allowed', 'केवल इमेज और PDF फाइलें अनुमत हैं'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const attachedFile: AttachedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          data: base64,
          size: file.size,
        };
        setAttachedFiles(prev => [...prev, attachedFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (waitingAllCooldown) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim() || t('Analyze these files', 'इन फाइलों का विश्लेषण करें'),
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

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
        setAttachedFiles([]);
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
      setAttachedFiles([]);
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
      {/* Header - Clean for students */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">TechNotes AI</h2>
          <p className="text-xs text-muted-foreground">{t('Your AI study assistant', 'आपका AI अध्ययन सहायक')}</p>
        </div>
        {/* Admin-only key indicator */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <KeyRound className="w-3 h-3 text-muted-foreground" />
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
                      : 'bg-muted'
                  )}
                  title={`Key ${status.index + 1}${status.onCooldown ? ` (cooldown ${status.remainingSeconds}s)` : ''}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {keyStatuses[currentKeyIndex]?.onCooldown ? '--' : `Key ${currentKeyIndex + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Admin-only key status bar */}
      {isAdmin && (
        <div className="flex items-center gap-1 mb-2 px-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-medium">{t('API Keys:', 'API Keys:')}</span>
          {keyStatuses.map((status) => (
            <div
              key={status.index}
              className={cn(
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors border',
                status.index === currentKeyIndex && !status.onCooldown
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : status.onCooldown
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-secondary/50 text-muted-foreground border-border'
              )}
            >
              <span>{status.index + 1}</span>
              {status.onCooldown && <span className="text-[8px] opacity-80">{status.remainingSeconds}s</span>}
            </div>
          ))}
        </div>
      )}

      {/* Wait countdown */}
      {waitingAllCooldown && (
        <div className="flex items-center gap-2 mb-3 mx-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <Clock className="w-4 h-4 text-orange-400 animate-pulse flex-shrink-0" />
          <span className="text-sm text-orange-300 font-medium">
            {t(`Please wait ${waitSeconds}s`, `${waitSeconds} सेकंड प्रतीक्षा करें`)}
          </span>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 rounded-xl border border-border bg-card/50 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-accent'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att) => (
                      <div key={att.id}>
                        {att.type.startsWith('image/') ? (
                          <img src={`data:${att.type};base64,${att.data}`} alt={att.name} className="max-w-[150px] rounded-lg" />
                        ) : (
                          <div className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-lg">
                            <FileText className="w-4 h-4 text-accent" />
                            <span className="text-xs truncate max-w-[100px]">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="prose  prose-sm max-w-none">
                  {msg.role === 'assistant' ? formatResponseText(msg.text) : <div className="whitespace-pre-wrap">{msg.text}</div>}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="bg-secondary rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs text-muted-foreground">{t('Thinking...', 'सोच रहा हूँ...')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 px-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-border group">
              {file.type.startsWith('image/') ? (
                <img src={`data:${file.type};base64,${file.data}`} alt={file.name} className="w-10 h-10 rounded object-cover" />
              ) : (
                getFileIcon(file.type)
              )}
              <span className="text-xs text-muted-foreground max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachedFile(file.id)}
                className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clean input bar */}
      <div className="flex items-center gap-2 mt-4 p-2 rounded-full bg-card/80 border border-border">
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
          onClick={() => fileInputRef.current?.click()}
          title={t('Attach files', 'फाइलें अटैच करें')}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
          onClick={() => fileInputRef.current?.click()}
          title={t('Attach image', 'इमेज अटैच करें')}
        >
          <ImagePlus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full opacity-50"
          disabled
          title={t('Voice input', 'वॉइस इनपुट')}
        >
          <Mic className="w-5 h-5" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('Ask me anything...', 'मुझसे कुछ भी पूछें...')}
          className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={loading || waitingAllCooldown}
        />
        <Button
          onClick={handleSend}
          disabled={loading || waitingAllCooldown || (!input.trim() && attachedFiles.length === 0)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full w-10 h-10"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
