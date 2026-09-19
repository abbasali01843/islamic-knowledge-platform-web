export type DuaCategoryKey =
  | 'ALL'
  | 'MORNING_EVENING'
  | 'SLEEP'
  | 'PRAYER_SALAH'
  | 'FOOD_DRINK'
  | 'HOME_ENTER_EXIT'
  | 'TRAVEL_MOSQUE'
  | 'DISTRESS_FORGIVENESS'
  | 'SICKNESS_RUQYAH'
  | 'FAVORITES';

export interface DuaCategory {
  id: DuaCategoryKey;
  nameBengali: string;
  nameEnglish: string;
  iconName: string;
  description: string;
}

export interface DuaItem {
  id: string;
  category: DuaCategoryKey;
  subCategory?: string;
  titleBengali: string;
  arabicText: string;
  bengaliTransliteration: string;
  bengaliMeaning: string;
  reference: string;
  virtue?: string;
  repeatTarget?: number;
  tags?: string[];
  sourceLabel?: string;
  sourceUrl?: string;
}

export interface TasbeehPreset {
  id: string;
  titleBengali: string;
  arabicText: string;
  meaningBengali: string;
  defaultTarget: number;
  reference?: string;
}
