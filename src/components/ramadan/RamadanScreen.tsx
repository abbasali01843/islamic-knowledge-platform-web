import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import type { LocationConfig } from '../../types/prayer';
import { DEFAULT_LOCATION } from '../../data/bangladeshDistricts';
import { requestGrantedBrowserLocation } from '../../utils/browserLocation';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  formatCountdownBengali,
} from '../../utils/prayerCalculation';
import { fetchWebModulesContent, type GuideItem } from '../../services/webModulesApi';
import { LoadingView, ErrorView } from '../ui/StateViews';
import { loadPrayerPrefs } from '../../utils/prayerPrefs';

interface Props {
  onBack: () => void;
}

export const RamadanScreen: React.FC<Props> = ({ onBack }) => {
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<LocationConfig>(() => {
    try {
      return loadPrayerPrefs().location || DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });
  const [guide, setGuide] = useState<GuideItem[] | null>(null);
  const [guideLoading, setGuideLoading] = useState(true);
  const [guideError, setGuideError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    requestGrantedBrowserLocation().then((detected) => {
      if (!cancelled && detected) setLocation(detected);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadGuide = async () => {
    setGuideLoading(true);
    setGuideError(false);
    try {
      const content = await fetchWebModulesContent();
      setGuide(content.ramadan);
    } catch {
      setGuideError(true);
    } finally {
      setGuideLoading(false);
    }
  };

  useEffect(() => {
    void loadGuide();
  }, []);

  const prayer = useMemo(
    () => calculatePrayerTimes(now, location, 'HANAFI', 'IFB'),
    [now, location]
  );

  const sehriMs = prayer.sehriEnd.getTime() - now.getTime();
  const iftarMs = prayer.iftar.getTime() - now.getTime();

  const sehriUpcoming =
    sehriMs > 0
      ? prayer.sehriEnd
      : new Date(prayer.sehriEnd.getTime() + 24 * 60 * 60 * 1000);
  const sehriCountdownMs = sehriUpcoming.getTime() - now.getTime();

  const iftarUpcoming =
    iftarMs > 0 ? prayer.iftar : new Date(prayer.iftar.getTime() + 24 * 60 * 60 * 1000);
  const iftarCountdownMs = iftarUpcoming.getTime() - now.getTime();

  const focusOnIftar = iftarMs > 0 && (sehriMs <= 0 || iftarMs < sehriMs);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7 space-y-5 pb-28">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="ফিরে যান"
          className="ikp-focus-ring p-2.5 rounded-2xl ikp-surface border border-[var(--ikp-border)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-[var(--ikp-text)]">রমজান</h1>
          <p className="text-xs text-[var(--ikp-text-muted)]">
            সেহরি · ইফতার · রোজার সহায়িকা
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--ikp-text-muted)]">
        <MapPin className="w-3.5 h-3.5" />
        <span>
          {location.nameBengali}
          {location.id === 'gps-current' ? '' : ' (ডিফল্ট)'}
        </span>
      </div>

      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0A3D2B] text-white space-y-4 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#9DD6B9]">
          {focusOnIftar ? (
            <>
              <Sun className="w-4 h-4" />
              <span>ইফতার পর্যন্ত</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>সেহরি শেষ পর্যন্ত</span>
            </>
          )}
        </div>

        <div className="text-3xl sm:text-4xl font-black tracking-tight">
          {formatCountdownBengali(focusOnIftar ? iftarCountdownMs : sehriCountdownMs)}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/15">
          <div className="space-y-1">
            <div className="text-[11px] text-white/70 flex items-center gap-1">
              <Moon className="w-3 h-3" />
              সেহরি শেষ
            </div>
            <div className="text-lg font-bold font-sans">
              {formatTimeBengali(prayer.sehriEnd, false, location.timezone)}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[11px] text-white/70 flex items-center gap-1 justify-end">
              <Sun className="w-3 h-3" />
              ইফতার
            </div>
            <div className="text-lg font-bold font-sans">
              {formatTimeBengali(prayer.iftar, false, location.timezone)}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/60 leading-relaxed">
          সেহরি শেষ = ফজরের ১০ মিনিট আগে (সাবধানতামূলক)। স্থানীয় মসজিদের ঘোষণা অনুসরণ করুন।
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl ikp-surface border border-[var(--ikp-border)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ikp-primary)]">
            <Moon className="w-3.5 h-3.5" />
            সেহরি
          </div>
          <div className="text-xl font-black text-[var(--ikp-text)] font-sans">
            {formatTimeBengali(prayer.sehriEnd, true, location.timezone)}
          </div>
          <div className="text-[11px] text-[#717A74] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {sehriMs > 0
              ? `${formatCountdownBengali(sehriMs)} বাকি`
              : 'আজকের সেহরি শেষ'}
          </div>
        </div>

        <div className="p-4 rounded-2xl ikp-surface border border-[var(--ikp-border)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Sun className="w-3.5 h-3.5" />
            ইফতার
          </div>
          <div className="text-xl font-black text-[var(--ikp-text)] font-sans">
            {formatTimeBengali(prayer.iftar, true, location.timezone)}
          </div>
          <div className="text-[11px] text-[#717A74] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {iftarMs > 0
              ? `${formatCountdownBengali(iftarMs)} বাকি`
              : 'আজকের ইফতার হয়েছে'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-black text-[var(--ikp-text)]">রমজান সহায়িকা</h2>

        {guideLoading && <LoadingView message="গাইড লোড হচ্ছে…" />}

        {guideError && !guideLoading && (
          <ErrorView
            title="গাইড লোড করা যায়নি"
            description="অনলাইন উৎস থেকে রমজান গাইড পাওয়া যাচ্ছে না।"
            onRetry={() => void loadGuide()}
          />
        )}

        {guide && !guideLoading && (
          <div className="space-y-3">
            {guide.map((item, i) => (
              <div
                key={item.title}
                className="p-4 rounded-2xl ikp-surface border border-[var(--ikp-border)]"
              >
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--ikp-primary)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[var(--ikp-text)]">
                      {i + 1}. {item.title}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ikp-text-muted)]">
                      {item.text}
                    </p>
                    <p className="mt-2 text-[11px] text-[#717A74]">উৎস: {item.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
