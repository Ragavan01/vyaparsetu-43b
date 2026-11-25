'use client';

import {Sparkles} from 'lucide-react';
import {REGIME_META} from '@/lib/statutory';
import type {AppLanguage, TaxRegime} from '@/lib/types';

interface ControlStripProps {
  language: AppLanguage;
  regime: TaxRegime;
  rbiBankRate: number;
  reducedMotion: boolean;
  onChangeLanguage: (lang: AppLanguage) => void;
  onChangeRegime: (regime: TaxRegime) => void;
  onToggleMotion: () => void;
}

export function ControlStrip({
  language,
  regime,
  rbiBankRate,
  reducedMotion,
  onChangeLanguage,
  onChangeRegime,
  onToggleMotion,
}: ControlStripProps) {
  const meta = REGIME_META[regime];
  const section16Rate = (rbiBankRate * 3).toFixed(2);

  return (
    <section
      aria-label="Workspace statutory, language, and motion controls"
      className="mx-auto max-w-[1280px] px-4 pt-3 sm:px-6"
    >
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-3.5 py-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5"
          >
            <button
              type="button"
              aria-pressed={language === 'en'}
              onClick={() => onChangeLanguage('en')}
              className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              aria-pressed={language === 'hi'}
              onClick={() => onChangeLanguage('hi')}
              className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                language === 'hi'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              हिन्दी + Hinglish
            </button>
          </div>

          <div
            role="group"
            aria-label="Income tax regime switcher"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5"
          >
            <button
              type="button"
              aria-pressed={regime === 'TY_2026_27'}
              onClick={() => onChangeRegime('TY_2026_27')}
              className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                regime === 'TY_2026_27'
                  ? 'bg-white/15 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              TY 2026-27 · §37(2)(g)
            </button>
            <button
              type="button"
              aria-pressed={regime === 'FY_2025_26'}
              onClick={() => onChangeRegime('FY_2025_26')}
              className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                regime === 'FY_2025_26'
                  ? 'bg-white/15 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              FY 2025-26 · §43B(h)
            </button>
          </div>

          <button
            type="button"
            aria-pressed={reducedMotion}
            onClick={onToggleMotion}
            className="inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-white/25 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" aria-hidden="true" />
            <span>Motion: {reducedMotion ? 'Reduced' : 'Smooth'}</span>
          </button>
        </div>

        <p className="font-tabular text-xs text-[#94A3B8]">
          <span>{meta.actName}</span>
          <span aria-hidden="true"> · </span>
          <span>{meta.auditFormLabel}</span>
          <span aria-hidden="true"> · </span>
          <span className="text-[#CBD5E1]">
            RBI {rbiBankRate.toFixed(2)}% / §16 {section16Rate}%
          </span>
        </p>
      </div>
    </section>
  );
}
