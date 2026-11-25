import {describe, expect, it} from 'vitest';
import {computeGstinChecksum, validateGstin} from '@/lib/gstin';
import {PILOT_LEDGER_INVOICES, SAMPLE_INVOICES} from '@/lib/samples';
import {
  auditInvoiceCompliance,
  computeSection16Interest,
  DEFAULT_RBI_BANK_RATE,
  REGIME_META,
} from '@/lib/statutory';

describe('GSTIN validation & MP state detection', () => {
  it('validates authentic 15-character MP GSTIN checksums', () => {
    const sample = SAMPLE_INVOICES[0].invoice.supplierGstin;
    const res = validateGstin(sample);
    expect(res.validFormat).toBe(true);
    expect(res.validChecksum).toBe(true);
    expect(res.stateCode).toBe('23');
    expect(res.stateName).toBe('Madhya Pradesh');
    expect(res.isMadhyaPradesh).toBe(true);
  });

  it('rejects tampered GSTIN checksum character', () => {
    const valid = SAMPLE_INVOICES[0].invoice.supplierGstin;
    const wrongChar = valid[14] === 'Z' ? 'A' : 'Z';
    const tampered = `${valid.slice(0, 14)}${wrongChar}`;
    const res = validateGstin(tampered);
    expect(res.validFormat).toBe(true);
    expect(res.validChecksum).toBe(false);
  });

  it('computes deterministic checksum for 14-char prefix', () => {
    const check = computeGstinChecksum('23AABCM4128F1Z');
    expect(check).not.toBeNull();
    expect(validateGstin(`23AABCM4128F1Z${check}`).validChecksum).toBe(true);
  });
});

describe('2026 Dual-Regime Statutory Engine (§37(2)(g) & §43B(h))', () => {
  it('enforces 5.75% RBI baseline -> 17.25% MSMED §16 monthly compound interest', () => {
    expect(DEFAULT_RBI_BANK_RATE).toBe(5.75);
    const interest = computeSection16Interest(1_000_000, 30, 5.75);
    expect(interest).toBe(Math.round(1_000_000 * (0.1725 / 12)));
    expect(computeSection16Interest(1_000_000, 0, 5.75)).toBe(0);
  });

  it('caps written credit agreements at 45 days and defaults oral agreements to 15 days', () => {
    const withAgreement = auditInvoiceCompliance(
      SAMPLE_INVOICES[0].invoice,
      5.75,
      'TY_2026_27',
      '2026-11-25',
    );
    expect(withAgreement.statutoryLimitDays).toBe(45);
    expect(withAgreement.taxMathDelta).toBe(-8100);

    const noAgreement = auditInvoiceCompliance(
      SAMPLE_INVOICES[1].invoice,
      5.75,
      'TY_2026_27',
      '2026-11-25',
    );
    expect(noAgreement.statutoryLimitDays).toBe(15);
    expect(noAgreement.overdueDays).toBeGreaterThan(0);
  });

  it('excludes Medium enterprises from §37(2)(g) / §43B(h) & §16 statutory protection', () => {
    const mediumInvoice = PILOT_LEDGER_INVOICES.find(
      (i) => i.udyamCategory === 'Medium',
    );
    expect(mediumInvoice).toBeDefined();
    const res = auditInvoiceCompliance(mediumInvoice!, 5.75, 'TY_2026_27', '2026-11-25');
    expect(res.eligibleForProtection).toBe(false);
    expect(res.status).toBe('excluded');
    expect(res.section16Interest).toBe(0);
    expect(res.buyerTaxDisallowance).toBe(0);
    expect(res.cliffStatus).toBe('none');
  });

  it('triggers March 31 Cliff separately for FY 2025-26 unpaid carry-forward', () => {
    const fyCarryForward = PILOT_LEDGER_INVOICES[0];
    const res = auditInvoiceCompliance(fyCarryForward, 5.75, 'FY_2025_26', '2026-11-25');
    expect(res.cliffStatus).toBe('triggered');
    expect(res.fiscalYearEnd).toBe('2026-03-31');
    expect(res.buyerTaxDisallowance).toBeGreaterThan(0);
    expect(REGIME_META.TY_2026_27.sectionLabel).toBe('Section 37(2)(g)');
    expect(REGIME_META.TY_2026_27.auditFormLabel).toContain('Form No. 26');
    expect(REGIME_META.FY_2025_26.sectionLabel).toBe('Section 43B(h)');
  });

  it('cites exact §263(1) ITR grace rule in TY 2026-27 and §139(1) in FY 2025-26', async () => {
    const {buildBuyerNotice} = await import('@/lib/notices');
    const overdueSample = SAMPLE_INVOICES[0].invoice;

    const tyAudit = auditInvoiceCompliance(overdueSample, 5.75, 'TY_2026_27', '2026-11-25');
    const tyCliff = tyAudit.findings.find((f) => f.id === 'march31-cliff');
    expect(tyCliff?.detail).toContain('no §263(1) ITR grace period');
    expect(tyCliff?.detail).not.toContain('§139(1)');
    expect(buildBuyerNotice(overdueSample, tyAudit, 'TY_2026_27', 'en')).toContain(
      'no §263(1) ITR grace period',
    );
    expect(buildBuyerNotice(overdueSample, tyAudit, 'TY_2026_27', 'hi')).toContain(
      '§263(1)',
    );

    const fyAudit = auditInvoiceCompliance(overdueSample, 5.75, 'FY_2025_26', '2026-11-25');
    const fyCliff = fyAudit.findings.find((f) => f.id === 'march31-cliff');
    expect(fyCliff?.detail).toContain('no §139(1) ITR grace period');
    expect(fyCliff?.detail).not.toContain('§263(1)');
    expect(buildBuyerNotice(overdueSample, fyAudit, 'FY_2025_26', 'en')).toContain(
      'no §139(1) ITR grace period',
    );
  });
});
