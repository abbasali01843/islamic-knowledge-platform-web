import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Search, X, BookOpen, Clock, Compass, Calendar, Calculator, Sparkles, BookMarked, Moon as MoonIcon } from 'lucide-react';
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

type SearchModule = {
  path: string;
  titleBn: string;
  titleEn: string;
  keywords: string;
  category: 'ibadah' | 'ilm' | 'tools';
  icon: React.ComponentType<{ className?: string }>;
};

const SEARCH_MODULES: SearchModule[] = [
  {
    path: '/prayer',
    titleBn: 'নামাজের সময় ও কিবলা',
    titleEn: 'Prayer',
    keywords: 'নামাজ সালাত ওয়াক্ত ফজর যোহর আসর মাগরিব এশা সেহরি ইফতার prayer salah',
    category: 'ibadah',
    icon: Clock,
  },
  {
    path: '/qibla',
    titleBn: 'কিবলা কম্পাস',
    titleEn: 'Qibla',
    keywords: 'কিবলা কাবা দিকনির্ণয় compass qibla',
    category: 'ibadah',
    icon: Compass,
  },
  {
    path: '/dua',
    titleBn: 'দোয়া ও যিকির',
    titleEn: 'Dua',
    keywords: 'দোয়া যিকির সকাল সন্ধ্যা তাসবীহ হিসনুল dua dhikr zikr',
    category: 'ibadah',
    icon: MoonIcon,
  },
  {
    path: '/hadith',
    titleBn: 'হাদিস ও সুন্নাহ',
    titleEn: 'Hadith',
    keywords: 'হাদিস বুখারী মুসলিম নববী সুন্নাহ hadith bukhari muslim',
    category: 'ilm',
    icon: BookMarked,
  },
  {
    path: '/quran',
    titleBn: 'কুরআন',
    titleEn: 'Quran',
    keywords: 'কুরআন কোরআন তিলাওয়াত সূরা আয়াত quran surah',
    category: 'ilm',
    icon: BookOpen,
  },
  {
    path: '/learn/salah',
    titleBn: 'সালাত ও অজু শিক্ষা',
    titleEn: 'Salah guide',
    keywords: 'অজু ওজু নামাজ শিক্ষা রাকাত wudu salah learn',
    category: 'ilm',
    icon: Sparkles,
  },
  {
    path: '/zakat',
    titleBn: 'যাকাত ক্যালকুলেটর',
    titleEn: 'Zakat',
    keywords: 'যাকাত নিসাব হিসাব zakat',
    category: 'tools',
    icon: Calculator,
  },
  {
    path: '/calendar',
    titleBn: 'হিজরি ক্যালেন্ডার',
    titleEn: 'Calendar',
    keywords: 'হিজরি চাঁদ ক্যালেন্ডার তারিখ hijri calendar',
    category: 'tools',
    icon: Calendar,
  },
  {
    path: '/ramadan',
    titleBn: 'রমজান',
    titleEn: 'Ramadan',
    keywords: 'রমজান রোজা সেহরি ইফতার ramadan',
    category: 'ibadah',
    icon: MoonIcon,
  },
  {
    path: '/hajj',
    titleBn: 'হজ ও উমরাহ',
    titleEn: 'Hajj',
    keywords: 'হজ উমরাহ hajj umrah',
    category: 'ilm',
    icon: Compass,
  },
  {
    path: '/seerah',
    titleBn: 'সীরাহ',
    titleEn: 'Seerah',
    keywords: 'সীরাহ রাসূল জীবনী seerah',
    category: 'ilm',
    icon: BookOpen,
  },
  {
    path: '/quiz',
    titleBn: 'ইসলামিক কুইজ',
    titleEn: 'Quiz',
    keywords: 'কুইজ প্রশ্ন quiz',
    category: 'ilm',
    icon: Sparkles,
  },
];

const QUICK_SUGGESTIONS = [
  { path: '/prayer', label: 'নামাজের সময়' },
  { path: '/quran', label: 'কুরআন' },
  { path: '/dua', label: 'সকাল-সন্ধ্যার দোয়া' },
  { path: '/hadith', label: 'হাদিস' },
  { path: '/qibla', label: 'কিবলা' },
  { path: '/zakat', label: 'যাকাত' },
];

const findQuranSurahs = (term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return Array.from({ length: 114 }, (_, i) => findQuranSurah(i + 1)).filter((s): s is Surah => {
    if (!s) return false;
    const hay = `${s.number} ${s.nameBengali} ${s.nameEnglish} ${s.nameArabic}`.
      toLowerCase();
    return hay.includes(q);
  });
};

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

  const searchSurahs = useMemo(
    () => (searchTerm ? findQuranSurahs(searchTerm).slice(0, 12) : []),
    [searchTerm]
  );

  const searchModules = useMemo(() => {
    if (!searchTerm) return SEARCH_MODULES;
    return SEARCH_MODULES.filter((m) =>
      `${m.titleBn} ${m.titleEn} ${m.keywords}`.toLowerCase().includes(searchTerm)
    );
  }, [searchTerm]);

  const hasResults = searchSurahs.length > 0 || searchModules.length > 0;

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

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch('');
  };

  const goFromSearch = (path: string) => {
    closeSearch();
    navigate(path);
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
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <div className="max-w-2xl mx-auto mt-4 rounded-3xl bg-white dark:bg-[#1A221C] shadow-2xl border border-[#E8EFEA] dark:border-[#3A4D43] overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-[#E8EFEA] dark:border-[#3A4D43]">
              <Search className="w-5 h-5 text-[#176B4D] dark:text-[#9DD6B9] shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeSearch();
                }}
                placeholder="সূরা, দোয়া, হাদিস, নামাজ, যাকাত..."
                className="flex-1 bg-transparent outline-none text-sm text-[#181D19] dark:text-[#E1E5E1]"
              />
              <button type="button" onClick={closeSearch} aria-label="অনুসন্ধান বন্ধ করুন">
                <X className="w-5 h-5 text-[#717A74]" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3 space-y-4">
              {!searchTerm && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] px-1">
                    দ্রুত অ্যাকসেস
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button
                        key={s.path}
                        type="button"
                        onClick={() => goFromSearch(s.path)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#E8EFEA] dark:bg-[#252F28] text-[#176B4D] dark:text-[#9DD6B9]"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#717A74] px-1 pt-1">
                    সূরার নাম (বাংলা/ইংরেজি/আরবি) বা ফিচারের নাম লিখে খুঁজুন।
                  </p>
                </div>
              )}

              {searchTerm && searchSurahs.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] px-1">
                    কুরআনের সূরা
                  </p>
                  {searchSurahs.map((s) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => {
                        closeSearch();
                        openSurah(s, null);
                      }}
                      className="w-full text-left p-3 rounded-2xl hover:bg-[#F0F5F1] dark:hover:bg-[#222C25] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                          {s.nameBengali}
                        </div>
                        <div className="text-[11px] text-[#717A74]">
                          সূরা {s.number} • {s.nameEnglish} • {s.ayahCount} আয়াত
                        </div>
                      </div>
                      <span className="text-lg font-serif text-[#176B4D] dark:text-[#9DD6B9] shrink-0" dir="rtl">
                        {s.nameArabic}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchModules.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] px-1">
                    {searchTerm ? 'ফিচার ও টুলস' : 'সব ফিচার'}
                  </p>
                  {searchModules.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.path}
                        type="button"
                        onClick={() => goFromSearch(m.path)}
                        className="w-full text-left p-3 rounded-2xl hover:bg-[#F0F5F1] dark:hover:bg-[#222C25] flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] flex items-center justify-center text-[#176B4D] dark:text-[#9DD6B9] shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                            {m.titleBn}
                          </div>
                          <div className="text-[11px] text-[#717A74]">{m.titleEn}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {searchTerm && !hasResults && (
                <p className="text-sm text-center text-[#717A74] py-10">
                  কোনো ফল পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।
                </p>
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
