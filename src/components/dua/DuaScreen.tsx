import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  Sun,
  Moon,
  Flame,
  Loader2,
  RefreshCw,
  Bookmark,
} from 'lucide-react';
import type { DuaCategoryKey, DuaItem } from '../../types/dua';
import {
  DUA_CATEGORIES,
  DUA_SOURCE_LABEL,
  DUA_SOURCE_URL,
  fetchLiveDuas,
} from '../../services/duaApi';
import { DuaCard } from './DuaCard';
import { TasbeehCounter } from './TasbeehCounter';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

type Tab = 'LIBRARY' | 'TASBEEH' | 'MORNING_EVENING';

const BOOKMARK_KEY = 'ikp-dua-bookmarks-v1';

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

function getDefaultTab(): Tab {
  const hour = new Date().getHours();
  // Fajr to ~10am and Maghrib to night → highlight morning-evening
  if (hour < 10 || hour >= 16) return 'MORNING_EVENING';
  return 'LIBRARY';
}

function getTimeLabel(): { title: string; subtitle: string; isMorning: boolean } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return {
      title: 'সকালের আমল',
      subtitle: 'ফজরের পর থেকে দুপুর পর্যন্ত পড়ার দোয়া ও যিকির',
      isMorning: true,
    };
  }
  if (hour >= 16 || hour < 4) {
    return {
      title: 'সন্ধ্যার আমল',
      subtitle: 'আসর/মাগরিবের পর পড়ার দোয়া ও যিকির',
      isMorning: false,
    };
  }
  return {
    title: 'সকাল-সন্ধ্যার আমল',
    subtitle: 'দৈনিক সকাল ও সন্ধ্যার মাসনূন দোয়া',
    isMorning: true,
  };
}

export const DuaScreen: React.FC = () => {
  const [tab, setTab] = useState<Tab>(() => getDefaultTab());
  const [category, setCategory] = useState<DuaCategoryKey>('ALL');
  const [query, setQuery] = useState('');
  const [duas, setDuas] = useState<DuaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchLiveDuas()
      .then((d) => {
        if (!cancelled) setDuas(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return duas.filter((d) => {
      if (category === 'FAVORITES') return bookmarks.includes(d.id);
      if (category !== 'ALL' && d.category !== category) return false;
      if (!query.trim()) return true;
      const hay = [d.titleBengali, d.bengaliMeaning, d.arabicText, d.reference, ...(d.tags || [])]
        .join(' ')
        .toLowerCase();
      return hay.includes(query.toLowerCase().trim());
    });
  }, [duas, category, query, bookmarks]);

  const morningEvening = useMemo(
    () => duas.filter((d) => d.category === 'MORNING_EVENING'),
    [duas]
  );

  const timeInfo = getTimeLabel();

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'MORNING_EVENING', label: 'সকাল-সন্ধ্যা', icon: Sun },
    { id: 'LIBRARY', label: 'সব দোয়া', icon: BookOpen },
    { id: 'TASBEEH', label: 'তাসবীহ', icon: Flame },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
      <div>
        <h1 className="text-2xl font-bold text-[#181D19] dark:text-[#E1E5E1]">
          দোয়া ও যিকির
        </h1>
        <p className="text-xs text-[#717A74] dark:text-[#8B958E] mt-1">
          হিসনুল মুসলিম থেকে বাংলা অনুবাদসহ মাসনূন দোয়া
        </p>
      </div>

      {/* Primary tabs — morning-evening first for daily habit */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8EFEA] dark:bg-[#222C25] rounded-2xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-colors ${
              tab === id
                ? 'bg-white dark:bg-[#1A221C] text-[#176B4D] dark:text-[#9DD6B9] shadow-xs'
                : 'text-[#717A74] dark:text-[#8B958E]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'TASBEEH' && <TasbeehCounter />}

      {tab === 'MORNING_EVENING' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white space-y-2">
            <div className="flex items-center gap-2">
              {timeInfo.isMorning ? (
                <Sun className="w-5 h-5 text-amber-200" />
              ) : (
                <Moon className="w-5 h-5 text-sky-200" />
              )}
              <span className="text-sm font-bold">{timeInfo.title}</span>
            </div>
            <p className="text-xs text-white/85 leading-relaxed">{timeInfo.subtitle}</p>
            <p className="text-[11px] text-[#9DD6B9]">
              {toBengaliNumerals(morningEvening.length)}টি দোয়া লোড হয়েছে
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#176B4D]" />
              <p className="text-xs text-[#717A74] mt-3">দোয়া লোড হচ্ছে…</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20">
              <p className="text-sm font-bold text-[#181D19] dark:text-[#E1E5E1]">
                দোয়া API পাওয়া যাচ্ছে না
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : morningEvening.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60">
              <p className="text-sm text-[#717A74]">
                সকাল-সন্ধ্যার দোয়া এখনো লোড হয়নি। "সব দোয়া" ট্যাব থেকে দেখুন।
              </p>
            </div>
          ) : (
            morningEvening.map((d) => (
              <DuaCard
                key={d.id}
                dua={d}
                isBookmarked={bookmarks.includes(d.id)}
                onToggleBookmark={toggle}
              />
            ))
          )}
        </div>
      )}

      {tab === 'LIBRARY' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#717A74]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="দোয়া, অর্থ বা বিষয় খুঁজুন..."
                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-white dark:bg-[#1A221C] text-xs text-[#181D19] dark:text-[#E1E5E1] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {DUA_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  category === c.id
                    ? 'bg-[#176B4D] text-white'
                    : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4]'
                }`}
              >
                {c.id === 'FAVORITES' ? (
                  <span className="inline-flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    {c.nameBengali}
                    {bookmarks.length > 0 ? ` (${toBengaliNumerals(bookmarks.length)})` : ''}
                  </span>
                ) : (
                  c.nameBengali
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#176B4D]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20">
              <p className="text-sm font-bold">দোয়া API পাওয়া যাচ্ছে না</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60">
              <p className="text-sm text-[#717A74]">
                {category === 'FAVORITES'
                  ? 'এখনো কোনো দোয়া বুকমার্ক করা হয়নি।'
                  : 'কোনো দোয়া মেলেনি।'}
              </p>
            </div>
          ) : (
            filtered.map((d) => (
              <DuaCard
                key={d.id}
                dua={d}
                isBookmarked={bookmarks.includes(d.id)}
                onToggleBookmark={toggle}
              />
            ))
          )}

          <p className="text-[10px] text-[#717A74] dark:text-[#8B958E]">
            সূত্র:{' '}
            <a
              href={DUA_SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {DUA_SOURCE_LABEL}
            </a>{' '}
            • কনটেন্ট অনলাইনে লোড হয়
          </p>
        </div>
      )}
    </div>
  );
};
