import { LastRead, NoteEntry } from '../types';

const KEY_BOOKMARKS = 'bookmarks';
const KEY_LAST_SURAH = 'last_read_surah';
const KEY_LAST_AYAH = 'last_read_ayah';
const KEY_SHOW_ARABIC = 'show_arabic';
const KEY_SHOW_BENGALI = 'show_bengali';
const KEY_FONT_SCALE = 'font_scale';

function getBookmarkSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_BOOKMARKS);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveBookmarkSet(set: Set<string>): void {
  try {
    localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function key(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

function noteKey(surahNumber: number, ayahNumber: number): string {
  return `note_${surahNumber}_${ayahNumber}`;
}

export const QuranPreferences = {
  isBookmarked(surahNumber: number, ayahNumber: number): boolean {
    return getBookmarkSet().has(key(surahNumber, ayahNumber));
  },

  toggleBookmark(surahNumber: number, ayahNumber: number): boolean {
    const set = getBookmarkSet();
    const k = key(surahNumber, ayahNumber);
    let bookmarked: boolean;
    if (set.has(k)) {
      set.delete(k);
      bookmarked = false;
    } else {
      set.add(k);
      bookmarked = true;
    }
    saveBookmarkSet(set);
    return bookmarked;
  },

  removeBookmark(surahNumber: number, ayahNumber: number): void {
    const set = getBookmarkSet();
    if (set.delete(key(surahNumber, ayahNumber))) {
      saveBookmarkSet(set);
    }
  },

  getBookmarks(): Set<string> {
    return getBookmarkSet();
  },

  getNote(surahNumber: number, ayahNumber: number): string {
    return localStorage.getItem(noteKey(surahNumber, ayahNumber)) || '';
  },

  saveNote(surahNumber: number, ayahNumber: number, note: string): void {
    const trimmed = note.trim();
    const k = noteKey(surahNumber, ayahNumber);
    if (!trimmed) {
      localStorage.removeItem(k);
    } else {
      localStorage.setItem(k, trimmed);
    }
  },

  deleteNote(surahNumber: number, ayahNumber: number): void {
    localStorage.removeItem(noteKey(surahNumber, ayahNumber));
  },

  getAllNotes(): NoteEntry[] {
    const notes: NoteEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey || !storageKey.startsWith('note_')) continue;
      const val = localStorage.getItem(storageKey);
      if (!val || !val.trim()) continue;
      const raw = storageKey.slice('note_'.length);
      const parts = raw.split('_');
      if (parts.length !== 2) continue;
      const surah = parseInt(parts[0], 10);
      const ayah = parseInt(parts[1], 10);
      if (isNaN(surah) || isNaN(ayah)) continue;
      notes.push({ surahNumber: surah, ayahNumber: ayah, text: val });
    }
    return notes.sort((a, b) => {
      if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
      return a.ayahNumber - b.ayahNumber;
    });
  },

  saveLastRead(surahNumber: number, ayahNumber: number): void {
    try {
      localStorage.setItem(KEY_LAST_SURAH, surahNumber.toString());
      localStorage.setItem(KEY_LAST_AYAH, ayahNumber.toString());
    } catch {
      // ignore
    }
  },

  getLastRead(): LastRead | null {
    try {
      const s = parseInt(localStorage.getItem(KEY_LAST_SURAH) || '-1', 10);
      const a = parseInt(localStorage.getItem(KEY_LAST_AYAH) || '-1', 10);
      return s > 0 && a > 0 ? { surahNumber: s, ayahNumber: a } : null;
    } catch {
      return null;
    }
  },

  getShowArabic(): boolean {
    const val = localStorage.getItem(KEY_SHOW_ARABIC);
    return val === null ? true : val === 'true';
  },

  setShowArabic(val: boolean): void {
    localStorage.setItem(KEY_SHOW_ARABIC, String(val));
  },

  getShowBengali(): boolean {
    const val = localStorage.getItem(KEY_SHOW_BENGALI);
    return val === null ? true : val === 'true';
  },

  setShowBengali(val: boolean): void {
    localStorage.setItem(KEY_SHOW_BENGALI, String(val));
  },

  getFontScale(): number {
    const val = parseFloat(localStorage.getItem(KEY_FONT_SCALE) || '1');
    return isNaN(val) ? 1 : Math.max(0.8, Math.min(1.5, val));
  },

  setFontScale(val: number): void {
    const clamped = Math.max(0.8, Math.min(1.5, val));
    localStorage.setItem(KEY_FONT_SCALE, clamped.toString());
  },
};
