export type HadithGrade = 'SAHIH' | 'HASAN' | 'MUTTAFAAQ_ALAIH' | 'UNKNOWN';

export interface HadithBook {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  nameArabic: string;
  compilerBengali: string;
  totalHadithBengali: string;
  description: string;
}

export interface HadithTopic {
  id: string;
  titleBengali: string;
  titleEnglish: string;
  iconName: string;
  description: string;
}

export interface HadithItem {
  id: string;
  bookId: string;
  bookNameBengali: string;
  hadithNumber: number | string;
  chapterNameBengali: string;
  narratorBengali: string;
  arabicText: string;
  bengaliText: string;
  grade: HadithGrade;
  gradeLabelBengali: string;
  explanationBengali?: string;
  topicId: string;
  tags: string[];
  sourceLabel?: string;
  sourceUrl?: string;
  isNawawi40?: boolean;
  nawawiNumber?: number;
}
