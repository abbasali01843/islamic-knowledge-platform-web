import { LastRead, NoteEntry } from '../types';

const STORAGE_KEY = 'ikp-quran-prefs-v1';

type StoredPrefs = {
  bookmarks: string[];
  notes: Record<string, string>;
  lastRead: LastRead | null;
  showArabic: boolean;
  showBengali: boolean;
  fontScale: number;
};

const bookmarks = new Set<string>();
const notes = new Map<string, string>();
let lastRead: LastRead | null = null;
let showArabic = true;
let showBengali = true;
let fontScale = 1;
let hydrated = false;

function key(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

function noteKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}_${ayahNumber}`;
}

function loadFromStorage(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<StoredPrefs>;
    if (Array.isArray(data.bookmarks)) {
      data.bookmarks.forEach((k) => bookmarks.add(k));
    }
    if (data.notes && typeof data.notes === 'object') {
      Object.entries(data.notes).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim()) notes.set(k, v);
      });
    }
    if (
      data.lastRead &&
      typeof data.lastRead.surahNumber === 'number' &&
      typeof data.lastRead.ayahNumber === 'number'
    ) {
      lastRead = data.lastRead;
    }
    if (typeof data.showArabic === 'boolean') showArabic = data.showArabic;
    if (typeof data.showBengali === 'boolean') showBengali = data.showBengali;
    if (typeof data.fontScale === 'number') {
      fontScale = Math.max(0.8, Math.min(1.5, data.fontScale));
    }
  } catch {
    // ignore corrupt storage
  }
}

function saveToStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const data: StoredPrefs = {
      bookmarks: Array.from(bookmarks),
      notes: Object.fromEntries(notes.entries()),
      lastRead,
      showArabic,
      showBengali,
      fontScale,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota or private mode
  }
}

// Eager hydrate on module load in browser
if (typeof window !== 'undefined') {
  loadFromStorage();
}

export const QuranPreferences = {
  isBookmarked(surahNumber: number, ayahNumber: number): boolean {
    loadFromStorage();
    return bookmarks.has(key(surahNumber, ayahNumber));
  },

  toggleBookmark(surahNumber: number, ayahNumber: number): boolean {
    loadFromStorage();
    const k = key(surahNumber, ayahNumber);
    if (bookmarks.has(k)) {
      bookmarks.delete(k);
      saveToStorage();
      return false;
    }
    bookmarks.add(k);
    saveToStorage();
    return true;
  },

  removeBookmark(surahNumber: number, ayahNumber: number): void {
    loadFromStorage();
    bookmarks.delete(key(surahNumber, ayahNumber));
    saveToStorage();
  },

  getBookmarks(): Set<string> {
    loadFromStorage();
    return new Set(bookmarks);
  },

  getNote(surahNumber: number, ayahNumber: number): string {
    loadFromStorage();
    return notes.get(noteKey(surahNumber, ayahNumber)) || '';
  },

  saveNote(surahNumber: number, ayahNumber: number, note: string): void {
    loadFromStorage();
    const k = noteKey(surahNumber, ayahNumber);
    const trimmed = note.trim();
    if (trimmed) notes.set(k, trimmed);
    else notes.delete(k);
    saveToStorage();
  },

  deleteNote(surahNumber: number, ayahNumber: number): void {
    loadFromStorage();
    notes.delete(noteKey(surahNumber, ayahNumber));
    saveToStorage();
  },

  getAllNotes(): NoteEntry[] {
    loadFromStorage();
    return Array.from(notes.entries())
      .map(([k, text]) => {
        const [surah, ayah] = k.split('_').map(Number);
        return { surahNumber: surah, ayahNumber: ayah, text };
      })
      .filter((x) => Number.isFinite(x.surahNumber) && Number.isFinite(x.ayahNumber))
      .sort(
        (a, b) =>
          a.surahNumber - b.surahNumber || a.ayahNumber - b.ayahNumber
      );
  },

  saveLastRead(surahNumber: number, ayahNumber: number): void {
    loadFromStorage();
    lastRead = { surahNumber, ayahNumber };
    saveToStorage();
  },

  getLastRead(): LastRead | null {
    loadFromStorage();
    return lastRead;
  },

  getShowArabic(): boolean {
    loadFromStorage();
    return showArabic;
  },
  setShowArabic(val: boolean): void {
    loadFromStorage();
    showArabic = val;
    saveToStorage();
  },

  getShowBengali(): boolean {
    loadFromStorage();
    return showBengali;
  },
  setShowBengali(val: boolean): void {
    loadFromStorage();
    showBengali = val;
    saveToStorage();
  },

  getFontScale(): number {
    loadFromStorage();
    return fontScale;
  },
  setFontScale(val: number): void {
    loadFromStorage();
    fontScale = Math.max(0.8, Math.min(1.5, val));
    saveToStorage();
  },
};
