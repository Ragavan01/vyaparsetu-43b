'use client';

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import {formatInr, formatIsoDate} from '@/lib/format';
import {UI_COPY} from '@/lib/i18n';
import {REGIME_META} from '@/lib/statutory';
import type {
  AppLanguage,
  ComplianceAuditResult,
  ComplianceFinding,
  InvoiceRecord,
  TaxRegime,
} from '@/lib/types';
import {AnimatedNumber} from '../motion/AnimatedNumber';
import {StatutoryRiskBar} from './StatutoryRiskBar';

interface AuditVerdictPanelProps {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
  regime: TaxRegime;
  language: AppLanguage;
  aiNotes: string[];
  reducedMotion: boolean;
  onAddToLedger: () => void;
  onSimulateTreds: () => void;
}

export function AuditVerdictPanel({
  invoice,
  audit,
  regime,
  language,
  aiNotes,
  reducedMotion,
  onAddToLedger,
  onSimulateTreds,
}: AuditVerdictPanelProps) {
  const copy = UI_COPY[language].audit;
  const meta = REGIME_META[regime];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs text-[#94A3B8]">
            {invoice.provenance} · Deterministic Statutory Model
          </p>
          <h3 className="mt-0.5 text-base font-bold text-[#F8FAFC]">
            Statutory Verdict Scorecard ({meta.sectionLabel})
          </h3>
        </div>
        <span className="font-tabular text-xs font-semibold text-[#A5B4FC]">
          {invoice.invoiceNumber} · {formatInr(invoice.totalAmount)}
        </span>
      </div>

      <StatutoryRiskBar
        audit={audit}
        acceptanceDate={invoice.acceptanceDate}
        reducedMotion={reducedMotion}
      />

      <VerdictCalloutGrid audit={audit} reducedMotion={reducedMotion} />

      <ul className="space-y-2" aria-label="Compliance audit findings">
        {audit.findings.map((finding) => (
          <FindingRow key={finding.id} finding={finding} />
        ))}
      </ul>

      {aiNotes.length > 0 ? (
        <div className="rounded-xl border border-indigo-400/25 bg-indigo-500/[0.08] p-3 text-xs">
          <p className="font-semibold text-[#A5B4FC]">AI Extraction Notes</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-[#CBD5E1]">
            {aiNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onAddToLedger}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-2 text-xs font-semibold text-white shadow-[0_0_22px_rgba(79,70,229,0.42)] transition-all hover:bg-[#6366F1] sm:text-sm"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>{copy.addLedgerBtn}</span>
        </button>
        <button
          type="button"
          onClick={onSimulateTreds}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-emerald-400/50 hover:text-[#6EE7B7] sm:text-sm"
        >
          <span>{copy.simTredsBtn}</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function VerdictCalloutGrid({
  audit,
  reducedMotion,
}: {
  audit: ComplianceAuditResult;
  reducedMotion: boolean;
}) {
  const gstinLabel = audit.supplierGstinCheck.validChecksum
    ? `Valid · ${audit.supplierGstinCheck.stateCode} (${audit.supplierGstinCheck.stateName})`
    : 'Checksum Error';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-3.5">
        <p className="text-xs text-[#CBD5E1]">
          Trigger (a) · §16 Penal Interest ({audit.section16AnnualRate}% p.a.)
        </p>
        <p className="font-tabular mt-1 text-2xl font-bold text-[#FDA4AF]">
          <AnimatedNumber
            value={audit.section16Interest}
            formatter={formatInr}
            reducedMotion={reducedMotion}
          />
        </p>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">
          3× RBI {audit.rbiBankRate}% monthly compound · Non-deductible §23
        </p>
      </div>

      <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.07] p-3.5">
        <p className="text-xs text-[#CBD5E1]">
          Trigger (b) · March 31 Buyer Tax Risk (25.17%)
        </p>
        <p className="font-tabular mt-1 text-2xl font-bold text-[#FCD34D]">
          {audit.eligibleForProtection ? (
            <AnimatedNumber
              value={audit.buyerTaxDisallowance}
              formatter={formatInr}
              reducedMotion={reducedMotion}
            />
          ) : (
            'Excluded'
          )}
        </p>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">
          GSTIN: {gstinLabel} · Due {formatIsoDate(audit.statutoryDueDate)}
        </p>
      </div>
    </div>
  );
}

function FindingRow({finding}: {finding: ComplianceFinding}) {
  const tone = {
    critical: {
      box: 'border-rose-400/25 bg-rose-500/[0.07]',
      title: 'text-[#FDA4AF]',
      icon: <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FB7185]" aria-hidden="true" />,
    },
    warning: {
      box: 'border-amber-400/25 bg-amber-500/[0.07]',
      title: 'text-[#FCD34D]',
      icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FBBF24]" aria-hidden="true" />,
    },
    pass: {
      box: 'border-emerald-400/25 bg-emerald-500/[0.07]',
      title: 'text-[#6EE7B7]',
      icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" aria-hidden="true" />,
    },
    info: {
      box: 'border-indigo-400/25 bg-indigo-500/[0.07]',
      title: 'text-[#A5B4FC]',
      icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#818CF8]" aria-hidden="true" />,
    },
  }[finding.severity];

  return (
    <li className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${tone.box}`}>
      {tone.icon}
      <div>
        <p className={`font-semibold ${tone.title}`}>{finding.title}</p>
        <p className="mt-0.5 text-[#CBD5E1]">{finding.detail}</p>
      </div>
    </li>
  );
}
