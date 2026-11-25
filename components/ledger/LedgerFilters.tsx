'use client';

import {Download, RotateCcw, Search} from 'lucide-react';
import {UI_COPY} from '@/lib/i18n';
import type {AppLanguage, TaxRegime} from '@/lib/types';

export type LedgerFilterKey =
  | 'all'
  | 'overdue'
  | 'due_soon'
  | 'march31'
  | 'treds_ready';

interface LedgerFiltersProps {
  language: AppLanguage;
  regime: TaxRegime;
  query: string;
  activeFilter: LedgerFilterKey;
  counts: Record<LedgerFilterKey, number>;
  exportDisabled: boolean;
  onQueryChange: (q: string) => void;
  onFilterChange: (f: LedgerFilterKey) => void;
  onExportCsv: () => void;
  onResetPilot: () => void;
}

const FILTER_LABELS: Array<{key: LedgerFilterKey; label: string}> = [
  {key: 'all', label: 'All'},
  {key: 'overdue', label: 'Overdue'},
  {key: 'due_soon', label: 'Due <7d'},
  {key: 'march31', label: 'March 31 Cliff'},
  {key: 'treds_ready', label: 'TReDS Ready'},
];

export function LedgerFilters({
  language,
  regime,
  query,
  activeFilter,
  counts,
  exportDisabled,
  onQueryChange,
  onFilterChange,
  onExportCsv,
  onResetPilot,
}: LedgerFiltersProps) {
  const copy = UI_COPY[language].ledger;
  const exportLabel =
    regime === 'TY_2026_27' ? 'Export Form 26 CSV' : 'Export Clause 22 CSV';

  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-xs">
        <label htmlFor="ledger-search-input" className="sr-only">
          Search receivables ledger
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
          aria-hidden="true"
        />
        <input
          id="ledger-search-input"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={copy.searchPlaceholder}
          className="glass-input min-h-[40px] w-full pl-9 pr-3 text-xs placeholder:text-[#94A3B8]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter invoices by compliance status"
          className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
        >
          {FILTER_LABELS.map((item) => {
            const active = activeFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(item.key)}
                className={`min-h-[34px] whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#4F46E5] text-white shadow-[0_0_16px_rgba(79,70,229,0.4)]'
                    : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}{' '}
                <span className="font-tabular opacity-85">({counts[item.key]})</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={exportDisabled}
          onClick={onExportCsv}
          className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-indigo-400/30 bg-indigo-500/[0.12] px-3.5 py-1.5 text-xs font-semibold text-[#C7D2FE] transition-colors hover:border-indigo-400/55 hover:bg-indigo-500/20 hover:text-white disabled:opacity-45"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{exportLabel}</span>
        </button>

        <button
          type="button"
          onClick={onResetPilot}
          className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-white/25 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{copy.resetBtn}</span>
        </button>
      </div>
    </div>
  );
}
