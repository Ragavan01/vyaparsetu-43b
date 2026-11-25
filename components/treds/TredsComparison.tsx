'use client';

import {Check, Copy} from 'lucide-react';
import {useState} from 'react';
import {formatInr} from '@/lib/format';
import {UI_COPY} from '@/lib/i18n';
import {buildTredsChecklist} from '@/lib/notices';
import {REGIME_META} from '@/lib/statutory';
import type {
  AppLanguage,
  TaxRegime,
  TredsInput,
  TredsSimulation,
} from '@/lib/types';

interface TredsComparisonProps {
  input: TredsInput;
  result: TredsSimulation;
  regime: TaxRegime;
  language: AppLanguage;
  onAnnounce: (msg: string) => void;
}

export function TredsComparison({
  input,
  result,
  regime,
  language,
  onAnnounce,
}: TredsComparisonProps) {
  const [copied, setCopied] = useState(false);
  const copy = UI_COPY[language].treds;
  const meta = REGIME_META[regime];
  const checklist = buildTredsChecklist(regime, language);

  const tredsBarPct =
    input.invoiceAmount > 0
      ? Math.max(8, Math.round((result.netCashTodayTreds / input.invoiceAmount) * 100))
      : 0;
  const informalBarPct =
    input.invoiceAmount > 0
      ? Math.max(8, Math.round((result.netCashInformal / input.invoiceAmount) * 100))
      : 0;

  async function handleCopyChecklist() {
    try {
      await navigator.clipboard.writeText(checklist);
      setCopied(true);
      onAnnounce('TReDS pre-upload checklist copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onAnnounce('Clipboard unavailable; copy checklist text directly');
    }
  }

  return (
    <div className="glass-panel space-y-5 p-5">
      <div className="grid grid-cols-1 gap-3 border-b border-white/[0.08] pb-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.07] p-3">
          <p className="text-xs text-[#CBD5E1]">Net Cash Today (TReDS T+1)</p>
          <p className="font-tabular mt-1 text-xl font-bold text-[#6EE7B7]">
            {formatInr(result.netCashTodayTreds)}
          </p>
          <p className="font-tabular text-[11px] text-[#94A3B8]">
            Discount cost: {formatInr(result.tredsDiscountCost)}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/[0.08] p-3">
          <p className="text-xs text-[#CBD5E1]">Savings vs Informal Credit</p>
          <p className="font-tabular mt-1 text-xl font-bold text-[#A5B4FC]">
            {formatInr(result.savingsVsInformal)}
          </p>
          <p className="font-tabular text-[11px] text-[#94A3B8]">
            {result.annualizedMarginSavedPct}% annualized margin saved
          </p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.07] p-3">
          <p className="text-xs text-[#CBD5E1]">Buyer Tax Shield Preserved</p>
          <p className="font-tabular mt-1 text-xl font-bold text-[#FCD34D]">
            {formatInr(result.buyerTaxShieldPreserved)}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            25.17% under {meta.sectionLabel}
          </p>
        </div>
      </div>

      <ComparisonBars
        tredsNet={result.netCashTodayTreds}
        tredsCost={result.tredsDiscountCost}
        tredsBarPct={tredsBarPct}
        informalNet={result.netCashInformal}
        informalCost={result.informalCreditCost}
        informalBarPct={informalBarPct}
        delayDays={result.workingCapitalDaysUnlocked}
      />

      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-[#CBD5E1]">
        {copy.mandateNote}
      </p>

      <div className="space-y-2.5 border-t border-white/[0.08] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#F8FAFC]">
            TReDS Pre-Upload Checklist (M1xchange / RXIL / Invoicemart)
          </p>
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(79,70,229,0.4)] hover:bg-[#6366F1]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? 'Copied' : copy.copyChecklistBtn}</span>
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3.5 font-sans text-xs leading-relaxed text-[#E2E8F0]">
          {checklist}
        </pre>
      </div>
    </div>
  );
}

function ComparisonBars({
  tredsNet,
  tredsCost,
  tredsBarPct,
  informalNet,
  informalCost,
  informalBarPct,
  delayDays,
}: {
  tredsNet: number;
  tredsCost: number;
  tredsBarPct: number;
  informalNet: number;
  informalCost: number;
  informalBarPct: number;
  delayDays: number;
}) {
  return (
    <div className="space-y-3.5 text-xs">
      <div>
        <div className="mb-1.5 flex justify-between gap-2">
          <span className="font-semibold text-[#F8FAFC]">
            TReDS Non-Recourse Factoring (T+1 · {delayDays}d unlocked)
          </span>
          <span className="font-tabular font-semibold text-[#6EE7B7]">
            {formatInr(tredsNet)} net (fee {formatInr(tredsCost)})
          </span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.07]">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_14px_rgba(16,185,129,0.4)] transition-[width] duration-200"
            style={{width: `${tredsBarPct}%`}}
          >
            <span
              aria-hidden="true"
              className="fluted-glass pointer-events-none absolute inset-0"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex justify-between gap-2">
          <span className="font-semibold text-[#F8FAFC]">
            Informal Local Working-Capital Loan
          </span>
          <span className="font-tabular font-semibold text-[#FDA4AF]">
            {formatInr(informalNet)} net (cost {formatInr(informalCost)})
          </span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.07]">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#E11D48] to-[#FB7185] shadow-[0_0_14px_rgba(244,63,94,0.35)] transition-[width] duration-200"
            style={{width: `${informalBarPct}%`}}
          >
            <span
              aria-hidden="true"
              className="fluted-glass pointer-events-none absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
