'use client';

import {motion} from 'framer-motion';
import {ArrowRight, FileSpreadsheet} from 'lucide-react';
import {formatShortInr} from '@/lib/format';
import {UI_COPY} from '@/lib/i18n';
import {REGIME_META} from '@/lib/statutory';
import type {AppLanguage, TaxRegime, WorkspaceId} from '@/lib/types';
import {FiscalCliffTimer} from './FiscalCliffTimer';
import {AnimatedNumber} from './motion/AnimatedNumber';
import {GlassReveal} from './motion/GlassReveal';
import {ProcessStrip} from './ProcessStrip';

export interface HeroKpiSummary {
  totalReceivables: number;
  overduePrincipal: number;
  march31TaxRisk: number;
  tredsUnlockable: number;
  invoiceCount: number;
  overdueCount: number;
}

interface HeroBandProps {
  language: AppLanguage;
  regime: TaxRegime;
  kpi: HeroKpiSummary;
  activeWorkspace: WorkspaceId;
  reducedMotion: boolean;
  onStartScan: () => void;
  onOpenLedger: () => void;
  onJumpToWorkspace: (w: WorkspaceId) => void;
}

export function HeroBand({
  language,
  regime,
  kpi,
  activeWorkspace,
  reducedMotion,
  onStartScan,
  onOpenLedger,
  onJumpToWorkspace,
}: HeroBandProps) {
  const copy = UI_COPY[language].hero;
  const meta = REGIME_META[regime];

  return (
    <section className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-5 pt-5 sm:px-6 sm:pt-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 right-6 select-none font-display text-[clamp(3.6rem,9vw,7.5rem)] font-extrabold leading-none tracking-tighter text-white/[0.03]"
      >
        BHARAT 2036
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={reducedMotion ? false : {opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.36, ease: [0.16, 1, 0.3, 1]}}
          className="max-w-2xl space-y-3"
        >
          <p className="text-xs font-medium text-[#94A3B8]">
            <span>{copy.kicker}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-[#A5B4FC]">{meta.sectionLabel}</span>
          </p>
          <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold leading-[1.08] text-[#F8FAFC]">
            {copy.headline}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#94A3B8]">
            {copy.subheading}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartScan}
              className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full bg-[#4F46E5] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_26px_rgba(79,70,229,0.45)] transition-all hover:bg-[#6366F1]"
            >
              <span>{copy.primaryCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenLedger}
              className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#F8FAFC] transition-colors hover:border-white/30 hover:bg-white/[0.08]"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#A5B4FC]" aria-hidden="true" />
              <span>{copy.secondaryCta}</span>
            </button>
          </div>
        </motion.div>

        <GlassReveal delay={0.08} reducedMotion={reducedMotion} className="shrink-0">
          <FiscalCliffTimer regime={regime} />
        </GlassReveal>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiWidget
          label="Tracked Receivables"
          rawValue={kpi.totalReceivables}
          meta={`${kpi.invoiceCount} invoices · Illustrative Pithampur Pilot`}
          tone="neutral"
          delay={0.02}
          reducedMotion={reducedMotion}
        />
        <KpiWidget
          label="Overdue MSE Exposure"
          rawValue={kpi.overduePrincipal}
          meta={`${kpi.overdueCount} past Day 15/45 · §16 interest active`}
          tone="crimson"
          delay={0.06}
          reducedMotion={reducedMotion}
        />
        <KpiWidget
          label="March 31 Tax Shield"
          rawValue={kpi.march31TaxRisk}
          meta={`25.17% buyer disallowance · ${meta.sectionLabel}`}
          tone="amber"
          delay={0.1}
          reducedMotion={reducedMotion}
        />
        <KpiWidget
          label="TReDS T+1 Unlockable"
          rawValue={kpi.tredsUnlockable}
          meta="₹250 Cr+ mandate · M1xchange / RXIL"
          tone="emerald"
          delay={0.14}
          reducedMotion={reducedMotion}
        />
      </div>

      <ProcessStrip
        activeWorkspace={activeWorkspace}
        onJumpTo={onJumpToWorkspace}
      />
    </section>
  );
}

function KpiWidget({
  label,
  rawValue,
  meta,
  tone,
  delay,
  reducedMotion,
}: {
  label: string;
  rawValue: number;
  meta: string;
  tone: 'neutral' | 'crimson' | 'amber' | 'emerald';
  delay: number;
  reducedMotion: boolean;
}) {
  const toneClass = {
    neutral: 'text-[#F8FAFC]',
    crimson: 'text-[#FDA4AF]',
    amber: 'text-[#FCD34D]',
    emerald: 'text-[#6EE7B7]',
  }[tone];

  return (
    <GlassReveal delay={delay} reducedMotion={reducedMotion}>
      <div className="glass-panel glass-panel-interactive h-full p-4">
        <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
        <p className={`font-tabular mt-1.5 text-2xl font-semibold ${toneClass}`}>
          <AnimatedNumber
            value={rawValue}
            formatter={formatShortInr}
            reducedMotion={reducedMotion}
          />
        </p>
        <p className="mt-1 text-xs text-[#94A3B8]">{meta}</p>
      </div>
    </GlassReveal>
  );
}
