import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { HADITH_ITEMS } from '../../data/hadithData';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

export const NawawiFortyView: React.FC = () => {
  const nawawiHadiths = HADITH_ITEMS.filter((h) => h.isNawawi40).sort(
    (a, b) => (a.nawawiNumber || 0) - (b.nawawiNumber || 0)
  );

  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const currentHadith =
    nawawiHadiths.find((h) => h.nawawiNumber === selectedNumber) || nawawiHadiths[0];

  const handleCopy = async () => {
    if (!currentHadith) return;
    const textToCopy = `[ইমাম নববীর ৪০ হাদিস: হাদিস ${toBengaliNumerals(currentHadith.nawawiNumber || 1)}]\n${currentHadith.bookNameBengali}: ${currentHadith.hadithNumber}\n${currentHadith.narratorBengali}\n\n${currentHadith.arabicText}\n\nঅনুবাদ:\n${currentHadith.bengaliText}\n\nশিক্ষা:\n${currentHadith.explanationBengali || ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0D442F] text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#9DD6B9]" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg">ইমাম নববীর চল্লিশ হাদিস</h2>
            <p className="text-xs text-white/80">الأربعون النووية • দ্বীনের মূল স্তম্ভ ও বুনিয়াদী শিক্ষা</p>
          </div>
        </div>

        <p className="text-xs text-white/90 leading-relaxed">
          ইমাম আবু জাকারিয়া ইয়াহইয়া আন-নববী (রহ.) ইসলাম ধর্মের সবচেয়ে গুরুত্বপূর্ণ, সারগর্ভ ও সর্বজনীন নীতিমালার ওপর এই বিশ্ববিখ্যাত সংকলনটি তৈরি করেছেন।
        </p>

        <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#9DD6B9]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>মোট সংকলিত বিশুদ্ধ হাদিস: ৪২ টি</span>
        </div>
      </div>

      {/* Horizontal Hadith Number Selector Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] uppercase tracking-wider block">
          হাদিস নম্বর নির্বাচন করুন:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {nawawiHadiths.map((h) => {
            const num = h.nawawiNumber || 1;
            const isSelected = selectedNumber === num;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedNumber(num)}
                className={`min-w-[48px] py-2 px-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#176B4D] text-white shadow-sm ring-2 ring-[#9DD6B9]/40'
                    : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#dce7e0]'
                }`}
              >
                {toBengaliNumerals(num)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Selected Hadith Display */}
      {currentHadith && (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-md space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-[#E8EFEA] dark:border-[#3A4D43]/40 pb-3">
            <div>
              <span className="text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-3 py-1 rounded-full inline-block mb-1">
                হাদিস নং: {toBengaliNumerals(currentHadith.nawawiNumber || 1)}
              </span>
              <h3 className="font-extrabold text-base text-[#181D19] dark:text-[#E1E5E1]">
                {currentHadith.chapterNameBengali}
              </h3>
              <p className="text-xs font-medium text-[#717A74] dark:text-[#8B958E] mt-0.5">
                {currentHadith.narratorBengali}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2.5 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Arabic Text */}
          <div className="p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right">
            <div
              dir="rtl"
              className="text-xl sm:text-2xl font-serif text-[#176B4D] dark:text-[#9DD6B9] leading-loose font-normal"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {currentHadith.arabicText}
            </div>
          </div>

          {/* Bengali Translation */}
          <div className="space-y-1.5 text-sm">
            <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
              বাংলা অনুবাদ:
            </span>
            <p className="text-[#181D19] dark:text-[#E1E5E1] font-medium leading-relaxed">
              {currentHadith.bengaliText}
            </p>
          </div>

          {/* Reference & Grade */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] text-xs">
            <span className="font-semibold text-[#176B4D] dark:text-[#9DD6B9]">
              মূল গ্রন্থ: {currentHadith.bookNameBengali} ({toBengaliNumerals(currentHadith.hadithNumber)})
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              মান: {currentHadith.gradeLabelBengali}
            </span>
          </div>

          {/* Takeaway / Lessons */}
          {currentHadith.explanationBengali && (
            <div className="p-4 rounded-2xl bg-[#D4F2E2]/30 dark:bg-[#005236]/20 border border-[#176B4D]/20 text-xs text-[#181D19] dark:text-[#E1E5E1] space-y-1 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>হাদিসের শিক্ষা ও ফিকহ:</span>
              </div>
              <p>{currentHadith.explanationBengali}</p>
            </div>
          )}

          {/* Quick Jump to next */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const currentIndex = nawawiHadiths.findIndex(
                  (h) => h.nawawiNumber === selectedNumber
                );
                const next = nawawiHadiths[(currentIndex + 1) % nawawiHadiths.length];
                if (next && next.nawawiNumber) {
                  setSelectedNumber(next.nawawiNumber);
                }
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold hover:bg-[#12583e] transition-colors"
            >
              <span>পরবর্তী হাদিস পড়ুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
