import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, X } from 'lucide-react';
import type { Surah, HomeDestination } from './types';
import { findQuranSurah } from './data/quranCatalog';
import { HomeScreen } from './components/HomeScreen';
import { QuranScreen } from './components/QuranScreen';
import { QuranReaderScreen } from './components/QuranReaderScreen';
import { PrayerTimesScreen } from './components/prayer/PrayerTimesScreen';
import { DuaScreen } from './components/dua/DuaScreen';
import { HadithScreen } from './components/hadith/HadithScreen';
import { LearnSalahScreen } from './components/learn/LearnSalahScreen';
import { ZakatScreen } from './components/zakat/ZakatScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { Navbar } from './components/Navbar';
import { WebModulesScreen } from './components/WebModulesScreen';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

type Special = 'LEARN_SALAH' | 'ZAKAT' | 'CALENDAR' | null;
type WebModule = 'QIBLA' | 'RAMADAN' | 'HAJJ' | 'SEERAH' | 'QUIZ';

const findQuranSurahs = (term: string) =>
  Array.from({ length: 114 }, (_, i) => findQuranSurah(i + 1)).filter(
    (s): s is Surah => !!s && `${s.number} ${s.nameBengali} ${s.nameEnglish}`.toLowerCase().includes(term)
  );

const moduleByPath: Record<string, WebModule> = {
  '/qibla': 'QIBLA',
  '/ramadan': 'RAMADAN',
  '/hajj': 'HAJJ',
  '/seerah': 'SEERAH',
  '/quiz': 'QUIZ',
};

export const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(0);
  const [selectedAyah, setSelectedAyah] = useState(0);
  const [showWebModules, setShowWebModules] = useState(false);
  const [activeWebModule, setActiveWebModule] = useState<WebModule | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSpecialModule, setActiveSpecialModule] = useState<Special>(null);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const applyRoute = () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const queryModule = new URLSearchParams(window.location.search).get('module');
    setShowWebModules(false);
    setActiveWebModule(null);
    setActiveSpecialModule(null);
    setSelectedSurahNumber(0);
    setSelectedAyah(0);
    if (queryModule === 'quran') {
      setSelectedTab(1);
      return;
    }
    if (queryModule === 'hadith') {
      setSelectedTab(4);
      return;
    }
    if (path.startsWith('/quran/')) {
      const n = Number(path.split('/')[2]);
      if (Number.isInteger(n) && findQuranSurah(n)) {
        setSelectedTab(1);
        setSelectedSurahNumber(n);
        return;
      }
    }
    const tabs: Record<string, number> = {
      '/': 0,
      '/quran': 1,
      '/prayer': 2,
      '/dua': 3,
      '/hadith': 4,
    };
    if (tabs[path] !== undefined) {
      setSelectedTab(tabs[path]);
      return;
    }
    if (path === '/learn/salah') {
      setActiveSpecialModule('LEARN_SALAH');
      return;
    }
    if (path === '/zakat') {
      setActiveSpecialModule('ZAKAT');
      return;
    }
    if (path === '/calendar') {
      setActiveSpecialModule('CALENDAR');
      return;
    }
    if (moduleByPath[path]) {
      setShowWebModules(true);
      setActiveWebModule(moduleByPath[path]);
      return;
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    applyRoute();
  };

  const navLink = (path: string) => ({
    href: path,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate(path);
      }
    },
  });

  useEffect(() => {
    applyRoute();
    const onPopState = () => applyRoute();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const selectedSurah = findQuranSurah(selectedSurahNumber);
  const isReaderOpen = selectedTab === 1 && !!selectedSurah;
  const searchTerm = search.trim().toLowerCase();
  const searchSurahs = searchTerm ? findQuranSurahs(searchTerm).slice(0, 8) : [];
  const searchModules = [
    ['/prayer', 'নামাজের সময়', 'Prayer'],
    ['/dua', 'দোয়া', 'Dua'],
    ['/hadith', 'হাদিস', 'Hadith'],
    ['/qibla', 'কিবলা', 'Qibla'],
    ['/calendar', 'হিজরি ক্যালেন্ডার', 'Calendar'],
    ['/zakat', 'যাকাত', 'Zakat'],
    ['/learn/salah', 'সালাত শিক্ষা', 'Salah'],
    ['/ramadan', 'রমজান', 'Ramadan'],
    ['/hajj', 'হজ', 'Hajj'],
    ['/seerah', 'সীরাহ', 'Seerah'],
    ['/quiz', 'কুইজ', 'Quiz'],
  ].filter(([, bn, en]) => !searchTerm || `${bn} ${en}`.toLowerCase().includes(searchTerm));

  const openSurah = (surah: Surah, ayahNumber: number | null) => {
    window.history.pushState({}, '', '/quran/' + surah.number);
    setShowWebModules(false);
    setActiveWebModule(null);
    setActiveSpecialModule(null);
    setSelectedTab(1);
    setSelectedSurahNumber(surah.number);
    setSelectedAyah(ayahNumber || 0);
  };

  const handleQuickAction = (dest: HomeDestination) => {
    const paths: Partial<Record<HomeDestination, string>> = {
      QURAN: '/quran',
      PRAYER: '/prayer',
      DUA: '/dua',
      HADITH: '/hadith',
      LEARN_SALAH: '/learn/salah',
      ZAKAT: '/zakat',
      CALENDAR: '/calendar',
    };
    const p = paths[dest];
    if (p) navigate(p);
  };

  const handleContinueReading = (surahNumber: number, ayahNumber: number) => {
    const surah = findQuranSurah(surahNumber);
    if (surah) openSurah(surah, ayahNumber);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] dark:bg-[#101511] text-[#181D19] dark:text-[#E1E5E1] transition-colors flex flex-col">
      {!isReaderOpen && !activeSpecialModule && (
        <header className="sticky top-0 z-30 bg-[#F7FAF7]/95 dark:bg-[#101511]/95 backdrop-blur border-b border-[#E8EFEA] dark:border-[#3A4D43]/60 px-4 py-2.5">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#176B4D] dark:text-[#9DD6B9]">
                ইসলামিক জ্ঞান
              </span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-[#D4F2E2] text-[#002114] dark:bg-[#005236] dark:text-[#D4F2E2] font-semibold">
                Web
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="ইসলামিক অনুসন্ধান খুলুন"
                className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <a
                {...navLink('/qibla')}
                aria-label="কিবলা খুলুন"
                className="px-3 py-2 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] text-[#176B4D] dark:text-[#D4F2E2] text-xs font-bold"
              >
                কিবলা
              </a>
              <button
                type="button"
                onClick={() => setIsDarkMode((v) => !v)}
                aria-label={isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
                className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="ইসলামিক অনুসন্ধান"
        >
          <div className="max-w-2xl mx-auto mt-4 rounded-3xl bg-white dark:bg-[#1A221C] shadow-2xl border border-[#E8EFEA] dark:border-[#3A4D43] overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-[#E8EFEA] dark:border-[#3A4D43]">
              <Search className="w-5 h-5 text-[#176B4D]" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="কুরআন, দোয়া, হাদিস, কিবলা... খুঁজুন"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="অনুসন্ধান বন্ধ করুন">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
              {!searchTerm && (
                <p className="text-xs text-[#717A74] px-2 py-3">
                  সূরা, ইসলামিক ফিচার বা মডিউলের নাম দিয়ে খুঁজুন।
                </p>
              )}
              {searchSurahs.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    openSurah(s, null);
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-[#F0F5F1] dark:hover:bg-[#222C25]"
                >
                  <div className="font-bold text-sm">{s.nameBengali}</div>
                  <div className="text-[11px] text-[#717A74]">
                    সূরা {s.number} • {s.nameEnglish}
                  </div>
                </button>
              ))}
              {searchModules.map(([path, bn, en]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate(path);
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-[#F0F5F1] dark:hover:bg-[#222C25]"
                >
                  <div className="font-bold text-sm">{bn}</div>
                  <div className="text-[11px] text-[#717A74]">{en}</div>
                </button>
              ))}
              {searchTerm && !searchSurahs.length && !searchModules.length && (
                <p className="text-sm text-center text-[#717A74] py-8">কোনো ফল পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        {!isOnline && (
          <div className="sticky top-0 z-40 px-4 py-2 text-center text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-b border-amber-200 dark:border-amber-900">
            ইন্টারনেট সংযোগ নেই — এই Web App অনলাইন-ভিত্তিক; ডাটা লোড করতে ইন্টারনেট প্রয়োজন।
          </div>
        )}
        {showWebModules && (
          <WebModulesScreen
            initialModule={activeWebModule ?? undefined}
            onBack={() => navigate('/')}
          />
        )}
        {!showWebModules &&
          (activeSpecialModule === 'LEARN_SALAH' ? (
            <LearnSalahScreen onBack={() => navigate('/')} />
          ) : activeSpecialModule === 'ZAKAT' ? (
            <ZakatScreen onBack={() => navigate('/')} />
          ) : activeSpecialModule === 'CALENDAR' ? (
            <CalendarScreen onBack={() => navigate('/')} />
          ) : (
            <>
              {selectedTab === 0 && (
                <HomeScreen
                  onQuickActionClick={handleQuickAction}
                  onContinueReading={handleContinueReading}
                />
              )}
              {selectedTab === 1 &&
                (!selectedSurah ? (
                  <QuranScreen onSurahClick={openSurah} />
                ) : (
                  <QuranReaderScreen
                    surah={selectedSurah}
                    initialAyah={selectedAyah > 0 ? selectedAyah : null}
                    onBack={() => navigate('/quran')}
                    onNavigateToSurah={(next) => openSurah(next, null)}
                  />
                ))}
              {selectedTab === 2 && <PrayerTimesScreen />}
              {selectedTab === 3 && <DuaScreen />}
              {selectedTab === 4 && <HadithScreen />}
            </>
          ))}
      </main>

      {!showWebModules && !isReaderOpen && (
        <Navbar
          selectedTab={activeSpecialModule ? -1 : selectedTab}
          onSelectTab={(idx) => navigate(['/', '/quran', '/prayer', '/dua', '/hadith'][idx] || '/')}
        />
      )}
      <PwaInstallPrompt />
    </div>
  );
};
