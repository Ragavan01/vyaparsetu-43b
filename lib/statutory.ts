import {validateGstin} from './gstin';
import type {
  CliffStatus,
  ComplianceAuditResult,
  ComplianceFinding,
  ComplianceStatus,
  InvoiceRecord,
  RegimeMetadata,
  TaxRegime,
} from './types';

export const DEFAULT_RBI_BANK_RATE = 5.75;
export const CORPORATE_TAX_RATE = 0.2517;
export const TREDS_MANDATORY_TURNOVER_CR = 250;
export const DEFAULT_AS_OF_DATE = '2026-11-25';

export const REGIME_META: Record<TaxRegime, RegimeMetadata> = {
  TY_2026_27: {
    id: 'TY_2026_27',
    shortLabel: 'TY 2026-27 · §37(2)(g)',
    actName: 'Income-tax Act, 2025',
    sectionLabel: 'Section 37(2)(g)',
    auditFormLabel: 'Form No. 26 (Section 63)',
    fiscalYearLabel: 'Tax Year 2026–27',
    itrSectionLabel: '§263(1)',
  },
  FY_2025_26: {
    id: 'FY_2025_26',
    shortLabel: 'FY 2025-26 · §43B(h)',
    actName: 'Income-tax Act, 1961',
    sectionLabel: 'Section 43B(h)',
    auditFormLabel: 'Form 3CD Clause 22',
    fiscalYearLabel: 'FY 2025–26 Carry-Forward',
    itrSectionLabel: '§139(1)',
  },
};

function parseIsoUtc(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1));
}

function addDaysIso(isoDate: string, days: number): string {
  const dt = parseIsoUtc(isoDate);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function diffDays(startIso: string, endIso: string): number {
  const ms = parseIsoUtc(endIso).getTime() - parseIsoUtc(startIso).getTime();
  return Math.round(ms / 86_400_000);
}

export function getFiscalYearEnd(acceptanceIso: string): string {
  const dt = parseIsoUtc(acceptanceIso);
  const year = dt.getUTCFullYear();
  const endYear = dt.getUTCMonth() >= 3 ? year + 1 : year;
  return `${endYear}-03-31`;
}

export function computeSection16Interest(
  principal: number,
  overdueDays: number,
  rbiBankRate: number,
): number {
  if (principal <= 0 || overdueDays <= 0 || rbiBankRate <= 0) return 0;
  const monthlyRate = (rbiBankRate * 3) / 100 / 12;
  const interest = principal * (Math.pow(1 + monthlyRate, overdueDays / 30) - 1);
  return Math.round(interest);
}

function evaluateCliffStatus(
  eligible: boolean,
  paid: boolean,
  dueDate: string,
  fyEnd: string,
  asOfDate: string,
  overdueDays: number,
): CliffStatus {
  if (!eligible || paid) return 'none';
  if (asOfDate >= fyEnd && dueDate <= fyEnd) return 'triggered';
  const daysToFyEnd = diffDays(asOfDate, fyEnd);
  if (dueDate <= fyEnd && (overdueDays > 0 || daysToFyEnd <= 45)) {
    return 'approaching';
  }
  return 'none';
}

function resolveStatus(
  eligible: boolean,
  paid: boolean,
  overdueDays: number,
  daysRemaining: number,
): ComplianceStatus {
  if (!eligible) return 'excluded';
  if (paid) return 'compliant';
  if (overdueDays > 0) return 'overdue';
  return daysRemaining <= 7 ? 'due_soon' : 'compliant';
}

function buildEligibilityFindings(
  inv: InvoiceRecord,
  meta: RegimeMetadata,
  eligible: boolean,
  limitDays: number,
  supplierGstinOk: boolean,
): ComplianceFinding[] {
  const list: ComplianceFinding[] = [
    eligible
      ? {
          id: 'udyam-scope',
          severity: 'pass',
          title: `Udyam ${inv.udyamCategory} Enterprise Protected`,
          detail: `Statutory cap locked at ${limitDays} days (${inv.hasWrittenAgreement ? 'written credit agreement capped at 45d' : 'no written credit agreement = 15d'}).`,
        }
      : {
          id: 'udyam-scope',
          severity: 'warning',
          title: 'Outside MSE Statutory Scope',
          detail: `${meta.sectionLabel} & MSMED §16 apply strictly to Udyam Micro & Small enterprises; ${inv.udyamCategory} suppliers are excluded.`,
        },
  ];
  if (!supplierGstinOk) {
    list.push({
      id: 'gstin-check',
      severity: 'critical',
      title: 'Supplier GSTIN Checksum / Format Issue',
      detail: `GSTIN ${inv.supplierGstin || 'missing'} failed 15-character Mod-36 verification.`,
    });
  }
  if (!inv.hasStatutoryClause && eligible) {
    list.push({
      id: 'missing-clause',
      severity: 'warning',
      title: `Missing ${meta.sectionLabel} Footer Clause`,
      detail: `Add Udyam number & ${meta.sectionLabel} / ${meta.auditFormLabel} notice on the invoice.`,
    });
  }
  return list;
}

function buildTriggerFindings(
  inv: InvoiceRecord,
  meta: RegimeMetadata,
  eligible: boolean,
  overdueDays: number,
  cliffStatus: CliffStatus,
  taxDelta: number,
  totalDelta: number,
): ComplianceFinding[] {
  const list: ComplianceFinding[] = [];
  if (Math.abs(taxDelta) > 1 || Math.abs(totalDelta) > 1) {
    list.push({
      id: 'tax-math',
      severity: 'critical',
      title: 'GST Arithmetic Discrepancy Detected',
      detail: `Tax delta ₹${Math.abs(taxDelta).toLocaleString('en-IN')} / Total delta ₹${Math.abs(totalDelta).toLocaleString('en-IN')}. Reconcile before GSTR-1 or TReDS upload.`,
    });
  }
  if (overdueDays > 0 && eligible && !inv.paid) {
    list.push({
      id: 'sec16-interest',
      severity: 'critical',
      title: `Trigger (a): MSMED §16 Interest Running (${overdueDays}d overdue)`,
      detail: '3x RBI Bank Rate compounded monthly accrues past Day 15/45 and is non-deductible under MSMED §23.',
    });
  }
  if (cliffStatus !== 'none') {
    list.push({
      id: 'march31-cliff',
      severity: cliffStatus === 'triggered' ? 'critical' : 'warning',
      title:
        cliffStatus === 'triggered'
          ? 'Trigger (b): March 31 Cliff Crossed (Disallowance Active)'
          : 'Trigger (b): March 31 Cliff Exposure',
      detail: `Unpaid MSE dues on 31 March defer ${meta.sectionLabel} deduction to actual payment year (no ${meta.itrSectionLabel} ITR grace period).`,
    });
  }
  return list;
}

function computeTaxMath(inv: InvoiceRecord) {
  const expectedTaxTotal =
    inv.supplyType === 'export_lut'
      ? 0
      : Math.round((inv.subtotal * inv.gstRatePercent) / 100);
  const declaredTaxTotal = Math.round(
    inv.cgstAmount + inv.sgstAmount + inv.igstAmount,
  );
  const taxMathDelta = declaredTaxTotal - expectedTaxTotal;
  const expectedGrandTotal = Math.round(inv.subtotal + expectedTaxTotal);
  const grandTotalDelta = Math.round(inv.totalAmount - expectedGrandTotal);
  return {
    expectedTaxTotal,
    declaredTaxTotal,
    taxMathDelta,
    expectedGrandTotal,
    grandTotalDelta,
  };
}

export function auditInvoiceCompliance(
  inv: InvoiceRecord,
  rbiBankRate = DEFAULT_RBI_BANK_RATE,
  regime: TaxRegime = 'TY_2026_27',
  asOfDate = DEFAULT_AS_OF_DATE,
): ComplianceAuditResult {
  const eligible = inv.udyamCategory === 'Micro' || inv.udyamCategory === 'Small';
  const statutoryLimitDays = inv.hasWrittenAgreement
    ? Math.min(Math.max(inv.contractedDays || 45, 1), 45)
    : 15;
  const statutoryDueDate = addDaysIso(inv.acceptanceDate, statutoryLimitDays);
  const daysElapsed = Math.max(0, diffDays(inv.acceptanceDate, asOfDate));
  const daysRemaining = diffDays(asOfDate, statutoryDueDate);
  const overdueDays = inv.paid ? 0 : Math.max(0, -daysRemaining);
  const fiscalYearEnd = getFiscalYearEnd(inv.acceptanceDate);
  const cliffStatus = evaluateCliffStatus(
    eligible, inv.paid, statutoryDueDate, fiscalYearEnd, asOfDate, overdueDays,
  );
  const tax = computeTaxMath(inv);
  const supplierGstinCheck = validateGstin(inv.supplierGstin);
  const buyerGstinCheck = validateGstin(inv.buyerGstin);
  const tredsMandatoryBuyer = inv.buyerTurnoverCr >= TREDS_MANDATORY_TURNOVER_CR;
  const meta = REGIME_META[regime];

  return {
    eligibleForProtection: eligible,
    statutoryLimitDays,
    statutoryDueDate,
    daysElapsed,
    daysRemaining,
    overdueDays,
    status: resolveStatus(eligible, inv.paid, overdueDays, daysRemaining),
    rbiBankRate,
    section16AnnualRate: Number((rbiBankRate * 3).toFixed(2)),
    section16Interest: eligible
      ? computeSection16Interest(inv.totalAmount, overdueDays, rbiBankRate)
      : 0,
    cliffStatus,
    fiscalYearEnd,
    buyerTaxDisallowance: eligible && !inv.paid
      ? Math.round(inv.subtotal * CORPORATE_TAX_RATE)
      : 0,
    ...tax,
    supplierGstinCheck,
    buyerGstinCheck,
    tredsMandatoryBuyer,
    tredsReady:
      eligible &&
      !inv.paid &&
      tredsMandatoryBuyer &&
      supplierGstinCheck.validChecksum &&
      Math.abs(tax.taxMathDelta) <= 1,
    findings: [
      ...buildEligibilityFindings(
        inv, meta, eligible, statutoryLimitDays,
        supplierGstinCheck.validFormat && supplierGstinCheck.validChecksum,
      ),
      ...buildTriggerFindings(
        inv, meta, eligible, overdueDays, cliffStatus, tax.taxMathDelta, tax.grandTotalDelta,
      ),
    ],
  };
}
