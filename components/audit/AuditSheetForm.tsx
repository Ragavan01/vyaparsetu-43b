'use client';

import type {InvoiceRecord, SupplyType, UdyamCategory} from '@/lib/types';

interface AuditSheetFormProps {
  invoice: InvoiceRecord;
  isAuditing: boolean;
  onChange: (patch: Partial<InvoiceRecord>) => void;
}

export function AuditSheetForm({
  invoice,
  isAuditing,
  onChange,
}: AuditSheetFormProps) {
  if (isAuditing) {
    return <AuditSkeleton />;
  }

  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldInput
          id="audit-inv-no"
          label="Invoice Number"
          value={invoice.invoiceNumber}
          mono
          onChange={(v) => onChange({invoiceNumber: v})}
        />
        <FieldInput
          id="audit-acc-date"
          label="Goods Acceptance Date"
          type="date"
          value={invoice.acceptanceDate}
          mono
          onChange={(v) => onChange({acceptanceDate: v})}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldInput
          id="audit-supplier"
          label="MSME Supplier Name"
          value={invoice.supplierName}
          onChange={(v) => onChange({supplierName: v})}
        />
        <FieldInput
          id="audit-supplier-gstin"
          label="Supplier GSTIN (15-char)"
          value={invoice.supplierGstin}
          mono
          onChange={(v) => onChange({supplierGstin: v.toUpperCase()})}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldInput
          id="audit-buyer"
          label="Corporate Buyer Name"
          value={invoice.buyerName}
          onChange={(v) => onChange({buyerName: v})}
        />
        <FieldInput
          id="audit-buyer-turnover"
          label="Buyer Turnover (₹ Cr)"
          type="number"
          value={String(invoice.buyerTurnoverCr)}
          mono
          onChange={(v) => onChange({buyerTurnoverCr: Math.max(0, Number(v) || 0)})}
        />
      </div>

      <CategoryAndSupplyRow invoice={invoice} onChange={onChange} />
      <AmountsRow invoice={invoice} onChange={onChange} />
      <AgreementFlagsRow invoice={invoice} onChange={onChange} />
    </div>
  );
}

function CategoryAndSupplyRow({
  invoice,
  onChange,
}: {
  invoice: InvoiceRecord;
  onChange: (patch: Partial<InvoiceRecord>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label htmlFor="audit-udyam-cat" className="block text-xs font-medium text-[#94A3B8]">
          Udyam Category
        </label>
        <select
          id="audit-udyam-cat"
          value={invoice.udyamCategory}
          onChange={(e) => onChange({udyamCategory: e.target.value as UdyamCategory})}
          className="glass-input mt-1 min-h-[38px] w-full px-2.5 text-xs font-medium"
        >
          <option value="Micro">Micro (Protected)</option>
          <option value="Small">Small (Protected)</option>
          <option value="Medium">Medium (Excluded)</option>
          <option value="Unverified">Unverified (Excluded)</option>
        </select>
      </div>

      <div>
        <label htmlFor="audit-supply-type" className="block text-xs font-medium text-[#94A3B8]">
          GST Supply Type
        </label>
        <select
          id="audit-supply-type"
          value={invoice.supplyType}
          onChange={(e) => onChange({supplyType: e.target.value as SupplyType})}
          className="glass-input mt-1 min-h-[38px] w-full px-2.5 text-xs font-medium"
        >
          <option value="intra_mp">Intra-MP (CGST + SGST)</option>
          <option value="inter_state">Inter-State (IGST)</option>
          <option value="export_lut">Export under LUT (0%)</option>
        </select>
      </div>

      <FieldInput
        id="audit-gst-rate"
        label="GST Rate (%)"
        type="number"
        value={String(invoice.gstRatePercent)}
        mono
        onChange={(v) => onChange({gstRatePercent: Math.max(0, Number(v) || 0)})}
      />
    </div>
  );
}

function AmountsRow({
  invoice,
  onChange,
}: {
  invoice: InvoiceRecord;
  onChange: (patch: Partial<InvoiceRecord>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <FieldInput
        id="audit-subtotal"
        label="Taxable Value (₹)"
        type="number"
        value={String(invoice.subtotal)}
        mono
        onChange={(v) => onChange({subtotal: Math.max(0, Number(v) || 0)})}
      />
      <FieldInput
        id="audit-cgst"
        label="CGST (₹)"
        type="number"
        value={String(invoice.cgstAmount)}
        mono
        onChange={(v) => onChange({cgstAmount: Math.max(0, Number(v) || 0)})}
      />
      <FieldInput
        id="audit-sgst"
        label="SGST (₹)"
        type="number"
        value={String(invoice.sgstAmount)}
        mono
        onChange={(v) => onChange({sgstAmount: Math.max(0, Number(v) || 0)})}
      />
      <FieldInput
        id="audit-total"
        label="Declared Total (₹)"
        type="number"
        value={String(invoice.totalAmount)}
        mono
        onChange={(v) => onChange({totalAmount: Math.max(0, Number(v) || 0)})}
      />
    </div>
  );
}

function AgreementFlagsRow({
  invoice,
  onChange,
}: {
  invoice: InvoiceRecord;
  onChange: (patch: Partial<InvoiceRecord>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-[#CBD5E1]">
      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={invoice.hasWrittenAgreement}
          onChange={(e) => onChange({hasWrittenAgreement: e.target.checked})}
          className="h-4 w-4 accent-[#6366F1]"
        />
        <span>Written Credit Agreement (45d cap vs 15d default)</span>
      </label>

      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={invoice.hasStatutoryClause}
          onChange={(e) => onChange({hasStatutoryClause: e.target.checked})}
          className="h-4 w-4 accent-[#6366F1]"
        />
        <span>Statutory §37(2)(g) / §43B(h) Clause Printed</span>
      </label>
    </div>
  );
}

function FieldInput({
  id,
  label,
  value,
  type = 'text',
  mono = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  mono?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[#94A3B8]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`glass-input mt-1 min-h-[38px] w-full px-2.5 text-xs ${
          mono ? 'font-tabular' : ''
        }`}
      />
    </div>
  );
}

function AuditSkeleton() {
  return (
    <div aria-busy="true" aria-label="Extracting invoice fields" className="space-y-3 pt-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="grid grid-cols-2 gap-3">
          <div className="h-11 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-11 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
