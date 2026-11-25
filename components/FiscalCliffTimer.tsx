'use client';

import {Clock} from 'lucide-react';
import {useEffect, useState} from 'react';
import {REGIME_META} from '@/lib/statutory';
import type {TaxRegime} from '@/lib/types';

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
}

const TARGET_CLIFF_MS = Date.UTC(2027, 2, 31, 18, 29, 0);
const BASELINE_NOW_MS = Date.UTC(2026, 10, 25, 10, 0, 0);

function computeCountdown(nowMs: number): CountdownParts {
  const diff = Math.max(0, TARGET_CLIFF_MS - nowMs);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return {days, hours, minutes};
}

export function FiscalCliffTimer({regime}: {regime: TaxRegime}) {
  const [parts, setParts] = useState<CountdownParts>(() =>
    computeCountdown(BASELINE_NOW_MS),
  );
  const meta = REGIME_META[regime];

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const effectiveNow = now < TARGET_CLIFF_MS ? now : BASELINE_NOW_MS;
      setParts(computeCountdown(effectiveNow));
    };
    const timer = window.setInterval(tick, 30_000);
    const raf = window.requestAnimationFrame(tick);
    return () => {
      window.clearInterval(timer);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="glass-panel glass-panel-interactive w-full max-w-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#F59E0B]">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          March 31 Fiscal Cliff
        </span>
        <span className="font-tabular">31 Mar 2027 · IST</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
        <TimerUnit value={String(parts.days).padStart(3, '0')} label="Days" />
        <TimerUnit value={String(parts.hours).padStart(2, '0')} label="Hours" />
        <TimerUnit value={String(parts.minutes).padStart(2, '0')} label="Mins" />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[#94A3B8]">
        Unpaid overdue MSE invoices on 31 March lose buyer deduction under{' '}
        <span className="font-semibold text-[#F8FAFC]">{meta.sectionLabel}</span>{' '}
        with no {meta.itrSectionLabel} ITR grace period.
      </p>
    </div>
  );
}

function TimerUnit({value, label}: {value: string; label: string}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2.5">
      <p className="font-tabular text-2xl font-semibold text-[#F8FAFC]">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[#94A3B8]">{label}</p>
    </div>
  );
}
