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
} from 'lucide-react';
import { HomeDestination } from '../types';
import { SectionHeader } from './SectionHeader';
import { LocationConfig, Madhab, CalculationMethod } from '../types/prayer';
import { DEFAULT_LOCATION } from '../data/bangladeshDistricts';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  formatCountdownBengali,
} from '../utils/prayerCalculation';

interface HomeScreenProps {
  onQuickActionClick: (destination: HomeDestination) => void;
}

interface QuickAction {
  title: string;
  subtitle: string;
  destination: HomeDestination;
  icon: React.ComponentType<{ className?: string }>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onQuickActionClick }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const location: LocationConfig = DEFAULT_LOCATION;
  const madhab: Madhab = 'HANAFI';
  const calcMethod: CalculationMethod = 'IFB';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerData = useMemo(() => {
    return calculatePrayerTimes(currentTime, location, madhab, calcMethod);
  }, [currentTime, location, madhab, calcMethod]);

  const actions: QuickAction[] = [
    {
      title: 'কুরআন',
      subtitle: '১১৪ সূরা ও অর্থ',
      destination: 'QURAN',
      icon: BookOpen,
    },
    {
      title: 'নামাজ ও কিবলা',
      subtitle: 'সময়সূচি ও দিকনির্ণয়',
      destination: 'PRAYER',
      icon: Landmark,
    },
    {
      title: 'হাদিস',
      subtitle: 'সহিহ হাদিস সংকলন',
      destination: 'HADITH',
      icon: BookOpen,
    },
    {
      title: 'দোয়া ও যিকর',
      subtitle: 'দৈনন্দিন আমল',
      destination: 'DUA',
      icon: Moon,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#181D19] dark:text-[#E1E5E1]">
            আসসালামু আলাইকুম
          </h1>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">
            আজ {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onQuickActionClick('PRAYER')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFEA] dark:bg-[#252F28] text-xs font-semibold text-[#176B4D] dark:text-[#9DD6B9] hover:opacity-80 transition-opacity"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>কিবলা ও নামাজ</span>
        </button>
      </div>

      {/* Live Next Prayer Banner */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onQuickActionClick('PRAYER')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onQuickActionClick('PRAYER');
        }}
        className="cursor-pointer rounded-3xl bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white p-6 shadow-md transition-transform active:scale-[0.99] relative overflow-hidden group"
      >
        <div className="absolute right-4 top-4 text-white/40 group-hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9DD6B9]">
              পরবর্তী ওয়াক্ত
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
              {location.nameBengali}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
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

          {/* Countdown timer */}
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9DD6B9]" />
              বাকি আছে
            </span>
            <span className="font-bold text-white font-sans text-sm">
              {formatCountdownBengali(prayerData.nextPrayer.remainingMs)}
            </span>
          </div>

          {/* Sehri & Iftar mini-strip */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-white/10 text-white/90">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-rose-300" />
              <span>সেহরি শেষ:</span>
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

      {/* Quick Actions Grid */}
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

      {/* Phase 4: Islamic Learning & Tools Section */}
      <div className="space-y-3">
        <SectionHeader title="ইসলামিক শিক্ষা ও আমল টুলস" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Salah & Wudu */}
          <button
            type="button"
            onClick={() => onQuickActionClick('LEARN_SALAH')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] hover:bg-[#D4F2E2]/20 border border-[#E8EFEA] dark:border-[#3A4D43]/60 transition-all shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#005236] flex items-center justify-center text-[#176B4D] dark:text-[#9DD6B9]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                সহীহ সুন্নাহ
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1] group-hover:text-[#176B4D] dark:group-hover:text-[#9DD6B9] transition-colors">
                সালাত ও অজু শিক্ষা
              </h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5 leading-relaxed">
                ধারাবাহিক নিয়ম, রাকাত টেবিল, দোয়া ও অজু
              </p>
            </div>
          </button>

          {/* Card 2: Zakat Calculator */}
          <button
            type="button"
            onClick={() => onQuickActionClick('ZAKAT')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] hover:bg-[#D4F2E2]/20 border border-[#E8EFEA] dark:border-[#3A4D43]/60 transition-all shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                ২.৫% হিসাব
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1] group-hover:text-[#176B4D] dark:group-hover:text-[#9DD6B9] transition-colors">
                যাকাত ক্যালকুলেটর
              </h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5 leading-relaxed">
                স্বর্ণ, রৌপ্য ও নগদ অর্থের নিসাব নির্ধারণ
              </p>
            </div>
          </button>

          {/* Card 3: Hijri Calendar */}
          <button
            type="button"
            onClick={() => onQuickActionClick('CALENDAR')}
            className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] hover:bg-[#D4F2E2]/20 border border-[#E8EFEA] dark:border-[#3A4D43]/60 transition-all shadow-xs flex flex-col justify-between space-y-3 group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-300">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                হিজরি সন
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1] group-hover:text-[#176B4D] dark:group-hover:text-[#9DD6B9] transition-colors">
                হিজরি ক্যালেন্ডার
              </h4>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5 leading-relaxed">
                ইসলামিক দিনপঞ্জিকা ও আইয়ামে বীজ
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Online Islamic content entry points */}
      <div className="space-y-3">
        <SectionHeader title="অনলাইন ইসলামিক কনটেন্ট" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onClick={() => onQuickActionClick('QURAN')} className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-colors">
            <h4 className="font-bold text-sm">কুরআন</h4><p className="text-xs text-[#717A74] mt-1">অনলাইন উৎস থেকে কুরআন পড়ুন</p>
          </button>
          <button type="button" onClick={() => onQuickActionClick('HADITH')} className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-colors">
            <h4 className="font-bold text-sm">হাদিস</h4><p className="text-xs text-[#717A74] mt-1">উৎস ও মানসহ অনলাইন হাদিস</p>
          </button>
          <button type="button" onClick={() => onQuickActionClick('DUA')} className="text-left p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#D4F2E2]/20 transition-colors">
            <h4 className="font-bold text-sm">দোয়া ও যিকর</h4><p className="text-xs text-[#717A74] mt-1">অনলাইন উৎস থেকে দোয়া ও যিকর</p>
          </button>
        </div>
      </div>
    </div>
  );
};
