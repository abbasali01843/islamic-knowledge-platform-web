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
import { fetchPrayerTimeOverrides } from '../../services/prayerTimesApi';
import type { PrayerTimeOverrides } from '../../utils/prayerCalculation';
import { QiblaCompass } from './QiblaCompass';
import { MonthlyTimetable } from './MonthlyTimetable';
import { SalahGuideView } from './SalahGuideView';
import {
  loadPrayerPrefs,
  savePrayerPrefs,
  loadSalahTracker,
  saveSalahTracker,
} from '../../utils/prayerPrefs';

type PrayerSubTab = 'TODAY' | 'QIBLA' | 'CALENDAR' | 'GUIDE';

export const PrayerTimesScreen: React.FC = () => {
  const [selectedSubTab, setSelectedSubTab] = useState<PrayerSubTab>('TODAY');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const initialPrefs = loadPrayerPrefs();
  const [location, setLocation] = useState<LocationConfig>(
    initialPrefs.location ?? DEFAULT_LOCATION
  );

  const [madhab, setMadhab] = useState<Madhab>(initialPrefs.madhab);
  const [calcMethod, setCalcMethod] = useState<CalculationMethod>(initialPrefs.calcMethod);

  useEffect(() => {
    if (initialPrefs.location) return;
    let cancelled = false;
    requestGrantedBrowserLocation().then((detectedLocation) => {
      if (!cancelled && detectedLocation) {
        setLocation(detectedLocation);
        savePrayerPrefs({ location: detectedLocation, madhab, calcMethod });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [apiOverrides, setApiOverrides] = useState<PrayerTimeOverrides>({});
  const [timingSource, setTimingSource] = useState<'api' | 'calculated'>('calculated');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectLocation = (loc: LocationConfig) => {
    setLocation(loc);
    savePrayerPrefs({ location: loc, madhab, calcMethod });
  };

  const handleToggleMadhab = (newMadhab: Madhab) => {
    setMadhab(newMadhab);
    savePrayerPrefs({ location, madhab: newMadhab, calcMethod });
  };

  const handleToggleCalcMethod = (newMethod: CalculationMethod) => {
    setCalcMethod(newMethod);
    savePrayerPrefs({ location, madhab, calcMethod: newMethod });
  };

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = getLocalDateKey(currentTime);

  const [tracker, setTracker] = useState<DailySalahTracker>(() =>
    loadSalahTracker(todayKey)
  );

  useEffect(() => {
    setTracker(loadSalahTracker(todayKey));
  }, [todayKey]);

  const toggleSalahCompleted = (prayer: keyof Omit<DailySalahTracker, 'date'>) => {
    setTracker((prev) => {
      const updated = { ...prev, [prayer]: !prev[prayer] };
      saveSalahTracker(updated);
      return updated;
    });
  };

  const locationDayKey = useMemo(() => {
    const shifted = new Date(currentTime.getTime() + location.timezone * 60 * 60 * 1000);
    return `${shifted.getUTCFullYear()}-${shifted.getUTCMonth() + 1}-${shifted.getUTCDate()}`;
  }, [currentTime, location.timezone]);

  useEffect(() => {
    const controller = new AbortController();
    setTimingSource('calculated');

    fetchPrayerTimeOverrides(currentTime, location, madhab, calcMethod, controller.signal)
      .then((overrides) => {
        if (!controller.signal.aborted) {
          setApiOverrides(overrides);
          setTimingSource(Object.keys(overrides).length > 0 ? 'api' : 'calculated');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiOverrides({});
          setTimingSource('calculated');
        }
      });

    return () => controller.abort();
  }, [location, madhab, calcMethod, locationDayKey]);

  const prayerData = useMemo(() => {
    return calculatePrayerTimes(currentTime, location, madhab, calcMethod, apiOverrides);
  }, [currentTime, location, madhab, calcMethod, apiOverrides]);

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
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7 space-y-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="ikp-focus-ring flex items-center gap-2 rounded-2xl bg-[var(--ikp-surface-muted)] px-3.5 py-2.5 text-xs font-bold text-[var(--ikp-text)] transition-colors border border-[var(--ikp-border)] active:scale-[0.98]"
        >
          <MapPin className="w-4 h-4 text-[var(--ikp-primary)]" />
          <span>{location.nameBengali}</span>
          <span className="text-[10px] text-[#717A74] font-normal">পরিবর্তন</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[var(--ikp-surface-muted)] p-1 rounded-2xl text-[11px] font-semibold border border-[var(--ikp-border)]">
            <button
              type="button"
              onClick={() => handleToggleMadhab('HANAFI')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                madhab === 'HANAFI'
                  ? 'bg-[var(--ikp-primary)] text-white shadow-sm'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              হানাফী
            </button>
            <button
              type="button"
              onClick={() => handleToggleMadhab('STANDARD')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                madhab === 'STANDARD'
                  ? 'bg-[var(--ikp-primary)] text-white shadow-sm'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              শাফেয়ী
            </button>
          </div>

          <div className="flex items-center bg-[var(--ikp-surface-muted)] p-1 rounded-2xl text-[11px] font-semibold border border-[var(--ikp-border)]">
            <button
              type="button"
              onClick={() => handleToggleCalcMethod('IFB')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                calcMethod === 'IFB'
                  ? 'bg-[var(--ikp-primary)] text-white shadow-sm'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              ১৮°
            </button>
            <button
              type="button"
              onClick={() => handleToggleCalcMethod('MWL')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                calcMethod === 'MWL'
                  ? 'bg-[var(--ikp-primary)] text-white shadow-sm'
                  : 'text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              MWL
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-[var(--ikp-text-muted)]">
        <span>
          সময়: {timingSource === 'api' ? 'AlAdhan API' : 'স্থানীয় গণনা'}
        </span>
        <span>
          {location.country === 'বাংলাদেশ'
            ? 'UTC+৬'
            : `UTC${location.timezone >= 0 ? '+' : ''}${location.timezone}`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--ikp-surface-muted)] rounded-2xl border border-[var(--ikp-border)]">
        {[
          { id: 'TODAY' as PrayerSubTab, label: 'আজ', icon: Clock },
          { id: 'QIBLA' as PrayerSubTab, label: 'কিবলা', icon: Compass },
          { id: 'CALENDAR' as PrayerSubTab, label: 'মাসিক', icon: Calendar },
          { id: 'GUIDE' as PrayerSubTab, label: 'শিক্ষা', icon: BookOpen },
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
                  ? 'bg-[var(--ikp-surface)] text-[var(--ikp-primary)] shadow-sm'
                  : 'text-[var(--ikp-text-muted)] hover:text-[#181D19] dark:hover:text-[#E1E5E1]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {selectedSubTab === 'TODAY' && (
        <div className="space-y-6">
          <div className="rounded-[28px] p-5 sm:p-7 bg-gradient-to-br from-[#176B4D] to-[#0B4A34] text-white shadow-lg relative overflow-hidden">
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
                  <h2 className="text-3xl sm:text-[42px] leading-none font-black tracking-tight">
                    {prayerData.nextPrayer.nameBengali}
                  </h2>
                  <span className="text-xs text-white/80 font-serif">
                    {prayerData.nextPrayer.nameArabic}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-extrabold font-sans tabular-nums">
                    {formatTimeBengali(prayerData.nextPrayer.time, true, location.timezone)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/80">বাকি আছে:</span>
                <span className="font-bold text-white font-sans text-sm tracking-wide">
                  {formatCountdownBengali(prayerData.nextPrayer.remainingMs)}
                </span>
              </div>

              {prayerData.currentPrayer && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-white/75">
                    <span>
                      চলতি: {prayerData.currentPrayer.nameBengali} (
                      {toBengaliNumerals(prayerData.currentPrayer.progressPercent)}%)
                    </span>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="ikp-surface rounded-2xl p-4">
              <span className="text-xs text-[var(--ikp-text-muted)] flex items-center gap-1 font-medium">
                <Moon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                সেহরি শেষ
              </span>
              <div className="text-lg font-bold text-[var(--ikp-text)] mt-1">
                {formatTimeBengali(prayerData.sehriEnd, true, location.timezone)}
              </div>
            </div>

            <div className="ikp-surface rounded-2xl p-4">
              <span className="text-xs text-[var(--ikp-text-muted)] flex items-center gap-1 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ইফতার
              </span>
              <div className="text-lg font-bold text-[#176B4D] dark:text-[#9DD6B9] mt-1">
                {formatTimeBengali(prayerData.iftar, true, location.timezone)}
              </div>
            </div>
          </div>

          {prayerData.forbiddenTimes.isForbiddenNow && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm">
                  এখন নামাজ পড়ার নিষিদ্ধ/মাকরূহ সময় চলছে!
                </strong>
                <p className="mt-0.5">{prayerData.forbiddenTimes.currentForbiddenReason}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-[var(--ikp-text)]">
                ওয়াক্তের সময়সূচি
              </h3>
              <span className="text-xs text-[var(--ikp-text-muted)]">
                {prayerData.date.toLocaleDateString('bn-BD', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>

            <div className="divide-y divide-[var(--ikp-border)] rounded-3xl ikp-surface shadow-sm overflow-hidden">
              {prayersList.map((item) => {
                const isNext = prayerData.nextPrayer.key === item.key;
                const isCurrent = prayerData.currentPrayer?.key === item.key;
                const isDone =
                  item.isTrackerKey &&
                  item.trackerProp &&
                  tracker[item.trackerProp];

                return (
                  <div
                    key={item.key}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isNext
                        ? 'bg-[var(--ikp-primary-soft)]/55'
                        : isCurrent
                        ? 'bg-[var(--ikp-surface-muted)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.isTrackerKey && item.trackerProp ? (
                        <button
                          type="button"
                          onClick={() => toggleSalahCompleted(item.trackerProp!)}
                          className="ikp-focus-ring shrink-0 rounded-lg"
                          aria-label={isDone ? 'সম্পন্ন' : 'চিহ্নিত করুন'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-6 h-6 text-[#176B4D] dark:text-[#9DD6B9]" />
                          ) : (
                            <Circle className="w-6 h-6 text-[var(--ikp-border)]" />
                          )}
                        </button>
                      ) : (
                        <div className="w-6 h-6 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[var(--ikp-text)]">
                          {item.titleBengali}
                          {isNext && (
                            <span className="ml-2 text-[10px] font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                              পরবর্তী
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#717A74] font-serif">
                          {item.titleArabic}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-base font-sans text-[var(--ikp-text)]">
                        {formatTimeBengali(item.time, true, location.timezone)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ikp-surface rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--ikp-text)] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
                আজকের নামাজ
              </h3>
              <span className="text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                {toBengaliNumerals(completedSalahCount)}/৫
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--ikp-surface-muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--ikp-primary)] rounded-full transition-all"
                style={{ width: `${(completedSalahCount / 5) * 100}%` }}
              />
            </div>
            {completedSalahCount === 5 && (
              <div className="text-emerald-700 dark:text-emerald-300 text-xs text-center font-semibold">
                মাশাআল্লাহ! আজকের ৫ ওয়াক্ত সম্পন্ন। আল্লাহ কবুল করুন।
              </div>
            )}
          </div>

          <div className="ikp-muted-surface rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-[#176B4D] dark:text-[#9DD6B9] flex items-center gap-1.5">
              <Moon className="w-4 h-4" /> নফল ও বিশেষ সময়
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#414A45] dark:text-[#C1CAC4]">
              <div>
                <span className="block text-[#717A74] text-[11px]">তাহাজ্জুদ (রাতের শেষ তৃতীয়াংশ):</span>
                <strong className="text-[var(--ikp-text)] font-sans">
                  {formatTimeBengali(prayerData.lastThirdNight)}
                </strong>
              </div>
              <div>
                <span className="block text-[#717A74] text-[11px]">ইসলামিক মধ্যরাত:</span>
                <strong className="text-[var(--ikp-text)] font-sans">
                  {formatTimeBengali(prayerData.midnight)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSubTab === 'QIBLA' && <QiblaCompass location={location} />}

      {selectedSubTab === 'CALENDAR' && (
        <MonthlyTimetable location={location} madhab={madhab} method={calcMethod} />
      )}

      {selectedSubTab === 'GUIDE' && <SalahGuideView />}

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
