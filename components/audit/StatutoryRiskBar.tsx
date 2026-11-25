'use client';

import {motion} from 'framer-motion';
import {formatIsoDate} from '@/lib/format';
import type {ComplianceAuditResult} from '@/lib/types';

interface StatutoryRiskBarProps {
  audit: ComplianceAuditResult;
  acceptanceDate: string;
  reducedMotion: boolean;
}

export function StatutoryRiskBar({
  audit,
  acceptanceDate,
  reducedMotion,
}: StatutoryRiskBarProps) {
  const maxSpan = audit.statutoryLimitDays + 45;
  const fillPct = Math.max(
    6,
    Math.min(100, Math.round((audit.daysElapsed / maxSpan) * 100)),
  );
  const capMarkerPct = Math.round((audit.statutoryLimitDays / maxSpan) * 100);

  const barGradient =
    audit.status === 'overdue'
      ? 'from-[#10B981] via-[#F59E0B] to-[#F43F5E]'
      : audit.status === 'due_soon'
        ? 'from-[#10B981] to-[#F59E0B]'
        : 'from-[#4F46E5] to-[#10B981]';

  const statusSummary =
    audit.status === 'overdue'
      ? `Day ${audit.daysElapsed} · Overdue by ${audit.overdueDays}d`
      : audit.status === 'excluded'
        ? `Day ${audit.daysElapsed} · Medium Enterprise Excluded`
        : `Day ${audit.daysElapsed} · ${audit.daysRemaining}d left to statutory cap`;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-[#F8FAFC]">
          Statutory Risk Timeline
        </span>
        <span className="font-tabular text-[#CBD5E1]">{statusSummary}</span>
      </div>

      <div className="relative mt-3 h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.07]">
        <motion.div
          initial={reducedMotion ? false : {width: '0%'}}
          animate={{width: `${fillPct}%`}}
          transition={
            reducedMotion
              ? {duration: 0}
              : {duration: 0.65, ease: [0.16, 1, 0.3, 1]}
          }
          className={`relative h-full overflow-hidden rounded-full bg-gradient-to-r shadow-[0_0_16px_rgba(244,63,94,0.35)] ${barGradient}`}
        >
          <span
            aria-hidden="true"
            className="fluted-glass pointer-events-none absolute inset-0"
          />
        </motion.div>
        <div
          aria-hidden="true"
          style={{left: `${capMarkerPct}%`}}
          className="absolute bottom-0 top-0 w-[2px] bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
        />
      </div>

      <div className="font-tabular mt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
        <span>Day 0 ({formatIsoDate(acceptanceDate)})</span>
        <span className="text-[#FCD34D]">
          Day {audit.statutoryLimitDays} Cap ({formatIsoDate(audit.statutoryDueDate)})
        </span>
        <span className="text-[#FDA4AF]">
          March 31 Cliff ({formatIsoDate(audit.fiscalYearEnd)})
        </span>
      </div>
    </div>
  );
}
