'use client';

import {formatInr, formatIsoDate} from '@/lib/format';
import {REGIME_META} from '@/lib/statutory';
import type {ComplianceAuditResult, InvoiceRecord, TaxRegime} from '@/lib/types';

interface InvoiceSvgPreviewProps {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
  regime: TaxRegime;
  uploadedPreviewUrl: string | null;
}

export function InvoiceSvgPreview({
  invoice,
  audit,
  regime,
  uploadedPreviewUrl,
}: InvoiceSvgPreviewProps) {
  if (uploadedPreviewUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/12 bg-black/40 p-3">
        <div className="flex items-center justify-between pb-2 text-xs text-[#94A3B8]">
          <span>Uploaded Invoice Photo Preview</span>
          <span className="text-[#A5B4FC]">Gemini Vision Ready</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploadedPreviewUrl}
          alt={`Uploaded GST invoice ${invoice.invoiceNumber || 'document'}`}
          referrerPolicy="no-referrer"
          className="max-h-[340px] w-full rounded-lg border border-white/10 bg-white object-contain"
        />
      </div>
    );
  }

  return <SampleInvoiceSvg invoice={invoice} audit={audit} regime={regime} />;
}

function SampleInvoiceSvg({
  invoice,
  audit,
  regime,
}: {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
  regime: TaxRegime;
}) {
  const meta = REGIME_META[regime];
  const hasMathErr = Math.abs(audit.taxMathDelta) > 1;
  const taxLine =
    invoice.supplyType === 'export_lut'
      ? 'Export under LUT (0% IGST)'
      : invoice.supplyType === 'inter_state'
        ? `IGST @ ${invoice.gstRatePercent}%: ${formatInr(invoice.igstAmount)}`
        : `CGST ${invoice.gstRatePercent / 2}%: ${formatInr(invoice.cgstAmount)}  |  SGST ${invoice.gstRatePercent / 2}%: ${formatInr(invoice.sgstAmount)}`;

  return (
    <div className="rounded-xl border border-white/12 bg-black/35 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-[#94A3B8]">
        <span>Tax Invoice Scan Preview</span>
        <span className="font-tabular text-[#CBD5E1]">{invoice.invoiceNumber}</span>
      </div>
      <svg
        viewBox="0 0 640 410"
        role="img"
        aria-label={`Tax invoice preview for ${invoice.supplierName}, invoice ${invoice.invoiceNumber}`}
        className="h-auto w-full rounded-lg border border-white/15 bg-[#F8FAFC] shadow-lg"
      >
        <rect x="0" y="0" width="640" height="58" fill="#0F172A" />
        <text x="24" y="28" fill="#F8FAFC" fontSize="15" fontWeight="700">
          {invoice.supplierName.slice(0, 44)}
        </text>
        <text x="24" y="46" fill="#CBD5E1" fontSize="11">
          {invoice.clusterLocation} · GSTIN: {invoice.supplierGstin}
        </text>
        <text x="616" y="34" textAnchor="end" fill="#818CF8" fontSize="12" fontWeight="700">
          TAX INVOICE
        </text>

        <text x="24" y="84" fill="#475569" fontSize="10" fontWeight="700">
          BILL TO (CORPORATE BUYER)
        </text>
        <text x="24" y="102" fill="#0F172A" fontSize="13" fontWeight="700">
          {invoice.buyerName.slice(0, 46)}
        </text>
        <text x="24" y="120" fill="#475569" fontSize="11">
          GSTIN: {invoice.buyerGstin} · Turnover: ₹{invoice.buyerTurnoverCr} Cr
        </text>

        <text x="616" y="84" textAnchor="end" fill="#475569" fontSize="10" fontWeight="700">
          INVOICE & ACCEPTANCE
        </text>
        <text x="616" y="102" textAnchor="end" fill="#0F172A" fontSize="11">
          No: {invoice.invoiceNumber}
        </text>
        <text x="616" y="119" textAnchor="end" fill="#0F172A" fontSize="11">
          Accepted: {formatIsoDate(invoice.acceptanceDate)}
        </text>
        <text x="616" y="136" textAnchor="end" fill="#4338CA" fontSize="10.5" fontWeight="700">
          UDYAM ({invoice.udyamCategory}): {invoice.supplierUdyamNumber}
        </text>

        <line x1="24" y1="154" x2="616" y2="154" stroke="#CBD5E1" />
        <rect x="24" y="164" width="592" height="28" fill="#E2E8F0" />
        <text x="34" y="182" fill="#0F172A" fontSize="11" fontWeight="700">
          Description of Industrial Goods / Supply
        </text>
        <text x="604" y="182" textAnchor="end" fill="#0F172A" fontSize="11" fontWeight="700">
          Taxable Value
        </text>

        <text x="34" y="216" fill="#0F172A" fontSize="12">
          {invoice.lineItemSummary.slice(0, 56)}
        </text>
        <text x="604" y="216" textAnchor="end" fill="#0F172A" fontSize="12" fontWeight="700">
          {formatInr(invoice.subtotal)}
        </text>

        <line x1="24" y1="238" x2="616" y2="238" stroke="#CBD5E1" />
        <text
          x="34"
          y="264"
          fill={hasMathErr ? '#BE123C' : '#334155'}
          fontSize="11"
          fontWeight={hasMathErr ? '700' : '500'}
        >
          {taxLine}
        </text>
        {hasMathErr ? (
          <text x="604" y="264" textAnchor="end" fill="#BE123C" fontSize="11" fontWeight="700">
            Math Delta: {formatInr(audit.taxMathDelta)}
          </text>
        ) : null}

        <rect x="24" y="282" width="592" height="40" fill="#F1F5F9" stroke="#CBD5E1" />
        <text x="36" y="306" fill="#0F172A" fontSize="13" fontWeight="700">
          Grand Total Declared
        </text>
        <text x="604" y="306" textAnchor="end" fill="#0F172A" fontSize="15" fontWeight="700">
          {formatInr(invoice.totalAmount)}
        </text>

        <text
          x="24"
          y="348"
          fill={invoice.hasStatutoryClause ? '#047857' : '#B45309'}
          fontSize="11"
          fontWeight="700"
        >
          {invoice.hasStatutoryClause
            ? `Clause Present: Payment due within ${audit.statutoryLimitDays} days under ${meta.sectionLabel} (${meta.auditFormLabel}).`
            : `Missing Clause: No ${meta.sectionLabel} / Udyam statutory payment notice printed on invoice.`}
        </text>
        <text x="24" y="370" fill="#475569" fontSize="10.5">
          Credit Terms: {invoice.hasWrittenAgreement ? `Written (${invoice.contractedDays}d contracted -> capped at 45d)` : 'No written credit agreement -> 15-day statutory cap'}
        </text>
        <text x="24" y="392" fill="#64748B" fontSize="10">
          Authorized Signatory · {invoice.supplierName} · E.&amp;O.E.
        </text>
      </svg>
    </div>
  );
}
