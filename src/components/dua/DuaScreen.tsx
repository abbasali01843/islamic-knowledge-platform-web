import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Sparkles,
  Sun,
  Flame,
} from 'lucide-react';
import { DuaCategoryKey } from '../../types/dua';
import { DUA_CATEGORIES, DUA_ITEMS } from '../../data/duaData';
import { DuaCard } from './DuaCard';
import { TasbeehCounter } from './TasbeehCounter';
import { MorningEveningCompanion } from './MorningEveningCompanion';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

type DuaMainTab = 'LIBRARY' | 'TASBEEH' | 'MORNING_EVENING';

export const DuaScreen: React.FC = () => {
  const [selectedMainTab, setSelectedMainTab] = useState<DuaMainTab>('LIBRARY');
  const [selectedCategory, setSelectedCategory] = useState<DuaCategoryKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Persistent bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_bookmarked_duas');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return ['sayyidul-istighfar', 'distress-yunus'];
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('user_bookmarked_duas', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered Duas
  const filteredDuas = useMemo(() => {
    return DUA_ITEMS.filter((dua) => {
      // Category match
      if (selectedCategory !== 'ALL' && dua.category !== selectedCategory) {
        return false;
      }
      // Bookmark filter
      if (showOnlyBookmarks && !bookmarkedIds.includes(dua.id)) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        dua.titleBengali.toLowerCase().includes(q) ||
        dua.bengaliMeaning.toLowerCase().includes(q) ||
        dua.bengaliTransliteration.toLowerCase().includes(q) ||
        dua.reference.toLowerCase().includes(q) ||
        (dua.tags && dua.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [selectedCategory, showOnlyBookmarks, bookmarkedIds, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#181D19] dark:text-[#E1E5E1]">
          দোয়া ও হিসনুল মুসলিম
        </h1>
        <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-0.5">
          সহীহ হাদিস ও কুরআনুল কারীম থেকে সংকলিত মাসনূন দোয়া ও জিকির
        </p>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8EFEA] dark:bg-[#222C25] rounded-2xl">
        {[
          { id: 'LIBRARY' as const, label: 'দোয়া ভাণ্ডার', icon: BookOpen },
          { id: 'TASBEEH' as const, label: 'ডিজিটাল তাসবীহ', icon: Flame },
          { id: 'MORNING_EVENING' as const, label: 'সকাল-সন্ধ্যা আমল', icon: Sun },
        ].map((tab) => {
          const isSelected = selectedMainTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedMainTab(tab.id)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
                  : 'text-[#717A74] dark:text-[#8B958E] hover:text-[#181D19] dark:hover:text-[#E1E5E1]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: DUA LIBRARY */}
      {selectedMainTab === 'LIBRARY' && (
        <div className="space-y-4">
          {/* Search Box & Bookmark filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717A74]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="দোয়া বা বিষয়ের নাম খুঁজুন (যেমন: ক্ষমা, ঘুম, ঋণ, বিপদ)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] text-[#181D19] dark:text-[#E1E5E1] placeholder-[#717A74] border border-transparent focus:border-[#176B4D] dark:focus:border-[#9DD6B9] outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showOnlyBookmarks
                  ? 'bg-[#176B4D] text-white border-[#176B4D]'
                  : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4] border-black/5 dark:border-white/5'
              }`}
              title="বুকমার্ক করা দোয়া"
            >
              <Bookmark className={`w-4 h-4 ${showOnlyBookmarks ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">বুকমার্ক</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-bold">
                {toBengaliNumerals(bookmarkedIds.length)}
              </span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DUA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id && !showOnlyBookmarks;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowOnlyBookmarks(false);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#176B4D] text-white shadow-xs'
                      : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#dce7e0]'
                  }`}
                >
                  {cat.nameBengali}
                </button>
              );
            })}
          </div>

          {/* Active Category Meta */}
          {!showOnlyBookmarks && (
            <div className="flex items-center justify-between text-xs text-[#717A74] dark:text-[#8B958E] px-1">
              <span>
                মোট {toBengaliNumerals(filteredDuas.length)} টি দোয়া পাওয়া গেছে
              </span>
              <span className="flex items-center gap-1 text-[#176B4D] dark:text-[#9DD6B9]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>উৎস ও সনদ যাচাইকৃত</span>
              </span>
            </div>
          )}

          {/* Duas List */}
          {filteredDuas.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-[#717A74]/50" />
              <p className="text-sm font-semibold text-[#181D19] dark:text-[#E1E5E1]">
                কোনো দোয়া পাওয়া যায়নি
              </p>
              <p className="text-xs text-[#717A74]">
                অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন অথবা ক্যাটাগরি পরিবর্তন করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDuas.map((dua) => (
                <DuaCard
                  key={dua.id}
                  dua={dua}
                  isBookmarked={bookmarkedIds.includes(dua.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: DIGITAL TASBEEH */}
      {selectedMainTab === 'TASBEEH' && <TasbeehCounter />}

      {/* SUB-VIEW 3: MORNING & EVENING COMPANION */}
      {selectedMainTab === 'MORNING_EVENING' && <MorningEveningCompanion />}
    </div>
  );
};
