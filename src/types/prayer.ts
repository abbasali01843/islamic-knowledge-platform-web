export type CalculationMethod =
  | 'IFB' // Internal key for the 18°/18° Karachi convention used by AlAdhan method 1
  | 'MWL' // Muslim World League (18°, 17°)
  | 'ISNA' // ISNA (15°, 15°)
  | 'UMM_AL_QURA' // Umm al-Qura, Makkah
  | 'EGYPT'; // Egyptian General Authority (19.5°, 17.5°)

export type Madhab = 'HANAFI' | 'STANDARD'; // HANAFI = 2x shadow, STANDARD = 1x shadow (Shafi'i, Maliki, Hanbali)

export interface LocationConfig {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  division?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours, e.g., +6 for Bangladesh
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface CalculatedPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  sehriEnd: Date;
  iftar: Date;
  tahajjudEnd: Date;
  midnight: Date;
  lastThirdNight: Date;
  nextPrayer: {
    key: PrayerKey;
    nameBengali: string;
    nameArabic: string;
    time: Date;
    remainingMs: number;
  };
  currentPrayer: {
    key: PrayerKey;
    nameBengali: string;
    nameArabic: string;
    time: Date;
    progressPercent: number;
  } | null;
  forbiddenTimes: {
    isForbiddenNow: boolean;
    currentForbiddenReason?: string;
    periods: Array<{
      nameBengali: string;
      start: Date;
      end: Date;
      reason: string;
    }>;
  };
}

export interface SalahStep {
  id: string;
  titleBengali: string;
  titleArabic?: string;
  instruction: string;
  arabicText?: string;
  bengaliTransliteration?: string;
  bengaliMeaning?: string;
  sourceReference?: string;
  note?: string;
}

export interface SalahGuideCategory {
  id: string;
  title: string;
  subtitle: string;
  steps: SalahStep[];
}

export interface DailySalahTracker {
  date: string; // YYYY-MM-DD
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}
