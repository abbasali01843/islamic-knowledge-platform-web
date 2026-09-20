import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { HadithItem } from '../../types/hadith';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

interface HadithCardProps {
  hadith: HadithItem;
  isBookmarked: boolean;
  onToggleBookmark: (hadithId: string) => void;
}

export const HadithCard: React.FC<HadithCardProps> = ({
  hadith,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `[${hadith.bookNameBengali}: ${hadith.hadithNumber}]\n${hadith.chapterNameBengali}\n\n${hadith.narratorBengali}:\n\n${hadith.arabicText}\n\nঅনুবাদ:\n${hadith.bengaliText}\n\nমান: ${hadith.gradeLabelBengali}${
      hadith.explanationBengali ? `\n\nশিক্ষা ও তাৎপর্য:\n${hadith.explanationBengali}` : ''
    }`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `${hadith.bookNameBengali}: ${hadith.hadithNumber}`,
          text: `${hadith.bengaliText}\n— ${hadith.narratorBengali} (${hadith.bookNameBengali})`,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-[26px] ikp-surface p-5 shadow-sm space-y-4 transition-colors">
      {/* Header Info Bar */}
      <div className="flex items-start justify-between gap-2 border-b border-[#E8EFEA] dark:border-[#3A4D43]/40 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--ikp-primary)] bg-[var(--ikp-primary-soft)] px-2.5 py-0.5 rounded-full">
              {hadith.bookNameBengali} : {toBengaliNumerals(hadith.hadithNumber)}
            </span>
            {hadith.isNawawi40 && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                নববীর ৪০ হাদিস ({toBengaliNumerals(hadith.nawawiNumber || 0)})
              </span>
            )}
            <span className="text-xs text-[var(--ikp-text-muted)]">
              • {hadith.chapterNameBengali}
            </span>
          </div>
          <p className="text-xs font-semibold text-[var(--ikp-text-muted)]">
            {hadith.narratorBengali}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="হাদিস কপি করুন" aria-label="হাদিস কপি করুন"
            className="ikp-focus-ring p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            title="শেয়ার করুন" aria-label="হাদিস শেয়ার করুন"
            className="ikp-focus-ring p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(hadith.id)}
            title={isBookmarked ? 'বুকমার্ক সরান' : 'বুকমার্ক করুন'} aria-label={isBookmarked ? 'বুকমার্ক সরান' : 'বুকমার্ক করুন'}
            className="ikp-focus-ring p-2 rounded-xl text-[var(--ikp-primary)] hover:bg-[var(--ikp-primary-soft)]/40 transition-colors"
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
      <div className="rounded-2xl bg-[var(--ikp-primary-soft)]/35 border border-[var(--ikp-primary)]/15 p-4 text-right space-y-2">
        <div
          dir="rtl"
          className="text-lg sm:text-xl font-serif text-[var(--ikp-primary)] font-normal leading-loose"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {hadith.arabicText}
        </div>
      </div>

      {/* Bengali Translation */}
      <div className="space-y-1 text-sm">
        <span className="text-[11px] font-bold text-[var(--ikp-text-muted)] block uppercase tracking-wider">
          অনুবাদ:
        </span>
        <p className="text-[var(--ikp-text)] font-medium leading-relaxed">
          {hadith.bengaliText}
        </p>
      </div>

      {/* Hadith Grade Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>মান: {hadith.gradeLabelBengali}</span>
        </div>

        {/* Expandable Explanation Button */}
        {hadith.explanationBengali && (
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 font-semibold text-[var(--ikp-primary)] hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'তাৎপর্য লুকান' : 'হাদিসের শিক্ষা ও তাৎপর্য'}</span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Collapsible Explanation Card */}
      {showExplanation && hadith.explanationBengali && (
        <div className="ikp-muted-surface rounded-2xl p-4 border border-[#176B4D]/20 text-xs text-[var(--ikp-text)] leading-relaxed space-y-1 animate-in fade-in">
          <div className="font-bold text-[var(--ikp-primary)] flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>হাদিসের শিক্ষা ও ফিকহ:</span>
          </div>
          <p>{hadith.explanationBengali}</p>
        </div>
      )}
    </div>
  );
};
