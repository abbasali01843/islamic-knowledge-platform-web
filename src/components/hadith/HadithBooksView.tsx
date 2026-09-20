import React, { useEffect, useState } from 'react';
import { BookMarked, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { HadithBook, HadithItem } from '../../types/hadith';
import { HadithCard } from './HadithCard';
import { fetchHadithSection } from '../../services/hadithApi';

const BOOKS: HadithBook[] = [
  { id:'bukhari', nameBengali:'সহীহুল বুখারী', nameEnglish:'Sahih al-Bukhari', nameArabic:'صحيح البخاري', compilerBengali:'ইমাম আল-বুখারী (রহ.)', totalHadithBengali:'৭,৫৬৩', description:'অনলাইন API থেকে লোড হওয়া সহীহ বুখারীর হাদিস।' },
  { id:'muslim', nameBengali:'সহীহ মুসলিম', nameEnglish:'Sahih Muslim', nameArabic:'صحيح مسلم', compilerBengali:'ইমাম মুসলিম (রহ.)', totalHadithBengali:'৭,৫০০+', description:'অনলাইন API থেকে লোড হওয়া সহীহ মুসলিমের হাদিস।' },
  { id:'tirmidhi', nameBengali:'জামে আত-তিরমিযী', nameEnglish:'Jami at-Tirmidhi', nameArabic:'جامع الترمذي', compilerBengali:'ইমাম আত-তিরমিযী (রহ.)', totalHadithBengali:'৩,৯৫৬', description:'অনলাইন API থেকে লোড হওয়া জামে আত-তিরমিযীর হাদিস।' },
  { id:'abudawud', nameBengali:'সুনান আবু দাউদ', nameEnglish:'Sunan Abi Dawud', nameArabic:'سنن أبي داود', compilerBengali:'ইমাম আবু দাউদ (রহ.)', totalHadithBengali:'৫,২৭৪', description:'অনলাইন API থেকে লোড হওয়া সুনান আবু দাউদের হাদিস।' },
  { id:'nasai', nameBengali:'সুনান আন-নাসাঈ', nameEnglish:'Sunan an-Nasa’i', nameArabic:'سنن النسائي', compilerBengali:'ইমাম আন-নাসাঈ (রহ.)', totalHadithBengali:'৫,৭৫৮', description:'অনলাইন API থেকে লোড হওয়া সুনান আন-নাসাঈর হাদিস।' },
  { id:'ibnmajah', nameBengali:'সুনান ইবন মাজাহ', nameEnglish:'Sunan Ibn Majah', nameArabic:'سنن ابن ماجه', compilerBengali:'ইমাম ইবন মাজাহ (রহ.)', totalHadithBengali:'৪,৩৪১', description:'অনলাইন API থেকে লোড হওয়া সুনান ইবন মাজাহর হাদিস।' },
];

interface Props { bookmarks: string[]; onToggleBookmark: (id: string) => void; }

export const HadithBooksView: React.FC<Props> = ({ bookmarks, onToggleBookmark }) => {
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [items, setItems] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedBook) return;
    let cancelled = false;
    setLoading(true); setItems([]);
    fetchHadithSection(selectedBook.id, 1).then(data => {
      if (!cancelled) setItems(data);
    }).catch(() => {
      if (!cancelled) setItems([]);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedBook]);

  if (selectedBook) return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setSelectedBook(null)} className="ikp-focus-ring p-2.5 rounded-2xl ikp-surface dark:border-[#3A4D43]/60 text-[#176B4D]"><ArrowLeft className="w-5 h-5"/></button>
        <div><h3 className="font-extrabold text-base">{selectedBook.nameBengali}</h3><p className="text-xs text-[#717A74]">{selectedBook.compilerBengali} • মোট: {selectedBook.totalHadithBengali}</p></div>
      </div>
      <div className="p-4 rounded-2xl bg-[#E8EFEA]/70 dark:bg-[#252F28] text-xs leading-relaxed">{selectedBook.description} • প্রথম সেকশন অনলাইন API থেকে লোড হয়েছে।</div>
      {loading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#176B4D]"/></div> :
        items.length ? <div className="space-y-4">{items.map(h => <HadithCard key={h.id} hadith={h} isBookmarked={bookmarks.includes(h.id)} onToggleBookmark={onToggleBookmark}/>)}</div> :
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA]">এই গ্রন্থের অনলাইন ডেটা এখন পাওয়া যাচ্ছে না।</div>}
    </div>
  );

  return <div className="space-y-4">
    <div className="rounded-3xl p-5 bg-gradient-to-r from-[#176B4D]/10 to-transparent border border-[#176B4D]/20">
      <div className="flex items-center gap-1.5 font-bold text-sm text-[#176B4D]"><BookMarked className="w-4 h-4"/><span>প্রধান হাদিস গ্রন্থ</span></div>
      <p className="text-xs text-[#717A74] mt-1">গ্রন্থের হাদিস অনলাইন API থেকে সরাসরি লোড হয়; এই অ্যাপে কপি রাখা নেই।</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {BOOKS.map(book => <button type="button" key={book.id} onClick={() => setSelectedBook(book)} className="ikp-focus-ring group p-5 rounded-3xl ikp-surface hover:border-[#176B4D] shadow-xs text-left space-y-3">
        <div className="flex items-start justify-between gap-2"><div><h3 className="font-extrabold text-base">{book.nameBengali}</h3><p className="text-[11px] font-serif text-[#176B4D] mt-0.5">{book.nameArabic}</p></div><span className="text-[11px] font-bold text-[#176B4D] bg-[#D4F2E2]/60 px-2 py-0.5 rounded-full">{book.totalHadithBengali}</span></div>
        <p className="text-xs text-[#717A74]">সংকলক: {book.compilerBengali}</p>
        <p className="text-xs leading-relaxed text-[#414A45]">{book.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-[var(--ikp-border)] text-xs font-bold text-[#176B4D]"><span>অনলাইন হাদিস পড়ুন</span><ChevronRight className="w-4 h-4 group-hover:translate-x-1"/></div>
      </button>)}
    </div>
  </div>;
};
