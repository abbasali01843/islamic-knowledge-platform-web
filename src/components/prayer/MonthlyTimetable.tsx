import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Printer, RefreshCw } from 'lucide-react';
import type { LocationConfig, Madhab, CalculationMethod } from '../../types/prayer';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  toBengaliNumerals,
} from '../../utils/prayerCalculation';
import {
  fetchMonthlyPrayerTimes,
  type MonthlyPrayerTimes,
} from '../../services/prayerTimesApi';

interface MonthlyTimetableProps {
  location: LocationConfig;
  madhab: Madhab;
  method: CalculationMethod;
}

export const MonthlyTimetable: React.FC<MonthlyTimetableProps> = ({
  location,
  madhab,
  method,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [apiSchedule, setApiSchedule] = useState<MonthlyPrayerTimes[]>([]);
  const [source, setSource] = useState<'api' | 'calculated'>('calculated');
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNamesBengali = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchMonthlyPrayerTimes(year, month + 1, location, madhab, method, controller.signal)
      .then((schedule) => {
        if (!controller.signal.aborted) {
          setApiSchedule(schedule);
          setSource('api');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiSchedule([]);
          setSource('calculated');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [year, month, location, madhab, method]);

  const scheduleByDay = useMemo(
    () => new Map(apiSchedule.map((entry) => [entry.dayNumber, entry.timings])),
    [apiSchedule],
  );

  const monthSchedule = useMemo(() => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(Date.UTC(year, month, d, 12));
      const times = calculatePrayerTimes(
        date,
        location,
        madhab,
        method,
        scheduleByDay.get(d),
      );
      days.push({
        dayNumber: d,
        dayNameBengali: new Intl.DateTimeFormat('bn-BD', { weekday: 'short' }).format(date),
        times,
      });
    }
    return days;
  }, [daysInMonth, year, month, location, madhab, method, scheduleByDay]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28]">
        <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors" title="পূর্ববর্তী মাস">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <Calendar className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
          <div>
            <div className="font-bold text-base text-[#181D19] dark:text-[#E1E5E1]">
              {monthNamesBengali[month]} {toBengaliNumerals(year)}
            </div>
            <div className="text-[10px] text-[#717A74] mt-0.5">
              {location.nameBengali} • {source === 'api' ? 'AlAdhan অনলাইন' : 'স্থানীয় fallback'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={handlePrint}
            className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:flex" title="প্রিন্ট করুন">
            <Printer className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors" title="পরবর্তী মাস">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-[#717A74]">
          <RefreshCw className="w-4 h-4 animate-spin" /> অনলাইন সময়সূচি আপডেট হচ্ছে…
        </div>
      )}

      <div className="rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 overflow-hidden bg-white dark:bg-[#1A221C] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F0F5F1] dark:bg-[#222C25] text-[#414A45] dark:text-[#C1CAC4] border-b border-[#E8EFEA] dark:border-[#3A4D43]/60 font-semibold">
              <tr>
                <th className="py-3 px-3 text-center">তারিখ</th>
                <th className="py-3 px-2 text-rose-700 dark:text-rose-400">সেহরি শেষ</th>
                <th className="py-3 px-2">ফজর</th>
                <th className="py-3 px-2 text-[#717A74]">সূর্যোদয়</th>
                <th className="py-3 px-2">যোহর</th>
                <th className="py-3 px-2">আসর</th>
                <th className="py-3 px-2 text-emerald-700 dark:text-emerald-400 font-bold">ইফতার/মাগরিব</th>
                <th className="py-3 px-2">এশা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EFEA] dark:divide-[#3A4D43]/40">
              {monthSchedule.map((row) => {
                const isToday = isCurrentMonth && row.dayNumber === todayDate;
                return (
                  <tr key={row.dayNumber}
                    className={`transition-colors ${isToday
                      ? 'bg-[#D4F2E2] dark:bg-[#005236]/50 font-bold text-[#002114] dark:text-[#D4F2E2]'
                      : 'hover:bg-[#F7FAF7] dark:hover:bg-[#202922] text-[#181D19] dark:text-[#E1E5E1]'}`}>
                    <td className="py-2.5 px-3 text-center">
                      {toBengaliNumerals(row.dayNumber)} ({row.dayNameBengali})
                    </td>
                    <td className="py-2.5 px-2 text-rose-700 dark:text-rose-400 font-medium">
                      {formatTimeBengali(row.times.sehriEnd, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2">{formatTimeBengali(row.times.fajr, false, location.timezone)}</td>
                    <td className="py-2.5 px-2 text-[#717A74] dark:text-[#8B958E]">{formatTimeBengali(row.times.sunrise, false, location.timezone)}</td>
                    <td className="py-2.5 px-2">{formatTimeBengali(row.times.dhuhr, false, location.timezone)}</td>
                    <td className="py-2.5 px-2">{formatTimeBengali(row.times.asr, false, location.timezone)}</td>
                    <td className="py-2.5 px-2 text-emerald-700 dark:text-emerald-400 font-bold">{formatTimeBengali(row.times.maghrib, false, location.timezone)}</td>
                    <td className="py-2.5 px-2">{formatTimeBengali(row.times.isha, false, location.timezone)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-[#717A74] dark:text-[#8B958E] px-1 leading-relaxed">
        সময়সূচি AlAdhan-এর অনলাইন ক্যালেন্ডার থেকে নেওয়া হয়; API অনুপলব্ধ হলে অ্যাপের স্থানীয় হিসাব fallback হিসেবে ব্যবহৃত হয়। সেহরি শেষের সময়টি অ্যাপের সতর্কতামূলক হিসাব।
      </div>
    </div>
  );
};
