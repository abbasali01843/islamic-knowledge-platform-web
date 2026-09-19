import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Droplet,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  WUDU_FARZ,
  GHUSL_FARZ,
  WUDU_BREAKERS,
  WUDU_STEPS,
  PRAYER_RAKAT_TABLE,
  SALAH_STEPS,
  SALAH_ESSENTIAL_DUAS,
} from '../../data/learnSalahData';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

interface LearnSalahScreenProps {
  onBack: () => void;
}

type LearnTab = 'steps' | 'rakat' | 'duas' | 'wudu';

export const LearnSalahScreen: React.FC<LearnSalahScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<LearnTab>('steps');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const currentSalahStep = SALAH_STEPS[activeStepIndex] || SALAH_STEPS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300 pb-24">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-[#176B4D] dark:text-[#9DD6B9] hover:bg-[#D4F2E2]/30 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#181D19] dark:text-[#E1E5E1]">
            সালাত ও অজু শিক্ষা
          </h1>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
            সহীহ সুন্নাহ অনুযায়ী সালাত আদায়, অজু, ফরজ ও প্রয়োজনীয় দোয়া
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#222C25] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'steps'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>নামাজের নিয়ম</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rakat')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'rakat'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>রাকাত সূচি</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('duas')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'duas'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>জরুরী দোয়া ও সূরা</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wudu')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wudu'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>অজু ও পবিত্রতা</span>
        </button>
      </div>

      {/* TAB 1: STEP BY STEP SALAH POSTURES */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          {/* Step Selector Horizontal Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] uppercase tracking-wider block">
              নামাজের ধারাবাহিক ধাপ নির্বাচন করুন:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SALAH_STEPS.map((step, idx) => {
                const isSelected = idx === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#176B4D] text-white shadow-sm ring-2 ring-[#9DD6B9]/40'
                        : 'bg-white dark:bg-[#1A221C] text-[#414A45] dark:text-[#C1CAC4] border border-[#E8EFEA] dark:border-[#3A4D43]/60'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px]">
                      {toBengaliNumerals(step.stepNumber)}
                    </span>
                    <span>{step.titleBengali}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Salah Step Detail Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-md space-y-5">
            <div className="flex items-start justify-between gap-2 border-b border-[#E8EFEA] dark:border-[#3A4D43]/40 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-3 py-0.5 rounded-full">
                    ধাপ {toBengaliNumerals(currentSalahStep.stepNumber)} এর {toBengaliNumerals(SALAH_STEPS.length)}
                  </span>
                  <span className="text-xs text-[#717A74] dark:text-[#8B958E] font-semibold">
                    • {currentSalahStep.postureNameBengali}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-[#181D19] dark:text-[#E1E5E1]">
                  {currentSalahStep.titleBengali}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    currentSalahStep.id,
                    `${currentSalahStep.titleBengali}\n${currentSalahStep.arabicText}\nউচ্চারণ: ${currentSalahStep.transliterationBengali}\nঅর্থ: ${currentSalahStep.meaningBengali}\nনিয়ম: ${currentSalahStep.instructionsBengali}`
                  )
                }
                className="p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="কপি করুন"
              >
                {copiedId === currentSalahStep.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Instruction description */}
            <div className="p-4 rounded-2xl bg-[#E8EFEA]/60 dark:bg-[#252F28] border border-[#176B4D]/10 text-xs text-[#181D19] dark:text-[#E1E5E1] leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5 text-[#176B4D] dark:text-[#9DD6B9]">
                  পদ্ধতি ও নির্দেশনা:
                </strong>
                {currentSalahStep.instructionsBengali}
              </div>
            </div>

            {/* Arabic Recitation */}
            <div className="p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right space-y-2">
              <span className="text-[11px] font-bold text-[#717A74] block uppercase tracking-wider text-left">
                পঠিত তাসবীহ বা দোয়া:
              </span>
              <div
                dir="rtl"
                className="text-xl sm:text-2xl font-serif text-[#176B4D] dark:text-[#9DD6B9] leading-loose font-normal"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {currentSalahStep.arabicText}
              </div>
            </div>

            {/* Transliteration */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
                উচ্চারণ:
              </span>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                {currentSalahStep.transliterationBengali}
              </p>
            </div>

            {/* Meaning */}
            <div className="space-y-1 text-xs border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 pt-3">
              <span className="font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
                অর্থ:
              </span>
              <p className="text-[#181D19] dark:text-[#E1E5E1] leading-relaxed">
                {currentSalahStep.meaningBengali}
              </p>
            </div>

            {/* Next / Previous Step Navigation */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-xs font-bold text-[#414A45] dark:text-[#C1CAC4] disabled:opacity-30"
              >
                ← পূর্ববর্তী ধাপ
              </button>

              <button
                type="button"
                disabled={activeStepIndex === SALAH_STEPS.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(SALAH_STEPS.length - 1, prev + 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold hover:bg-[#12583e] disabled:opacity-30"
              >
                <span>পরবর্তী ধাপ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RAKAT CHART TABLE */}
      {activeTab === 'rakat' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#D4F2E2]/30 dark:bg-[#005236]/20 border border-[#176B4D]/20 text-xs text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9] shrink-0" />
            <span>
              প্রতিদিনের পাঁচ ওয়াক্ত নামাজে মোট ১৭ রাকাত ফরজ আদায় করা আবশ্যক। সুন্নাত ও নফলসহ মোট রাকাত সংখ্যা নিচে উল্লেখিত হলো।
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PRAYER_RAKAT_TABLE.map((item) => (
              <div
                key={item.prayerId}
                className="rounded-3xl p-5 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#181D19] dark:text-[#E1E5E1]">
                      {item.prayerNameBengali}
                    </h3>
                    <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
                      ওয়াক্ত: {item.timeBengali}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#176B4D] dark:text-[#9DD6B9]">
                      {toBengaliNumerals(item.totalRakat)} রাকাত
                    </span>
                    <span className="text-[11px] block text-[#717A74] dark:text-[#8B958E]">
                      (মোট)
                    </span>
                  </div>
                </div>

                {/* Breakdown Pills */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {item.sunnahMuakkadahPre !== undefined && item.sunnahMuakkadahPre > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300/30 font-semibold">
                      সুন্নাত: {toBengaliNumerals(item.sunnahMuakkadahPre)}
                    </span>
                  )}

                  {item.sunnahGhairMuakkadah !== undefined && item.sunnahGhairMuakkadah > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-300/30 font-semibold">
                      গায়রে মুয়াক্কাদা: {toBengaliNumerals(item.sunnahGhairMuakkadah)}
                    </span>
                  )}

                  {item.farz > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 border border-emerald-500/30 font-bold">
                      ফরজ: {toBengaliNumerals(item.farz)}
                    </span>
                  )}

                  {item.sunnahMuakkadahPost !== undefined && item.sunnahMuakkadahPost > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300/30 font-semibold">
                      সুন্নাত: {toBengaliNumerals(item.sunnahMuakkadahPost)}
                    </span>
                  )}

                  {item.witr !== undefined && item.witr > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-300/30 font-bold">
                      ওয়াজিব বিতর: {toBengaliNumerals(item.witr)}
                    </span>
                  )}

                  {item.nafl !== undefined && item.nafl > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                      নফল: {toBengaliNumerals(item.nafl)}
                    </span>
                  )}
                </div>

                {item.notesBengali && (
                  <p className="text-[11px] text-[#717A74] dark:text-[#8B958E] italic border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 pt-2">
                    {item.notesBengali}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESSENTIAL DUAS & SAJDAH SAHW */}
      {activeTab === 'duas' && (
        <div className="space-y-6">
          {SALAH_ESSENTIAL_DUAS.map((dua) => (
            <div
              key={dua.id}
              className="rounded-3xl p-6 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#E8EFEA] dark:border-[#3A4D43]/40 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#181D19] dark:text-[#E1E5E1]">
                    {dua.titleBengali}
                  </h3>
                  <p className="text-xs text-[#176B4D] dark:text-[#9DD6B9] font-medium mt-0.5">
                    {dua.timingBengali}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      dua.id,
                      `${dua.titleBengali}\n\n${dua.arabicText}\n\nউচ্চারণ:\n${dua.transliterationBengali}\n\nঅর্থ:\n${dua.meaningBengali}\n\nরেফারেন্স: ${dua.referenceBengali}`
                    )
                  }
                  className="p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="কপি করুন"
                >
                  {copiedId === dua.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Arabic */}
              <div className="p-4 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right">
                <div
                  dir="rtl"
                  className="text-lg sm:text-xl font-serif text-[#176B4D] dark:text-[#9DD6B9] leading-loose font-normal"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {dua.arabicText}
                </div>
              </div>

              {/* Pronunciation */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
                  উচ্চারণ:
                </span>
                <p className="text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                  {dua.transliterationBengali}
                </p>
              </div>

              {/* Meaning */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
                  অর্থ:
                </span>
                <p className="text-[#181D19] dark:text-[#E1E5E1] leading-relaxed">
                  {dua.meaningBengali}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 flex items-center justify-between text-[11px] text-[#717A74] dark:text-[#8B958E]">
                <span>সূত্র: {dua.referenceBengali}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: WUDU & PURITY */}
      {activeTab === 'wudu' && (
        <div className="space-y-6">
          {/* 4 Farz of Wudu Box */}
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-[#005236]/30 border border-emerald-500/30 space-y-2">
            <h3 className="font-extrabold text-sm text-[#176B4D] dark:text-[#9DD6B9] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>অজুর ৪টি ফরজ (কুরআনের সূরা মায়িদা: ৬)</span>
            </h3>
            <ul className="space-y-1 text-xs text-[#181D19] dark:text-[#E1E5E1]">
              {WUDU_FARZ.map((f) => (
                <li key={f} className="leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* 3 Farz of Ghusl Box */}
          <div className="p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-500/30 space-y-2">
            <h3 className="font-extrabold text-sm text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" />
              <span>গোসলের ৩টি ফরজ</span>
            </h3>
            <ul className="space-y-1 text-xs text-[#181D19] dark:text-[#E1E5E1]">
              {GHUSL_FARZ.map((g) => (
                <li key={g} className="leading-relaxed">
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Step by step Wudu Sequence */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] uppercase tracking-wider block">
              ধারাবাহিক সুন্নাতসম্মত অজুর নিয়ম:
            </span>

            <div className="space-y-3">
              {WUDU_STEPS.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#176B4D] text-white flex items-center justify-center text-xs font-bold">
                        {toBengaliNumerals(step.stepNumber)}
                      </span>
                      <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                        {step.titleBengali}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        step.type === 'FARZ'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                      }`}
                    >
                      {step.typeLabelBengali}
                    </span>
                  </div>

                  <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed pl-8">
                    {step.descriptionBengali}
                  </p>

                  {step.arabicDua && (
                    <div className="mt-2 pl-8 space-y-1">
                      <div
                        dir="rtl"
                        className="text-sm font-serif text-[#176B4D] dark:text-[#9DD6B9] text-right"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {step.arabicDua}
                      </div>
                      {step.transliterationBengali && (
                        <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          {step.transliterationBengali}
                        </p>
                      )}
                      {step.duaMeaningBengali && (
                        <p className="text-[11px] text-[#717A74] dark:text-[#8B958E]">
                          {step.duaMeaningBengali}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wudu Nullifiers */}
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 space-y-2">
            <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>অজু ভঙ্গের কারণসমূহ (৭টি প্রধান কারণ)</span>
            </h3>
            <ul className="space-y-1 text-xs text-[#181D19] dark:text-[#E1E5E1]">
              {WUDU_BREAKERS.map((wb) => (
                <li key={wb} className="leading-relaxed">
                  {wb}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
