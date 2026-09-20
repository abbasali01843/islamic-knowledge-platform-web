import {
  CalculatedPrayerTimes,
  CalculationMethod,
  LocationConfig,
  Madhab,
  PrayerKey,
} from '../types/prayer';

// Kaaba coordinates in Makkah
export const KAABA_LATITUDE = 21.422487;
export const KAABA_LONGITUDE = 39.826206;

// Mathematical helpers
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

const sinDeg = (d: number) => Math.sin(d2r(d));
const cosDeg = (d: number) => Math.cos(d2r(d));
const asinDeg = (x: number) => r2d(Math.asin(Math.max(-1, Math.min(1, x))));
const acosDeg = (x: number) => r2d(Math.acos(Math.max(-1, Math.min(1, x))));
const atan2Deg = (y: number, x: number) => (r2d(Math.atan2(y, x)) + 360) % 360;

const fixAngle = (a: number) => {
  const res = a % 360.0;
  return res < 0 ? res + 360.0 : res;
};

const fixHour = (h: number) => {
  const res = h % 24.0;
  return res < 0 ? res + 24.0 : res;
};

function getJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

function getSunPosition(jd: number): { declination: number; eqTime: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sinDeg(g) + 0.02 * sinDeg(2 * g));

  const e = 23.439 - 0.00000036 * D;
  const d = asinDeg(sinDeg(e) * sinDeg(L));
  let RA = atan2Deg(cosDeg(e) * sinDeg(L), cosDeg(L)) / 15.0;
  RA = fixHour(RA);

  const eqTime = (q / 15.0 - RA) * 60.0;
  return { declination: d, eqTime };
}

function getHourAngle(altitude: number, latitude: number, declination: number): number | null {
  const cosH =
    (sinDeg(altitude) - sinDeg(latitude) * sinDeg(declination)) /
    (cosDeg(latitude) * cosDeg(declination));
  if (cosH > 1 || cosH < -1) {
    return null;
  }
  return acosDeg(cosH);
}

interface MethodParams {
  fajrAngle: number;
  ishaAngle?: number;
  ishaMinutesAfterMaghrib?: number;
}

function getMethodParams(method: CalculationMethod): MethodParams {
  switch (method) {
    case 'IFB':
      return { fajrAngle: 18.0, ishaAngle: 18.0 };
    case 'MWL':
      return { fajrAngle: 18.0, ishaAngle: 17.0 };
    case 'ISNA':
      return { fajrAngle: 15.0, ishaAngle: 15.0 };
    case 'UMM_AL_QURA':
      return { fajrAngle: 18.5, ishaMinutesAfterMaghrib: 90 };
    case 'EGYPT':
      return { fajrAngle: 19.5, ishaAngle: 17.5 };
    default:
      return { fajrAngle: 18.0, ishaAngle: 18.0 };
  }
}

function hoursToDate(
  year: number,
  month: number,
  day: number,
  decimalHours: number,
  timezone: number
): Date {
  const totalSeconds = Math.round(fixHour(decimalHours) * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Local wall-clock → UTC instant so countdowns stay correct across browser TZs
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds) - timezone * 60 * 60 * 1000);
}

export interface PrayerTimeOverrides {
  fajr?: Date;
  sunrise?: Date;
  dhuhr?: Date;
  asr?: Date;
  maghrib?: Date;
  isha?: Date;
}

export function calculatePrayerTimes(
  date: Date,
  location: LocationConfig,
  madhab: Madhab = 'HANAFI',
  method: CalculationMethod = 'IFB',
  overrides: PrayerTimeOverrides = {}
): CalculatedPrayerTimes {
  const locationDate = new Date(date.getTime() + location.timezone * 60 * 60 * 1000);
  const year = locationDate.getUTCFullYear();
  const month = locationDate.getUTCMonth() + 1;
  const day = locationDate.getUTCDate();

  const jd = getJulianDay(year, month, day);
  const { declination, eqTime } = getSunPosition(jd);
  const params = getMethodParams(method);

  const dhuhrDecimal = 12.0 + location.timezone - location.longitude / 15.0 - eqTime / 60.0;

  const sunAltitudeRiseSet = -0.833;
  const hRiseSet = getHourAngle(sunAltitudeRiseSet, location.latitude, declination) ?? 90;
  const sunriseDecimal = dhuhrDecimal - hRiseSet / 15.0;
  const sunsetDecimal = dhuhrDecimal + hRiseSet / 15.0;

  const hFajr = getHourAngle(-params.fajrAngle, location.latitude, declination) ?? 108;
  const fajrDecimal = dhuhrDecimal - hFajr / 15.0;

  const shadowFactor = madhab === 'HANAFI' ? 2 : 1;
  const asrAltitude = r2d(
    Math.atan(1.0 / (shadowFactor + Math.tan(Math.abs(d2r(location.latitude - declination)))))
  );
  const hAsr = getHourAngle(asrAltitude, location.latitude, declination) ?? 60;
  const asrDecimal = dhuhrDecimal + hAsr / 15.0;

  const maghribDecimal = sunsetDecimal;

  let ishaDecimal: number;
  if (params.ishaMinutesAfterMaghrib) {
    ishaDecimal = maghribDecimal + params.ishaMinutesAfterMaghrib / 60.0;
  } else {
    const hIsha = getHourAngle(-(params.ishaAngle ?? 18.0), location.latitude, declination) ?? 108;
    ishaDecimal = dhuhrDecimal + hIsha / 15.0;
  }

  const fajr = hoursToDate(year, month, day, fajrDecimal, location.timezone);
  const sunrise = hoursToDate(year, month, day, sunriseDecimal, location.timezone);
  const dhuhr = hoursToDate(year, month, day, dhuhrDecimal, location.timezone);
  const asr = hoursToDate(year, month, day, asrDecimal, location.timezone);
  const maghrib = hoursToDate(year, month, day, maghribDecimal, location.timezone);
  const isha = hoursToDate(year, month, day, ishaDecimal, location.timezone);

  const finalFajr = overrides.fajr ?? fajr;
  const finalSunrise = overrides.sunrise ?? sunrise;
  const finalDhuhr = overrides.dhuhr ?? dhuhr;
  const finalAsr = overrides.asr ?? asr;
  const finalMaghrib = overrides.maghrib ?? maghrib;
  const finalIsha = overrides.isha ?? isha;

  const sehriEnd = new Date(finalFajr.getTime() - 10 * 60 * 1000);
  const iftar = new Date(finalMaghrib.getTime());

  const tomorrowFajr = new Date(finalFajr.getTime() + 24 * 60 * 60 * 1000);
  const nightDurationMs = tomorrowFajr.getTime() - finalMaghrib.getTime();
  const midnight = new Date(finalMaghrib.getTime() + nightDurationMs / 2);
  const lastThirdNight = new Date(finalMaghrib.getTime() + (nightDurationMs * 2) / 3);
  const tahajjudEnd = new Date(finalFajr.getTime());

  const now = date;
  const prayerSequence: Array<{ key: PrayerKey; nameBengali: string; nameArabic: string; time: Date }> = [
    { key: 'fajr', nameBengali: 'ফজর', nameArabic: 'الفجر', time: finalFajr },
    { key: 'sunrise', nameBengali: 'সূর্যোদয়', nameArabic: 'الشروق', time: finalSunrise },
    { key: 'dhuhr', nameBengali: 'যোহর', nameArabic: 'الظهر', time: finalDhuhr },
    { key: 'asr', nameBengali: 'আসর', nameArabic: 'العصر', time: finalAsr },
    { key: 'maghrib', nameBengali: 'মাগরিব', nameArabic: 'المغرب', time: finalMaghrib },
    { key: 'isha', nameBengali: 'এশা', nameArabic: 'العشاء', time: finalIsha },
  ];

  let nextPrayerItem = prayerSequence.find((p) => p.time.getTime() > now.getTime());
  if (!nextPrayerItem) {
    const tomorrowFajrTime = new Date(finalFajr.getTime() + 24 * 60 * 60 * 1000);
    nextPrayerItem = {
      key: 'fajr',
      nameBengali: 'ফজর',
      nameArabic: 'الفجر',
      time: tomorrowFajrTime,
    };
  }

  let currentPrayerItem: {
    key: PrayerKey;
    nameBengali: string;
    nameArabic: string;
    time: Date;
    progressPercent: number;
  } | null = null;

  for (let i = prayerSequence.length - 1; i >= 0; i--) {
    if (now.getTime() >= prayerSequence[i].time.getTime()) {
      const cur = prayerSequence[i];
      const nextTime =
        i < prayerSequence.length - 1
          ? prayerSequence[i + 1].time.getTime()
          : finalFajr.getTime() + 24 * 60 * 60 * 1000;
      const totalSpan = nextTime - cur.time.getTime();
      const elapsed = Math.max(0, now.getTime() - cur.time.getTime());
      const progressPercent = Math.min(100, Math.round((elapsed / totalSpan) * 100));

      currentPrayerItem = {
        key: cur.key,
        nameBengali: cur.nameBengali,
        nameArabic: cur.nameArabic,
        time: cur.time,
        progressPercent,
      };
      break;
    }
  }

  if (!currentPrayerItem) {
    const yesterdayIsha = new Date(finalIsha.getTime() - 24 * 60 * 60 * 1000);
    const totalSpan = finalFajr.getTime() - yesterdayIsha.getTime();
    const elapsed = Math.max(0, now.getTime() - yesterdayIsha.getTime());
    const progressPercent = Math.min(100, Math.round((elapsed / totalSpan) * 100));
    currentPrayerItem = {
      key: 'isha',
      nameBengali: 'এশা',
      nameArabic: 'العشاء',
      time: yesterdayIsha,
      progressPercent,
    };
  }

  const sunriseForbiddenEnd = new Date(finalSunrise.getTime() + 15 * 60 * 1000);
  const zawalStart = new Date(finalDhuhr.getTime() - 10 * 60 * 1000);
  const sunsetForbiddenDate = new Date(finalMaghrib.getTime() - 15 * 60 * 1000);

  const forbiddenPeriods = [
    {
      nameBengali: 'সূর্যোদয় কালীন',
      start: finalSunrise,
      end: sunriseForbiddenEnd,
      reason:
        'সূর্যোদয়ের সময় থেকে সূর্য এক বর্শা পরিমাণ ওপরে ওঠার আগ পর্যন্ত (প্রায় ১৫ মিনিট) নামাজ পড়া নিষেধ। (সহীহ মুসলিম: ৮৩১)',
    },
    {
      nameBengali: 'ঠিক দ্বিপ্রহর (যাওয়াল)',
      start: zawalStart,
      end: finalDhuhr,
      reason:
        'সূর্য ঠিক মাথার ওপর থাকার সময় থেকে পশ্চিমাকাশে ঢলে পড়ার পূর্ব পর্যন্ত নামাজ নিষেধ। (সহীহ মুসলিম: ৮৩১)',
    },
    {
      nameBengali: 'সূর্যাস্ত কালীন',
      start: sunsetForbiddenDate,
      end: finalMaghrib,
      reason:
        'সূর্য হলুদ বর্ণ ধারণ করে ডোবার আগ পর্যন্ত (১৫ মিনিট) নফল নামাজ নিষেধ। (সহীহ মুসলিম: ৮৩১)',
    },
  ];

  const currentForbidden = forbiddenPeriods.find(
    (p) => now.getTime() >= p.start.getTime() && now.getTime() <= p.end.getTime()
  );

  return {
    date,
    fajr: finalFajr,
    sunrise: finalSunrise,
    dhuhr: finalDhuhr,
    asr: finalAsr,
    maghrib: finalMaghrib,
    isha: finalIsha,
    sehriEnd,
    iftar,
    tahajjudEnd,
    midnight,
    lastThirdNight,
    nextPrayer: {
      key: nextPrayerItem.key,
      nameBengali: nextPrayerItem.nameBengali,
      nameArabic: nextPrayerItem.nameArabic,
      time: nextPrayerItem.time,
      remainingMs: Math.max(0, nextPrayerItem.time.getTime() - now.getTime()),
    },
    currentPrayer: currentPrayerItem,
    forbiddenTimes: {
      isForbiddenNow: Boolean(currentForbidden),
      currentForbiddenReason: currentForbidden?.reason,
      periods: forbiddenPeriods,
    },
  };
}

export function calculateKaabaDistanceKm(latitude: number, longitude: number): number {
  const R = 6371;
  const dLat = d2r(KAABA_LATITUDE - latitude);
  const dLon = d2r(KAABA_LONGITUDE - longitude);
  const lat1 = d2r(latitude);
  const lat2 = d2r(KAABA_LATITUDE);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const phiK = d2r(KAABA_LATITUDE);
  const lambdaK = d2r(KAABA_LONGITUDE);
  const phi = d2r(latitude);
  const lambda = d2r(longitude);

  const deltaLambda = lambdaK - lambda;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  return Math.round((r2d(Math.atan2(y, x)) + 360) % 360);
}

export function toBengaliNumerals(value: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

/**
 * Formats a Date into Bengali 12-hour wall-clock time for a location.
 * Always pass `timezone` (UTC offset hours) for prayer times — never rely on browser local TZ.
 * Defaults to UTC+6 (Bangladesh) when omitted, so accidental omissions still show BD-local times.
 */
export function formatTimeBengali(
  date: Date,
  showPeriod: boolean = true,
  timezone: number = 6
): string {
  const shifted = new Date(date.getTime() + timezone * 60 * 60 * 1000);
  let hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();

  let bengaliPeriod = 'সকাল';
  if (hours >= 3 && hours < 6) bengaliPeriod = 'ভোর';
  else if (hours >= 6 && hours < 12) bengaliPeriod = 'সকাল';
  else if (hours >= 12 && hours < 15) bengaliPeriod = 'দুপুর';
  else if (hours >= 15 && hours < 18) bengaliPeriod = 'বিকাল';
  else if (hours >= 18 && hours < 20) bengaliPeriod = 'সন্ধ্যা';
  else bengaliPeriod = 'রাত';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const hStr = toBengaliNumerals(hours.toString().padStart(2, '0'));
  const mStr = toBengaliNumerals(minutes.toString().padStart(2, '0'));

  if (!showPeriod) {
    return `${hStr}:${mStr}`;
  }
  return `${hStr}:${mStr} ${bengaliPeriod}`;
}

export function formatCountdownBengali(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = toBengaliNumerals(hours);
  const mStr = toBengaliNumerals(minutes);
  const sStr = toBengaliNumerals(seconds);

  if (hours > 0) {
    return `${hStr} ঘণ্টা ${mStr} মিনিট ${sStr} সেকেন্ড`;
  }
  return `${mStr} মিনিট ${sStr} সেকেন্ড`;
}
