'use client';

import {ArrowRight, FileCheck2, Landmark, ScanLine} from 'lucide-react';
import type {WorkspaceId} from '@/lib/types';

interface ProcessStripProps {
  activeWorkspace: WorkspaceId;
  onJumpTo: (workspace: WorkspaceId) => void;
}

const STEPS: Array<{
  num: string;
  title: string;
  detail: string;
  target: WorkspaceId;
  icon: typeof ScanLine;
}> = [
  {
    num: '01',
    title: 'Scan GST Invoice',
    detail: 'Vision extraction & Mod-36 GSTIN state-code 23 verification',
    target: 'audit',
    icon: ScanLine,
  },
  {
    num: '02',
    title: 'Dual-Trigger Statutory Audit',
    detail: 'Separate §16 compound interest (17.25%) from March 31 disallowance',
    target: 'ledger',
    icon: FileCheck2,
  },
  {
    num: '03',
    title: 'Unlock T+1 TReDS Liquidity',
    detail: 'Compare M1xchange / RXIL factoring vs informal credit costs',
    target: 'treds',
    icon: Landmark,
  },
];

export function ProcessStrip({activeWorkspace, onJumpTo}: ProcessStripProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      {STEPS.map((step) => {
        const Icon = step.icon;
        const active = activeWorkspace === step.target;
        return (
          <button
            key={step.num}
            type="button"
            onClick={() => onJumpTo(step.target)}
            className={`glass-panel glass-panel-interactive group flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-left ${
              active ? 'border-indigo-400/45 bg-indigo-500/[0.10]' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
                <span className="font-tabular text-[#818CF8]">{step.num}</span>
                <Icon className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                <span>{step.title}</span>
              </div>
              <p className="text-xs text-[#94A3B8]">{step.detail}</p>
            </div>
            <ArrowRight
              className="mt-1 h-4 w-4 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-white"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
