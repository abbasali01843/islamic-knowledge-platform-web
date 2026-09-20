import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  FileText,
  Copy,
  Share2,
  Minus,
  Plus,
  Search,
  Check,
} from 'lucide-react';
import type { Surah, ReaderAyah } from '../types';
import { quranSurahs } from '../data/quranCatalog';
import { QuranReaderRepository } from '../data/quranRepository';
import { QuranPreferences } from '../utils/preferences';

interface QuranReaderScreenProps {
  surah: Surah;
  initialAyah?: number | null;
  onBack: () => void;
  onNavigateToSurah: (surah: Surah) => void;
}

export const QuranReaderScreen: React.FC<QuranReaderScreenProps> = ({
  surah,
  initialAyah,
  onBack,
  onNavigateToSurah,
}) => {
  const [showArabic, setShowArabic] = useState(() => QuranPreferences.getShowArabic());
  const [showBengali, setShowBengali] = useState(() => QuranPreferences.getShowBengali());
  const [fontScale, setFontScale] = useState(() => QuranPreferences.getFontScale());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<number>>(new Set());
  const [editingNoteAyah, setEditingNoteAyah] = useState<ReaderAyah | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [noteVersion, setNoteVersion] = useState(0);
  const [progress, setProgress] = useState(0);
  const [allAyahs, setAllAyahs] = useState<ReaderAyah[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');

  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setAllAyahs([]);
    setLoadState('loading');
    setLoadError('');
    QuranReaderRepository.ayahsForSurah(surah.number)
      .then((items) => {
        if (cancelled) return;
        setAllAyahs(items);
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadState('error');
        setLoadError(error instanceof Error ? error.message : 'কুরআন ডেটা লোড করা যায়নি');
      });
    return () => { cancelled = true; };
  }, [surah.number]);

  const previousSurah = useMemo(
    () => quranSurahs.find((s) => s.number === surah.number - 1),
    [surah.number]
  );
  const nextSurah = useMemo(
    () => quranSurahs.find((s) => s.number === surah.number + 1),
    [surah.number]
  );

  // Initialize bookmarked set for this surah
  useEffect(() => {
    const set = new Set<number>();
    allAyahs.forEach((a) => {
      if (QuranPreferences.isBookmarked(surah.number, a.number)) {
        set.add(a.number);
      }
    });
    setBookmarkedSet(set);
  }, [surah.number, allAyahs]);

  const filteredAyahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allAyahs;
    return allAyahs.filter(
      (a) =>
        a.arabic.toLowerCase().includes(q) ||
        a.bengali.toLowerCase().includes(q) ||
        a.number.toString() === q
    );
  }, [allAyahs, searchQuery]);

  // Scroll to initial ayah if given
  useEffect(() => {
    if (initialAyah && initialAyah > 0) {
      setTimeout(() => {
        const el = ayahRefs.current.get(initialAyah);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [initialAyah, surah.number]);

  // Track reading progress and auto-save last read
  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress(Math.min(1, Math.max(0, scrollY / docHeight)));
    }

    // Find visible ayah
    for (const ayah of filteredAyahs) {
      const el = ayahRefs.current.get(ayah.number);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight * 0.5) {
          QuranPreferences.saveLastRead(surah.number, ayah.number);
          break;
        }
      }
    }
  }, [filteredAyahs, surah.number]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleToggleArabic = () => {
    const next = !showArabic;
    setShowArabic(next);
    QuranPreferences.setShowArabic(next);
  };

  const handleToggleBengali = () => {
    const next = !showBengali;
    setShowBengali(next);
    QuranPreferences.setShowBengali(next);
  };

  const handleFontScaleChange = (delta: number) => {
    const next = Math.round((fontScale + delta) * 10) / 10;
    const clamped = Math.max(0.8, Math.min(1.5, next));
    setFontScale(clamped);
    QuranPreferences.setFontScale(clamped);
  };

  const handleToggleBookmark = (ayahNumber: number) => {
    const added = QuranPreferences.toggleBookmark(surah.number, ayahNumber);
    setBookmarkedSet((prev) => {
      const updated = new Set(prev);
      if (added) updated.add(ayahNumber);
      else updated.delete(ayahNumber);
      return updated;
    });
  };

  const handleCopyAyah = (ayah: ReaderAyah) => {
    let text = `${surah.nameBengali} ${surah.number}:${ayah.number}\n`;
    if (showArabic) text += `${ayah.arabic}\n`;
    if (showBengali) text += `${ayah.bengali}`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.number);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handleShareAyah = async (ayah: ReaderAyah) => {
    let text = `${surah.nameBengali} ${surah.number}:${ayah.number}\n`;
    if (showArabic) text += `${ayah.arabic}\n`;
    if (showBengali) text += `${ayah.bengali}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surah.nameBengali} ${surah.number}:${ayah.number}`,
          text,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyAyah(ayah);
    }
  };

  const openNoteDialog = (ayah: ReaderAyah) => {
    setEditingNoteAyah(ayah);
    setNoteInput(QuranPreferences.getNote(surah.number, ayah.number));
  };

  const saveNote = () => {
    if (!editingNoteAyah) return;
    QuranPreferences.saveNote(surah.number, editingNoteAyah.number, noteInput);
    setEditingNoteAyah(null);
    setNoteVersion((v) => v + 1);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F7FAF7] dark:bg-[#101511] pb-28">
      {/* Top App Bar with sticky header */}
      <div className="sticky top-0 z-30 bg-[#F7FAF7]/95 dark:bg-[#101511]/95 backdrop-blur-md border-b border-[#E8EFEA] dark:border-[#3A4D43]/60 px-4 py-2.5 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              title="ফিরে যান" aria-label="ফিরে যান"
              className="p-2 -ml-2 rounded-xl text-[#181D19] dark:text-[#E1E5E1] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#181D19] dark:text-[#E1E5E1] leading-tight">
                {surah.nameBengali}
              </h2>
              <p className="text-xs text-[#414A45] dark:text-[#C1CAC4]">
                {surah.nameArabic} • {surah.ayahCount} আয়াত
              </p>
            </div>
          </div>

          {/* Surah Navigator Prev / Next */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!previousSurah}
              onClick={() => previousSurah && onNavigateToSurah(previousSurah)}
              title="পূর্ববর্তী সূরা" aria-label="পূর্ববর্তী সূরা"
              className="p-2 rounded-xl text-[#181D19] dark:text-[#E1E5E1] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={!nextSurah}
              onClick={() => nextSurah && onNavigateToSurah(nextSurah)}
              title="পরবর্তী সূরা" aria-label="পরবর্তী সূরা"
              className="p-2 rounded-xl text-[#181D19] dark:text-[#E1E5E1] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reading Progress Indicator */}
        <div className="w-full bg-[#E8EFEA] dark:bg-[#3F4943] h-1 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#176B4D] dark:bg-[#9DD6B9] h-full transition-all duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-3 space-y-4">
        {/* Source Attribution */}
        <div className="text-[11px] text-[#717A74] dark:text-[#8B958E] px-1">
          {QuranReaderRepository.sourceAttribution()}
        </div>

        {/* Reader Display Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-[#1E2620] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleArabic}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                showArabic
                  ? 'bg-[#176B4D] text-white dark:bg-[#9DD6B9] dark:text-[#003824]'
                  : 'bg-[#E8EFEA] text-[#414A45] dark:bg-[#3F4943] dark:text-[#C1CAC4]'
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={handleToggleBengali}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                showBengali
                  ? 'bg-[#176B4D] text-white dark:bg-[#9DD6B9] dark:text-[#003824]'
                  : 'bg-[#E8EFEA] text-[#414A45] dark:bg-[#3F4943] dark:text-[#C1CAC4]'
              }`}
            >
              বাংলা
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#E8EFEA] dark:bg-[#3F4943] px-2 py-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => handleFontScaleChange(-0.1)}
              title="ফন্ট ছোট করুন"
              className="p-1 rounded-lg text-[#181D19] dark:text-[#E1E5E1] hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-[#181D19] dark:text-[#E1E5E1] w-10 text-center">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleFontScaleChange(0.1)}
              title="ফন্ট বড় করুন"
              className="p-1 rounded-lg text-[#181D19] dark:text-[#E1E5E1] hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* In-Surah Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717A74] dark:text-[#8B958E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="এই সূরার আয়াত খুঁজুন"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E2620] border border-[#C1CAC4] dark:border-[#414A45] text-xs sm:text-sm text-[#181D19] dark:text-[#E1E5E1] focus:outline-none focus:border-[#176B4D] dark:focus:border-[#9DD6B9] transition-colors"
          />
        </div>

        {/* Ayahs List */}
        {loadState === 'loading' ? (
          <div className="text-center py-20 px-4 space-y-3">
            <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#176B4D] border-t-transparent animate-spin" />
            <p className="text-sm text-[#414A45] dark:text-[#C1CAC4]">অনলাইন থেকে কুরআনের আয়াত লোড হচ্ছে…</p>
          </div>
        ) : loadState === 'error' ? (
          <div className="text-center py-20 px-4 space-y-3">
            <p className="text-sm text-[#414A45] dark:text-[#C1CAC4]">{loadError}</p>
            <button type="button" onClick={() => {
              setLoadState('loading');
              setLoadError('');
              QuranReaderRepository.ayahsForSurah(surah.number).then(setAllAyahs).then(() => setLoadState('ready')).catch((error: unknown) => {
                setLoadState('error');
                setLoadError(error instanceof Error ? error.message : 'কুরআন ডেটা লোড করা যায়নি');
              });
            }} className="px-4 py-2 rounded-xl bg-[#176B4D] text-white text-sm font-semibold">আবার চেষ্টা করুন</button>
          </div>
        ) : filteredAyahs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-[#414A45] dark:text-[#C1CAC4]">
              কোনো আয়াত মেলেনি।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAyahs.map((ayah) => {
              const isBookmarked = bookmarkedSet.has(ayah.number);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              noteVersion;
              const savedNote = QuranPreferences.getNote(surah.number, ayah.number);
              const metaTokens = [
                ayah.page ? `পৃষ্ঠা ${ayah.page}` : null,
                ayah.juz ? `পারা ${ayah.juz}` : null,
                ayah.hizb ? `হিজব ${ayah.hizb}` : null,
              ].filter(Boolean);

              return (
                <div
                  key={ayah.number}
                  ref={(el) => {
                    if (el) ayahRefs.current.set(ayah.number, el);
                    else ayahRefs.current.delete(ayah.number);
                  }}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E2620] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-2xs space-y-3 transition-colors"
                >
                  {/* Ayah Header & Action Icons */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8EFEA]/80 dark:border-[#3A4D43]/40">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[#E8EFEA] dark:bg-[#3F4943] text-[#176B4D] dark:text-[#9DD6B9] font-bold text-xs flex items-center justify-center">
                        {ayah.number}
                      </span>
                      {ayah.hasSajdah && (
                        <span className="text-[11px] font-semibold text-[#75603A] dark:text-[#E8C77E] bg-[#FFE8B7] dark:bg-[#5A471E] px-2 py-0.5 rounded-md">
                          সিজদাহর আয়াত
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(ayah.number)}
                        title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্ক যোগ'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/60'
                            : 'text-[#717A74] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943]'
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openNoteDialog(ayah)}
                        title="নোট যুক্ত করুন"
                        className={`p-1.5 rounded-lg transition-colors ${
                          savedNote
                            ? 'text-[#75603A] dark:text-[#E8C77E] bg-[#FFE8B7]/60 dark:bg-[#5A471E]/60'
                            : 'text-[#717A74] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943]'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyAyah(ayah)}
                        title="কপি করুন"
                        className="p-1.5 rounded-lg text-[#717A74] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
                      >
                        {copiedAyah === ayah.number ? (
                          <Check className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareAyah(ayah)}
                        title="শেয়ার করুন"
                        className="p-1.5 rounded-lg text-[#717A74] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata line */}
                  {metaTokens.length > 0 && (
                    <div className="text-[11px] text-[#717A74] dark:text-[#8B958E]">
                      {metaTokens.join(' • ')}
                    </div>
                  )}

                  {/* Arabic Text (RTL) */}
                  {showArabic && (
                    <div
                      dir="rtl"
                      className="font-arabic text-[#181D19] dark:text-[#E1E5E1] text-right py-2 select-text"
                      style={{
                        fontSize: `${Math.round(24 * fontScale)}px`,
                        lineHeight: `${Math.round(24 * fontScale * 1.85)}px`,
                      }}
                    >
                      {ayah.arabic}
                    </div>
                  )}

                  {/* Bengali Translation */}
                  {showBengali && (
                    <div
                      className="text-[#181D19] dark:text-[#E1E5E1] select-text font-bengali leading-relaxed"
                      style={{
                        fontSize: `${Math.round(16 * fontScale)}px`,
                        lineHeight: `${Math.round(16 * fontScale * 1.6)}px`,
                      }}
                    >
                      {ayah.bengali}
                    </div>
                  )}

                  {/* Display Note if exists */}
                  {savedNote && (
                    <div className="mt-2 p-3 rounded-xl bg-[#F7FAF7] dark:bg-[#101511] border border-black/5 dark:border-white/5 space-y-1">
                      <span className="text-[11px] font-semibold text-[#75603A] dark:text-[#E8C77E]">
                        নোট:
                      </span>
                      <p className="text-xs text-[#181D19] dark:text-[#E1E5E1] whitespace-pre-wrap">
                        {savedNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note Editing Modal */}
      {editingNoteAyah && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#1E2620] rounded-2xl p-5 space-y-4 shadow-xl border border-[#C1CAC4] dark:border-[#414A45]">
            <h3 className="font-semibold text-base text-[#181D19] dark:text-[#E1E5E1]">
              আয়াত {editingNoteAyah.number}-এর নোট
            </h3>
            <textarea
              rows={4}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="আপনার ব্যক্তিগত ভাবনা বা শিক্ষণীয় নোট লিখুন..."
              className="w-full p-3 rounded-xl bg-[#F7FAF7] dark:bg-[#101511] border border-[#C1CAC4] dark:border-[#414A45] text-sm text-[#181D19] dark:text-[#E1E5E1] focus:outline-none focus:border-[#176B4D] dark:focus:border-[#9DD6B9]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteAyah(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#176B4D] text-white dark:bg-[#9DD6B9] dark:text-[#003824] hover:opacity-90 active:scale-95 transition-all"
              >
                সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
