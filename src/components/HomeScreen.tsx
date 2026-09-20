import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Moon,
  Landmark,
  Sun,
  Compass,
  ArrowRight,
  Calculator,
  Calendar,
  Sparkles,
  Check,
  BookMarked,
  Flame,
} from 'lucide-react';
import type { HomeDestination } from '../types';
import { SectionHeader } from './SectionHeader';
import type { LocationConfig, Madhab, CalculationMethod } from '../types/prayer';
import { DEFAULT_LOCATION } from '../data/bangladeshDistricts';
import { requestGrantedBrowserLocation } from '../utils/browserLocation';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  formatCountdownBengali,
} from '../utils/prayerCalculation';
import { QuranPreferences } from '../utils/preferences';
import { findQuranSurah } from '../data/quranCatalog';

interface HomeScreenProps {
  onQuickActionClick: (destination: HomeDestination) => void;
  onContinueReading?: (surahNumber: number, ayahNumber: number) => void;
}

interface QuickAction {
  title: string;
  subtitle: string;
  destination: HomeDestination;
  icon: React.ComponentType<{ className?: string }>;
}

interface DailyAmal {
  id: string;
  label: string;
  destination?: HomeDestination;
}

const DAILY_AMALS: DailyAmal[] = [
  { id: 'fajr', label: 'ফজর নামাজ', destination: 'PRAYER' },
  { id: 'quran', label: 'কুরআন তিলাওয়াত', destination: 'QURAN' },
  { id: 'morning-dhikr', label: 'সকালের যিকির', destination: 'DUA' },
  { id: 'dhuhr', label: 'যোহর নামাজ', destination: 'PRAYER' },
  { id: 'evening-dhikr', label: 'সন্ধ্যার যিকির', destination: 'DUA' },
];

const INSPIRATION = [
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    bengali: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি রয়েছে।',
    source: 'সূরা আল-ইনশিরাহ, ৯৪:৬',
  },
  {
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    bengali: 'তোমরা আমাকে স্মরণ কর, আমিও তোমাদের স্মরণ করব।',
    source: 'সূরা আল-বাকারা, ২:১৫২',
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    bengali: 'যে আল্লাহর উপর ভরসা করে, তিনিই তার জন্য যথেষ্ট।',
    source: 'সূরা আত-তালাক, ৬৫:৩',
  },
  {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    bengali: 'জেনে রাখ, আল্লাহর স্মরণেই অন্তর প্রশান্ত হয়।',
    source: 'সূরা আর-রাদ, ১৩:২৮',
  },
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadCheckedAmals(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem('ikp-daily-amal');
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { date: string; checked: Record<string, boolean> };
    if (parsed.date !== getTodayKey()) return {};
    return parsed.checked || {};
  } catch {
    return {};
  }
}

function saveCheckedAmals(checked: Record<string, boolean>) {
  try {
    localStorage.setItem(
      'ikp-daily-amal',
      JSON.stringify({ date: getTodayKey(), checked })
    );
  } catch {
    // ignore
  }
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onQuickActionClick,
  onContinueReading,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [checkedAmals, setCheckedAmals] = useState<Record<string, boolean>>(() =>
    loadCheckedAmals()
  );

  const madhab: Madhab = 'HANAFI';
  const calcMethod: CalculationMethod = 'IFB';

  const lastRead = QuranPreferences.getLastRead();
  const resumeSurah = lastRead ? findQuranSurah(lastRead.surahNumber) : null;

  useEffect(() => {
    let cancelled = false;
    requestGrantedBrowserLocation().then((detectedLocation) => {
      if (!cancelled && detectedLocation) setLocation(detectedLocation);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerData = useMemo(
    () => calculatePrayerTimes(currentTime, location, madhab, calcMethod),
    [currentTime, location, madhab, calcMethod]
  );

  const inspiration = useMemo(() => {
    const dayOfYear = Math.floor(
      (currentTime.getTime() -
        new Date(currentTime.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return INSPIRATION[dayOfYear % INSPIRATION.length];
  }, [currentTime]);

  const completedCount = DAILY_AMALS.filter((a) => checkedAmals[a.id]).length;
  const amalProgress = Math.round((completedCount / DAILY_AMALS.length) * 100);

  const toggleAmal = (id: string) => {
    setCheckedAmals((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveCheckedAmals(next);
      return next;
    });
  };

  const actions: QuickAction[] = [
    { title: 'কুরআন', subtitle: 'তিলাওয়াত ও অর্থ', destination: 'QURAN', icon: BookOpen },
    { title: 'নামাজ ও কিবলা', subtitle: 'সময় ও দিকনির্ণয়', destination: 'PRAYER', icon: Landmark },
    { title: 'দোয়া ও যিকির', subtitle: 'দৈনন্দিন আমল', destination: 'DUA', icon: Moon },
    { title: 'হাদিস', subtitle: 'সহীহ হাদিস', destination: 'HADITH', icon: BookMarked },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7 space-y-6 pb-28">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] sm:text-3xl font-extrabold tracking-tight text-[var(--ikp-text)]">
            আসসালামু আলাইকুম
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--ikp-text-muted)]">
            আজ{' '}
            {currentTime.toLocaleDateString('bn-BD', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onQuickActionClick('PRAYER')}
          className="ikp-focus-ring flex items-center gap-1.5 rounded-xl bg-[var(--ikp-primary-soft)] px-3 py-2 text-xs font-bold text-[var(--ikp-primary)] transition-colors hover:opacity-85 shrink-0"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>কিবলা</span>
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onQuickActionClick('PRAYER')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onQuickActionClick('PRAYER');
        }}
        className="ikp-focus-ring cursor-pointer rounded-[28px] bg-gradient-to-br from-[#176B4D] to-[#0B4A34] p-5 sm:p-7 text-white shadow-lg shadow-emerald-950/10 transition-transform active:scale-[0.99] relative overflow-hidden group"
      >
        <div className="absolute right-5 top-5 text-white/45 group-hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="relative space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B6E8CF]">
              পরবর্তী ওয়াক্ত
            </span>
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold text-white/90 ring-1 ring-white/10">
              {location.id === 'gps-current'
                ? location.nameBengali
                : `${location.nameBengali} (ডিফল্ট)`}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-3xl sm:text-[42px] leading-none font-black tracking-tight">
                {prayerData.nextPrayer.nameBengali}
              </div>
              <span className="mt-1 block text-sm text-white/70 font-serif">
                {prayerData.nextPrayer.nameArabic}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-sans tabular-nums">
                {formatTimeBengali(prayerData.nextPrayer.time, true, location.timezone)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3.5 text-xs backdrop-blur-sm">
            <span className="text-white/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9DD6B9]" />
              বাকি আছে
            </span>
            <span className="font-bold text-white font-sans text-sm">
              {formatCountdownBengali(prayerData.nextPrayer.remainingMs)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] text-white/80">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-rose-300" />
              <span>ফজর শুরু:</span>
              <strong className="font-bold font-sans text-white">
                {formatTimeBengali(prayerData.sehriEnd, false, location.timezone)}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>মাগরিব:</span>
              <strong className="font-bold font-sans text-white">
                {formatTimeBengali(prayerData.iftar, false, location.timezone)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {resumeSurah && lastRead && onContinueReading && (
        <button
          type="button"
          onClick={() => onContinueReading(lastRead.surahNumber, lastRead.ayahNumber)}
          className="ikp-focus-ring w-full text-left rounded-2xl ikp-surface p-4 shadow-sm transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ikp-primary-soft)] text-[var(--ikp-primary)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[var(--ikp-primary)]">
                  কুরআন চালিয়ে পড়ুন
                </span>
                <div className="mt-0.5 truncate text-sm font-bold text-[var(--ikp-text)]">
                  {resumeSurah.nameBengali}
                </div>
                <div className="text-xs text-[var(--ikp-text-muted)]">
                  আয়াত {lastRead.ayahNumber} • {resumeSurah.nameArabic}
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--ikp-primary)]" />
          </div>
        </button>
      )}

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <SectionHeader title="আজকের আমল" />
          <span className="text-xs font-bold text-[var(--ikp-primary)]">
            {completedCount}/{DAILY_AMALS.length}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[var(--ikp-surface-muted)]"
          aria-label={`আজকের আমল ${amalProgress}% সম্পন্ন`}
        >
          <div
            className="h-full rounded-full bg-[var(--ikp-primary)] transition-[width]"
            style={{ width: `${amalProgress}%` }}
          />
        </div>

        <div className="ikp-surface overflow-hidden rounded-2xl divide-y divide-[var(--ikp-border)]">
          {DAILY_AMALS.map((amal) => {
            const done = !!checkedAmals[amal.id];
            return (
              <div key={amal.id} className="flex items-center gap-3 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => toggleAmal(amal.id)}
                  aria-label={done ? `${amal.label} সম্পন্ন` : `${amal.label} চিহ্নিত করুন`}
                  className={`ikp-focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                    done
                      ? 'bg-[var(--ikp-primary)] border-[var(--ikp-primary)] text-white'
                      : 'border-[var(--ikp-border)] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (amal.destination) onQuickActionClick(amal.destination);
                  }}
                  className={`flex-1 text-left text-sm font-medium transition-colors ${
                    done
                      ? 'text-[var(--ikp-text-muted)] line-through'
                      : 'text-[var(--ikp-text)]'
                  }`}
                >
                  {amal.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--ikp-primary-soft)] bg-[var(--ikp-primary-soft)]/45 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--ikp-primary)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>আজকের আয়াত</span>
        </div>
        <p
          className="text-right text-lg leading-relaxed font-serif text-[var(--ikp-primary-strong)]"
          dir="rtl"
        >
          {inspiration.arabic}
        </p>
        <p className="text-sm leading-relaxed text-[var(--ikp-text)]">
          “{inspiration.bengali}”
        </p>
        <p className="text-[11px] text-[var(--ikp-text-muted)]">{inspiration.source}</p>
      </div>

      <div className="space-y-3">
        <SectionHeader title="দ্রুত অ্যাকশন" />
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.title}
                type="button"
                onClick={() => onQuickActionClick(action.destination)}
                className="ikp-focus-ring text-left rounded-2xl bg-[var(--ikp-surface-muted)] p-4 sm:p-5 transition-colors hover:brightness-[0.98] flex flex-col justify-between gap-4 border border-[var(--ikp-border)] active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ikp-primary-soft)] text-[var(--ikp-primary)]">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--ikp-text)]">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[var(--ikp-text-muted)] mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader title="টুলস ও শিক্ষা" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onQuickActionClick('LEARN_SALAH')}
            className="ikp-focus-ring text-left rounded-2xl ikp-surface p-4 transition-all hover:bg-[var(--ikp-primary-soft)]/25 shadow-sm flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--ikp-primary-soft)] flex items-center justify-center text-[var(--ikp-primary)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--ikp-text)]">সালাত শিক্ষা</h4>
              <p className="mt-0.5 text-xs text-[var(--ikp-text-muted)]">অজু ও নামাজ</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickActionClick('RAMADAN')}
            className="ikp-focus-ring text-left rounded-2xl ikp-surface p-4 transition-all hover:bg-[var(--ikp-primary-soft)]/25 shadow-sm flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--ikp-text)]">রমজান</h4>
              <p className="mt-0.5 text-xs text-[var(--ikp-text-muted)]">সেহরি · ইফতার</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickActionClick('ZAKAT')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-all shadow-xs flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">যাকাত</h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">নিসাব ও হিসাব</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickActionClick('CALENDAR')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-all shadow-xs flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">হিজরি ক্যালেন্ডার</h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">ইসলামিক দিনপঞ্জি</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
