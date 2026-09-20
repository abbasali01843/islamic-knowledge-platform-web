import type { HadithGrade, HadithItem } from '../types/hadith';

const API_ROOT = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const SOURCE_LABEL = 'Fawaz Ahmed Hadith API';
const SOURCE_URL = 'https://github.com/fawazahmed0/hadith-api';

type ApiHadith = { hadithnumber?: number | string; hadithNumber?: number | string; text?: string; hadithArabic?: string; hadithBengali?: string; reference?: { hadith?: number | string }; grades?: Array<{ grade?: string }>; grade?: string };
const BOOKS = [
  { id: 'bukhari', api: 'bukhari', name: 'সহীহুল বুখারী' },
  { id: 'muslim', api: 'muslim', name: 'সহীহ মুসলিম' },
  { id: 'tirmidhi', api: 'tirmidhi', name: 'জামে আত-তিরমিযী' },
  { id: 'abudawud', api: 'abudawud', name: 'সুনান আবু দাউদ' },
  { id: 'nasai', api: 'nasai', name: 'সুনান আন-নাসাঈ' },
  { id: 'ibnmajah', api: 'ibnmajah', name: 'সুনান ইবন মাজাহ' },
  { id: 'nawawi', api: 'nawawi', name: 'ইমাম নববীর ৪০ হাদিস' },
] as const;

const REQUEST_TIMEOUT_MS = 10000;

async function getJson(url: string): Promise<unknown> {
  const urls = [url.replace('.json', '.min.json'), url];
  let lastError: unknown;
  for (const candidate of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(candidate, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) throw new Error('Hadith API ' + response.status);
        return await response.json();
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Hadith API unavailable');
}
function rows(payload: unknown): ApiHadith[] {
  if (Array.isArray(payload)) return payload as ApiHadith[];
  if (payload && typeof payload === 'object') {
    const value = payload as { hadiths?: unknown; data?: unknown };
    const data = value.hadiths ?? value.data;
    if (Array.isArray(data)) return data as ApiHadith[];
  }
  return [];
}
function numberOf(item: ApiHadith, fallback: number): number {
  const value = item.hadithnumber ?? item.hadithNumber ?? item.reference?.hadith ?? fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function gradeOf(item: ApiHadith): HadithGrade {
  const raw = String(item.grade ?? item.grades?.[0]?.grade ?? '').toLowerCase().trim();
  if (raw.includes('hasan')) return 'HASAN';
  if (raw.includes('sahih') || raw.includes('ṣaḥīḥ')) return 'SAHIH';
  if (raw.includes('muttafa')) return 'MUTTAFAAQ_ALAIH';
  return 'UNKNOWN';
}
function normalizePair(book: (typeof BOOKS)[number], arabic: ApiHadith[], bengali: ApiHadith[]): HadithItem[] {
  const byNumber = new Map<number, ApiHadith>();
  bengali.forEach((item, index) => byNumber.set(numberOf(item, index + 1), item));
  return arabic.map((ar, index) => {
    const number = numberOf(ar, index + 1);
    const bn = byNumber.get(number);
    const grade = gradeOf(ar);
    return {
      id: 'api-' + book.id + '-' + number, bookId: book.id, bookNameBengali: book.name, hadithNumber: number,
      chapterNameBengali: 'অনলাইন হাদিস সংগ্রহ', narratorBengali: '',
      arabicText: ar.text ?? ar.hadithArabic ?? '', bengaliText: bn?.text ?? bn?.hadithBengali ?? '',
      grade, gradeLabelBengali: grade === 'HASAN' ? 'হাসান' : grade === 'SAHIH' ? 'সহীহ' : grade === 'MUTTAFAAQ_ALAIH' ? 'মুত্তাফাকুন আলাইহ' : 'মান যাচাই করা হয়নি', topicId: 'ALL', tags: ['api', book.id], sourceLabel: SOURCE_LABEL, sourceUrl: SOURCE_URL
    };
  }).filter(item => item.arabicText && item.bengaliText);
}
async function fetchSection(book: (typeof BOOKS)[number], section: number): Promise<HadithItem[]> {
  const [arabic, bengali] = await Promise.all([
    getJson(API_ROOT + '/editions/ara-' + book.api + '/sections/' + section + '.json'),
    getJson(API_ROOT + '/editions/ben-' + book.api + '/sections/' + section + '.json'),
  ]);
  return normalizePair(book, rows(arabic), rows(bengali));
}
export async function fetchHadithSection(bookId: string, section: number): Promise<HadithItem[]> {
  const book = BOOKS.find((item) => item.id === bookId);
  if (!book) throw new Error('Unknown Hadith book: ' + bookId);
  return fetchSection(book, section);
}

export async function fetchLiveHadiths(): Promise<{ items: HadithItem[]; fromCache: boolean }> {
  const results = await Promise.allSettled(BOOKS.map(book => fetchSection(book, 1)));
  const items = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  if (!items.length) throw new Error('Hadith API unavailable');
  return { items, fromCache: false };
}
