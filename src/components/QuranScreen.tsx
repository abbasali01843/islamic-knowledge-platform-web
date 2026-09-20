import React, { useState, useMemo } from 'react';
import { Search, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import type { QuranLibraryTab, Surah, BookmarkEntry, NoteListItem } from '../types';
import { quranSurahs, findQuranSurah } from '../data/quranCatalog';
import { QuranReaderRepository } from '../data/quranRepository';
import { QuranPreferences } from '../utils/preferences';
import { SectionHeader } from './SectionHeader';

interface QuranScreenProps {
  onSurahClick: (surah: Surah, ayahNumber: number | null) => void;
}

export const QuranScreen: React.FC<QuranScreenProps> = ({ onSurahClick }) => {
  const [selectedTab, setSelectedTab] = useState<QuranLibraryTab>('SURAHS');
  const [query, setQuery] = useState('');
  const [libraryVersion, setLibraryVersion] = useState(0);

  const lastRead = useMemo(() => QuranPreferences.getLastRead(), [libraryVersion]);
  const resumeSurah = useMemo(
    () => (lastRead ? findQuranSurah(lastRead.surahNumber) : null),
    [lastRead]
  );

  const juzNumbers = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  const pageNumbers = useMemo(() => Array.from({ length: 604 }, (_, i) => i + 1), []);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quranSurahs;
    return quranSurahs.filter(
      (s) =>
        s.nameBengali.toLowerCase().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.number.toString() === q
    );
  }, [query]);

  const bookmarks = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    libraryVersion;
    const items: BookmarkEntry[] = [];
    const set = QuranPreferences.getBookmarks();
    set.forEach((entryKey) => {
      const parts = entryKey.split(':');
      if (parts.length !== 2) return;
      const s = parseInt(parts[0], 10);
      const a = parseInt(parts[1], 10);
      const catalog = findQuranSurah(s);
      if (!catalog) return;
      items.push({ surah: catalog, ayah: undefined, ayahNumber: a });
    });
    return items.sort((x, y) => {
      if (x.surah.number !== y.surah.number) return x.surah.number - y.surah.number;
      return x.ayahNumber - y.ayahNumber;
    });
  }, [libraryVersion]);

  const notes = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    libraryVersion;
    const rawNotes = QuranPreferences.getAllNotes();
    const items: NoteListItem[] = [];
    for (const entry of rawNotes) {
      const catalog = findQuranSurah(entry.surahNumber);
      if (catalog) {
        items.push({ surah: catalog, entry });
      }
    }
    return items;
  }, [libraryVersion]);

  const openJuz = async (juz: number) => {
    try {
      const hit = await QuranReaderRepository.firstAyahForJuz(juz);
      const surah = hit ? findQuranSurah(hit.surahNumber) : null;
      if (surah) onSurahClick(surah, hit?.ayah.number ?? 1);
    } catch {
      window.alert('পারা সূচি অনলাইন থেকে লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    }
  };

  const openPage = async (page: number) => {
    try {
      const hit = await QuranReaderRepository.firstAyahForPage(page);
      const surah = hit ? findQuranSurah(hit.surahNumber) : null;
      if (surah) onSurahClick(surah, hit?.ayah.number ?? 1);
    } catch {
      window.alert('পৃষ্ঠা সূচি অনলাইন থেকে লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    }
  };

  const tabs: Array<{ id: QuranLibraryTab; label: string }> = [
    { id: 'SURAHS', label: 'সূরা' },
    { id: 'JUZ', label: 'পারা' },
    { id: 'PAGES', label: 'পৃষ্ঠা' },
    { id: 'BOOKMARKS', label: 'বুকমার্ক' },
    { id: 'NOTES', label: 'নোট' },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7 space-y-5 pb-28">
      <SectionHeader title="কুরআন" />

      {/* Resume — most important action when user has history */}
      {resumeSurah && lastRead && selectedTab === 'SURAHS' && (
        <button
          type="button"
          onClick={() => onSurahClick(resumeSurah, lastRead.ayahNumber)}
          className="w-full text-left rounded-[26px] bg-gradient-to-r from-[#176B4D] to-[#0B4A34] text-white shadow-md active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#9DD6B9]" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9DD6B9]">
                  যেখান থেকে থেমেছিলেন
                </span>
                <div className="font-bold text-base truncate">
                  {resumeSurah.nameBengali}
                </div>
                <div className="text-xs text-white/80">
                  আয়াত {lastRead.ayahNumber} • {resumeSurah.nameArabic}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 text-sm font-bold shrink-0">
              <span>চালিয়ে পড়ুন</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedTab(tab.id);
                if (tab.id === 'BOOKMARKS' || tab.id === 'NOTES') {
                  setLibraryVersion((v) => v + 1);
                }
              }}
              className={`ikp-focus-ring px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                isSelected
                  ? 'bg-[var(--ikp-primary)] text-white shadow-sm'
                  : 'bg-[var(--ikp-surface-muted)] text-[var(--ikp-text-muted)] hover:brightness-[0.98]'
              }`}
            >
              {tab.label}
              {tab.id === 'BOOKMARKS' && bookmarks.length > 0 && (
                <span className="ml-1.5 text-xs opacity-80">({bookmarks.length})</span>
              )}
              {tab.id === 'NOTES' && notes.length > 0 && (
                <span className="ml-1.5 text-xs opacity-80">({notes.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* SURAHS TAB */}
      {selectedTab === 'SURAHS' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ikp-text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="সূরা খুঁজুন (বাংলা, ইংরেজি বা আরবি)"
              className="w-full pl-10 pr-4 py-3 rounded-xl ikp-surface text-sm text-[var(--ikp-text)] focus:outline-none transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--ikp-text-muted)]">
            ১১৪টি সূরা • {filteredSurahs.length}টি ফলাফল
          </div>

          <div className="space-y-2">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.id}
                type="button"
                onClick={() => onSurahClick(surah, null)}
                className="ikp-focus-ring w-full rounded-2xl ikp-surface hover:bg-[var(--ikp-surface-muted)] transition-colors text-left flex items-center justify-between p-4 shadow-sm group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 rounded-xl bg-[var(--ikp-primary-soft)] text-[var(--ikp-primary)] font-bold text-sm flex items-center justify-center shrink-0">
                    {surah.number}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-[var(--ikp-text)] group-hover:text-[#176B4D] dark:group-hover:text-[#9DD6B9] transition-colors">
                      {surah.nameBengali}
                    </h4>
                    <p className="text-xs text-[var(--ikp-text-muted)]">
                      {surah.nameEnglish} • {surah.ayahCount} আয়াত
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-arabic text-xl text-[var(--ikp-text)]" dir="rtl">
                    {surah.nameArabic}
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ikp-text-muted)]">
                    {surah.revelationType === 'MECCAN' ? 'মাক্কী' : 'মাদানী'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* JUZ TAB */}
      {selectedTab === 'JUZ' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--ikp-text-muted)]">
            প্রতিটি পারার সূচি অনলাইন API থেকে খোলা হবে।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {juzNumbers.map((juz) => (
              <button
                key={juz}
                type="button"
                onClick={() => openJuz(juz)}
                className="ikp-focus-ring p-4 rounded-2xl ikp-surface hover:bg-[var(--ikp-surface-muted)] text-left shadow-sm transition-colors"
              >
                <div className="font-semibold text-base text-[var(--ikp-text)]">
                  পারা {juz}
                </div>
                <div className="text-xs text-[var(--ikp-text-muted)] mt-1">
                  অনলাইন সূচি খুলতে ট্যাপ করুন
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PAGES TAB */}
      {selectedTab === 'PAGES' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--ikp-text-muted)]">
            প্রতিটি মুশহাফ পৃষ্ঠা অনলাইন API থেকে খোলা হবে।
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => openPage(page)}
                className="ikp-focus-ring p-3.5 rounded-2xl ikp-surface hover:bg-[var(--ikp-surface-muted)] text-left shadow-sm transition-colors"
              >
                <div className="font-semibold text-sm text-[var(--ikp-text)]">
                  পৃষ্ঠা {page}
                </div>
                <div className="text-xs text-[var(--ikp-text-muted)] mt-0.5 truncate">
                  ট্যাপ করে খুলুন
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOOKMARKS TAB */}
      {selectedTab === 'BOOKMARKS' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <h3 className="font-semibold text-base text-[var(--ikp-text)]">
                এখনও কোনো আয়াত বুকমার্ক করা হয়নি।
              </h3>
              <p className="text-sm text-[var(--ikp-text-muted)]">
                কুরআন পড়ার সময় বুকমার্ক আইকনে চাপ দিয়ে আয়াত সংরক্ষণ করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookmarks.map((item) => (
                <div
                  key={`${item.surah.number}:${item.ayahNumber}`}
                  className="p-4 rounded-2xl ikp-surface shadow-sm flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onSurahClick(item.surah, item.ayahNumber)}
                    className="text-left flex-1 space-y-1"
                  >
                    <div className="font-semibold text-sm text-[#176B4D] dark:text-[#9DD6B9]">
                      {item.surah.number}. {item.surah.nameBengali} • আয়াত {item.ayahNumber}
                    </div>
                    <p className="text-sm text-[var(--ikp-text)] line-clamp-2 leading-relaxed">
                      আয়াত খুলতে ট্যাপ করুন
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      QuranPreferences.removeBookmark(item.surah.number, item.ayahNumber);
                      setLibraryVersion((v) => v + 1);
                    }}
                    title="বুকমার্ক মুছুন"
                    className="p-2 rounded-xl text-[#717A74] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {selectedTab === 'NOTES' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <h3 className="font-semibold text-base text-[var(--ikp-text)]">
                এখনও কোনো নোট সংরক্ষণ করা হয়নি।
              </h3>
              <p className="text-sm text-[var(--ikp-text-muted)]">
                কুরআন পড়ার সময় নোট আইকন ব্যবহার করে নিজস্ব চিন্তাভাবনা লিখে রাখুন।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notes.map((item) => (
                <div
                  key={`${item.entry.surahNumber}:${item.entry.ayahNumber}`}
                  className="p-4 rounded-2xl ikp-surface shadow-sm flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onSurahClick(item.surah, item.entry.ayahNumber)}
                    className="text-left flex-1 space-y-1"
                  >
                    <div className="font-semibold text-sm text-[#176B4D] dark:text-[#9DD6B9]">
                      {item.surah.number}. {item.surah.nameBengali} • আয়াত {item.entry.ayahNumber}
                    </div>
                    <p className="text-sm text-[var(--ikp-text)] bg-[#F7FAF7] dark:bg-[#101511] p-2.5 rounded-xl border border-black/5 dark:border-white/5 leading-relaxed">
                      {item.entry.text}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      QuranPreferences.deleteNote(item.entry.surahNumber, item.entry.ayahNumber);
                      setLibraryVersion((v) => v + 1);
                    }}
                    title="নোট মুছুন"
                    className="p-2 rounded-xl text-[#717A74] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
