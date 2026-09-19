import { ReaderAyah } from '../types';

const API_ROOT = 'https://api.alquran.cloud/v1';
const ARABIC_EDITION = 'quran-uthmani';
const BENGALI_EDITION = 'bn.bengali';
const SOURCE = 'কুরআন: Al Quran Cloud API • Arabic: quran-uthmani • বাংলা edition: bn.bengali';

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz?: number;
  hizbQuarter?: number;
  page?: number;
  sajda?: boolean | { id?: number; recommended?: boolean; obligatory?: boolean };
}

interface ApiSurah {
  ayahs: ApiAyah[];
}

interface ApiResponse {
  code: number;
  status: string;
  data: ApiSurah;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('কুরআন API সংযোগ ব্যর্থ (' + response.status + ')');
  const payload = (await response.json()) as T;
  return payload;
}

function hasSajdah(value: ApiAyah['sajda']): boolean {
  return typeof value === 'boolean' ? value : Boolean(value);
}

function normalize(arabic: ApiAyah[], bengali: ApiAyah[]): ReaderAyah[] {
  const bn = new Map(bengali.map((ayah) => [ayah.numberInSurah, ayah]));
  return arabic.map((ayah) => {
    const translation = bn.get(ayah.numberInSurah);
    return {
      number: ayah.numberInSurah,
      arabic: ayah.text,
      bengali: translation?.text ?? '',
      juz: ayah.juz ?? null,
      hizb: ayah.hizbQuarter ?? null,
      page: ayah.page ?? null,
      hasSajdah: hasSajdah(ayah.sajda),
    };
  });
}

export class QuranReaderRepository {
  static async ayahsForSurah(surahNumber: number): Promise<ReaderAyah[]> {
    const [arabic, bengali] = await Promise.all([
      getJson<ApiResponse>(API_ROOT + '/surah/' + surahNumber + '/' + ARABIC_EDITION),
      getJson<ApiResponse>(API_ROOT + '/surah/' + surahNumber + '/' + BENGALI_EDITION),
    ]);
    if (arabic.code !== 200 || bengali.code !== 200) throw new Error('কুরআন ডেটা পাওয়া যায়নি');
    return normalize(arabic.data.ayahs, bengali.data.ayahs);
  }

  static async firstAyahForJuz(juz: number): Promise<{ surahNumber: number; ayah: ReaderAyah } | null> {
    const payload = await getJson<ApiResponse>(API_ROOT + '/juz/' + juz + '/' + ARABIC_EDITION);
    const first = payload.data.ayahs[0];
    return first ? {
      surahNumber: Number((first as ApiAyah & { surah?: { number?: number } }).surah?.number ?? 1),
      ayah: {
        number: first.numberInSurah,
        arabic: first.text,
        bengali: '',
        juz: first.juz ?? juz,
        hizb: first.hizbQuarter ?? null,
        page: first.page ?? null,
        hasSajdah: hasSajdah(first.sajda),
      },
    } : null;
  }

  static async firstAyahForPage(page: number): Promise<{ surahNumber: number; ayah: ReaderAyah } | null> {
    const payload = await getJson<ApiResponse>(API_ROOT + '/page/' + page + '/' + ARABIC_EDITION);
    const first = payload.data.ayahs[0];
    return first ? {
      surahNumber: Number((first as ApiAyah & { surah?: { number?: number } }).surah?.number ?? 1),
      ayah: {
        number: first.numberInSurah,
        arabic: first.text,
        bengali: '',
        juz: first.juz ?? null,
        hizb: first.hizbQuarter ?? null,
        page: first.page ?? page,
        hasSajdah: hasSajdah(first.sajda),
      },
    } : null;
  }

  static sourceAttribution(): string {
    return SOURCE;
  }
}
