export interface HijriDateInfo {
  day: number;
  month: number;
  year: number;
  monthNameBengali: string;
  monthNameArabic: string;
  monthNameEnglish: string;
  dayNameBengali: string;
  isAyyamAlBeed: boolean;
}

export interface IslamicEvent {
  id: string;
  titleBengali: string;
  titleArabic: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthNameBengali: string;
  descriptionBengali: string;
  significanceBengali: string;
  recommendedAmalBengali: string[];
}
