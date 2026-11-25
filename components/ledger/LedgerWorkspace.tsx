'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {useMemo, useState} from 'react';
import {buildLedgerCsv, getLedgerCsvFilename} from '@/lib/csv';
import {UI_COPY} from '@/lib/i18n';
import {auditInvoiceCompliance, REGIME_META} from '@/lib/statutory';
import type {AppLanguage, InvoiceRecord, TaxRegime} from '@/lib/types';
import {GlassReveal} from '../motion/GlassReveal';
import {LedgerDrawer} from './LedgerDrawer';
import {LedgerFilters, type LedgerFilterKey} from './LedgerFilters';
import {LedgerTable, type AuditedRow} from './LedgerTable';

interface LedgerWorkspaceProps {
  invoices: InvoiceRecord[];
  language: AppLanguage;
  regime: TaxRegime;
  rbiBankRate: number;
  reducedMotion: boolean;
  onResetPilot: () => void;
  onSimulateTreds: (invoice: InvoiceRecord) => void;
  onAnnounce: (message: string) => void;
}

function matchesFilter(row: AuditedRow, filter: LedgerFilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'overdue') return row.audit.status === 'overdue';
  if (filter === 'due_soon') return row.audit.status === 'due_soon';
  if (filter === 'march31') return row.audit.cliffStatus !== 'none';
  return row.audit.tredsReady;
}

function matchesSearch(inv: InvoiceRecord, q: string): boolean {
  if (!q) return true;
  const target =
    `${inv.invoiceNumber} ${inv.supplierName} ${inv.buyerName} ${inv.supplierGstin} ${inv.clusterLocation}`.toLowerCase();
  return target.includes(q.toLowerCase());
}

export function LedgerWorkspace({
  invoices,
  language,
  regime,
  rbiBankRate,
  reducedMotion,
  onResetPilot,
  onSimulateTreds,
  onAnnounce,
}: LedgerWorkspaceProps) {
  const copy = UI_COPY[language].ledger;
  const meta = REGIME_META[regime];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LedgerFilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(invoices[0]?.id ?? null);

  const auditedRows = useMemo<AuditedRow[]>(
    () =>
      invoices.map((invoice) => ({
        invoice,
        audit: auditInvoiceCompliance(invoice, rbiBankRate, regime),
      })),
    [invoices, rbiBankRate, regime],
  );

  const counts = useMemo<Record<LedgerFilterKey, number>>(
    () => ({
      all: auditedRows.length,
      overdue: auditedRows.filter((r) => r.audit.status === 'overdue').length,
      due_soon: auditedRows.filter((r) => r.audit.status === 'due_soon').length,
      march31: auditedRows.filter((r) => r.audit.cliffStatus !== 'none').length,
      treds_ready: auditedRows.filter((r) => r.audit.tredsReady).length,
    }),
    [auditedRows],
  );

  const visibleRows = useMemo(
    () =>
      auditedRows.filter(
        (r) => matchesFilter(r, filter) && matchesSearch(r.invoice, query.trim()),
      ),
    [auditedRows, filter, query],
  );

  const selectedRow = auditedRows.find((r) => r.invoice.id === selectedId) ?? null;

  function handleExportCsv() {
    if (visibleRows.length === 0) return;
    const csv = buildLedgerCsv(visibleRows, regime);
    const filename = getLedgerCsvFilename(regime);
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onAnnounce(`Exported ${visibleRows.length} ledger rows to ${filename}`);
  }

  return (
    <section aria-labelledby="ledger-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="ledger-heading" className="font-display text-2xl font-bold text-[#F8FAFC]">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{copy.subtitle}</p>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Illustrative Pithampur Pilot · {meta.sectionLabel} · {meta.auditFormLabel}
        </p>
      </div>

      <GlassReveal reducedMotion={reducedMotion}>
        <div className="glass-panel space-y-4 p-5">
          <LedgerFilters
            language={language}
            regime={regime}
            query={query}
            activeFilter={filter}
            counts={counts}
            exportDisabled={visibleRows.length === 0}
            onQueryChange={setQuery}
            onFilterChange={setFilter}
            onExportCsv={handleExportCsv}
            onResetPilot={onResetPilot}
          />

          {visibleRows.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#F8FAFC]">{copy.emptyTitle}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{copy.emptyBody}</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
                className="mt-4 min-h-[40px] rounded-full bg-[#4F46E5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#6366F1]"
              >
                Show All Invoices
              </button>
            </div>
          ) : (
            <LedgerTable
              rows={visibleRows}
              selectedId={selectedId}
              onToggleSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
            />
          )}
        </div>
      </GlassReveal>

      <AnimatePresence mode="wait">
        {selectedRow ? (
          <motion.div
            key={selectedRow.invoice.id}
            initial={reducedMotion ? false : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            exit={reducedMotion ? undefined : {opacity: 0, y: -8}}
            transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
          >
            <LedgerDrawer
              invoice={selectedRow.invoice}
              audit={selectedRow.audit}
              regime={regime}
              language={language}
              onClose={() => setSelectedId(null)}
              onSimulateTreds={onSimulateTreds}
              onAnnounce={onAnnounce}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
