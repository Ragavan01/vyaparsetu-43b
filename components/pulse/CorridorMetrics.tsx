'use client';

import {CloudSun, Landmark, RefreshCw} from 'lucide-react';
import {UI_COPY} from '@/lib/i18n';
import type {AppLanguage, LiveCorridorSnapshot} from '@/lib/types';

interface CorridorMetricsProps {
  language: AppLanguage;
  snapshot: LiveCorridorSnapshot | null;
  loading: boolean;
  errorMsg: string | null;
  onRefresh: () => void;
}

function formatReading(val: number | null, suffix: string, digits = 1): string {
  if (val === null) return 'Unavailable';
  return `${val.toFixed(digits)}${suffix}`;
}

export function CorridorMetrics({
  language,
  snapshot,
  loading,
  errorMsg,
  onRefresh,
}: CorridorMetricsProps) {
  const copy = UI_COPY[language].pulse;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#94A3B8]">
          Live API · Open-Meteo (22.61°N, 75.69°E) · Frankfurter FX
          {snapshot?.fetchedAt ? ` · Updated ${snapshot.fetchedAt.slice(11, 19)} UTC` : ''}
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={onRefresh}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#818CF8] hover:text-white disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{copy.refreshBtn}</span>
        </button>
      </div>

      {errorMsg ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-xs text-[#FDA4AF]"
        >
          {errorMsg}
        </p>
      ) : null}

      {loading && !snapshot ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-busy="true">
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WeatherCard snapshot={snapshot} />
          <FxCard snapshot={snapshot} />
        </div>
      )}
    </div>
  );
}

function WeatherCard({snapshot}: {snapshot: LiveCorridorSnapshot | null}) {
  const w = snapshot?.weather;
  return (
    <div className="glass-panel glass-panel-interactive space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#F8FAFC]">
          Indore–Pithampur NH-52 Weather
        </h3>
        <CloudSun className="h-4 w-4 text-[#6EE7B7]" aria-hidden="true" />
      </div>
      <p className="text-xs text-[#94A3B8]">
        Live API · {w?.status === 'live' ? 'Active Reading' : 'Unavailable'} · 22.61°N, 75.69°E
      </p>
      <div className="grid grid-cols-3 gap-3 border-y border-white/[0.08] py-3 text-xs">
        <div>
          <p className="text-[#94A3B8]">Temperature</p>
          <p className="font-tabular mt-0.5 text-lg font-bold text-[#F8FAFC]">
            {formatReading(w?.temperatureC ?? null, '°C', 1)}
          </p>
        </div>
        <div>
          <p className="text-[#94A3B8]">Precipitation</p>
          <p className="font-tabular mt-0.5 text-lg font-bold text-[#6EE7B7]">
            {formatReading(w?.precipitationMm ?? null, ' mm', 1)}
          </p>
        </div>
        <div>
          <p className="text-[#94A3B8]">Wind Speed</p>
          <p className="font-tabular mt-0.5 text-lg font-bold text-[#A5B4FC]">
            {formatReading(w?.windKmh ?? null, ' km/h', 1)}
          </p>
        </div>
      </div>
      <p className="text-xs text-[#CBD5E1]">
        {w?.freightAdvisory ?? 'Awaiting live weather reading.'}
      </p>
    </div>
  );
}

function FxCard({snapshot}: {snapshot: LiveCorridorSnapshot | null}) {
  const fx = snapshot?.fx;
  return (
    <div className="glass-panel glass-panel-interactive space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#F8FAFC]">
          Pithampur SEZ Export FX Benchmark
        </h3>
        <Landmark className="h-4 w-4 text-[#FCD34D]" aria-hidden="true" />
      </div>
      <p className="text-xs text-[#94A3B8]">
        Live API · Frankfurter ECB Reference
        {fx?.rateDate ? ` · ${fx.rateDate}` : ' · Unavailable'}
      </p>
      <div className="grid grid-cols-2 gap-4 border-y border-white/[0.08] py-3 text-xs">
        <div>
          <p className="text-[#94A3B8]">USD / INR</p>
          <p className="font-tabular mt-0.5 text-2xl font-bold text-[#F8FAFC]">
            {fx?.usdInr !== null && fx?.usdInr !== undefined
              ? `₹${fx.usdInr.toFixed(2)}`
              : 'Unavailable'}
          </p>
        </div>
        <div>
          <p className="text-[#94A3B8]">EUR / INR</p>
          <p className="font-tabular mt-0.5 text-2xl font-bold text-[#FCD34D]">
            {fx?.eurInr !== null && fx?.eurInr !== undefined
              ? `₹${fx.eurInr.toFixed(2)}`
              : 'Unavailable'}
          </p>
        </div>
      </div>
      <p className="text-xs text-[#CBD5E1]">
        Reference conversion rates for Pithampur pharma, auto-ancillary, and LUT export invoices.
      </p>
    </div>
  );
}
