'use client';

import {AnimatePresence, motion, MotionConfig, useReducedMotion} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {PILOT_LEDGER_INVOICES} from '@/lib/samples';
import {auditInvoiceCompliance, DEFAULT_RBI_BANK_RATE} from '@/lib/statutory';
import {DEFAULT_TREDS_INPUT} from '@/lib/treds';
import type {
  AppLanguage,
  InvoiceRecord,
  TaxRegime,
  TredsInput,
  WorkspaceId,
} from '@/lib/types';
import {AuditStudio} from './audit/AuditStudio';
import {ControlStrip} from './ControlStrip';
import {HeroBand, type HeroKpiSummary} from './HeroBand';
import {LedgerWorkspace} from './ledger/LedgerWorkspace';
import {AmbientAurora} from './motion/AmbientAurora';
import {IndorePulseWorkspace} from './pulse/IndorePulseWorkspace';
import {TopBar} from './TopBar';
import {TredsWorkspace} from './treds/TredsWorkspace';

const SESSION_KEY = 'vyaparsetu_43b_ledger_v1';

function computeHeroKpi(
  invoices: InvoiceRecord[],
  rbiBankRate: number,
  regime: TaxRegime,
): HeroKpiSummary {
  let totalReceivables = 0;
  let overduePrincipal = 0;
  let march31TaxRisk = 0;
  let tredsUnlockable = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const audit = auditInvoiceCompliance(inv, rbiBankRate, regime);
    totalReceivables += inv.totalAmount;
    if (audit.status === 'overdue') {
      overduePrincipal += inv.totalAmount;
      overdueCount += 1;
    }
    if (audit.cliffStatus !== 'none') march31TaxRisk += audit.buyerTaxDisallowance;
    if (audit.tredsReady) tredsUnlockable += inv.totalAmount;
  }
  return {
    totalReceivables,
    overduePrincipal,
    march31TaxRisk,
    tredsUnlockable,
    invoiceCount: invoices.length,
    overdueCount,
  };
}

export function VyaparSetuShell() {
  const osReduced = useReducedMotion();
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? Boolean(osReduced);
  const [workspace, setWorkspace] = useState<WorkspaceId>('audit');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [regime, setRegime] = useState<TaxRegime>('TY_2026_27');
  const [rbiBankRate, setRbiBankRate] = useState<number>(DEFAULT_RBI_BANK_RATE);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(PILOT_LEDGER_INVOICES);
  const [tredsInput, setTredsInput] = useState<TredsInput>(DEFAULT_TREDS_INPUT);
  const [announcement, setAnnouncement] = useState<string>('');
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const saved = window.sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as InvoiceRecord[];
          if (Array.isArray(parsed) && parsed.length > 0) setInvoices(parsed);
        }
      } catch {
        // Ignore storage restrictions
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateInvoices(next: InvoiceRecord[]) {
    setInvoices(next);
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage restrictions
    }
  }

  function jumpToWorkspace(next: WorkspaceId) {
    setWorkspace(next);
    workspaceRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  const heroKpi = useMemo(
    () => computeHeroKpi(invoices, rbiBankRate, regime),
    [invoices, rbiBankRate, regime],
  );

  function handleAddToLedger(inv: InvoiceRecord) {
    const exists = invoices.some((i) => i.invoiceNumber === inv.invoiceNumber);
    const next = exists
      ? invoices.map((i) => (i.invoiceNumber === inv.invoiceNumber ? inv : i))
      : [{...inv, id: `USR-${Date.now().toString().slice(-5)}`}, ...invoices];
    updateInvoices(next);
    setWorkspace('ledger');
    setAnnouncement(`Added invoice ${inv.invoiceNumber} to statutory receivables ledger.`);
  }

  function handleSimulateTreds(inv: InvoiceRecord) {
    setTredsInput((prev) => ({
      ...prev,
      invoiceAmount: Math.max(100000, Math.min(5000000, inv.totalAmount)),
    }));
    setWorkspace('treds');
    setAnnouncement(`Loaded ${inv.invoiceNumber} into TReDS working-capital simulator.`);
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      <div
        data-motion={reducedMotion ? 'reduced' : 'smooth'}
        className="relative flex min-h-screen flex-col bg-[#05070D] text-[#F8FAFC]"
      >
        <AmbientAurora reducedMotion={reducedMotion} />

        <div className="relative z-10 flex min-h-screen flex-col">
          <TopBar
            activeWorkspace={workspace}
            language={language}
            reducedMotion={reducedMotion}
            onSelectWorkspace={setWorkspace}
            onScanClick={() => jumpToWorkspace('audit')}
          />
          <ControlStrip
            language={language}
            regime={regime}
            rbiBankRate={rbiBankRate}
            reducedMotion={reducedMotion}
            onChangeLanguage={setLanguage}
            onChangeRegime={setRegime}
            onToggleMotion={() => setMotionOverride(!reducedMotion)}
          />

          <main className="flex-1">
            <HeroBand
              language={language}
              regime={regime}
              kpi={heroKpi}
              activeWorkspace={workspace}
              reducedMotion={reducedMotion}
              onStartScan={() => jumpToWorkspace('audit')}
              onOpenLedger={() => jumpToWorkspace('ledger')}
              onJumpToWorkspace={jumpToWorkspace}
            />

            <div
              ref={workspaceRef}
              className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 pt-4 sm:px-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={workspace}
                  initial={reducedMotion ? false : {opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={reducedMotion ? undefined : {opacity: 0, y: -6}}
                  transition={{duration: 0.2, ease: [0.16, 1, 0.3, 1]}}
                >
                  {workspace === 'audit' ? (
                    <AuditStudio
                      language={language}
                      regime={regime}
                      rbiBankRate={rbiBankRate}
                      reducedMotion={reducedMotion}
                      onAddInvoiceToLedger={handleAddToLedger}
                      onSimulateTredsInvoice={handleSimulateTreds}
                      onAnnounce={setAnnouncement}
                    />
                  ) : null}

                  {workspace === 'ledger' ? (
                    <LedgerWorkspace
                      invoices={invoices}
                      language={language}
                      regime={regime}
                      rbiBankRate={rbiBankRate}
                      reducedMotion={reducedMotion}
                      onResetPilot={() => {
                        updateInvoices(PILOT_LEDGER_INVOICES);
                        setAnnouncement('Reset ledger to Pithampur & Sanwer Road pilot baseline.');
                      }}
                      onSimulateTreds={handleSimulateTreds}
                      onAnnounce={setAnnouncement}
                    />
                  ) : null}

                  {workspace === 'treds' ? (
                    <TredsWorkspace
                      input={tredsInput}
                      regime={regime}
                      language={language}
                      reducedMotion={reducedMotion}
                      onChangeInput={(patch) =>
                        setTredsInput((prev) => ({...prev, ...patch}))
                      }
                      onAnnounce={setAnnouncement}
                    />
                  ) : null}

                  {workspace === 'pulse' ? (
                    <IndorePulseWorkspace
                      language={language}
                      regime={regime}
                      rbiBankRate={rbiBankRate}
                      reducedMotion={reducedMotion}
                      onChangeRbiRate={setRbiBankRate}
                      onAnnounce={setAnnouncement}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <footer className="border-t border-white/[0.08] bg-black/40 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-[#94A3B8] sm:px-6">
              <span>VyaparSetu 43B · Pithampur &amp; Sanwer Road MSME Pilot · BUILD 2036</span>
              <span>
                Statutory aid only — verify filings with a Chartered Accountant (Form 26 / Form 3CD).
              </span>
            </div>
          </footer>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {announcement}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
