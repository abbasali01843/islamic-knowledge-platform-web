import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Printer } from 'lucide-react';
import { LocationConfig, Madhab, CalculationMethod } from '../../types/prayer';
import {
  calculatePrayerTimes,
  formatTimeBengali,
  toBengaliNumerals,
} from '../../utils/prayerCalculation';

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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesBengali = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];

  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Generate prayer times for each day in this month
  const monthSchedule = useMemo(() => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(year, month, d, 12));
      const times = calculatePrayerTimes(date, location, madhab, method);
      days.push({
        dayNumber: d,
        dayNameBengali: date.toLocaleDateString('bn-BD', { weekday: 'short' }),
        times,
      });
    }
    return days;
  }, [year, month, daysInMonth, location, madhab, method]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation Card */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="পূর্ববর্তী মাস"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <Calendar className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
          <span className="font-bold text-base text-[#181D19] dark:text-[#E1E5E1]">
            {monthNamesBengali[month]} {toBengaliNumerals(year)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[#176B4D]/10 text-[#176B4D] dark:text-[#9DD6B9] font-medium">
            {location.nameBengali}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:flex"
            title="প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="পরবর্তী মাস"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timetable Table */}
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
                const { times } = row;

                return (
                  <tr
                    key={row.dayNumber}
                    className={`transition-colors ${
                      isToday
                        ? 'bg-[#D4F2E2] dark:bg-[#005236]/50 font-bold text-[#002114] dark:text-[#D4F2E2]'
                        : 'hover:bg-[#F7FAF7] dark:hover:bg-[#202922] text-[#181D19] dark:text-[#E1E5E1]'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded-md text-xs font-semibold">
                        {toBengaliNumerals(row.dayNumber)} ({row.dayNameBengali})
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-rose-700 dark:text-rose-400 font-medium">
                      {formatTimeBengali(times.sehriEnd, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2">
                      {formatTimeBengali(times.fajr, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2 text-[#717A74] dark:text-[#8B958E]">
                      {formatTimeBengali(times.sunrise, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2">
                      {formatTimeBengali(times.dhuhr, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2">
                      {formatTimeBengali(times.asr, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      {formatTimeBengali(times.maghrib, false, location.timezone)}
                    </td>
                    <td className="py-2.5 px-2">
                      {formatTimeBengali(times.isha, false, location.timezone)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-[#717A74] dark:text-[#8B958E] px-1 space-y-1 leading-relaxed">
        <p>• সেহরি শেষ সময় সতর্কতামূলকভাবে ফজরের ওয়াক্ত শুরু থেকে ১০ মিনিট পূর্বে নির্ধারিত।</p>
        <p>• সূর্যাস্তের সঙ্গে সঙ্গেই ইফতার ও মাগরিবের ওয়াক্ত শুরু হয়।</p>
      </div>
    </div>
  );
};
