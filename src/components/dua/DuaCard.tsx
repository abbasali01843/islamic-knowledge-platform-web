import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Copy, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { DuaItem } from '../../types/dua';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

interface DuaCardProps {
  dua: DuaItem;
  isBookmarked: boolean;
  onToggleBookmark: (duaId: string) => void;
}

export const DuaCard: React.FC<DuaCardProps> = ({
  dua,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentRepeats, setCurrentRepeats] = useState(0);

  const handleCopy = async () => {
    const textToCopy = `${dua.titleBengali}\n\n${dua.arabicText}\n\nউচ্চারণ: ${dua.bengaliTransliteration}\n\nঅর্থ: ${dua.bengaliMeaning}\n\nউৎস: ${dua.reference}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleRepeatTap = () => {
    if (!dua.repeatTarget) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }
    setCurrentRepeats((prev) => {
      const next = prev + 1;
      return next > (dua.repeatTarget || 1) ? 0 : next;
    });
  };

  const isCompleted = dua.repeatTarget ? currentRepeats >= dua.repeatTarget : false;

  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {dua.subCategory && (
            <span className="text-[11px] font-semibold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-2.5 py-0.5 rounded-full inline-block mb-1">
              {dua.subCategory}
            </span>
          )}
          <h3 className="font-bold text-base text-[#181D19] dark:text-[#E1E5E1]">
            {dua.titleBengali}
          </h3>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="দোয়া কপি করুন"
            className="p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(dua.id)}
            title={isBookmarked ? 'বুকমার্ক সরান' : 'বুকমার্ক করুন'}
            className="p-2 rounded-xl text-[#176B4D] dark:text-[#9DD6B9] hover:bg-[#D4F2E2]/40 transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-[#176B4D] dark:fill-[#9DD6B9]" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Arabic Script */}
      <div className="p-4 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/15 dark:border-[#9DD6B9]/15 text-right space-y-3">
        <div
          dir="rtl"
          className="text-xl sm:text-2xl font-serif text-[#176B4D] dark:text-[#9DD6B9] font-normal leading-loose"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {dua.arabicText}
        </div>
      </div>

      {/* Bengali Pronunciation */}
      <div className="space-y-1 text-xs">
        <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
          উচ্চারণ:
        </span>
        <p className="text-[#181D19] dark:text-[#E1E5E1] font-medium leading-relaxed">
          {dua.bengaliTransliteration}
        </p>
      </div>

      {/* Bengali Meaning */}
      <div className="space-y-1 text-xs border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 pt-2.5">
        <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] block uppercase tracking-wider">
          অর্থ:
        </span>
        <p className="text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
          {dua.bengaliMeaning}
        </p>
      </div>

      {/* Virtue / ফজিলত */}
      {dua.virtue && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">ফজিলত: </strong>
            <span>{dua.virtue}</span>
          </div>
        </div>
      )}

      {/* Footer: Source reference & Repeat Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#176B4D] dark:text-[#9DD6B9] bg-[#E8EFEA] dark:bg-[#252F28] px-3 py-1 rounded-xl">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>উৎস: {dua.reference}</span>
        </div>

        {/* Inline Tap Repeat Counter if repeatTarget > 1 */}
        {dua.repeatTarget && dua.repeatTarget > 1 && (
          <button
            type="button"
            onClick={handleRepeatTap}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2]'
            }`}
          >
            <span>
              {isCompleted
                ? 'সম্পন্ন হয়েছে'
                : `${toBengaliNumerals(dua.repeatTarget)} বার পড়ুন`}
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/20 font-sans text-[11px]">
              {toBengaliNumerals(currentRepeats)}/{toBengaliNumerals(dua.repeatTarget)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
