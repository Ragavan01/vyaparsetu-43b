'use client';

import {AlertCircle, FileUp, Loader2, Sparkles} from 'lucide-react';
import {useRef, useState} from 'react';
import {UI_COPY} from '@/lib/i18n';
import {SAMPLE_INVOICES, type SampleInvoicePreset} from '@/lib/samples';
import type {AppLanguage} from '@/lib/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 4 * 1024 * 1024;

interface AuditUploadPanelProps {
  language: AppLanguage;
  selectedSampleId: string | null;
  uploadedFileName: string | null;
  isAuditing: boolean;
  errorMsg: string | null;
  noticeMsg: string | null;
  onSelectSample: (preset: SampleInvoicePreset) => void;
  onUploadFile: (file: File, base64: string, previewUrl: string) => void;
  onValidationError: (msg: string) => void;
  onRunAudit: () => void;
}

export function AuditUploadPanel({
  language,
  selectedSampleId,
  uploadedFileName,
  isAuditing,
  errorMsg,
  noticeMsg,
  onSelectSample,
  onUploadFile,
  onValidationError,
  onRunAudit,
}: AuditUploadPanelProps) {
  const copy = UI_COPY[language].audit;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function processFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      onValidationError('Unsupported format. Please upload a JPG, PNG, or WebP invoice photo.');
      return;
    }
    if (file.size > MAX_BYTES) {
      onValidationError('File exceeds the 4 MB maximum size limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) onUploadFile(file, dataUrl, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-xl border border-dashed p-4 text-center transition-colors ${
          isDragging
            ? 'border-[#818CF8] bg-indigo-500/15'
            : 'border-white/20 bg-white/[0.03] hover:border-white/30'
        }`}
      >
        <input
          ref={inputRef}
          id="invoice-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
        <FileUp className="mx-auto h-6 w-6 text-[#818CF8]" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-[#F8FAFC]">
          {uploadedFileName ? `Selected: ${uploadedFileName}` : copy.uploadPrompt}
        </p>
        <p className="mt-1 text-xs text-[#94A3B8]">{copy.uploadHint}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 min-h-[38px] rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#818CF8] hover:bg-indigo-500/20"
        >
          Browse Invoice Photo
        </button>
      </div>

      <SampleSelector
        label={copy.sampleLabel}
        selectedSampleId={selectedSampleId}
        onSelectSample={onSelectSample}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={isAuditing}
          onClick={onRunAudit}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(79,70,229,0.48)] transition-all hover:bg-[#6366F1] disabled:opacity-60"
        >
          {isAuditing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{isAuditing ? copy.runningAiBtn : copy.runAiBtn}</span>
        </button>
        <span className="text-xs text-[#94A3B8]">
          Server-side Gemini Vision · Deterministic Math
        </span>
      </div>

      {errorMsg ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-xs text-[#FDA4AF]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {noticeMsg ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/[0.08] px-3 py-2.5 text-xs text-[#FDE68A]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
          <span>{noticeMsg}</span>
        </div>
      ) : null}
    </div>
  );
}

function SampleSelector({
  label,
  selectedSampleId,
  onSelectSample,
}: {
  label: string;
  selectedSampleId: string | null;
  onSelectSample: (preset: SampleInvoicePreset) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#94A3B8]">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SAMPLE_INVOICES.map((preset) => {
          const active = selectedSampleId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectSample(preset)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? 'border-indigo-400/55 bg-indigo-500/15 shadow-[0_0_20px_rgba(79,70,229,0.22)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
              }`}
            >
              <p className="text-xs font-semibold text-[#F8FAFC]">
                {preset.shortTag}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-[#94A3B8]">
                {preset.invoice.supplierName}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
