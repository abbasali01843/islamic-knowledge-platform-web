import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Compass,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';
import {
  LocationConfig,
  Madhab,
  CalculationMethod,
  DailySalahTracker,
  PrayerKey,
} from '../../types/prayer';
import { DEFAULT_LOCATION } from '../../data/bangladeshDistricts';
import { requestGrantedBrowserLocation } from '../../utils/browserLocation';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  formatCountdownBengali,
  toBengaliNumerals,
} from '../../utils/prayerCalculation';
import { LocationPickerModal } from './LocationPickerModal';
import { QiblaCompass } from './QiblaCompass';
import { MonthlyTimetable } from './MonthlyTimetable';
import { SalahGuideView } from './SalahGuideView';

type PrayerSubTab = 'TODAY' | 'QIBLA' | 'CALENDAR' | 'GUIDE';

export const PrayerTimesScreen: React.FC = () => {
  const [selectedSubTab, setSelectedSubTab] = useState<PrayerSubTab>('TODAY');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);

  const [madhab, setMadhab] = useState<Madhab>('HANAFI');
  const [calcMethod, setCalcMethod] = useState<CalculationMethod>('IFB');

  useEffect(() => {
    let cancelled = false;
    requestGrantedBrowserLocation().then((detectedLocation) => {
      if (!cancelled && detectedLocation) setLocation(detectedLocation);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real-time second ticker for live countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes
  const handleSelectLocation = (loc: LocationConfig) => {
    setLocation(loc);
  };

  const handleToggleMadhab = (newMadhab: Madhab) => {
    setMadhab(newMadhab);
  };

  const handleToggleCalcMethod = (newMethod: CalculationMethod) => {
    setCalcMethod(newMethod);
  };

  // Daily Salah Tracker state
  // Use Bangladesh/browser local calendar date, not UTC, so the tracker does not
  // roll over at 6:00 AM in Bangladesh (UTC midnight).
  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = getLocalDateKey(currentTime);

  const loadTracker = (dateKey: string): DailySalahTracker => ({
    date: dateKey,
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });

  const [tracker, setTracker] = useState<DailySalahTracker>(() => loadTracker(todayKey));

  // Reset the tracker automatically when the local calendar date changes.
  useEffect(() => {
    setTracker(loadTracker(todayKey));
  }, [todayKey]);

  const toggleSalahCompleted = (prayer: keyof Omit<DailySalahTracker, 'date'>) => {
    setTracker((prev) => {
      const updated = { ...prev, [prayer]: !prev[prayer] };
      return updated;
    });
  };

  // Compute live prayer times
  const prayerData = useMemo(() => {
    return calculatePrayerTimes(currentTime, location, madhab, calcMethod);
  }, [currentTime, location, madhab, calcMethod]);

  const completedSalahCount = [
    tracker.fajr,
    tracker.dhuhr,
    tracker.asr,
    tracker.maghrib,
    tracker.isha,
  ].filter(Boolean).length;

  const prayersList: Array<{
    key: PrayerKey;
    titleBengali: string;
    titleArabic: string;
    time: Date;
    isTrackerKey: boolean;
    trackerProp?: keyof Omit<DailySalahTracker, 'date'>;
  }> = [
    {
      key: 'fajr',
      titleBengali: 'ফজর',
      titleArabic: 'الفجر',
      time: prayerData.fajr,
      isTrackerKey: true,
      trackerProp: 'fajr',
    },
    {
      key: 'sunrise',
      titleBengali: 'সূর্যোদয় (ইশরাক)',
      titleArabic: 'الشروق',
      time: prayerData.sunrise,
      isTrackerKey: false,
    },
    {
      key: 'dhuhr',
      titleBengali: 'যোহর',
      titleArabic: 'الظهر',
      time: prayerData.dhuhr,
      isTrackerKey: true,
      trackerProp: 'dhuhr',
    },
    {
      key: 'asr',
      titleBengali: 'আসর',
      titleArabic: 'العصر',
      time: prayerData.asr,
      isTrackerKey: true,
      trackerProp: 'asr',
    },
    {
      key: 'maghrib',
      titleBengali: 'মাগরিব (ইফতার)',
      titleArabic: 'المغرب',
      time: prayerData.maghrib,
      isTrackerKey: true,
      trackerProp: 'maghrib',
    },
    {
      key: 'isha',
      titleBengali: 'এশা',
      titleArabic: 'العشاء',
      time: prayerData.isha,
      isTrackerKey: true,
      trackerProp: 'isha',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Bar: Location & Settings */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] hover:bg-[#dce7e0] dark:hover:bg-[#303c34] text-xs font-bold text-[#181D19] dark:text-[#E1E5E1] transition-colors border border-black/5 dark:border-white/5 active:scale-[0.98]"
        >
          <MapPin className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
          <span>{location.nameBengali}</span>
          <span className="text-[10px] text-[#717A74] font-normal">পরিবর্তন</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Madhab Selector */}
          <div className="flex items-center bg-[#E8EFEA] dark:bg-[#252F28] p-1 rounded-2xl text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleToggleMadhab('HANAFI')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                madhab === 'HANAFI'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              হানাফী (২x)
            </button>
            <button
              type="button"
              onClick={() => handleToggleMadhab('STANDARD')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                madhab === 'STANDARD'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              শাফেয়ী (১x)
            </button>
          </div>

          {/* Method Selector */}
          <div className="flex items-center bg-[#E8EFEA] dark:bg-[#252F28] p-1 rounded-2xl text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleToggleCalcMethod('IFB')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                calcMethod === 'IFB'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              IFB (১৮°)
            </button>
            <button
              type="button"
              onClick={() => handleToggleCalcMethod('MWL')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                calcMethod === 'MWL'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              MWL (১৭°)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#E8EFEA] dark:bg-[#222C25] rounded-2xl">
        {[
          { id: 'TODAY' as PrayerSubTab, label: 'আজকের সময়', icon: Clock },
          { id: 'QIBLA' as PrayerSubTab, label: 'কিবলা কম্পাস', icon: Compass },
          { id: 'CALENDAR' as PrayerSubTab, label: 'ক্যালেন্ডার', icon: Calendar },
          { id: 'GUIDE' as PrayerSubTab, label: 'নামাজ শিক্ষা', icon: BookOpen },
        ].map((tab) => {
          const isSelected = selectedSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSubTab(tab.id)}
              className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
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

      {/* TAB 1: TODAY'S PRAYER TIMES */}
      {selectedSubTab === 'TODAY' && (
        <div className="space-y-6">
          {/* Main Hero Card: Live Countdown & Next Prayer */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0D442F] text-white shadow-lg relative overflow-hidden">
            {/* Subtle decorative circle */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-widest text-[#9DD6B9] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> পরবর্তী ওয়াক্ত
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {location.nameBengali}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {prayerData.nextPrayer.nameBengali}
                  </h2>
                  <span className="text-xs text-white/80 font-serif">
                    {prayerData.nextPrayer.nameArabic}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-bold font-sans">
                    {formatTimeBengali(prayerData.nextPrayer.time)}
                  </span>
                </div>
              </div>

              {/* Countdown Ticker */}
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/80">বাকি আছে:</span>
                <span className="font-bold text-white font-sans text-sm tracking-wide">
                  {formatCountdownBengali(prayerData.nextPrayer.remainingMs)}
                </span>
              </div>

              {/* Progress bar of current interval */}
              {prayerData.currentPrayer && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-white/75">
                    <span>
                      চলতি ওয়াক্ত: {prayerData.currentPrayer.nameBengali} (
                      {toBengaliNumerals(prayerData.currentPrayer.progressPercent)}%)
                    </span>
                    <span>{prayerData.nextPrayer.nameBengali} হতে আর কিছুক্ষণ</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9DD6B9] rounded-full transition-all duration-500"
                      style={{ width: `${prayerData.currentPrayer.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fasting (Sehri & Iftar) Quick Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-[#717A74] dark:text-[#8B958E] flex items-center gap-1 font-medium">
                  <Moon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  সেহরি শেষ
                </span>
                <div className="text-lg font-bold text-[#181D19] dark:text-[#E1E5E1]">
                  {formatTimeBengali(prayerData.sehriEnd)}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold">
                সতর্কতামূলক
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-[#717A74] dark:text-[#8B958E] flex items-center gap-1 font-medium">
                  <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ইফতার সময়
                </span>
                <div className="text-lg font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                  {formatTimeBengali(prayerData.iftar)}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] font-semibold">
                মাগরিব
              </span>
            </div>
          </div>

          {/* Forbidden Time Warning (if active or upcoming) */}
          {prayerData.forbiddenTimes.isForbiddenNow && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm">
                  এখন নামাজ পড়ার নিষিদ্ধ/মাকরূহ সময় চলছে!
                </strong>
                <p className="mt-0.5">{prayerData.forbiddenTimes.currentForbiddenReason}</p>
              </div>
            </div>
          )}

          {/* 5 Daily Prayer Cards List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                ওয়াক্ত অনুযায়ী সময়সূচি
              </h3>
              <span className="text-xs text-[#717A74] dark:text-[#8B958E]">
                {prayerData.date.toLocaleDateString('bn-BD', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="divide-y divide-[#E8EFEA] dark:divide-[#3A4D43]/40 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs overflow-hidden">
              {prayersList.map((item) => {
                const isNext = prayerData.nextPrayer.key === item.key;
                const isCurrent = prayerData.currentPrayer?.key === item.key;

                return (
                  <div
                    key={item.key}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isNext
                        ? 'bg-[#D4F2E2]/50 dark:bg-[#005236]/30'
                        : isCurrent
                        ? 'bg-[#F0F5F1] dark:bg-[#202A22]'
                        : 'hover:bg-[#F7FAF7] dark:hover:bg-[#1D251F]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          isNext
                            ? 'bg-[#176B4D] text-white'
                            : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4]'
                        }`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                            {item.titleBengali}
                          </h4>
                          {isNext && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#176B4D] text-white font-semibold">
                              পরবর্তী
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] font-semibold">
                              চলতি ওয়াক্ত
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#717A74] dark:text-[#8B958E] font-serif">
                          {item.titleArabic}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-[#181D19] dark:text-[#E1E5E1] font-sans">
                        {formatTimeBengali(item.time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Daily Salah Tracker */}
          <div className="p-5 rounded-3xl bg-[#E8EFEA] dark:bg-[#252F28] border border-black/5 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#176B4D] text-white flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                    দৈনিক ৫ ওয়াক্ত নামাজ ট্র্যাকার
                  </h4>
                  <p className="text-[11px] text-[#717A74] dark:text-[#8B958E]">
                    আজকের ওয়াক্তসমূহ আদায় শেষে টিক দিন
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2]">
                {toBengaliNumerals(completedSalahCount)}/৫ আদায়
              </span>
            </div>

            {/* Prayer Checkboxes */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'fajr' as const, label: 'ফজর' },
                { key: 'dhuhr' as const, label: 'যোহর' },
                { key: 'asr' as const, label: 'আসর' },
                { key: 'maghrib' as const, label: 'মাগরিব' },
                { key: 'isha' as const, label: 'এশা' },
              ].map((p) => {
                const isCompleted = tracker[p.key];
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleSalahCompleted(p.key)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                        : 'bg-white dark:bg-[#1A221C] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#F0F5F1]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#717A74]" />
                    )}
                    <span className="text-xs font-bold">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {completedSalahCount === 5 && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs text-center font-semibold">
                মাশাআল্লাহ! আজকের ৫ ওয়াক্ত নামাজ সম্পন্ন করেছেন। আল্লাহ কবুল করুন।
              </div>
            )}
          </div>

          {/* Tahajjud & Midnight Info */}
          <div className="p-4 rounded-2xl bg-[#F0F5F1] dark:bg-[#1C251F] border border-black/5 dark:border-white/5 space-y-2 text-xs">
            <h4 className="font-bold text-[#176B4D] dark:text-[#9DD6B9] flex items-center gap-1.5">
              <Moon className="w-4 h-4" /> নফল ও বিশেষ সময়
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#414A45] dark:text-[#C1CAC4]">
              <div>
                <span className="block text-[#717A74] text-[11px]">তাহাজ্জুদের উত্তম সময় (রাতের শেষ তৃতীয়াংশ):</span>
                <strong className="text-[#181D19] dark:text-[#E1E5E1] font-sans">
                  {formatTimeBengali(prayerData.lastThirdNight)}
                </strong>
              </div>
              <div>
                <span className="block text-[#717A74] text-[11px]">ইসলামিক মধ্যরাত (এশার ওয়াক্ত শেষ):</span>
                <strong className="text-[#181D19] dark:text-[#E1E5E1] font-sans">
                  {formatTimeBengali(prayerData.midnight)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QIBLA COMPASS */}
      {selectedSubTab === 'QIBLA' && <QiblaCompass location={location} />}

      {/* TAB 3: MONTHLY TIMETABLE */}
      {selectedSubTab === 'CALENDAR' && (
        <MonthlyTimetable location={location} madhab={madhab} method={calcMethod} />
      )}

      {/* TAB 4: SALAH GUIDE */}
      {selectedSubTab === 'GUIDE' && <SalahGuideView />}

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <LocationPickerModal
          currentLocation={location}
          onSelectLocation={handleSelectLocation}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}
    </div>
  );
};
