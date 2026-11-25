import {formatInr, formatIsoDate} from './format';
import {REGIME_META} from './statutory';
import type {
  AppLanguage,
  ComplianceAuditResult,
  InvoiceRecord,
  TaxRegime,
} from './types';

export function buildBuyerNotice(
  inv: InvoiceRecord,
  audit: ComplianceAuditResult,
  regime: TaxRegime,
  lang: AppLanguage,
): string {
  const meta = REGIME_META[regime];
  const dueStr = formatIsoDate(audit.statutoryDueDate);
  const amtStr = formatInr(inv.totalAmount);
  const intStr = formatInr(audit.section16Interest);
  const taxStr = formatInr(audit.buyerTaxDisallowance);

  if (lang === 'hi') {
    return [
      `नमस्ते ${inv.buyerName} Accounts Team,`,
      ``,
      `हमारी Udyam-registered ${inv.udyamCategory} unit (${inv.supplierName}, Udyam: ${inv.supplierUdyamNumber}) का Invoice ${inv.invoiceNumber} (${amtStr}) ${dueStr} को statutory ${audit.statutoryLimitDays}-day timeline के अंतर्गत due है।`,
      ``,
      `${meta.actName} के ${meta.sectionLabel} (${meta.auditFormLabel}) के अनुसार:`,
      `• MSMED Act §16 ब्याज (${audit.section16AnnualRate}% p.a., 3x RBI Rate ${audit.rbiBankRate}%): ${audit.overdueDays > 0 ? `${audit.overdueDays} दिन overdue होने पर अनुमानित ${intStr} (MSMED §23 के तहत non-deductible)` : 'समय पर भुगतान से शून्य ब्याज'}।`,
      `• March 31 Cliff Tax Shield: 31 मार्च तक अनपेड रहने पर लगभग ${taxStr} का corporate tax disallowance (बिना ${meta.itrSectionLabel} ITR grace period) लग सकता है।`,
      ``,
      `कृपया NEFT/RTGS या TReDS (M1xchange / RXIL / Invoicemart) के माध्यम से समय पर clearance सुनिश्चित करें। धन्यवाद — ${inv.supplierName}, ${inv.clusterLocation}।`,
    ].join('\n');
  }

  return [
    `Dear ${inv.buyerName} Accounts Payable Team,`,
    ``,
    `Gentle compliance reminder for Invoice ${inv.invoiceNumber} (${amtStr}) issued by ${inv.supplierName} (Udyam ${inv.udyamCategory}: ${inv.supplierUdyamNumber}), due by ${dueStr} under the ${audit.statutoryLimitDays}-day statutory timeline.`,
    ``,
    `Key statutory considerations under ${meta.sectionLabel} of the ${meta.actName} (${meta.auditFormLabel}):`,
    `• MSMED Act §16 Penal Interest (${audit.section16AnnualRate}% p.a., 3x RBI Bank Rate of ${audit.rbiBankRate}% compounded monthly): ${audit.overdueDays > 0 ? `Currently ${audit.overdueDays} days overdue (~${intStr} accrued, non-deductible under MSMED §23).` : 'Zero penal interest if settled on or before due date.'}`,
    `• March 31 Cliff Tax Shield: Overdue MSE invoices unpaid on 31 March defer expense deduction (~${taxStr} tax impact at 25.17%) to the actual payment year with no ${meta.itrSectionLabel} ITR grace period.`,
    ``,
    `We are ready to settle via direct NEFT/RTGS or Factoring Unit upload on TReDS (M1xchange / RXIL / Invoicemart). Thank you for your partnership.`,
    `Warm regards, ${inv.supplierName} (${inv.clusterLocation})`,
  ].join('\n');
}

export function buildTredsChecklist(
  regime: TaxRegime,
  lang: AppLanguage,
): string {
  const meta = REGIME_META[regime];
  if (lang === 'hi') {
    return [
      `TReDS Pre-Upload Checklist (₹250 Cr+ Corporate Buyers · M1xchange / RXIL / Invoicemart)`,
      `1. Supplier Udyam Certificate verified (Micro या Small — Medium बाहर हैं)।`,
      `2. GSTIN (15-digit checksum) और CGST/SGST/IGST math GSTR-1 के साथ 100% matched।`,
      `3. Signed Delivery Challan / GRN और invoice acceptance date उपलब्ध।`,
      `4. Invoice footer पर Udyam Number + ${meta.sectionLabel} (${meta.auditFormLabel}) clause दर्ज।`,
      `5. Buyer TReDS onboarding confirmed (₹250 Cr turnover mandate) ताकि T+1 में cash मिल सके।`,
    ].join('\n');
  }

  return [
    `TReDS Pre-Upload Checklist (₹250 Cr+ Mandate · M1xchange / RXIL / Invoicemart)`,
    `1. Verify Udyam Registration is active Micro or Small (Medium enterprises excluded).`,
    `2. Reconcile 15-character GSTIN checksum and CGST/SGST/IGST totals with GSTR-1.`,
    `3. Attach acknowledged Delivery Challan / GRN confirming exact acceptance date.`,
    `4. Include Udyam Number and ${meta.sectionLabel} (${meta.auditFormLabel}) clause on invoice.`,
    `5. Upload Factoring Unit (FU) for buyer acceptance to unlock non-recourse T+1 liquidity.`,
  ].join('\n');
}
