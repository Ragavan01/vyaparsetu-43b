'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {ChevronDown, SlidersHorizontal} from 'lucide-react';
import {useMemo, useState} from 'react';
import {UI_COPY} from '@/lib/i18n';
import {SAMPLE_INVOICES, type SampleInvoicePreset} from '@/lib/samples';
import {auditInvoiceCompliance} from '@/lib/statutory';
import type {
  AppLanguage,
  AuditApiResponse,
  InvoiceRecord,
  TaxRegime,
} from '@/lib/types';
import {GlassReveal} from '../motion/GlassReveal';
import {AuditSheetForm} from './AuditSheetForm';
import {AuditUploadPanel} from './AuditUploadPanel';
import {AuditVerdictPanel} from './AuditVerdictPanel';
import {InvoiceSvgPreview} from './InvoiceSvgPreview';

interface AuditStudioProps {
  language: AppLanguage;
  regime: TaxRegime;
  rbiBankRate: number;
  reducedMotion: boolean;
  onAddInvoiceToLedger: (invoice: InvoiceRecord) => void;
  onSimulateTredsInvoice: (invoice: InvoiceRecord) => void;
  onAnnounce: (message: string) => void;
}

function buildContextSummary(inv: InvoiceRecord): string {
  return [
    `Invoice: ${inv.invoiceNumber}`,
    `Supplier: ${inv.supplierName}, GSTIN: ${inv.supplierGstin}, Udyam: ${inv.supplierUdyamNumber} (${inv.udyamCategory})`,
    `Buyer: ${inv.buyerName}, GSTIN: ${inv.buyerGstin}, Turnover: ${inv.buyerTurnoverCr} Cr`,
    `Acceptance Date: ${inv.acceptanceDate}, Written Agreement: ${inv.hasWrittenAgreement}`,
    `Subtotal: ${inv.subtotal}, GST%: ${inv.gstRatePercent}, CGST: ${inv.cgstAmount}, SGST: ${inv.sgstAmount}, IGST: ${inv.igstAmount}, Total: ${inv.totalAmount}`,
    `Line item: ${inv.lineItemSummary}`,
  ].join('\n');
}

export function AuditStudio({
  language,
  regime,
  rbiBankRate,
  reducedMotion,
  onAddInvoiceToLedger,
  onSimulateTredsInvoice,
  onAnnounce,
}: AuditStudioProps) {
  const copy = UI_COPY[language].audit;
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(
    SAMPLE_INVOICES[0].id,
  );
  const [invoice, setInvoice] = useState<InvoiceRecord>(SAMPLE_INVOICES[0].invoice);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  const audit = useMemo(
    () => auditInvoiceCompliance(invoice, rbiBankRate, regime),
    [invoice, rbiBankRate, regime],
  );

  function handleSelectSample(preset: SampleInvoicePreset) {
    setSelectedSampleId(preset.id);
    setInvoice(preset.invoice);
    setUploadedFileName(null);
    setUploadedBase64(null);
    setUploadedMime(null);
    setUploadedPreviewUrl(null);
    setErrorMsg(null);
    setNoticeMsg(null);
    setAiNotes([]);
    onAnnounce(`Loaded sample invoice ${preset.invoice.invoiceNumber}`);
  }

  function handleUploadFile(file: File, base64: string, previewUrl: string) {
    setSelectedSampleId(null);
    setUploadedFileName(file.name);
    setUploadedBase64(base64);
    setUploadedMime(file.type);
    setUploadedPreviewUrl(previewUrl);
    setErrorMsg(null);
    setNoticeMsg(null);
    onAnnounce(`Selected invoice image ${file.name} for Vision audit`);
  }

  async function handleRunAiAudit() {
    setIsAuditing(true);
    setErrorMsg(null);
    setNoticeMsg(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          mode: 'audit_invoice',
          regime,
          language,
          sampleId: selectedSampleId ?? undefined,
          imageBase64: uploadedBase64 ?? undefined,
          imageMimeType: uploadedMime ?? undefined,
          invoiceTextContext: uploadedBase64 ? undefined : buildContextSummary(invoice),
        }),
      });
      const data = (await res.json()) as AuditApiResponse & {error?: string};
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Audit request failed. Please try again.');
        return;
      }
      if (data.mode === 'non_invoice' || data.isInvoice === false) {
        setNoticeMsg(
          data.notice ??
            'Uploaded image does not appear to be a GST invoice or challan.',
        );
        setAiNotes(data.aiNotes ?? []);
        onAnnounce('Uploaded image does not appear to be a GST invoice or challan');
        return;
      }
      setInvoice((prev) => ({
        ...prev,
        ...data.extracted,
        id: `AUD-${Date.now().toString().slice(-5)}`,
        provenance: data.provenance,
      }));
      setAiNotes(data.aiNotes ?? []);
      setNoticeMsg(data.notice ?? null);
      onAnnounce('Invoice audit complete and statutory findings refreshed');
    } catch {
      setErrorMsg('Network error reaching /api/ai. Deterministic checks remain active below.');
    } finally {
      setIsAuditing(false);
    }
  }

  return (
    <section aria-labelledby="audit-studio-heading" className="space-y-5">
      <div>
        <h2
          id="audit-studio-heading"
          className="font-display text-2xl font-bold text-[#F8FAFC]"
        >
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <GlassReveal reducedMotion={reducedMotion} className="lg:col-span-5">
          <div className="glass-panel flex flex-col gap-5 p-5">
            <AuditUploadPanel
              language={language}
              selectedSampleId={selectedSampleId}
              uploadedFileName={uploadedFileName}
              isAuditing={isAuditing}
              errorMsg={errorMsg}
              noticeMsg={noticeMsg}
              onSelectSample={handleSelectSample}
              onUploadFile={handleUploadFile}
              onValidationError={setErrorMsg}
              onRunAudit={handleRunAiAudit}
            />
            <InvoiceSvgPreview
              invoice={invoice}
              audit={audit}
              regime={regime}
              uploadedPreviewUrl={uploadedPreviewUrl}
            />
          </div>
        </GlassReveal>

        <GlassReveal delay={0.06} reducedMotion={reducedMotion} className="space-y-4 lg:col-span-7">
          <div className="glass-panel p-5">
            <AuditVerdictPanel
              invoice={invoice}
              audit={audit}
              regime={regime}
              language={language}
              aiNotes={aiNotes}
              reducedMotion={reducedMotion}
              onAddToLedger={() => onAddInvoiceToLedger(invoice)}
              onSimulateTreds={() => onSimulateTredsInvoice(invoice)}
            />
          </div>

          <EditableFieldsAccordion
            open={fieldsOpen}
            invoice={invoice}
            isAuditing={isAuditing}
            reducedMotion={reducedMotion}
            onToggle={() => setFieldsOpen((prev) => !prev)}
            onChange={(patch) =>
              setInvoice((prev) => ({...prev, ...patch, provenance: 'Manual Entry'}))
            }
          />
        </GlassReveal>
      </div>
    </section>
  );
}

function EditableFieldsAccordion({
  open,
  invoice,
  isAuditing,
  reducedMotion,
  onToggle,
  onChange,
}: {
  open: boolean;
  invoice: InvoiceRecord;
  isAuditing: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<InvoiceRecord>) => void;
}) {
  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-[#818CF8]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              Edit Extracted Invoice Fields
            </p>
            <p className="text-xs text-[#94A3B8]">
              Adjust GSTIN, acceptance date, Udyam scope, or tax lines to live-test statutory outcomes
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-200 ${
            open ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reducedMotion ? false : {opacity: 0, height: 0}}
            animate={{opacity: 1, height: 'auto'}}
            exit={reducedMotion ? undefined : {opacity: 0, height: 0}}
            transition={{duration: 0.24, ease: [0.16, 1, 0.3, 1]}}
            className="overflow-hidden border-t border-white/[0.08] px-5 pb-5"
          >
            <AuditSheetForm
              invoice={invoice}
              isAuditing={isAuditing}
              onChange={onChange}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
