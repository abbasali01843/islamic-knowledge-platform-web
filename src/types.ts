export type RevelationType = 'MECCAN' | 'MEDINAN' | 'UNKNOWN';

export interface Surah {
  id: number;
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBengali: string;
  revelationType: RevelationType;
  ayahCount: number;
  revelationOrder?: number;
}

export interface ReaderAyah {
  number: number;
  arabic: string;
  bengali: string;
  juz?: number | null;
  hizb?: number | null;
  page?: number | null;
  hasSajdah?: boolean;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
}

export interface NoteEntry {
  surahNumber: number;
  ayahNumber: number;
  text: string;
}

export interface BookmarkEntry {
  surah: Surah;
  ayah?: ReaderAyah;
  ayahNumber: number;
}

export interface NoteListItem {
  surah: Surah;
  entry: NoteEntry;
}

export type HomeDestination =
  | 'QURAN'
  | 'HADITH'
  | 'PRAYER'
  | 'DUA'
  | 'LEARN_SALAH'
  | 'ZAKAT'
  | 'CALENDAR'
  | 'RAMADAN';

export type QuranLibraryTab = 'SURAHS' | 'JUZ' | 'PAGES' | 'BOOKMARKS' | 'NOTES';
