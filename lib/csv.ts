import {REGIME_META} from './statutory';
import type {
  ComplianceAuditResult,
  InvoiceRecord,
  TaxRegime,
} from './types';

const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;

export function neutralizeCsvCell(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) return '';
  const raw = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  const trimmedStart = raw.replace(/^ +/, '');
  const safe =
    FORMULA_TRIGGER_RE.test(raw) || FORMULA_TRIGGER_RE.test(trimmedStart)
      ? `'${raw}`
      : raw;
  const escaped = safe.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

const CSV_HEADERS = [
  'Invoice Number',
  'Tax Regime',
  'Audit Form',
  'Supplier Name',
  'Supplier GSTIN',
  'Supplier Udyam',
  'MSE Category',
  'Buyer Name',
  'Buyer GSTIN',
  'Acceptance Date',
  'Statutory Limit (Days)',
  'Statutory Due Date',
  'Overdue Days',
  'Invoice Total (INR)',
  'Tax Math Delta (INR)',
  'MSMED Sec16 Rate (% p.a.)',
  'MSMED Sec16 Interest (INR)',
  'March 31 Cliff Status',
  'Buyer Tax Risk 25.17% (INR)',
  'ITR Grace Rule',
  'TReDS Ready',
  'Provenance',
];

export interface CsvLedgerRow {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
}

export function buildLedgerCsv(
  rows: CsvLedgerRow[],
  regime: TaxRegime,
): string {
  const meta = REGIME_META[regime];
  const headerLine = CSV_HEADERS.map(neutralizeCsvCell).join(',');
  const dataLines = rows.map(({invoice, audit}) => {
    const fields: Array<string | number | boolean> = [
      invoice.invoiceNumber,
      meta.shortLabel,
      meta.auditFormLabel,
      invoice.supplierName,
      invoice.supplierGstin,
      invoice.supplierUdyamNumber,
      invoice.udyamCategory,
      invoice.buyerName,
      invoice.buyerGstin,
      invoice.acceptanceDate,
      audit.statutoryLimitDays,
      audit.statutoryDueDate,
      audit.overdueDays,
      invoice.totalAmount,
      audit.taxMathDelta,
      audit.section16AnnualRate,
      audit.section16Interest,
      audit.cliffStatus,
      audit.buyerTaxDisallowance,
      `No ${meta.itrSectionLabel} ITR grace period`,
      audit.tredsReady ? 'Yes' : 'No',
      invoice.provenance,
    ];
    return fields.map(neutralizeCsvCell).join(',');
  });

  return [headerLine, ...dataLines].join('\r\n');
}

export function getLedgerCsvFilename(regime: TaxRegime): string {
  return regime === 'TY_2026_27'
    ? 'vyaparsetu-form26-ty2026-27.csv'
    : 'vyaparsetu-clause22-fy2025-26.csv';
}
