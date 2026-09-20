import type { CalculationMethod, LocationConfig, Madhab } from '../types/prayer';
import type { PrayerTimeOverrides } from '../utils/prayerCalculation';

const API_ROOT = 'https://api.aladhan.com/v1';

const METHOD_IDS: Record<CalculationMethod, number> = {
  IFB: 1, // University of Islamic Sciences, Karachi — closest supported convention for IFB
  MWL: 3,
  ISNA: 2,
  UMM_AL_QURA: 4,
  EGYPT: 5,
};

const REQUEST_TIMEOUT_MS = 8000;

interface AlAdhanResponse {
  code: number;
  status: string;
  data?: {
    timings?: Record<string, string>;
  };
}

function localDateParts(date: Date, timezone: number) {
  const shifted = new Date(date.getTime() + timezone * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function apiDate(date: Date, timezone: number): string {
  const { year, month, day } = localDateParts(date, timezone);
  return [day, month, year].map((value) => String(value).padStart(2, '0')).join('-');
}

function parseLocalClock(value: string | undefined, date: Date, timezone: number): Date | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return undefined;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const { year, month, day } = localDateParts(date, timezone);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - timezone * 60 * 60 * 1000);
}

export async function fetchPrayerTimeOverrides(
  date: Date,
  location: LocationConfig,
  madhab: Madhab,
  method: CalculationMethod,
  signal?: AbortSignal,
): Promise<PrayerTimeOverrides> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    method: String(METHOD_IDS[method]),
    school: madhab === 'HANAFI' ? '1' : '0',
  });

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();

  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(
      `${API_ROOT}/timings/${apiDate(date, location.timezone)}?${params.toString()}`,
      {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error(`PRAYER_API_HTTP_${response.status}`);
    }

    const payload = (await response.json()) as AlAdhanResponse;
    if (payload.code !== 200 || !payload.data?.timings) {
      throw new Error('PRAYER_API_INVALID_RESPONSE');
    }

    const timings = payload.data.timings;
    return {
      fajr: parseLocalClock(timings.Fajr, date, location.timezone),
      sunrise: parseLocalClock(timings.Sunrise, date, location.timezone),
      dhuhr: parseLocalClock(timings.Dhuhr, date, location.timezone),
      asr: parseLocalClock(timings.Asr, date, location.timezone),
      maghrib: parseLocalClock(timings.Maghrib, date, location.timezone),
      isha: parseLocalClock(timings.Isha, date, location.timezone),
    };
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export interface MonthlyPrayerTimes {
  dayNumber: number;
  timings: PrayerTimeOverrides;
}

interface AlAdhanCalendarResponse {
  code: number;
  status: string;
  data?: Array<{
    date?: { gregorian?: { date?: string } };
    timings?: Record<string, string>;
  }>;
}

function parseCalendarDate(value: string | undefined, timezone: number): Date | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\\d{2})-(\\d{2})-(\\d{4})$/);
  if (!match) return undefined;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day, 12) - timezone * 60 * 60 * 1000);
}

export async function fetchMonthlyPrayerTimes(
  year: number,
  month: number,
  location: LocationConfig,
  madhab: Madhab,
  method: CalculationMethod,
  signal?: AbortSignal,
): Promise<MonthlyPrayerTimes[]> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    method: String(METHOD_IDS[method]),
    school: madhab === 'HANAFI' ? '1' : '0',
  });
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(
      `${API_ROOT}/calendar/${month}/${year}?${params.toString()}`,
      {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) throw new Error(`PRAYER_CALENDAR_HTTP_${response.status}`);
    const payload = (await response.json()) as AlAdhanCalendarResponse;
    if (payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('PRAYER_CALENDAR_INVALID_RESPONSE');
    }

    return payload.data.flatMap((entry) => {
      const gregorianDate = entry.date?.gregorian?.date;
      const parsedDate = parseCalendarDate(gregorianDate, location.timezone);
      const timings = entry.timings;
      if (!parsedDate || !timings) return [];
      return [{
        dayNumber: parsedDate.getUTCDate(),
        timings: {
          fajr: parseLocalClock(timings.Fajr, parsedDate, location.timezone),
          sunrise: parseLocalClock(timings.Sunrise, parsedDate, location.timezone),
          dhuhr: parseLocalClock(timings.Dhuhr, parsedDate, location.timezone),
          asr: parseLocalClock(timings.Asr, parsedDate, location.timezone),
          maghrib: parseLocalClock(timings.Maghrib, parsedDate, location.timezone),
          isha: parseLocalClock(timings.Isha, parsedDate, location.timezone),
        },
      }];
    });
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}