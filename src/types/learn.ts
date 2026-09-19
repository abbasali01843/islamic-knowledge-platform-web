export type WuduStepType = 'FARZ' | 'SUNNAH' | 'MUSTAHAB';

export interface WuduStep {
  stepNumber: number;
  titleBengali: string;
  type: WuduStepType;
  typeLabelBengali: string;
  descriptionBengali: string;
  arabicDua?: string;
  transliterationBengali?: string;
  duaMeaningBengali?: string;
}

export interface PrayerRakatItem {
  prayerId: string;
  prayerNameBengali: string;
  timeBengali: string;
  sunnahMuakkadahPre?: number;
  farz: number;
  sunnahMuakkadahPost?: number;
  sunnahGhairMuakkadah?: number;
  witr?: number;
  nafl?: number;
  totalRakat: number;
  notesBengali?: string;
}

export interface SalahStepItem {
  id: string;
  stepNumber: number;
  titleBengali: string;
  postureNameBengali: string;
  arabicText: string;
  transliterationBengali: string;
  meaningBengali: string;
  instructionsBengali: string;
}

export interface SalahEssentialDua {
  id: string;
  titleBengali: string;
  timingBengali: string;
  arabicText: string;
  transliterationBengali: string;
  meaningBengali: string;
  instructionsBengali?: string;
  referenceBengali: string;
}
