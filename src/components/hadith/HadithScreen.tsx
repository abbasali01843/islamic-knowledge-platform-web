import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Bookmark,
  Layers,
  Heart,
  Smile,
  GraduationCap,
  Users,
  Coins,
  Handshake,
  BookMarked,
  X,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { HadithItem } from '../../types/hadith';

const HADITH_TOPICS = [
  {
    id: 'ALL',
    titleBengali: 'সব হাদিস',
    titleEnglish: 'All Hadith',
    iconName: 'BookMarked',
    description: 'অনলাইন API থেকে লোড হওয়া হাদিস',
  },
] as const;

import { HadithCard } from './HadithCard';
import { NawawiFortyView } from './NawawiFortyView';
import { HadithBooksView } from './HadithBooksView';
import { toBengaliNumerals } from '../../utils/prayerCalculation';
import { fetchHadithBatch, fetchLiveHadiths } from '../../services/hadithApi';

type HadithTab = 'topics' | 'nawawi' | 'books' | 'bookmarks';

const BOOKMARK_KEY = 'ikp-hadith-bookmarks-v1';

function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveBookmarks(ids: string[]) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export const HadithScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HadithTab>('topics');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'SAHIH' | 'HASAN'>('ALL');
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());

  const [dailyHadithCopied, setDailyHadithCopied] = useState(false);
  const [liveHadiths, setLiveHadiths] = useState<HadithItem[]>([]);
  const [apiState, setApiState] = useState<'loading' | 'online' | 'error'>('loading');
  const [nextSection, setNextSection] = useState(1);
  const [nextBookIndex, setNextBookIndex] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  const reloadHadiths = () => {
    setApiState('loading');
    fetchLiveHadiths()
      .then(({ items }) => {
        setLiveHadiths(items);
        setApiState('online');
      })
      .catch(() => setApiState('error'));
  };

  useEffect(() => {
    let cancelled = false;
    fetchLiveHadiths()
      .then(({ items }) => {
        if (cancelled) return;
        setLiveHadiths(items);
        setApiState('online');
      })
      .catch(() => {
        if (!cancelled) setApiState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadNextSection = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const bookIds = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah'];
      const batchBookIds =
        nextSection === 1 ? bookIds.slice(nextBookIndex, nextBookIndex + 2) : bookIds;
      const items = await fetchHadithBatch(batchBookIds, nextSection);
      if (items.length) {
        setLiveHadiths((prev) => {
          const ids = new Set(prev.map((item) => item.id));
          return [...prev, ...items.filter((item) => !ids.has(item.id))];
        });
        if (nextSection === 1 && nextBookIndex + batchBookIds.length < bookIds.length) {
          setNextBookIndex((value) => value + batchBookIds.length);
        } else if (nextSection === 1) {
          setNextBookIndex(bookIds.length);
          setNextSection(2);
        } else {
          setNextSection((value) => value + 1);
        }
        setApiState('online');
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleBookmark = (hadithId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(hadithId)
        ? prev.filter((id) => id !== hadithId)
        : [...prev, hadithId];
      saveBookmarks(next);
      return next;
    });
  };

  const availableHadiths = liveHadiths;

  const dailyHadith: HadithItem | undefined = useMemo(() => {
    if (!availableHadiths.length) return undefined;
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return availableHadiths[dayOfYear % availableHadiths.length];
  }, [availableHadiths]);

  const handleCopyDailyHadith = async () => {
    if (!dailyHadith) return;
    const text = `[আজকের হাদিস: ${dailyHadith.bookNameBengali}: ${toBengaliNumerals(dailyHadith.hadithNumber)}]\n${dailyHadith.narratorBengali}\n\n${dailyHadith.arabicText}\n\nঅনুবাদ: ${dailyHadith.bengaliText}\n\nমান: ${dailyHadith.gradeLabelBengali}`;
    try {
      await navigator.clipboard.writeText(text);
      setDailyHadithCopied(true);
      setTimeout(() => setDailyHadithCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const filteredHadiths = useMemo(() => {
    let list = availableHadiths;

    if (activeTab === 'bookmarks') {
      list = list.filter((h) => bookmarks.includes(h.id));
    } else if (selectedTopicId !== 'ALL') {
      list = list.filter((h) => h.topicId === selectedTopicId);
    }

    if (gradeFilter === 'SAHIH') {
      list = list.filter((h) => h.grade === 'SAHIH' || h.grade === 'MUTTAFAAQ_ALAIH');
    } else if (gradeFilter === 'HASAN') {
      list = list.filter((h) => h.grade === 'HASAN');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.bengaliText.toLowerCase().includes(q) ||
          h.arabicText.includes(q) ||
          h.narratorBengali.toLowerCase().includes(q) ||
          h.bookNameBengali.toLowerCase().includes(q) ||
          h.chapterNameBengali.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, selectedTopicId, gradeFilter, searchQuery, bookmarks, availableHadiths]);

  useEffect(() => {
    setVisibleCount(40);
  }, [activeTab, selectedTopicId, gradeFilter, searchQuery]);

  const renderedHadiths = filteredHadiths.slice(0, visibleCount);
  const hasMoreVisibleHadiths = renderedHadiths.length < filteredHadiths.length;

  const renderTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Smile':
        return <Smile className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Coins':
        return <Coins className="w-4 h-4" />;
      case 'Handshake':
        return <Handshake className="w-4 h-4" />;
      default:
        return <BookMarked className="w-4 h-4" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-7 space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="rounded-[28px] p-5 sm:p-7 bg-gradient-to-r from-[#176B4D] via-[#12583e] to-[#0A3D2B] shadow-lg shadow-emerald-950/10 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#9DD6B9] uppercase tracking-wider">
              সহীহ হাদিস ভাণ্ডার
            </span>
            <h1 className="text-[26px] sm:text-3xl font-black tracking-tight">হাদিস ও সুন্নাহ</h1>
            <p className="text-xs text-white/80">
              সিহাহ সিত্তাহ ও ইমাম নববীর ৪০ হাদিস
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#9DD6B9]" />
          </div>
        </div>

        {dailyHadith && (
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-extrabold text-[#9DD6B9] flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  আজকের হাদিস ({dailyHadith.bookNameBengali}:{' '}
                  {toBengaliNumerals(dailyHadith.hadithNumber)})
                </span>
              </span>
              <button
                type="button"
                onClick={handleCopyDailyHadith}
                className="text-white/80 hover:text-white flex items-center gap-1 text-[11px] font-semibold shrink-0"
              >
                {dailyHadithCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>কপি</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-white/95 leading-relaxed italic line-clamp-3">
              "{dailyHadith.bengaliText}"
            </p>
            <div className="text-[11px] text-white/70">
              — {dailyHadith.narratorBengali} • {dailyHadith.gradeLabelBengali}
            </div>
          </div>
        )}

        {apiState === 'loading' && !dailyHadith && (
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>আজকের হাদিস লোড হচ্ছে…</span>
          </div>
        )}
      </div>

      {/* API status */}
      <div className="flex items-center justify-between ikp-surface rounded-2xl px-4 py-3 text-xs">
        <div className="flex items-center gap-2 font-semibold">
          <span
            className={
              'w-2 h-2 rounded-full ' +
              (apiState === 'online'
                ? 'bg-emerald-500'
                : apiState === 'error'
                ? 'bg-red-500'
                : 'bg-slate-400 animate-pulse')
            }
          />
          <span>
            {apiState === 'online'
              ? 'অনলাইন হাদিস API সক্রিয়'
              : apiState === 'error'
              ? 'API পাওয়া যাচ্ছে না'
              : 'সংযোগ হচ্ছে…'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#717A74]">{toBengaliNumerals(liveHadiths.length)} হাদিস</span>
          {apiState === 'error' && (
            <button
              type="button"
              onClick={reloadHadiths}
              className="inline-flex items-center gap-1 text-[#176B4D] dark:text-[#9DD6B9] font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              আবার
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--ikp-surface-muted)] border border-[var(--ikp-border)] overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'topics' as HadithTab, label: 'বিষয়ভিত্তিক', icon: Layers },
            { id: 'nawawi' as HadithTab, label: 'নববীর ৪০', icon: Sparkles },
            { id: 'books' as HadithTab, label: 'গ্রন্থ', icon: BookMarked },
            {
              id: 'bookmarks' as HadithTab,
              label: `বুকমার্ক (${toBengaliNumerals(bookmarks.length)})`,
              icon: Bookmark,
            },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === id
                ? 'bg-[var(--ikp-surface)] text-[var(--ikp-primary)] shadow-sm'
                : 'text-[var(--ikp-text-muted)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'nawawi' ? (
        <NawawiFortyView />
      ) : activeTab === 'books' ? (
        <HadithBooksView bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#717A74] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="হাদিস, বর্ণনাকারী বা বিষয় খুঁজুন..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl ikp-surface text-sm font-medium text-[var(--ikp-text)] placeholder:text-[var(--ikp-text-muted)] ikp-focus-ring"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717A74] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--ikp-surface-muted)] self-start sm:self-auto shrink-0 text-xs">
              <span className="text-[11px] font-bold text-[#717A74] px-2">মান:</span>
              {(['ALL', 'SAHIH', 'HASAN'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradeFilter(g)}
                  className={`py-1.5 px-2.5 rounded-xl font-bold transition-colors ${
                    gradeFilter === g
                      ? g === 'SAHIH'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : g === 'HASAN'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-[var(--ikp-surface)] text-[var(--ikp-primary)] shadow-sm'
                      : 'text-[var(--ikp-text-muted)]'
                  }`}
                >
                  {g === 'ALL' ? 'সকল' : g === 'SAHIH' ? 'সহীহ' : 'হাসান'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'topics' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {HADITH_TOPICS.map((topic) => {
                const isSelected = selectedTopicId === topic.id;
                const count =
                  topic.id === 'ALL'
                    ? availableHadiths.length
                    : availableHadiths.filter((h) => h.topicId === topic.id).length;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[var(--ikp-primary)] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1A221C] text-[var(--ikp-text-muted)] border border-[#E8EFEA] dark:border-[#3A4D43]/60'
                    }`}
                  >
                    {renderTopicIcon(topic.iconName)}
                    <span>{topic.titleBengali}</span>
                    <span
                      className={`text-[10px] px-1.5 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                      }`}
                    >
                      {toBengaliNumerals(count)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {apiState === 'loading' && liveHadiths.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#176B4D]" />
              <p className="text-sm text-[#717A74]">হাদিস লোড হচ্ছে…</p>
            </div>
          ) : apiState === 'error' && liveHadiths.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-red-200 dark:border-red-900/40 space-y-3">
              <p className="text-sm font-bold text-[#181D19] dark:text-[#E1E5E1]">
                হাদিস API পাওয়া যাচ্ছে না
              </p>
              <button
                type="button"
                onClick={reloadHadiths}
                className="px-4 py-2 rounded-xl bg-[var(--ikp-primary)] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={loadNextSection}
                  disabled={loadingMore}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--ikp-primary)] text-white text-xs font-bold disabled:opacity-60"
                >
                  {loadingMore
                    ? 'আরও হাদিস লোড হচ্ছে…'
                    : nextSection === 1
                    ? `আরও গ্রন্থ লোড করুন • ${toBengaliNumerals(Math.min(2, 6 - nextBookIndex))}টি`
                    : `আরও হাদিস লোড করুন • সেকশন ${toBengaliNumerals(nextSection)}`}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[var(--ikp-text-muted)] px-1">
                <span>
                  {activeTab === 'bookmarks'
                    ? `সংরক্ষিত: ${toBengaliNumerals(filteredHadiths.length)} টি`
                    : `প্রদর্শিত: ${toBengaliNumerals(filteredHadiths.length)} টি`}
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#176B4D] dark:text-[#9DD6B9] hover:underline"
                  >
                    ফিল্টার মুছুন
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {filteredHadiths.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-2">
                    <BookOpen className="w-10 h-10 text-[#717A74] mx-auto opacity-50" />
                    <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                      {activeTab === 'bookmarks'
                        ? 'এখনো কোনো হাদিস বুকমার্ক করা হয়নি'
                        : 'কোনো হাদিস মেলেনি'}
                    </h4>
                    <p className="text-xs text-[var(--ikp-text-muted)]">
                      {activeTab === 'bookmarks'
                        ? 'হাদিসের পাশে বুকমার্ক আইকনে চাপ দিয়ে সংরক্ষণ করুন।'
                        : 'অন্য শব্দ বা মান ফিল্টার দিয়ে চেষ্টা করুন।'}
                    </p>
                  </div>
                ) : (
                  renderedHadiths.map((hadith) => (
                    <HadithCard
                      key={hadith.id}
                      hadith={hadith}
                      isBookmarked={bookmarks.includes(hadith.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))
                )}
              </div>

              {hasMoreVisibleHadiths && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) => Math.min(count + 40, filteredHadiths.length))
                    }
                    className="px-5 py-2.5 rounded-2xl border border-[#176B4D]/30 bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] text-xs font-bold"
                  >
                    আরও{' '}
                    {toBengaliNumerals(
                      Math.min(40, filteredHadiths.length - renderedHadiths.length)
                    )}
                    টি দেখুন
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
