import { LastRead, NoteEntry } from '../types';

const bookmarks = new Set<string>();
const notes = new Map<string,string>();
let lastRead: LastRead | null = null;
let showArabic = true;
let showBengali = true;
let fontScale = 1;

function key(surahNumber:number, ayahNumber:number):string {
  return `${surahNumber}:${ayahNumber}`;
}
function noteKey(surahNumber:number, ayahNumber:number):string {
  return `${surahNumber}_${ayahNumber}`;
}

export const QuranPreferences = {
  isBookmarked(surahNumber:number, ayahNumber:number):boolean {
    return bookmarks.has(key(surahNumber,ayahNumber));
  },
  toggleBookmark(surahNumber:number, ayahNumber:number):boolean {
    const k=key(surahNumber,ayahNumber);
    if(bookmarks.has(k)){bookmarks.delete(k);return false;}
    bookmarks.add(k);return true;
  },
  removeBookmark(surahNumber:number, ayahNumber:number):void {
    bookmarks.delete(key(surahNumber,ayahNumber));
  },
  getBookmarks():Set<string> {
    return new Set(bookmarks);
  },
  getNote(surahNumber:number, ayahNumber:number):string {
    return notes.get(noteKey(surahNumber,ayahNumber)) || '';
  },
  saveNote(surahNumber:number, ayahNumber:number, note:string):void {
    const k=noteKey(surahNumber,ayahNumber);
    const trimmed=note.trim();
    if(trimmed) notes.set(k,trimmed); else notes.delete(k);
  },
  deleteNote(surahNumber:number, ayahNumber:number):void {
    notes.delete(noteKey(surahNumber,ayahNumber));
  },
  getAllNotes():NoteEntry[] {
    return Array.from(notes.entries()).map(([k,text])=>{
      const [surah,ayah]=k.split('_').map(Number);
      return {surahNumber:surah,ayahNumber:ayah,text};
    }).filter(x=>Number.isFinite(x.surahNumber)&&Number.isFinite(x.ayahNumber))
      .sort((a,b)=>a.surahNumber-b.surahNumber||a.ayahNumber-b.ayahNumber);
  },
  saveLastRead(surahNumber:number, ayahNumber:number):void {
    lastRead={surahNumber,ayahNumber};
  },
  getLastRead():LastRead|null {
    return lastRead;
  },
  getShowArabic():boolean { return showArabic; },
  setShowArabic(val:boolean):void { showArabic=val; },
  getShowBengali():boolean { return showBengali; },
  setShowBengali(val:boolean):void { showBengali=val; },
  getFontScale():number { return fontScale; },
  setFontScale(val:number):void { fontScale=Math.max(0.8,Math.min(1.5,val)); },
};
