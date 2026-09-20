import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  CheckCircle,
  Flame,
  ChevronDown,
} from 'lucide-react';
import type { TasbeehPreset } from '../../types/dua';
import { TASBEEH_PRESETS } from '../../data/tasbeehPresets';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

export const TasbeehCounter: React.FC = () => {
  const [activePreset, setActivePreset] = useState<TasbeehPreset>(TASBEEH_PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(TASBEEH_PRESETS[0].defaultTarget);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [lifetimeTotal, setLifetimeTotal] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Gentle synthesized web audio tick
  const playTickSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtxRef.current.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.04);
    } catch {
      // Audio autoplay might be limited
    }
  }, [soundEnabled]);

  const triggerVibration = useCallback(() => {
    if (vibrationEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
  }, [vibrationEnabled]);

  const handleIncrement = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);

    playTickSound();
    triggerVibration();

    const nextCount = count + 1;
    const nextLifetime = lifetimeTotal + 1;
    setLifetimeTotal(nextLifetime);
    localStorage.setItem('tasbeeh_lifetime_total', nextLifetime.toString());

    if (nextCount >= target) {
      setCount(0);
      setCyclesCompleted((prev) => prev + 1);
      // Extra celebratory vibration when cycle completes
      if (vibrationEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 80]);
        } catch {
          // ignore
        }
      }
    } else {
      setCount(nextCount);
    }
  };

  const handleResetCurrent = () => {
    setCount(0);
  };

  const handleSelectPreset = (preset: TasbeehPreset) => {
    setActivePreset(preset);
    setTarget(preset.defaultTarget);
    setCount(0);
    setIsMenuOpen(false);
  };

  // Keyboard spacebar support for quick counting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count, target, lifetimeTotal, soundEnabled, vibrationEnabled]);

  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="space-y-6">
      {/* Preset Selector Card */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#717A74] dark:text-[#8B958E] uppercase tracking-wider">
            বর্তমান নির্বাচিত জিকির
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ikp-focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8EFEA] dark:bg-[#252F28] hover:bg-[#dce7e0] text-xs font-semibold text-[#176B4D] dark:text-[#9DD6B9] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>জিকির পরিবর্তন</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Selected Zikr display */}
        <div className="space-y-1.5">
          <div
            dir="rtl"
            className="text-2xl sm:text-3xl font-serif text-[#176B4D] dark:text-[#9DD6B9] font-normal leading-relaxed"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {activePreset.arabicText}
          </div>
          <h3 className="text-base font-bold text-[#181D19] dark:text-[#E1E5E1]">
            {activePreset.titleBengali}
          </h3>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
            {activePreset.meaningBengali}
          </p>
          {activePreset.reference && (
            <span className="inline-block text-[11px] font-semibold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-2.5 py-0.5 rounded-md mt-1">
              {activePreset.reference}
            </span>
          )}
        </div>

        {/* Dropdown presets drawer */}
        {isMenuOpen && (
          <div className="pt-3 border-t border-[#E8EFEA] dark:border-[#3A4D43]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
            {TASBEEH_PRESETS.map((preset) => {
              const isCurrent = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] font-bold'
                      : 'bg-[#F7FAF7] dark:bg-[#202922] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#E8EFEA]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold">
                      {preset.titleBengali}
                    </span>
                    <span className="block text-[10px] opacity-75">
                      লক্ষ্য: {toBengaliNumerals(preset.defaultTarget)} বার
                    </span>
                  </div>
                  {isCurrent && <CheckCircle className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Target & Settings Strip */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#717A74] dark:text-[#8B958E]">টার্গেট:</span>
          {[33, 100, 500].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                setTarget(num);
                setCount(0);
              }}
              className={`ikp-focus-ring px-2.5 py-1 rounded-lg font-bold transition-all ${
                target === num
                  ? 'bg-[#176B4D] text-white'
                  : 'bg-white dark:bg-[#1A221C] text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              {toBengaliNumerals(num)}
            </button>
          ))}
        </div>

        {/* Audio & Haptic Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`ikp-focus-ring p-2 rounded-xl transition-colors ${
              soundEnabled
                ? 'bg-[#176B4D] text-white'
                : 'bg-white dark:bg-[#1A221C] text-[#717A74]'
            }`}
            title={soundEnabled ? 'শব্দ বন্ধ করুন' : 'শব্দ চালু করুন'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`ikp-focus-ring p-2 rounded-xl transition-colors ${
              vibrationEnabled
                ? 'bg-[#176B4D] text-white'
                : 'bg-white dark:bg-[#1A221C] text-[#717A74]'
            }`}
            title={vibrationEnabled ? 'ভাইব্রেশন বন্ধ করুন' : 'ভাইব্রেশন চালু করুন'}
          >
            <Vibrate className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCurrent}
            className="p-2 rounded-xl bg-white dark:bg-[#1A221C] text-[#717A74] hover:text-rose-600 transition-colors"
            title="গণনা রিসেট করুন"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Giant Circular Clicker Button */}
      <div className="flex flex-col items-center justify-center py-6">
        <button
          type="button"
          onClick={handleIncrement}
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none shadow-2xl active:scale-95 focus:outline-hidden ${
            isPressing
              ? 'ring-8 ring-[#176B4D]/30 scale-95'
              : 'ring-4 ring-[#176B4D]/15 dark:ring-[#9DD6B9]/15'
          } bg-gradient-to-br from-[#176B4D] via-[#10593E] to-[#093C29] text-white`}
        >
          {/* Subtle Outer Progress Ring SVG */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1.5">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="text-white/10 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="text-[#9DD6B9] stroke-current transition-all duration-200"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Content */}
          <span className="text-xs uppercase tracking-widest text-[#9DD6B9] font-bold">
            ট্যাপ করুন
          </span>
          <div className="text-6xl sm:text-7xl font-extrabold font-sans my-1 tracking-tight">
            {toBengaliNumerals(count)}
          </div>
          <span className="text-xs text-white/80 font-medium">
            টার্গেট: {toBengaliNumerals(target)} ({toBengaliNumerals(progressPercent)}%)
          </span>

          <div className="mt-3 text-[11px] px-3 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-xs font-semibold">
            চক্র সম্পন্ন: {toBengaliNumerals(cyclesCompleted)} বার
          </div>
        </button>

        <p className="text-[11px] text-[#717A74] dark:text-[#8B958E] mt-4 text-center">
          কীবোর্ডের স্পেসবার (Spacebar) চেপেও গণনা করতে পারেন
        </p>
      </div>

      {/* Lifetime / Total Count Banner */}
      <div className="p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#176B4D] text-white flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#181D19] dark:text-[#E1E5E1]">
              সর্বমোট জিকির সংখ্যা
            </h4>
            <span className="text-[10px] text-[#717A74] dark:text-[#8B958E]">
              এই সেশনে মোট তাসবীহ
            </span>
          </div>
        </div>
        <span className="text-lg font-extrabold text-[#176B4D] dark:text-[#9DD6B9] font-sans">
          {toBengaliNumerals(lifetimeTotal)}
        </span>
      </div>
    </div>
  );
};
