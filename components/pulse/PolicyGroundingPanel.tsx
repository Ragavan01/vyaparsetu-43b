'use client';

import {ExternalLink, Loader2, SearchCheck} from 'lucide-react';
import {isSafeHttpUrl} from '@/lib/format';
import {UI_COPY} from '@/lib/i18n';
import {DEFAULT_RBI_BANK_RATE, REGIME_META} from '@/lib/statutory';
import type {
  AppLanguage,
  PolicyGroundingResponse,
  TaxRegime,
} from '@/lib/types';

interface PolicyGroundingPanelProps {
  language: AppLanguage;
  regime: TaxRegime;
  rbiBankRate: number;
  policyData: PolicyGroundingResponse | null;
  verifying: boolean;
  errorMsg: string | null;
  onChangeRbiRate: (rate: number) => void;
  onVerifyPolicy: () => void;
}

export function PolicyGroundingPanel({
  language,
  regime,
  rbiBankRate,
  policyData,
  verifying,
  errorMsg,
  onChangeRbiRate,
  onVerifyPolicy,
}: PolicyGroundingPanelProps) {
  const copy = UI_COPY[language].pulse;
  const meta = REGIME_META[regime];
  const sec16Rate = (rbiBankRate * 3).toFixed(2);

  return (
    <div className="glass-panel space-y-5 p-5">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-[#94A3B8]">
            {policyData?.provenance ?? 'Deterministic Statutory Model'} · {meta.sectionLabel} · RBI 7 Oct 2026 Baseline
          </p>
          <h3 className="font-display mt-1 text-lg font-bold text-[#F8FAFC]">
            RBI Bank Rate &amp; Live Policy Grounding
          </h3>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rbi-rate-input" className="block text-xs font-medium text-[#94A3B8]">
              {copy.rbiLabel}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="rbi-rate-input"
                type="number"
                min={2}
                max={15}
                step={0.05}
                value={rbiBankRate}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next) && next >= 1 && next <= 20) {
                    onChangeRbiRate(next);
                  }
                }}
                className="glass-input font-tabular min-h-[40px] w-24 px-2.5 text-sm font-semibold"
              />
              <span className="font-tabular text-xs font-semibold text-[#FDA4AF]">
                → §16: {sec16Rate}%
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={verifying}
            onClick={onVerifyPolicy}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-2 text-xs font-semibold text-white shadow-[0_0_24px_rgba(79,70,229,0.45)] transition-all hover:bg-[#6366F1] disabled:opacity-60 sm:text-sm"
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <SearchCheck className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{verifying ? copy.verifyingBtn : copy.verifyPolicyBtn}</span>
          </button>
        </div>
      </div>

      {errorMsg ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-xs text-[#FDA4AF]"
        >
          {errorMsg}
        </p>
      ) : null}

      {verifying ? (
        <div className="space-y-2.5" aria-busy="true">
          <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.07]" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-white/[0.07]" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.07]" />
        </div>
      ) : policyData ? (
        <PolicyResults data={policyData} />
      ) : (
        <BaselineStatutorySummary
          rbiRate={rbiBankRate}
          sec16Rate={sec16Rate}
          onReset={() => onChangeRbiRate(DEFAULT_RBI_BANK_RATE)}
        />
      )}
    </div>
  );
}

function BaselineStatutorySummary({
  rbiRate,
  sec16Rate,
  onReset,
}: {
  rbiRate: number;
  sec16Rate: string;
  onReset: () => void;
}) {
  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-[#94A3B8]">
      <p className="text-[#E2E8F0]">
        Click <strong>Verify Live RBI &amp; MP Policy</strong> to run real-time Google Search grounding across RBI Bank Rate notifications, Income-tax Act 2025 Section 37(2)(g) / Form No. 26 updates, TReDS ₹250 Cr mandates, and MP MSME Protsahan Yojana.
      </p>
      <p>
        Current deterministic baseline: RBI Bank Rate{' '}
        <strong className="font-tabular text-[#F8FAFC]">{rbiRate.toFixed(2)}% p.a.</strong>{' '}
        (7 Oct 2026 baseline) → MSMED §16 penal interest{' '}
        <strong className="font-tabular text-[#FDA4AF]">{sec16Rate}% p.a.</strong>{' '}
        compounded monthly (non-deductible under MSMED §23).
      </p>
      {rbiRate !== DEFAULT_RBI_BANK_RATE ? (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#A5B4FC] underline underline-offset-2"
        >
          Reset RBI Rate to 5.75% baseline
        </button>
      ) : null}
    </div>
  );
}

function PolicyResults({data}: {data: PolicyGroundingResponse}) {
  const safeCitations = data.citations.filter((c) => isSafeHttpUrl(c.uri));

  return (
    <div className="space-y-4 text-xs">
      {data.notice ? (
        <p
          role="status"
          className="rounded-xl border border-amber-400/30 bg-amber-500/[0.08] px-3.5 py-2.5 font-medium text-[#FDE68A]"
        >
          {data.notice}
        </p>
      ) : null}

      <ul className="space-y-2.5 text-[#E2E8F0]">
        {data.keyPoints.map((point, idx) => (
          <li
            key={idx}
            className="border-b border-white/[0.08] pb-2.5 leading-relaxed last:border-b-0"
          >
            {point}
          </li>
        ))}
      </ul>

      {safeCitations.length > 0 ? (
        <div className="space-y-2 border-t border-white/[0.08] pt-3">
          <p className="font-semibold text-[#94A3B8]">
            {data.mode === 'live_grounded'
              ? `Verified Web Citations (${data.provenance})`
              : 'Official Statutory Sources'}
          </p>
          <ul className="flex flex-wrap gap-2">
            {safeCitations.map((cite) => (
              <li key={cite.uri}>
                <a
                  href={cite.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 font-semibold text-[#A5B4FC] transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
                >
                  <span>{cite.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
