import {describe, expect, it} from 'vitest';
import {
  buildLedgerCsv,
  getLedgerCsvFilename,
  neutralizeCsvCell,
} from '@/lib/csv';
import {isSafeHttpUrl} from '@/lib/format';
import {SAMPLE_INVOICES} from '@/lib/samples';
import {
  buildDeterministicAuditFallback,
  buildVerifiedPolicyRegistryPack,
} from '@/lib/server/fallbacks';
import {VISION_MODEL_CASCADE} from '@/lib/server/gemini';
import {createSlidingWindowLimiter} from '@/lib/server/rate-limit';
import {
  aiRequestSchema,
  estimateBase64Bytes,
  MAX_IMAGE_BYTES,
  sanitizeText,
} from '@/lib/server/schemas';
import {auditInvoiceCompliance} from '@/lib/statutory';

describe('API Schema Validation & Sanitization Security', () => {
  it('accepts valid audit_invoice and policy_grounding payloads', () => {
    const a = aiRequestSchema.safeParse({
      mode: 'audit_invoice',
      regime: 'TY_2026_27',
      language: 'hi',
      imageMimeType: 'image/png',
    });
    expect(a.success).toBe(true);

    const p = aiRequestSchema.safeParse({
      mode: 'policy_grounding',
      regime: 'FY_2025_26',
      language: 'en',
    });
    expect(p.success).toBe(true);
  });

  it('rejects disallowed MIME types and unknown modes', () => {
    const badMime = aiRequestSchema.safeParse({
      mode: 'audit_invoice',
      imageMimeType: 'image/svg+xml',
    });
    expect(badMime.success).toBe(false);

    const badMode = aiRequestSchema.safeParse({mode: 'exec_shell'});
    expect(badMode.success).toBe(false);
  });

  it('enforces 4MB image payload estimation and strips control characters', () => {
    const hugeBase64 = 'A'.repeat(5_700_000);
    expect(estimateBase64Bytes(hugeBase64)).toBeGreaterThan(MAX_IMAGE_BYTES);
    expect(sanitizeText('Hello\u0000\u0007   Indore\nMSME')).toBe('Hello Indore MSME');
  });

  it('blocks javascript: and data: URLs in external citation helper', () => {
    expect(isSafeHttpUrl('https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});

describe('Sliding-Window Per-IP Rate Limiter', () => {
  it('blocks requests exceeding window quota and resets after window elapses', () => {
    const limiter = createSlidingWindowLimiter(2, 10_000);
    expect(limiter('10.0.0.1', 1000).allowed).toBe(true);
    expect(limiter('10.0.0.1', 2000).allowed).toBe(true);
    const blocked = limiter('10.0.0.1', 3000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    expect(limiter('10.0.0.2', 3000).allowed).toBe(true);
    expect(limiter('10.0.0.1', 12_000).allowed).toBe(true);
  });
});

describe('CA Audit CSV Formula-Injection Neutralization', () => {
  it('neutralizes =, +, -, @, and leading-whitespace formula payloads', () => {
    expect(neutralizeCsvCell("=CMD|'/C calc'!A0")).toBe("'=CMD|'/C calc'!A0");
    expect(neutralizeCsvCell('+SUM(A1:A5)')).toBe("'+SUM(A1:A5)");
    expect(neutralizeCsvCell('-2+3')).toBe("'-2+3");
    expect(neutralizeCsvCell('@HYPERLINK("http://evil")')).toBe(
      "\"'@HYPERLINK(\"\"http://evil\"\")\"",
    );
    expect(neutralizeCsvCell('  =1+1')).toBe("'  =1+1");
    expect(neutralizeCsvCell('Normal Supplier, Pvt Ltd')).toBe(
      '"Normal Supplier, Pvt Ltd"',
    );
  });

  it('builds Form 26 / Clause 22 CSV safely with neutralized supplier fields', () => {
    const injectedInvoice = {
      ...SAMPLE_INVOICES[0].invoice,
      supplierName: '=HYPERLINK("https://evil.test","Click")',
    };
    const audit = auditInvoiceCompliance(injectedInvoice, 5.75, 'TY_2026_27', '2026-11-25');
    const csv = buildLedgerCsv([{invoice: injectedInvoice, audit}], 'TY_2026_27');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('No §263(1) ITR grace period');
    expect(getLedgerCsvFilename('TY_2026_27')).toBe('vyaparsetu-form26-ty2026-27.csv');
    expect(getLedgerCsvFilename('FY_2025_26')).toBe('vyaparsetu-clause22-fy2025-26.csv');
  });
});

describe('Free-Tier Multi-Model Cascade & Official Registry Fallbacks', () => {
  it('configures exact Free-Tier cascade order and clean deterministic sample fallback', () => {
    expect(VISION_MODEL_CASCADE).toEqual([
      'gemini-4-hydrogen',
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
    ]);
    const fallback = buildDeterministicAuditFallback(
      SAMPLE_INVOICES[0].id,
      'TY_2026_27',
      'quota',
    );
    expect(fallback.mode).toBe('offline_fallback');
    expect(fallback.provenance).toBe(
      'Deterministic Verification · Live Vision Quota Reached',
    );
    expect(fallback.extracted.invoiceNumber).toBe(
      SAMPLE_INVOICES[0].invoice.invoiceNumber,
    );
  });

  it('returns URL-validated official RBI, Income Tax, MSME & MP MSME citations on registry fallback', () => {
    const pack = buildVerifiedPolicyRegistryPack('TY_2026_27', 'en');
    expect(pack.provenance).toBe(
      'Verified Statutory Registry · Oct 2026 Baseline (Live Search Requires Paid Tier)',
    );
    const uris = pack.citations.map((c) => c.uri);
    expect(uris).toEqual([
      'https://www.rbi.org.in',
      'https://www.incometaxindia.gov.in',
      'https://msme.gov.in',
      'https://mpmsme.gov.in',
    ]);
    for (const uri of uris) {
      expect(isSafeHttpUrl(uri)).toBe(true);
    }
  });
});
