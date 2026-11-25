'use client';

import {useCallback, useEffect, useState} from 'react';
import {UI_COPY} from '@/lib/i18n';
import type {
  AppLanguage,
  LiveCorridorSnapshot,
  PolicyGroundingResponse,
  TaxRegime,
} from '@/lib/types';
import {GlassReveal} from '../motion/GlassReveal';
import {CorridorMetrics} from './CorridorMetrics';
import {PolicyGroundingPanel} from './PolicyGroundingPanel';

interface IndorePulseWorkspaceProps {
  language: AppLanguage;
  regime: TaxRegime;
  rbiBankRate: number;
  reducedMotion: boolean;
  onChangeRbiRate: (rate: number) => void;
  onAnnounce: (msg: string) => void;
}

export function IndorePulseWorkspace({
  language,
  regime,
  rbiBankRate,
  reducedMotion,
  onChangeRbiRate,
  onAnnounce,
}: IndorePulseWorkspaceProps) {
  const copy = UI_COPY[language].pulse;
  const [snapshot, setSnapshot] = useState<LiveCorridorSnapshot | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [policyData, setPolicyData] = useState<PolicyGroundingResponse | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  const loadLiveData = useCallback(async () => {
    setLoadingLive(true);
    setLiveError(null);
    try {
      const res = await fetch('/api/live-data', {cache: 'no-store'});
      if (!res.ok) throw new Error('Failed to fetch corridor data');
      const data = (await res.json()) as LiveCorridorSnapshot;
      setSnapshot(data);
    } catch {
      setLiveError('Unable to reach /api/live-data. Missing readings remain explicitly unavailable.');
    } finally {
      setLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/live-data', {cache: 'no-store'})
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json() as Promise<LiveCorridorSnapshot>;
      })
      .then((data) => {
        if (active) {
          setSnapshot(data);
          setLiveError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLiveError('Unable to reach /api/live-data. Missing readings remain explicitly unavailable.');
        }
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleVerifyPolicy() {
    setVerifying(true);
    setPolicyError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          mode: 'policy_grounding',
          regime,
          language,
        }),
      });
      const data = (await res.json()) as PolicyGroundingResponse & {error?: string};
      if (!res.ok) {
        setPolicyError(data.error ?? 'Policy grounding failed.');
        return;
      }
      setPolicyData(data);
      onAnnounce('Live RBI and MP MSME policy verification complete');
    } catch {
      setPolicyError('Network error calling /api/ai for policy verification.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section aria-labelledby="pulse-heading" className="space-y-5">
      <div>
        <h2 id="pulse-heading" className="font-display text-2xl font-bold text-[#F8FAFC]">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">{copy.subtitle}</p>
      </div>

      <GlassReveal reducedMotion={reducedMotion}>
        <CorridorMetrics
          language={language}
          snapshot={snapshot}
          loading={loadingLive}
          errorMsg={liveError}
          onRefresh={() => void loadLiveData()}
        />
      </GlassReveal>

      <GlassReveal delay={0.06} reducedMotion={reducedMotion}>
        <PolicyGroundingPanel
          language={language}
          regime={regime}
          rbiBankRate={rbiBankRate}
          policyData={policyData}
          verifying={verifying}
          errorMsg={policyError}
          onChangeRbiRate={onChangeRbiRate}
          onVerifyPolicy={handleVerifyPolicy}
        />
      </GlassReveal>
    </section>
  );
}
