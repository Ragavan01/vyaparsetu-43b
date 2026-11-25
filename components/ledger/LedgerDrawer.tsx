'use client';

import {ArrowUpRight, Check, Copy, X} from 'lucide-react';
import {useState} from 'react';
import {formatInr, formatIsoDate} from '@/lib/format';
import {UI_COPY} from '@/lib/i18n';
import {buildBuyerNotice} from '@/lib/notices';
import {REGIME_META} from '@/lib/statutory';
import type {
  AppLanguage,
  ComplianceAuditResult,
  InvoiceRecord,
  TaxRegime,
} from '@/lib/types';

interface LedgerDrawerProps {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
  regime: TaxRegime;
  language: AppLanguage;
  onClose: () => void;
  onSimulateTreds: (invoice: InvoiceRecord) => void;
  onAnnounce: (message: string) => void;
}

export function LedgerDrawer({
  invoice,
  audit,
  regime,
  language,
  onClose,
  onSimulateTreds,
  onAnnounce,
}: LedgerDrawerProps) {
  const [copied, setCopied] = useState(false);
  const copy = UI_COPY[language].ledger;
  const meta = REGIME_META[regime];
  const noticeText = buildBuyerNotice(invoice, audit, regime, language);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(noticeText);
      setCopied(true);
      onAnnounce('Buyer statutory notice copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onAnnounce('Clipboard unavailable; select and copy the notice text manually');
    }
  }

  return (
    <aside
      aria-label={`Statutory breakdown for ${invoice.invoiceNumber}`}
      className="glass-panel space-y-5 p-5"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div>
          <p className="font-tabular text-xs text-[#94A3B8]">
            {invoice.invoiceNumber} · {invoice.udyamCategory} · {invoice.provenance}
          </p>
          <h3 className="font-display mt-1 text-lg font-bold text-[#F8FAFC]">
            {invoice.supplierName} → {invoice.buyerName}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close statutory breakdown drawer"
          className="min-h-[36px] min-w-[36px] rounded-lg border border-white/12 bg-white/[0.04] p-1.5 text-[#94A3B8] hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <DualTriggerBreakdown audit={audit} meta={meta} />

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#F8FAFC]">
            Polite Buyer Notice ({language === 'hi' ? 'हिन्दी + Hinglish' : 'English'} · WhatsApp / Email)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(79,70,229,0.4)] hover:bg-[#6366F1]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copied ? copy.copiedLabel : copy.copyNoticeBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onSimulateTreds(invoice)}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-emerald-400/50 hover:text-[#6EE7B7]"
            >
              <span>TReDS</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3.5 font-sans text-xs leading-relaxed text-[#E2E8F0]">
          {noticeText}
        </pre>
      </div>
    </aside>
  );
}

function DualTriggerBreakdown({
  audit,
  meta,
}: {
  audit: ComplianceAuditResult;
  meta: (typeof REGIME_META)[TaxRegime];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-4 text-xs">
        <p className="font-semibold text-[#F8FAFC]">
          Trigger (a) · MSMED Act §16 Penal Interest
        </p>
        <p className="mt-1 text-[#CBD5E1]">
          Accrues immediately past Day {audit.statutoryLimitDays} ({formatIsoDate(audit.statutoryDueDate)}) at{' '}
          <span className="font-tabular font-semibold text-white">
            {audit.section16AnnualRate}% p.a.
          </span>{' '}
          (3× RBI {audit.rbiBankRate}%) compounded monthly. Non-deductible under MSMED §23.
        </p>
        <p className="font-tabular mt-2 text-lg font-bold text-[#FDA4AF]">
          {formatInr(audit.section16Interest)} accrued ({audit.overdueDays}d overdue)
        </p>
      </div>

      <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.07] p-4 text-xs">
        <p className="font-semibold text-[#F8FAFC]">
          Trigger (b) · March 31 Cliff ({meta.sectionLabel})
        </p>
        <p className="mt-1 text-[#CBD5E1]">
          Expense disallowance under {meta.actName} ({meta.auditFormLabel}) bites if unpaid on{' '}
          <span className="font-tabular font-semibold text-white">
            {formatIsoDate(audit.fiscalYearEnd)}
          </span>
          — deferred to payment year with no {meta.itrSectionLabel} ITR grace period.
        </p>
        <p className="font-tabular mt-2 text-lg font-bold text-[#FCD34D]">
          {audit.eligibleForProtection
            ? `${formatInr(audit.buyerTaxDisallowance)} buyer tax risk (25.17%)`
            : 'Medium / Unverified — Excluded'}
        </p>
      </div>
    </div>
  );
}
