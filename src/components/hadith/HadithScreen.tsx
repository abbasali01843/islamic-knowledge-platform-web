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
} from 'lucide-react';
import { HadithItem } from '../../types/hadith';
const HADITH_TOPICS = [{ id: 'ALL', titleBengali: 'সব হাদিস', titleEnglish: 'All Hadith', iconName: 'BookMarked', description: 'অনলাইন API থেকে লোড হওয়া হাদিস' }] as const;

import { HadithCard } from './HadithCard';
import { NawawiFortyView } from './NawawiFortyView';
import { HadithBooksView } from './HadithBooksView';
import { toBengaliNumerals } from '../../utils/prayerCalculation';
import { fetchHadithSection, fetchLiveHadiths } from '../../services/hadithApi';

type HadithTab = 'topics' | 'nawawi' | 'books' | 'bookmarks';

export const HadithScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HadithTab>('topics');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'SAHIH' | 'HASAN'>('ALL');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const [dailyHadithCopied, setDailyHadithCopied] = useState(false);
  const [liveHadiths, setLiveHadiths] = useState<HadithItem[]>([]);
  const [apiState, setApiState] = useState<'loading' | 'online' | 'error'>('loading');
  const [nextSection, setNextSection] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLiveHadiths().then(({ items }) => {
      if (cancelled) return;
      setLiveHadiths(items);
      setApiState('online');
    }).catch(() => { if (!cancelled) setApiState('error'); });
    return () => { cancelled = true; };
  }, []);

  const loadNextSection = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const section = nextSection;
    try {
      const results = await Promise.allSettled(
        ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah'].map((bookId) =>
          fetchHadithSection(bookId, section)
        )
      );
      const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
      if (items.length) {
        setLiveHadiths((prev) => {
          const ids = new Set(prev.map((item) => item.id));
          return [...prev, ...items.filter((item) => !ids.has(item.id))];
        });
        setNextSection((value) => value + 1);
        setApiState('online');
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleBookmark = (hadithId: string) => {
    setBookmarks((prev) =>
      prev.includes(hadithId) ? prev.filter((id) => id !== hadithId) : [...prev, hadithId]
    );
  };

  // Hadith of the day based on day of year
  const availableHadiths = liveHadiths;

  const dailyHadith: HadithItem | undefined = useMemo(() => {
    if (!availableHadiths.length) return undefined;
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
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

  // Filter Hadiths for the 'topics' or 'bookmarks' tab
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-[#176B4D] via-[#12583e] to-[#0A3D2B] text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#9DD6B9] uppercase tracking-wider">
              সহীহ হাদিস ভাণ্ডার
            </span>
            <h1 className="text-2xl font-black">হাদিস ও সুন্নাহ</h1>
            <p className="text-xs text-white/80">
              কুরআন ও সিহাহ সিত্তাহর আলোকে বিশুদ্ধ হাদিস ও ইমাম নববীর ৪০ হাদিস
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#9DD6B9]" />
          </div>
        </div>

        {/* Hadith of the Day Card */}
        {dailyHadith && (
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#9DD6B9] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আজকের হাদিস ({dailyHadith.bookNameBengali}: {toBengaliNumerals(dailyHadith.hadithNumber)})</span>
              </span>
              <button
                type="button"
                onClick={handleCopyDailyHadith}
                className="text-white/80 hover:text-white flex items-center gap-1 text-[11px] font-semibold"
              >
                {dailyHadithCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-white/95 leading-relaxed italic line-clamp-2">
              "{dailyHadith.bengaliText}"
            </p>
            <div className="text-[11px] text-white/70">
              — {dailyHadith.narratorBengali} • {dailyHadith.gradeLabelBengali}
            </div>
          </div>
        )}
      </div>


        <div className="flex items-center justify-between rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-white dark:bg-[#1A221C] px-4 py-3 text-xs">
          <div className="flex items-center gap-2 font-semibold"><span className={"w-2 h-2 rounded-full " + (apiState === 'online' ? 'bg-emerald-500' : apiState === 'error' ? 'bg-red-500' : 'bg-slate-400 animate-pulse')} />
            <span>{apiState === 'online' ? 'অনলাইন হাদিস API সক্রিয়' : apiState === 'error' ? 'অনলাইন API পাওয়া যাচ্ছে না — আবার চেষ্টা করুন' : 'হাদিস API সংযোগ হচ্ছে...'}</span></div>
          <span className="text-[#717A74]">{toBengaliNumerals(liveHadiths.length)} অনলাইন</span>
        </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#222C25] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'topics'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>বিষয়ভিত্তিক</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nawawi')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'nawawi'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>নববীর ৪০ হাদিস</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('books')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'books'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>গ্রন্থসমূহ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
              : 'text-[#414A45] dark:text-[#C1CAC4] hover:text-[#181D19]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>বুকমার্ক ({toBengaliNumerals(bookmarks.length)})</span>
        </button>
      </div>

      {/* Tab Content: Navigating between Submodules */}
      {activeTab === 'nawawi' ? (
        <NawawiFortyView />
      ) : activeTab === 'books' ? (
        <HadithBooksView bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
      ) : (
        <div className="space-y-5">
          {/* Search & Grade Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#717A74] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="হাদিস, অনুবাদ, বর্ণনাকারী বা বিষয় দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-xs font-medium text-[#181D19] dark:text-[#E1E5E1] placeholder:text-[#717A74] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
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

            {/* Authenticity Grade Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] self-start sm:self-auto shrink-0 text-xs">
              <span className="text-[11px] font-bold text-[#717A74] px-2">মান:</span>
              <button
                type="button"
                onClick={() => setGradeFilter('ALL')}
                className={`py-1.5 px-2.5 rounded-xl font-bold transition-colors ${
                  gradeFilter === 'ALL'
                    ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
                    : 'text-[#414A45] dark:text-[#C1CAC4]'
                }`}
              >
                সকল
              </button>
              <button
                type="button"
                onClick={() => setGradeFilter('SAHIH')}
                className={`py-1.5 px-2.5 rounded-xl font-bold transition-colors ${
                  gradeFilter === 'SAHIH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#414A45] dark:text-[#C1CAC4]'
                }`}
              >
                সহীহ
              </button>
              <button
                type="button"
                onClick={() => setGradeFilter('HASAN')}
                className={`py-1.5 px-2.5 rounded-xl font-bold transition-colors ${
                  gradeFilter === 'HASAN'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-[#414A45] dark:text-[#C1CAC4]'
                }`}
              >
                হাসান
              </button>
            </div>
          </div>

          {/* Topic Pills Carousel (Only on topics tab) */}
          {activeTab === 'topics' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {HADITH_TOPICS.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  const count = topic.id === 'ALL' ? availableHadiths.length : availableHadiths.filter((h) => h.topicId === topic.id).length;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#176B4D] text-white shadow-xs'
                          : 'bg-white dark:bg-[#1A221C] text-[#414A45] dark:text-[#C1CAC4] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:bg-[#E8EFEA]'
                      }`}
                    >
                      {renderTopicIcon(topic.iconName)}
                      <span>{topic.titleBengali}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'
                        }`}
                      >
                        {toBengaliNumerals(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadNextSection}
              disabled={loadingMore}
              className="px-5 py-2.5 rounded-2xl bg-[#176B4D] text-white text-xs font-bold disabled:opacity-60"
            >
              {loadingMore ? 'আরও হাদিস লোড হচ্ছে...' : `আরও হাদিস লোড করুন • সেকশন ${toBengaliNumerals(nextSection)}`}
            </button>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs font-bold text-[#717A74] dark:text-[#8B958E] px-1">
            <span>
              {activeTab === 'bookmarks'
                ? `সংরক্ষিত হাদিস: ${toBengaliNumerals(filteredHadiths.length)} টি`
                : `প্রদর্শিত হাদিস: ${toBengaliNumerals(filteredHadiths.length)} টি`}
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

          {/* Hadiths List */}
          <div className="space-y-4">
            {filteredHadiths.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-2">
                <BookOpen className="w-10 h-10 text-[#717A74] mx-auto opacity-50" />
                <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                  {activeTab === 'bookmarks'
                    ? 'কোনো বুকমার্ক করা হাদিস পাওয়া যায়নি'
                    : 'আপনার অনুসন্ধানের সাথে কোনো হাদিস মেলেনি'}
                </h4>
                <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
                  {activeTab === 'bookmarks'
                    ? 'হাদিসের পাশে থাকা বুকমার্ক আইকনে ক্লিক করে প্রিয় হাদিস সংরক্ষণ করুন।'
                    : 'অন্য কোনো শব্দ বা বিষয় দিয়ে অনুসন্ধান করে দেখুন।'}
                </p>
              </div>
            ) : (
              filteredHadiths.map((hadith) => (
                <HadithCard
                  key={hadith.id}
                  hadith={hadith}
                  isBookmarked={bookmarks.includes(hadith.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
