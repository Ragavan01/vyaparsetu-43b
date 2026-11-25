import {computeGstinChecksum} from './gstin';
import type {InvoiceRecord} from './types';

function validGstin(prefix14: string): string {
  const check = computeGstinChecksum(prefix14) ?? '0';
  return `${prefix14}${check}`;
}

export interface SampleInvoicePreset {
  id: string;
  label: string;
  shortTag: string;
  anomalyHighlight: string;
  invoice: InvoiceRecord;
}

export const SAMPLE_INVOICES: SampleInvoicePreset[] = [
  {
    id: 'sample-auto-math',
    label: 'Pithampur Auto Forgings (GST Math Error)',
    shortTag: 'Sector III · GST Delta',
    anomalyHighlight: 'CGST/SGST under-billed by ₹8,100; overdue 22 days past 45d cap',
    invoice: {
      id: 'SMP-2026-01',
      invoiceNumber: 'MPF/26-27/0418',
      supplierName: 'Malwa Precision Forgings Pvt Ltd',
      supplierGstin: validGstin('23AABCM4128F1Z'),
      supplierUdyamNumber: 'UDYAM-MP-23-0041892',
      udyamCategory: 'Small',
      buyerName: 'Central India Commercial Axles Ltd',
      buyerGstin: validGstin('23AAACC9081K1Z'),
      buyerTurnoverCr: 620,
      hasWrittenAgreement: true,
      contractedDays: 60,
      hasStatutoryClause: true,
      invoiceDate: '2026-09-18',
      acceptanceDate: '2026-09-19',
      supplyType: 'intra_mp',
      subtotal: 900000,
      gstRatePercent: 18,
      cgstAmount: 76950,
      sgstAmount: 76950,
      igstAmount: 0,
      totalAmount: 1053900,
      lineItemSummary: 'CNC Machined Transmission Shafts (HSN 8708 · 450 units)',
      clusterLocation: 'Pithampur Sector III, Dhar-Indore',
      paid: false,
      provenance: 'Illustrative Pithampur Pilot',
    },
  },
  {
    id: 'sample-pack-clause',
    label: 'Sanwer Road Packaging (Missing Clause & 15d Cliff)',
    shortTag: 'Sanwer Rd · No Agreement',
    anomalyHighlight: 'No written credit agreement (15d statutory cap) & missing §37(2)(g) clause',
    invoice: {
      id: 'SMP-2026-02',
      invoiceNumber: 'SRP/26-27/1104',
      supplierName: 'Narmada Corrugated Packagings',
      supplierGstin: validGstin('23ABDFN7732M1Z'),
      supplierUdyamNumber: 'UDYAM-MP-23-0019204',
      udyamCategory: 'Micro',
      buyerName: 'Deccan Lifesciences Formulations Ltd',
      buyerGstin: validGstin('23AAACD5519B1Z'),
      buyerTurnoverCr: 410,
      hasWrittenAgreement: false,
      contractedDays: 45,
      hasStatutoryClause: false,
      invoiceDate: '2026-10-28',
      acceptanceDate: '2026-10-29',
      supplyType: 'intra_mp',
      subtotal: 420000,
      gstRatePercent: 12,
      cgstAmount: 25200,
      sgstAmount: 25200,
      igstAmount: 0,
      totalAmount: 470400,
      lineItemSummary: '5-Ply Export Pharma Cartons (HSN 4819 · 14,000 boxes)',
      clusterLocation: 'Sanwer Road Industrial Area, Indore',
      paid: false,
      provenance: 'Illustrative Pithampur Pilot',
    },
  },
  {
    id: 'sample-pharma-export',
    label: 'Pithampur SEZ Pharma (Export LUT 0% GST)',
    shortTag: 'SEZ Phase II · Export LUT',
    anomalyHighlight: 'Zero-rated LUT export supply; approaching 45-day deadline in 5 days',
    invoice: {
      id: 'SMP-2026-03',
      invoiceNumber: 'VPL/EXP/26-27/089',
      supplierName: 'Vindhya Fine Excipients LLP',
      supplierGstin: validGstin('23AADFV6210Q1Z'),
      supplierUdyamNumber: 'UDYAM-MP-23-0058821',
      udyamCategory: 'Small',
      buyerName: 'EuroMed Generics Distribution India Pvt Ltd',
      buyerGstin: validGstin('27AABCE3194P1Z'),
      buyerTurnoverCr: 890,
      hasWrittenAgreement: true,
      contractedDays: 45,
      hasStatutoryClause: true,
      invoiceDate: '2026-10-15',
      acceptanceDate: '2026-10-16',
      supplyType: 'export_lut',
      subtotal: 1450000,
      gstRatePercent: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 1450000,
      lineItemSummary: 'USP Grade Pharma Excipient Drums under LUT ARN AD2304260012 (HSN 2933)',
      clusterLocation: 'Pithampur SEZ Phase II, Indore',
      paid: false,
      provenance: 'Illustrative Pithampur Pilot',
    },
  },
];

export {PILOT_LEDGER_INVOICES} from './pilot-ledger';

