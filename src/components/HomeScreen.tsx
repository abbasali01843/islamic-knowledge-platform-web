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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#181D19] dark:text-[#E1E5E1]">
            আসসালামু আলাইকুম
          </h1>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFEA] dark:bg-[#252F28] text-xs font-semibold text-[#176B4D] dark:text-[#9DD6B9] hover:opacity-80 transition-opacity shrink-0"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>কিবলা</span>
        </button>
      </div>

      {/* Next Prayer */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onQuickActionClick('PRAYER')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onQuickActionClick('PRAYER');
        }}
        className="cursor-pointer rounded-3xl bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white p-5 sm:p-6 shadow-md transition-transform active:scale-[0.99] relative overflow-hidden group"
      >
        <div className="absolute right-4 top-4 text-white/40 group-hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9DD6B9]">
              পরবর্তী ওয়াক্ত
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
              {location.id === 'gps-current'
                ? location.nameBengali
                : `${location.nameBengali} (ডিফল্ট)`}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {prayerData.nextPrayer.nameBengali}
              </div>
              <span className="text-xs text-white/80 font-serif">
                {prayerData.nextPrayer.nameArabic}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-bold font-sans">
                {formatTimeBengali(prayerData.nextPrayer.time)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9DD6B9]" />
              বাকি আছে
            </span>
            <span className="font-bold text-white font-sans text-sm">
              {formatCountdownBengali(prayerData.nextPrayer.remainingMs)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-white/10 text-white/90">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-rose-300" />
              <span>সেহরি:</span>
              <strong className="font-bold font-sans text-white">
                {formatTimeBengali(prayerData.sehriEnd, false)}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>ইফতার:</span>
              <strong className="font-bold font-sans text-white">
                {formatTimeBengali(prayerData.iftar, false)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Continue reading Quran */}
      {resumeSurah && lastRead && onContinueReading && (
        <button
          type="button"
          onClick={() => onContinueReading(lastRead.surahNumber, lastRead.ayahNumber)}
          className="w-full text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#176B4D]/25 dark:border-[#9DD6B9]/30 shadow-xs active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] flex items-center justify-center shrink-0 text-[#176B4D] dark:text-[#9DD6B9]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                  কুরআন চালিয়ে পড়ুন
                </span>
                <div className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1] truncate mt-0.5">
                  {resumeSurah.nameBengali}
                </div>
                <div className="text-xs text-[#717A74] dark:text-[#8B958E]">
                  আয়াত {lastRead.ayahNumber} • {resumeSurah.nameArabic}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#176B4D] dark:text-[#9DD6B9] shrink-0" />
          </div>
        </button>
      )}

      {/* Today's Amal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader title="আজকের আমল" />
          <span className="text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9]">
            {completedCount}/{DAILY_AMALS.length}
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 divide-y divide-[#E8EFEA] dark:divide-[#3A4D43]/40 overflow-hidden">
          {DAILY_AMALS.map((amal) => {
            const done = !!checkedAmals[amal.id];
            return (
              <div key={amal.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleAmal(amal.id)}
                  aria-label={done ? `${amal.label} সম্পন্ন` : `${amal.label} চিহ্নিত করুন`}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    done
                      ? 'bg-[#176B4D] border-[#176B4D] text-white'
                      : 'border-[#C5D0C8] dark:border-[#4A5A50] text-transparent'
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
                      ? 'text-[#717A74] dark:text-[#8B958E] line-through'
                      : 'text-[#181D19] dark:text-[#E1E5E1]'
                  }`}
                >
                  {amal.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Inspiration */}
      <div className="rounded-2xl p-5 bg-[#F0F7F3] dark:bg-[#152019] border border-[#D4E8DC] dark:border-[#2A3A30] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>আজকের আয়াত</span>
        </div>
        <p
          className="text-right text-lg leading-relaxed font-serif text-[#0A3D2B] dark:text-[#C8E6D4]"
          dir="rtl"
        >
          {inspiration.arabic}
        </p>
        <p className="text-sm leading-relaxed text-[#414A45] dark:text-[#C1CAC4]">
          “{inspiration.bengali}”
        </p>
        <p className="text-[11px] text-[#717A74] dark:text-[#8B958E]">{inspiration.source}</p>
      </div>

      {/* Quick Actions */}
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
                className="text-left p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] hover:bg-[#dce7e0] dark:hover:bg-[#2f3b33] transition-colors flex flex-col justify-between space-y-3 border border-black/5 dark:border-white/5 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] flex items-center justify-center text-[#176B4D] dark:text-[#9DD6B9]">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#181D19] dark:text-[#E1E5E1]">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-3">
        <SectionHeader title="টুলস ও শিক্ষা" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onQuickActionClick('LEARN_SALAH')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-all shadow-xs flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#005236] flex items-center justify-center text-[#176B4D] dark:text-[#9DD6B9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">সালাত শিক্ষা</h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">অজু ও নামাজের নিয়ম</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onQuickActionClick('ZAKAT')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-all shadow-xs flex flex-col gap-3 active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
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
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-300">
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
