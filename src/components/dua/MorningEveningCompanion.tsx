import React, { useState } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { DUA_ITEMS } from '../../data/duaData';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

export const MorningEveningCompanion: React.FC = () => {
  // Auto-detect current time: Morning (03:00 to 15:00), Evening (15:00 to 03:00)
  const [period, setPeriod] = useState<'MORNING' | 'EVENING'>(() => {
    const hours = new Date().getHours();
    return hours >= 3 && hours < 15 ? 'MORNING' : 'EVENING';
  });

  const adhkarList = DUA_ITEMS.filter((item) => item.category === 'MORNING_EVENING');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progressState, setProgressState] = useState<Record<string, number>>({});

  const currentItem = adhkarList[currentIndex] || adhkarList[0];
  const targetCount = currentItem?.repeatTarget || 1;
  const currentItemCount = progressState[currentItem?.id] || 0;
  const isCurrentCompleted = currentItemCount >= targetCount;

  const completedTotalCount = adhkarList.filter(
    (item) => (progressState[item.id] || 0) >= (item.repeatTarget || 1)
  ).length;

  const handleIncrement = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }

    const nextCount = currentItemCount + 1;
    setProgressState((prev) => ({
      ...prev,
      [currentItem.id]: nextCount,
    }));

    // If completed this item, can automatically advance after short delay if desired
    if (nextCount >= targetCount && currentIndex < adhkarList.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(adhkarList.length - 1, prev + 1));
      }, 400);
    }
  };

  const handleResetCurrent = () => {
    setProgressState((prev) => ({
      ...prev,
      [currentItem.id]: 0,
    }));
  };

  const handleNext = () => {
    if (currentIndex < adhkarList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Mode Toggle: Morning vs Evening */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28]">
        <button
          type="button"
          onClick={() => {
            setPeriod('MORNING');
            setCurrentIndex(0);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            period === 'MORNING'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#717A74] dark:text-[#8B958E]'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>সকালের জিকির (ফজর পরবর্তী)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setPeriod('EVENING');
            setCurrentIndex(0);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            period === 'EVENING'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#717A74] dark:text-[#8B958E]'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>সন্ধ্যার জিকির (আসর পরবর্তী)</span>
        </button>
      </div>

      {/* Progress Bar & Header */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#176B4D] to-[#0E4A34] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#9DD6B9]">
            {period === 'MORNING' ? 'সকালের মাসনূন জিকির' : 'সন্ধ্যার মাসনূন জিকির'}
          </span>
          <span className="font-bold">
            {toBengaliNumerals(completedTotalCount)} / {toBengaliNumerals(adhkarList.length)} টি সম্পন্ন
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-[#9DD6B9] rounded-full transition-all duration-300"
            style={{
              width: `${(completedTotalCount / adhkarList.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/80 pt-0.5">
          <span>
            জিকির নং: {toBengaliNumerals(currentIndex + 1)} / {toBengaliNumerals(adhkarList.length)}
          </span>
          <span>রাসূলুল্লাহ ﷺ-এর নিয়মিত সুন্নাহ</span>
        </div>
      </div>

      {/* Active Dua Focus Card */}
      {currentItem && (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-md space-y-5">
          {/* Title & Badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] inline-block mb-1">
                {currentItem.subCategory || 'নিয়মিত জিকির'}
              </span>
              <h3 className="font-extrabold text-lg text-[#181D19] dark:text-[#E1E5E1]">
                {currentItem.titleBengali}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleResetCurrent}
              title="গণনা রিসেট করুন"
              className="p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Arabic Text */}
          <div className="p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right">
            <div
              dir="rtl"
              className="text-2xl sm:text-3xl font-serif text-[#176B4D] dark:text-[#9DD6B9] leading-loose font-normal"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {currentItem.arabicText}
            </div>
          </div>

          {/* Bengali Pronunciation */}
          <div className="space-y-1 text-xs">
            <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
              উচ্চারণ:
            </span>
            <p className="text-[#181D19] dark:text-[#E1E5E1] font-medium leading-relaxed">
              {currentItem.bengaliTransliteration}
            </p>
          </div>

          {/* Meaning */}
          <div className="space-y-1 text-xs border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 pt-3">
            <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
              অর্থ:
            </span>
            <p className="text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
              {currentItem.bengaliMeaning}
            </p>
          </div>

          {/* Virtue */}
          {currentItem.virtue && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">ফজিলত: </strong>
                <span>{currentItem.virtue}</span>
              </div>
            </div>
          )}

          {/* Big Interactive Tap-to-count button */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleIncrement}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md ${
                isCurrentCompleted
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : 'bg-[#176B4D] text-white hover:bg-[#135940]'
              }`}
            >
              {isCurrentCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>আলহামদুলিল্লাহ! পড়া সম্পন্ন হয়েছে</span>
                </>
              ) : (
                <>
                  <span>ট্যাপ করে পড়ুন ({toBengaliNumerals(targetCount)} বার)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/20 font-sans text-sm">
                    {toBengaliNumerals(currentItemCount)} / {toBengaliNumerals(targetCount)}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Controls: Prev & Next */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4] disabled:opacity-40 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী</span>
            </button>

            <span className="text-xs font-semibold text-[#176B4D] dark:text-[#9DD6B9]">
              উৎস: {currentItem.reference}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === adhkarList.length - 1}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#176B4D] text-white disabled:opacity-40 transition-opacity"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
