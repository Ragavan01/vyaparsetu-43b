'use client';

import {ChevronDown, ChevronUp} from 'lucide-react';
import {formatInr, formatIsoDate} from '@/lib/format';
import type {ComplianceAuditResult, InvoiceRecord} from '@/lib/types';

export interface AuditedRow {
  invoice: InvoiceRecord;
  audit: ComplianceAuditResult;
}

interface LedgerTableProps {
  rows: AuditedRow[];
  selectedId: string | null;
  onToggleSelect: (id: string) => void;
}

export function LedgerTable({
  rows,
  selectedId,
  onToggleSelect,
}: LedgerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 text-[#94A3B8]">
            <th className="py-2.5 pr-3 font-semibold">Invoice &amp; Supplier</th>
            <th className="px-3 py-2.5 font-semibold">Buyer &amp; Scope</th>
            <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
            <th className="px-3 py-2.5 font-semibold">Statutory Due</th>
            <th className="px-3 py-2.5 text-right font-semibold">§16 Interest</th>
            <th className="px-3 py-2.5 font-semibold">Status &amp; Cliff</th>
            <th className="py-2.5 pl-3 text-right font-semibold">Breakdown</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">
          {rows.map((row) => (
            <LedgerTableRow
              key={row.invoice.id}
              row={row}
              expanded={selectedId === row.invoice.id}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LedgerTableRow({
  row,
  expanded,
  onToggleSelect,
}: {
  row: AuditedRow;
  expanded: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const {invoice, audit} = row;
  const statusText =
    audit.status === 'overdue'
      ? `Overdue ${audit.overdueDays}d`
      : audit.status === 'due_soon'
        ? `Due in ${audit.daysRemaining}d`
        : audit.status === 'excluded'
          ? 'Medium Excluded'
          : `On Track (${audit.daysRemaining}d)`;
  const statusColor =
    audit.status === 'overdue'
      ? 'text-[#FDA4AF]'
      : audit.status === 'due_soon'
        ? 'text-[#FCD34D]'
        : audit.status === 'excluded'
          ? 'text-[#94A3B8]'
          : 'text-[#6EE7B7]';

  return (
    <tr
      className={
        expanded
          ? 'bg-indigo-500/[0.12]'
          : 'transition-colors hover:bg-white/[0.04]'
      }
    >
      <td className="py-3 pr-3">
        <p className="font-tabular font-semibold text-[#F8FAFC]">
          {invoice.invoiceNumber}
        </p>
        <p className="text-[#94A3B8]">{invoice.supplierName}</p>
      </td>
      <td className="px-3 py-3">
        <p className="font-medium text-[#F8FAFC]">{invoice.buyerName}</p>
        <p className="text-[#94A3B8]">
          {invoice.udyamCategory} · {audit.statutoryLimitDays}d cap
          {audit.tredsReady ? ' · TReDS Ready' : ''}
        </p>
      </td>
      <td className="font-tabular px-3 py-3 text-right font-semibold text-[#F8FAFC]">
        {formatInr(invoice.totalAmount)}
      </td>
      <td className="font-tabular px-3 py-3 text-[#CBD5E1]">
        {formatIsoDate(audit.statutoryDueDate)}
      </td>
      <td className="font-tabular px-3 py-3 text-right font-semibold text-[#FDA4AF]">
        {audit.section16Interest > 0 ? formatInr(audit.section16Interest) : '₹0'}
      </td>
      <td className="px-3 py-3">
        <p className={`font-semibold ${statusColor}`}>{statusText}</p>
        {audit.cliffStatus !== 'none' ? (
          <p className="text-[#FCD34D]">
            {audit.cliffStatus === 'triggered'
              ? 'March 31 Cliff Crossed'
              : 'March 31 Cliff Watch'}
          </p>
        ) : null}
      </td>
      <td className="py-3 pl-3 text-right">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => onToggleSelect(invoice.id)}
          className="inline-flex min-h-[34px] items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-[#A5B4FC] transition-colors hover:border-indigo-400/50 hover:text-white"
        >
          <span>{expanded ? 'Hide' : 'Inspect'}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </td>
    </tr>
  );
}
