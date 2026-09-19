import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Moon,
  Sparkles,
  Clock,
} from 'lucide-react';
import {
  getHijriDate,
  formatHijriDateBengali,
  getUpcomingIslamicEvents,
} from '../../utils/hijriCalendar';
import { HIJRI_MONTHS } from '../../data/calendarData';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

interface CalendarScreenProps {
  onBack: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onBack }) => {
  const [offsetDays, setOffsetDays] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hijri_offset_days');
      if (saved) return parseInt(saved, 10) || 0;
    }
    return 0;
  });

  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    localStorage.setItem('hijri_offset_days', offsetDays.toString());
  }, [offsetDays]);

  const today = useMemo(() => new Date(), []);
  const currentHijri = useMemo(
    () => getHijriDate(today, offsetDays),
    [today, offsetDays]
  );

  const upcomingEvents = useMemo(
    () => getUpcomingIslamicEvents(currentHijri.month, currentHijri.day),
    [currentHijri]
  );

  const convertedHijri = useMemo(() => {
    const d = new Date(customDate);
    return isNaN(d.getTime()) ? null : getHijriDate(d, offsetDays);
  }, [customDate, offsetDays]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300 pb-24">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-[#176B4D] dark:text-[#9DD6B9] hover:bg-[#D4F2E2]/30 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#181D19] dark:text-[#E1E5E1]">
            হিজরি ক্যালেন্ডার ও বিশেষ দিনসমূহ
          </h1>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
            ইসলামিক মাস, চাঁদের তারিখ, আইয়ামে বীজ ও গুরুত্বপূর্ণ ধর্মীয় দিন
          </p>
        </div>
      </div>

      {/* Hijri Current Date Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white shadow-md space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9DD6B9] flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              আজকের হিজরি তারিখ
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
            {currentHijri.dayNameBengali}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatHijriDateBengali(currentHijri)}
            </div>
            <span
              dir="rtl"
              className="text-lg text-white/80 font-serif block mt-1"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {toBengaliNumerals(currentHijri.day)} {currentHijri.monthNameArabic}{' '}
              {toBengaliNumerals(currentHijri.year)} هـ
            </span>
          </div>
        </div>

        {/* Ayyam al-beed badge */}
        {currentHijri.isAyyamAlBeed && (
          <div className="p-3 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-100 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              আজ আইয়ামে বীজের রোজা (চান্দ্র মাসের ১৩, ১৪, ১৫ তারিখের অন্যতম)। নফল রোজা রাখা সুন্নাত ও অসীম সওয়াবপূর্ণ।
            </span>
          </div>
        )}

        {/* Moon adjustment control */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-white/80">
            চাঁদ দেখার তারতম্য সমন্বয় (হিজরি অফসেট):
          </span>
          <div className="flex items-center gap-1">
            {[-2, -1, 0, 1, 2].map((offset) => (
              <button
                key={offset}
                type="button"
                onClick={() => setOffsetDays(offset)}
                className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
                  offsetDays === offset
                    ? 'bg-white text-[#176B4D] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {offset > 0 ? `+${toBengaliNumerals(offset)}` : toBengaliNumerals(offset)} দিন
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ayyam al-Beed Info Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-2">
        <h3 className="font-extrabold text-sm text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
          <span>আইয়ামে বীজের রোজা (প্রতি মাসের ১৩, ১৪ ও ১৫ তারিখ)</span>
        </h3>
        <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
          রাসূলুল্লাহ ﷺ বলেছেন: "প্রতি মাসে তিন দিন রোজা রাখা পুরো বছর রোজা রাখার সমান।" (সহীহ বুখারী: ১৯৭৫)। চলতি মাসে এই দিনগুলো অত্যন্ত বরকতময়।
        </p>
      </div>

      {/* Date Converter Tool */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
          <span>তারিখ রূপান্তরক (খ্রিস্টাব্দ ⇄ হিজরি)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-[#414A45] dark:text-[#C1CAC4] block mb-1">
              যেকোনো ইংরেজি তারিখ নির্বাচন করুন:
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-[#F4F8F5] dark:bg-[#252F28] text-xs font-bold"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#D4F2E2]/30 dark:bg-[#005236]/20 border border-[#176B4D]/20">
            <span className="text-[11px] text-[#717A74] dark:text-[#8B958E] block">
              সমমানের হিজরি তারিখ:
            </span>
            <span className="text-sm font-extrabold text-[#176B4D] dark:text-[#9DD6B9] block mt-0.5">
              {convertedHijri ? formatHijriDateBengali(convertedHijri) : 'তারিখ প্রদান করুন'}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Islamic Events Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#181D19] dark:text-[#E1E5E1] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>আসন্ন গুরুত্বপূর্ণ ইসলামি দিবস ও রজনী</span>
          </h3>
          <span className="text-xs text-[#717A74] dark:text-[#8B958E]">
            ক্রম অনুযায়ী সাজানো
          </span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                      {evt.titleBengali}
                    </h4>
                  </div>
                  <span
                    dir="rtl"
                    className="text-xs font-serif text-[#176B4D] dark:text-[#9DD6B9] mt-0.5 block"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {evt.titleArabic}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] text-[#176B4D] dark:text-[#9DD6B9] text-xs font-bold block">
                    {toBengaliNumerals(evt.hijriDay)} {evt.hijriMonthNameBengali}
                  </span>
                  {evt.approxDaysRemaining !== undefined && (
                    <span className="text-[10px] text-[#717A74] dark:text-[#8B958E] block mt-1">
                      প্রায় {toBengaliNumerals(evt.approxDaysRemaining)} দিন পর
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
                {evt.descriptionBengali}
              </p>

              {/* Significance */}
              <div className="p-3 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] border border-[#176B4D]/10 text-xs text-[#181D19] dark:text-[#E1E5E1] flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#176B4D] dark:text-[#9DD6B9] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-[#176B4D] dark:text-[#9DD6B9] block mb-0.5">
                    তাৎপর্য ও ফজিলত:
                  </strong>
                  <span>{evt.significanceBengali}</span>
                </div>
              </div>

              {/* Recommended Amals */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#717A74] dark:text-[#8B958E] uppercase tracking-wider block">
                  করণীয় নেক আমলসমূহ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evt.recommendedAmalBengali.map((amal) => (
                    <span
                      key={amal}
                      className="px-2.5 py-1 rounded-xl bg-[#E8EFEA] dark:bg-[#252F28] text-[11px] text-[#181D19] dark:text-[#E1E5E1] font-semibold"
                    >
                      ✓ {amal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Hijri Months Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#181D19] dark:text-[#E1E5E1]">
          ১২টি হিজরি মাসের তালিকা
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {HIJRI_MONTHS.map((m) => (
            <div
              key={m.number}
              className={`p-3 rounded-2xl border ${
                m.number === currentHijri.month
                  ? 'bg-emerald-50 dark:bg-[#005236]/30 border-emerald-500/40 text-[#176B4D] dark:text-[#9DD6B9] font-bold'
                  : 'bg-white dark:bg-[#1A221C] border-[#E8EFEA] dark:border-[#3A4D43]/60 text-[#414A45] dark:text-[#C1CAC4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>
                  {toBengaliNumerals(m.number)}. {m.bengali}
                </span>
                <span className="font-serif text-[11px]">{m.arabic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
