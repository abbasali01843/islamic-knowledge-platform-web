import { HijriDateInfo } from '../types/calendar';
import { HIJRI_MONTHS, ISLAMIC_EVENTS } from '../data/calendarData';
import { toBengaliNumerals } from './prayerCalculation';

/**
 * Standard Kuwaiti/Tabular Gregorian to Hijri converter with user offset support
 */
export function getHijriDate(date: Date, offsetDays = 0): HijriDateInfo {
  // Adjust date by offset days if specified
  const targetDate = new Date(date);
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  const day = targetDate.getDate();
  const month = targetDate.getMonth(); // 0-indexed
  const year = targetDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;

  // Epoch of Hijri calendar is JD 1948439.5 (July 16, 622 CE)
  const z = jd - 1948439.5;
  const cyc = Math.floor(z / 10631);
  const rem = z - 10631 * cyc;
  const j = Math.floor((rem - 0.1335) / 354.36667);
  const hijriYear = 30 * cyc + j + 1;
  const remDays = rem - Math.floor(j * 354.36667 + 0.1335);

  let hijriMonth = Math.min(12, Math.floor((remDays + 28.5001) / 29.5) + 1);
  let hijriDay = Math.floor(remDays - Math.floor((hijriMonth - 1) * 29.5) + 1);

  if (hijriDay <= 0) {
    hijriMonth -= 1;
    if (hijriMonth <= 0) {
      hijriMonth = 12;
    }
    hijriDay = 30 + hijriDay;
  }

  if (hijriDay > 30) {
    hijriDay = 30;
  }

  const monthObj = HIJRI_MONTHS.find((item) => item.number === hijriMonth) || HIJRI_MONTHS[0];

  const daysBengali = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayNameBengali = daysBengali[targetDate.getDay()];

  const isAyyamAlBeed = hijriDay === 13 || hijriDay === 14 || hijriDay === 15;

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthNameBengali: monthObj.bengali,
    monthNameArabic: monthObj.arabic,
    monthNameEnglish: monthObj.english,
    dayNameBengali,
    isAyyamAlBeed,
  };
}

export function formatHijriDateBengali(hijri: HijriDateInfo): string {
  return `${toBengaliNumerals(hijri.day)} ${hijri.monthNameBengali}, ${toBengaliNumerals(hijri.year)} হিজরি`;
}

export function getUpcomingIslamicEvents(currentHijriMonth: number, currentHijriDay: number) {
  return ISLAMIC_EVENTS.map((event) => {
    let monthDiff = event.hijriMonth - currentHijriMonth;
    if (monthDiff < 0) {
      monthDiff += 12;
    }

    const approxDaysRemaining = monthDiff * 30 + (event.hijriDay - currentHijriDay);
    return {
      ...event,
      approxDaysRemaining: approxDaysRemaining < 0 ? approxDaysRemaining + 354 : approxDaysRemaining,
    };
  }).sort((a, b) => a.approxDaysRemaining - b.approxDaysRemaining);
}
