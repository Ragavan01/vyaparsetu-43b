'use client';

import {useMemo} from 'react';
import {UI_COPY} from '@/lib/i18n';
import {simulateTreds} from '@/lib/treds';
import type {AppLanguage, TaxRegime, TredsInput} from '@/lib/types';
import {GlassReveal} from '../motion/GlassReveal';
import {TredsComparison} from './TredsComparison';
import {TredsControls} from './TredsControls';

interface TredsWorkspaceProps {
  input: TredsInput;
  regime: TaxRegime;
  language: AppLanguage;
  reducedMotion: boolean;
  onChangeInput: (patch: Partial<TredsInput>) => void;
  onAnnounce: (msg: string) => void;
}

export function TredsWorkspace({
  input,
  regime,
  language,
  reducedMotion,
  onChangeInput,
  onAnnounce,
}: TredsWorkspaceProps) {
  const copy = UI_COPY[language].treds;
  const result = useMemo(() => simulateTreds(input), [input]);

  return (
    <section aria-labelledby="treds-heading" className="space-y-5">
      <div>
        <h2 id="treds-heading" className="font-display text-2xl font-bold text-[#F8FAFC]">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <GlassReveal reducedMotion={reducedMotion} className="lg:col-span-5">
          <TredsControls input={input} onChange={onChangeInput} />
        </GlassReveal>
        <GlassReveal delay={0.06} reducedMotion={reducedMotion} className="lg:col-span-7">
          <TredsComparison
            input={input}
            result={result}
            regime={regime}
            language={language}
            onAnnounce={onAnnounce}
          />
        </GlassReveal>
      </div>
    </section>
  );
}
