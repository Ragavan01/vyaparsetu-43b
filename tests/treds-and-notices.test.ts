import {describe, expect, it} from 'vitest';
import {buildBuyerNotice, buildTredsChecklist} from '@/lib/notices';
import {PILOT_LEDGER_INVOICES} from '@/lib/samples';
import {auditInvoiceCompliance} from '@/lib/statutory';
import {DEFAULT_TREDS_INPUT, simulateTreds} from '@/lib/treds';

describe('TReDS Working-Capital Arbitrage Engine', () => {
  it('computes net cash unlocked, savings vs informal credit, and buyer tax shield', () => {
    const sim = simulateTreds(DEFAULT_TREDS_INPUT);
    expect(sim.netCashTodayTreds).toBeGreaterThan(sim.netCashInformal);
    expect(sim.savingsVsInformal).toBe(
      sim.informalCreditCost - sim.tredsDiscountCost,
    );
    expect(sim.annualizedMarginSavedPct).toBeCloseTo(18.8, 1);
    expect(sim.buyerTaxShieldPreserved).toBe(
      Math.round(DEFAULT_TREDS_INPUT.invoiceAmount * 0.2517),
    );
  });

  it('handles zero amount gracefully without NaN', () => {
    const sim = simulateTreds({...DEFAULT_TREDS_INPUT, invoiceAmount: 0});
    expect(sim.netCashTodayTreds).toBe(0);
    expect(sim.annualizedMarginSavedPct).toBe(0);
  });
});

describe('Bilingual Statutory Buyer Notices & TReDS Checklist', () => {
  it('renders TY 2026-27 §37(2)(g) / Form No. 26 references in English & Hindi/Hinglish', () => {
    const inv = PILOT_LEDGER_INVOICES[1];
    const audit = auditInvoiceCompliance(inv, 5.75, 'TY_2026_27', '2026-11-25');

    const enNotice = buildBuyerNotice(inv, audit, 'TY_2026_27', 'en');
    expect(enNotice).toContain('Section 37(2)(g)');
    expect(enNotice).toContain('Form No. 26');
    expect(enNotice).toContain('MSMED §23');

    const hiNotice = buildBuyerNotice(inv, audit, 'TY_2026_27', 'hi');
    expect(hiNotice).toContain('नमस्ते');
    expect(hiNotice).toContain('Section 37(2)(g)');
    expect(hiNotice).toContain('TReDS');
  });

  it('switches cleanly to FY 2025-26 §43B(h) / Form 3CD Clause 22', () => {
    const checklist = buildTredsChecklist('FY_2025_26', 'en');
    expect(checklist).toContain('Section 43B(h)');
    expect(checklist).toContain('Form 3CD Clause 22');
    expect(checklist).toContain('₹250 Cr+');
  });
});
