'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/language';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'blue', label: 'Blue', colors: ['#1E3A8A', '#F97316'] },
  { id: 'green', label: 'Green', colors: ['#15803D', '#EAB308'] },
  { id: 'purple', label: 'Purple', colors: ['#6B21A8', '#EC4899'] },
] as const;

const textSizes = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
] as const;

export function SettingsPanel() {
  const { mode, theme, brightness, textSize, setTheme, setBrightness, setTextSize, toggleMode } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
        title={t('Settings', 'सेटिंग्स')}
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t('Display Settings', 'डिस्प्ले सेटिंग्स')}</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dark/Light toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{t('Appearance', 'दिखावट')}</span>
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              {mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {mode === 'dark' ? t('Dark', 'डार्क') : t('Light', 'लाइट')}
            </button>
          </div>

          {/* Brightness slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('Brightness', 'ब्राइटनेस')} <span className="text-xs opacity-70">(90–110%)</span></span>
              <span className="text-xs text-muted-foreground font-medium">{brightness}%</span>
            </div>
            <input
              type="range"
              min={90}
              max={110}
              step={5}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          {/* Text size */}
          <div className="mb-4">
            <span className="text-sm text-muted-foreground block mb-2">{t('Text Size', 'टेक्स्ट साइज')}</span>
            <div className="flex gap-2">
              {textSizes.map((ts) => (
                <button
                  key={ts.id}
                  onClick={() => setTextSize(ts.id)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border',
                    textSize === ts.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                  )}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color themes */}
          <div>
            <span className="text-sm text-muted-foreground block mb-2">{t('Color Theme', 'कलर थीम')}</span>
            <div className="flex gap-3">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 group',
                  )}
                  title={th.label}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all border-2',
                      theme === th.id
                        ? 'border-foreground scale-110'
                        : 'border-transparent group-hover:scale-105'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${th.colors[0]}, ${th.colors[1]})`,
                    }}
                  >
                    {theme === th.id && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={cn('text-xs', theme === th.id ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                    {th.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
