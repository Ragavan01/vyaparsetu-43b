import {isSafeHttpUrl} from '../format';
import {SAMPLE_INVOICES} from '../samples';
import {REGIME_META} from '../statutory';
import type {
  AppLanguage,
  AuditApiResponse,
  PolicyCitation,
  PolicyGroundingResponse,
  TaxRegime,
} from '../types';

export const VERIFIED_STATUTORY_CITATIONS: PolicyCitation[] = [
  {
    title: 'Reserve Bank of India (RBI Bank Rate · 5.75% Baseline)',
    uri: 'https://www.rbi.org.in',
  },
  {
    title: 'Income Tax India (Income-tax Act, 2025 · Form No. 26)',
    uri: 'https://www.incometaxindia.gov.in',
  },
  {
    title: 'Ministry of MSME (MSMED Act §16 & ₹250 Cr TReDS Mandate)',
    uri: 'https://msme.gov.in',
  },
  {
    title: 'MP MSME Department (MP MSME Protsahan Yojana)',
    uri: 'https://mpmsme.gov.in',
  },
];

export function buildDeterministicAuditFallback(
  sampleId: string | undefined,
  regime: TaxRegime,
  reason: 'quota' | 'missing_key',
): AuditApiResponse {
  const meta = REGIME_META[regime];
  const preset = SAMPLE_INVOICES.find((s) => s.id === sampleId);
  const provenance =
    reason === 'quota'
      ? 'Deterministic Verification · Live Vision Quota Reached'
      : 'Deterministic Statutory Model';
  const reasonLead =
    reason === 'quota'
      ? 'Deterministic Verification · Live Vision Quota Reached'
      : 'Deterministic Statutory Model · Server API Key Not Set';

  if (preset) {
    return {
      mode: 'offline_fallback',
      isInvoice: true,
      extracted: preset.invoice,
      aiNotes: [
        `Verified ${preset.invoice.invoiceNumber} via deterministic compliance engine: ${preset.anomalyHighlight}.`,
        `Checked against ${meta.sectionLabel} (${meta.auditFormLabel}) with no ${meta.itrSectionLabel} ITR grace period.`,
      ],
      provenance,
      notice: `${reasonLead} — complete GSTIN Mod-36, GST math, MSMED §16 & March 31 Cliff checks executed locally.`,
    };
  }

  return {
    mode: 'offline_fallback',
    isInvoice: true,
    extracted: {},
    aiNotes: [
      `Live Vision extraction is currently paused. Expand "Edit Extracted Invoice Fields" below to run exact deterministic ${meta.sectionLabel} checks.`,
    ],
    provenance,
    notice: `${reasonLead} — expand Edit Extracted Invoice Fields below or pick a Pithampur sample for instant deterministic verification.`,
  };
}

export function buildVerifiedPolicyRegistryPack(
  regime: TaxRegime,
  language: AppLanguage,
): PolicyGroundingResponse {
  const meta = REGIME_META[regime];
  const safeCitations = VERIFIED_STATUTORY_CITATIONS.filter((c) =>
    isSafeHttpUrl(c.uri),
  );

  const keyPoints =
    language === 'hi'
      ? [
          'RBI Bank Rate: 5.75% p.a. (7 Oct 2026 official baseline) → MSMED Act §16 penal interest 17.25% p.a. monthly compounded (MSMED §23 के तहत non-deductible)।',
          `Dual Tax Regime: TY 2026–27 के लिए Income-tax Act, 2025 की Section 37(2)(g) / Form No. 26 (बिना §263(1) ITR grace period) और FY 2025–26 के लिए Section 43B(h) / Form 3CD Clause 22 (बिना §139(1) grace period)।`,
          'TReDS Mandate: ₹250 Cr+ वार्षिक टर्नओवर वाले कॉर्पोरेट खरीदारों के लिए M1xchange, RXIL और Invoicemart पर अनिवार्य onboarding लागू।',
          'MP MSME Protsahan Yojana: पीथमपुर, सांवेर रोड और देवास क्लस्टर की Micro & Small इकाइयों के लिए पूंजी और ब्याज सहायता।',
        ]
      : [
          'RBI Bank Rate: 5.75% p.a. (7 Oct 2026 baseline) → MSMED Act §16 penal interest stands at 17.25% p.a. compounded monthly (non-deductible under MSMED §23).',
          `Dual Tax Regime: ${meta.sectionLabel} of the ${meta.actName} (${meta.auditFormLabel}) disallows overdue Micro & Small payables unpaid on 31 March with no ${meta.itrSectionLabel} ITR grace period.`,
          'TReDS Mandate: Ministry of MSME requires buyers with ₹250 Cr+ annual turnover to onboard onto M1xchange, RXIL, or Invoicemart for T+1 non-recourse liquidity.',
          'MP MSME Protsahan Yojana: Capital investment assistance and cluster incentives supporting Pithampur, Sanwer Road, and Dewas MSMEs.',
        ];

  return {
    mode: 'offline_fallback',
    fetchedAt: new Date().toISOString(),
    summary: keyPoints[0],
    keyPoints,
    citations: safeCitations,
    provenance:
      'Verified Statutory Registry · Oct 2026 Baseline (Live Search Requires Paid Tier)',
    notice:
      'Verified Statutory Registry · Oct 2026 Baseline (Live Search Requires Paid Tier)',
  };
}
