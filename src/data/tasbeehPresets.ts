import type { TasbeehPreset } from '../types/dua';

export const TASBEEH_PRESETS: TasbeehPreset[] = [
  { id: 'subhanallah', titleBengali: 'সুবহানাল্লাহ', arabicText: 'سُبْحَانَ اللَّهِ', meaningBengali: 'আল্লাহ অতি পবিত্র ও নিষ্পাপ', defaultTarget: 33, reference: 'সহীহ মুসলিম: ৫৯৭' },
  { id: 'alhamdulillah', titleBengali: 'আলহামদুলিল্লাহ', arabicText: 'الْحَمْدُ لِلَّهِ', meaningBengali: 'সমস্ত প্রশংসা একমাত্র আল্লাহর জন্য', defaultTarget: 33, reference: 'সহীহ মুসলিম: ৫৯৭' },
  { id: 'allahuakbar', titleBengali: 'আল্লাহু আকবার', arabicText: 'اللَّهُ أَكْبَرُ', meaningBengali: 'আল্লাহ সর্বশ্রেষ্ঠ ও মহান', defaultTarget: 34, reference: 'সহীহ মুসলিম: ৫৯৭' },
  { id: 'la-ilaha-illallah', titleBengali: 'লা ইলাহা ইল্লাল্লাহ', arabicText: 'لَا إِلَهَ إِلَّا اللَّهُ', meaningBengali: 'আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই', defaultTarget: 100, reference: 'সহীহ বুখারী: ৬৪০৩' },
  { id: 'astaghfirullah', titleBengali: 'আস্তাগফিরুল্লাহ', arabicText: 'أَسْتَغْفِرُ اللَّهَ', meaningBengali: 'আমি আল্লাহর নিকট ক্ষমা প্রার্থনা করছি', defaultTarget: 100, reference: 'সহীহ মুসলিম: ২৭০২ (রাসূলুল্লাহ ﷺ দিনে ১০০ বার ইস্তিগফার করতেন)' },
  { id: 'subhanallahi-wa-bihamdihi', titleBengali: 'সুবহানাল্লাহি ওয়া বিহামদিহী, সুবহানাল্লাহিল আযীম', arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', meaningBengali: 'আল্লাহর প্রশংসাসহ পবিত্রতা ঘোষণা করছি, মহান আল্লাহর পবিত্রতা ঘোষণা করছি', defaultTarget: 100, reference: 'সহীহ বুখারী: ৬৬৮২' },
  { id: 'durood-sharif', titleBengali: 'দরূদ শরীফ (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম)', arabicText: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', meaningBengali: 'তাঁর (মুহাম্মদ ﷺ-এর) ওপর আল্লাহর শান্তি ও রহমত বর্ষিত হোক', defaultTarget: 10, reference: 'সহীহ মুসলিম: ৩৮৪' },
  { id: 'la-hawla', titleBengali: 'লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ', arabicText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaningBengali: 'আল্লাহর সাহায্য ছাড়া পাপ থেকে ফেরার এবং নেক আমল করার কোনো সামর্থ্য নেই', defaultTarget: 33, reference: 'সহীহ বুখারী: ৪২০৫' },
];
