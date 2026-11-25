import {NextResponse} from 'next/server';
import type {
  LiveCorridorSnapshot,
  LiveFxData,
  LiveWeatherData,
} from '@/lib/types';

const PITHAMPUR_LAT = 22.61;
const PITHAMPUR_LON = 75.69;

const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${PITHAMPUR_LAT}&longitude=${PITHAMPUR_LON}` +
  '&current=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia%2FKolkata';

const USD_INR_URL = 'https://api.frankfurter.app/latest?from=USD&to=INR';
const EUR_INR_URL = 'https://api.frankfurter.app/latest?from=EUR&to=INR';

function toNullableNumber(val: unknown): number | null {
  return typeof val === 'number' && Number.isFinite(val) ? val : null;
}

function classifyFreightAdvisory(
  precipMm: number | null,
  windKmh: number | null,
): string {
  if (precipMm === null && windKmh === null) {
    return 'Weather telemetry unavailable — verify NH-52 dispatch locally.';
  }
  if ((precipMm ?? 0) >= 5 || (windKmh ?? 0) >= 40) {
    return 'Heavy weather along NH-52 Rau–Pithampur; add dispatch buffer for GRN cutoffs.';
  }
  if ((precipMm ?? 0) > 0) {
    return 'Light precipitation on Indore–Pithampur corridor; standard freight clearance.';
  }
  return 'Clear NH-52 corridor conditions for Indore–Pithampur & Sanwer Road freight.';
}

async function fetchCorridorWeather(): Promise<LiveWeatherData> {
  const unavailable: LiveWeatherData = {
    status: 'unavailable',
    corridorName: 'Indore–Pithampur NH-52 Corridor',
    latitude: PITHAMPUR_LAT,
    longitude: PITHAMPUR_LON,
    temperatureC: null,
    precipitationMm: null,
    windKmh: null,
    weatherCode: null,
    freightAdvisory: 'Live weather feed temporarily unavailable.',
    observedAt: null,
  };

  try {
    const res = await fetch(OPEN_METEO_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return unavailable;
    const json = (await res.json()) as {
      current?: {
        temperature_2m?: unknown;
        precipitation?: unknown;
        wind_speed_10m?: unknown;
        weather_code?: unknown;
        time?: unknown;
      };
    };
    const cur = json.current;
    if (!cur) return unavailable;

    const temperatureC = toNullableNumber(cur.temperature_2m);
    const precipitationMm = toNullableNumber(cur.precipitation);
    const windKmh = toNullableNumber(cur.wind_speed_10m);
    const weatherCode = toNullableNumber(cur.weather_code);
    const observedAt = typeof cur.time === 'string' ? cur.time : null;

    return {
      status: temperatureC !== null ? 'live' : 'unavailable',
      corridorName: 'Indore–Pithampur NH-52 Corridor',
      latitude: PITHAMPUR_LAT,
      longitude: PITHAMPUR_LON,
      temperatureC,
      precipitationMm,
      windKmh,
      weatherCode,
      freightAdvisory: classifyFreightAdvisory(precipitationMm, windKmh),
      observedAt,
    };
  } catch {
    return unavailable;
  }
}

async function fetchExportFx(): Promise<LiveFxData> {
  const unavailable: LiveFxData = {
    status: 'unavailable',
    base: 'INR',
    usdInr: null,
    eurInr: null,
    rateDate: null,
  };

  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch(USD_INR_URL, {cache: 'no-store', signal: AbortSignal.timeout(6000)}),
      fetch(EUR_INR_URL, {cache: 'no-store', signal: AbortSignal.timeout(6000)}),
    ]);
    const usdJson = usdRes.ok
      ? ((await usdRes.json()) as {rates?: {INR?: unknown}; date?: unknown})
      : null;
    const eurJson = eurRes.ok
      ? ((await eurRes.json()) as {rates?: {INR?: unknown}; date?: unknown})
      : null;

    const usdInr = toNullableNumber(usdJson?.rates?.INR);
    const eurInr = toNullableNumber(eurJson?.rates?.INR);
    const rateDate =
      typeof usdJson?.date === 'string'
        ? usdJson.date
        : typeof eurJson?.date === 'string'
          ? eurJson.date
          : null;

    return {
      status: usdInr !== null || eurInr !== null ? 'live' : 'unavailable',
      base: 'INR',
      usdInr,
      eurInr,
      rateDate,
    };
  } catch {
    return unavailable;
  }
}

export async function GET() {
  const [weather, fx] = await Promise.all([
    fetchCorridorWeather(),
    fetchExportFx(),
  ]);
  const snapshot: LiveCorridorSnapshot = {
    fetchedAt: new Date().toISOString(),
    weather,
    fx,
  };
  return NextResponse.json(snapshot, {status: 200});
}
