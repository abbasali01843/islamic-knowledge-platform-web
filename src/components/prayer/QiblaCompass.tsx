import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LocationConfig } from '../../types/prayer';
import {
  calculateQiblaBearing,
  calculateKaabaDistanceKm,
  toBengaliNumerals,
} from '../../utils/prayerCalculation';

interface QiblaCompassProps {
  location: LocationConfig;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ location }) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const hasVibratedRef = useRef(false);
  const orientationCleanupRef = useRef<(() => void) | null>(null);

  const qiblaBearing = calculateQiblaBearing(location.latitude, location.longitude);
  const distanceKm = calculateKaabaDistanceKm(location.latitude, location.longitude);

  // Effective current heading is either device sensor or manual slider
  const currentHeading = isManualMode ? manualHeading : deviceHeading;

  // Relative angle to Kaaba from current device front (0° = directly facing Kaaba)
  const relativeQibla = (qiblaBearing - currentHeading + 360) % 360;
  // Aligned if within +/- 4 degrees of Kaaba
  const isAligned = relativeQibla <= 4 || relativeQibla >= 356;

  // Haptic feedback on alignment
  useEffect(() => {
    if (isAligned && !hasVibratedRef.current) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 50, 40]);
        } catch {
          // ignore if vibration blocked
        }
      }
      hasVibratedRef.current = true;
    } else if (!isAligned) {
      hasVibratedRef.current = false;
    }
  }, [isAligned]);

  // Request device orientation permission for iOS 13+
  const requestCompassPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          attachOrientationListener();
        } else {
          setPermissionState('denied');
          setIsManualMode(true);
        }
      } catch (err) {
        console.error('Orientation permission error:', err);
        setPermissionState('denied');
        setIsManualMode(true);
      }
    } else {
      attachOrientationListener();
    }
  };

  const attachOrientationListener = () => {
    // Prevent duplicate listeners when permission is requested more than once.
    orientationCleanupRef.current?.();

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS webkitCompassHeading (0 to 360, 0 = True North)
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android / standard orientation (alpha is counter-clockwise 0-360)
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setIsSensorAvailable(true);
        setPermissionState('granted');
        setDeviceHeading(Math.round(heading));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation as unknown as EventListener, true);

    orientationCleanupRef.current = () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation as unknown as EventListener, true);
      orientationCleanupRef.current = null;
    };

    return orientationCleanupRef.current;
  };

  useEffect(() => {
    // Check if permission required
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setPermissionState('prompt');
    } else {
      attachOrientationListener();
    }

    return () => {
      orientationCleanupRef.current?.();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Info Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#9DD6B9]">
              কিবলার কোণ ও দূরত্ব
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-sans">
                {toBengaliNumerals(qiblaBearing)}°
              </span>
              <span className="text-sm font-medium text-white/80">
                উত্তর থেকে ঘড়ির কাঁটার দিকে
              </span>
            </div>
            <p className="text-xs text-white/80 flex items-center gap-1.5 pt-1">
              <span>{location.nameBengali} থেকে পবিত্র কাবা শরীফের দূরত্ব:</span>
              <strong className="text-white font-semibold">
                {toBengaliNumerals(distanceKm)} কিমি
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManualMode(!isManualMode)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>
                {isManualMode
                  ? 'সেন্সর মোড'
                  : isSensorAvailable
                  ? 'সেন্সর সক্রিয়'
                  : 'ম্যানুয়াল কম্পাস'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Permission / Sensor Alert */}
      {permissionState === 'prompt' && !isManualMode && (
        <div className="p-4 rounded-2xl bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#176B4D] dark:text-[#9DD6B9] shrink-0" />
            <span>মোবাইলের কম্পাস সেন্সর সক্রিয় করতে পারমিশন দিন।</span>
          </div>
          <button
            type="button"
            onClick={requestCompassPermission}
            className="px-3.5 py-1.5 rounded-xl bg-[#176B4D] text-white font-semibold text-xs shrink-0 active:scale-95"
          >
            পারমিশন দিন
          </button>
        </div>
      )}

      {/* Alignment Status Banner */}
      <div
        className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
          isAligned
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400 animate-pulse'
            : 'bg-[#E8EFEA] dark:bg-[#252F28] text-[#414A45] dark:text-[#C1CAC4]'
        }`}
      >
        {isAligned ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>আলহামদুলিল্লাহ! আপনি সরাসরি পবিত্র কাবার অভিমুখে আছেন।</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
            <span>
              ডিভাইসটি ঘুরিয়ে সবুজ সূচক ও কাবার চিহ্ন সোজা বরাবর আনুন ({toBengaliNumerals(relativeQibla)}° ব্যবধান)
            </span>
          </>
        )}
      </div>

      {/* The Visual Compass Dial */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center select-none">
          {/* Outer Ring with Direction Marks */}
          <div
            className={`w-full h-full rounded-full border-4 relative transition-transform duration-300 ease-out shadow-xl flex items-center justify-center ${
              isAligned
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-[#176B4D]/20 dark:border-[#3A4D43] bg-white dark:bg-[#1A231D]'
            }`}
            style={{
              transform: `rotate(-${currentHeading}deg)`,
            }}
          >
            <div className="absolute top-2 text-center font-bold text-sm text-rose-600">
              N<span className="block text-[9px] font-normal text-[#717A74]">উত্তর (০°)</span>
            </div>
            <div className="absolute right-3 text-center font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
              E<span className="block text-[9px] font-normal text-[#717A74]">পূর্ব (৯০°)</span>
            </div>
            <div className="absolute bottom-2 text-center font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
              S<span className="block text-[9px] font-normal text-[#717A74]">দক্ষিণ (১৮০°)</span>
            </div>
            <div className="absolute left-3 text-center font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
              W<span className="block text-[9px] font-normal text-[#717A74]">পশ্চিম (২৭০°)</span>
            </div>

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-0.5 h-3 bg-[#717A74]/40"
                style={{
                  top: '12px',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${deg}deg) translateY(0px)`,
                  height: deg % 90 === 0 ? '12px' : '6px',
                }}
              />
            ))}

            <div
              className="absolute w-full h-full flex flex-col items-center pointer-events-none"
              style={{
                transform: `rotate(${qiblaBearing}deg)`,
              }}
            >
              <div className="mt-1 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-black text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg font-bold text-[10px] transform -rotate-45">
                  <span className="transform rotate-45">🕋</span>
                </div>
                <span className="text-[10px] font-bold text-[#176B4D] dark:text-[#9DD6B9] bg-white/90 dark:bg-black/90 px-1 rounded-sm mt-0.5 shadow-xs">
                  কিবলা ({toBengaliNumerals(qiblaBearing)}°)
                </span>
              </div>
            </div>

            <div className="w-36 h-36 rounded-full border border-dashed border-[#176B4D]/30 dark:border-[#9DD6B9]/30 flex flex-col items-center justify-center p-2 text-center">
              <span className="text-xs text-[#717A74] dark:text-[#8B958E]">
                {location.nameBengali}
              </span>
              <span className="text-lg font-extrabold text-[#176B4D] dark:text-[#9DD6B9]">
                {toBengaliNumerals(qiblaBearing)}°
              </span>
              <span className="text-[10px] text-[#717A74] dark:text-[#8B958E]">
                কিবলার দিক
              </span>
            </div>
          </div>

          <div className="absolute -top-3 w-6 h-6 flex items-center justify-center pointer-events-none z-20">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-rose-600 drop-shadow-md" />
          </div>
        </div>
      </div>

      {isManualMode && (
        <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#181D19] dark:text-[#E1E5E1]">
              ম্যানুয়াল হেড রোটেটর (পরীক্ষা বা ডেস্কটপ)
            </span>
            <span className="font-bold text-[#176B4D] dark:text-[#9DD6B9]">
              বর্তমান হেড: {toBengaliNumerals(manualHeading)}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={manualHeading}
            onChange={(e) => setManualHeading(parseInt(e.target.value, 10))}
            className="w-full accent-[#176B4D] h-2 bg-black/10 dark:bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#717A74]">
            <span>০° (উত্তর)</span>
            <span>৯০° (পূর্ব)</span>
            <span>১৮০° (দক্ষিণ)</span>
            <span>২৭০° (পশ্চিম)</span>
            <span>৩৬০°</span>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#F0F5F1] dark:bg-[#1E2721] border border-black/5 dark:border-white/5 space-y-2 text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#176B4D] dark:text-[#9DD6B9]">
          <AlertCircle className="w-4 h-4" />
          <span>নির্ভুল কিবলা নির্ণয়ের জরুরি নির্দেশনা</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>
            মোবাইলটি কোনো সমতল টেবিলে বা হাতের তালুতে সম্পূর্ণ অনুভূমিকভাবে (ফ্ল্যাট) রাখুন।
          </li>
          <li>
            চৌম্বকীয় পদার্থ, ল্যাপটপ, স্পিকার বা ধাতব বস্তু থেকে ফোন দূরে রাখুন।
          </li>
          <li>
            বাংলাদেশে কিবলার দিক সাধারণত পশ্চিম দিক থেকে সামান্য ডান (উত্তর) দিকে হেলে থাকে (প্রায় ২৭৪° থেকে ২৭৮° কোণে)।
          </li>
        </ul>
      </div>
    </div>
  );
};
