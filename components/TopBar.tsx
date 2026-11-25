'use client';

import {motion} from 'framer-motion';
import {ScanLine} from 'lucide-react';
import {UI_COPY} from '@/lib/i18n';
import type {AppLanguage, WorkspaceId} from '@/lib/types';
import {ScrollProgressBar} from './motion/ScrollProgressBar';

interface TopBarProps {
  activeWorkspace: WorkspaceId;
  language: AppLanguage;
  reducedMotion: boolean;
  onSelectWorkspace: (workspace: WorkspaceId) => void;
  onScanClick: () => void;
}

const WORKSPACE_ITEMS: Array<{id: WorkspaceId; key: keyof typeof UI_COPY.en.nav}> = [
  {id: 'audit', key: 'audit'},
  {id: 'ledger', key: 'ledger'},
  {id: 'treds', key: 'treds'},
  {id: 'pulse', key: 'pulse'},
];

export function TopBar({
  activeWorkspace,
  language,
  reducedMotion,
  onSelectWorkspace,
  onScanClick,
}: TopBarProps) {
  const copy = UI_COPY[language].nav;

  return (
    <header className="sticky top-0 z-40 px-3 pt-2.5 sm:px-6 sm:pt-3">
      <div className="glass-nav mx-auto max-w-[1280px] overflow-hidden rounded-2xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-15 sm:gap-8 sm:px-5">
          <button
            type="button"
            onClick={() => onSelectWorkspace('audit')}
            className="font-display shrink-0 whitespace-nowrap text-base font-bold tracking-tight text-[#F8FAFC] transition-colors hover:text-[#A5B4FC] sm:text-lg"
          >
            VyaparSetu <span className="font-tabular text-[#818CF8]">43B</span>
          </button>

          <nav
            aria-label="Primary workspaces"
            className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 md:flex"
          >
            {WORKSPACE_ITEMS.map((item) => {
              const active = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelectWorkspace(item.id)}
                  className={`relative min-h-[34px] shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="active-workspace-pill"
                      transition={
                        reducedMotion
                          ? {duration: 0}
                          : {type: 'spring', stiffness: 360, damping: 30}
                      }
                      className="absolute inset-0 rounded-full border border-indigo-400/40 bg-indigo-500/25 shadow-[0_0_20px_rgba(79,70,229,0.35)]"
                    />
                  ) : null}
                  <span className="relative z-10">{copy[item.key]}</span>
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onScanClick}
              className="inline-flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_24px_rgba(79,70,229,0.45)] transition-all hover:bg-[#6366F1] sm:px-5 sm:text-sm"
            >
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              <span>{copy.scanCta}</span>
            </button>
          </div>
        </div>

        <MobileNavBar
          activeWorkspace={activeWorkspace}
          copy={copy}
          onSelectWorkspace={onSelectWorkspace}
        />
        <ScrollProgressBar reducedMotion={reducedMotion} />
      </div>
    </header>
  );
}

const MOBILE_LABELS: Record<WorkspaceId, string> = {
  audit: 'Audit',
  ledger: 'Ledger',
  treds: 'TReDS',
  pulse: 'Indore',
};

function MobileNavBar({
  activeWorkspace,
  copy,
  onSelectWorkspace,
}: {
  activeWorkspace: WorkspaceId;
  copy: typeof UI_COPY.en.nav;
  onSelectWorkspace: (workspace: WorkspaceId) => void;
}) {
  return (
    <nav
      aria-label="Mobile workspace switcher"
      className="grid grid-cols-4 gap-1 border-t border-white/[0.08] px-2 py-1.5 md:hidden"
    >
      {WORKSPACE_ITEMS.map((item) => {
        const active = activeWorkspace === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={copy[item.key]}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelectWorkspace(item.id)}
            className={`min-h-[34px] whitespace-nowrap rounded-lg px-2 py-1 text-center text-xs font-semibold transition-colors ${
              active
                ? 'border border-indigo-400/40 bg-indigo-500/25 text-white'
                : 'text-[#94A3B8] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            {MOBILE_LABELS[item.id]}
          </button>
        );
      })}
    </nav>
  );
}
