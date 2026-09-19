import React, { useState } from 'react';
import { BookMarked, ChevronRight, ArrowLeft } from 'lucide-react';
import { HADITH_BOOKS, HADITH_ITEMS } from '../../data/hadithData';
import { HadithBook } from '../../types/hadith';
import { HadithCard } from './HadithCard';

interface HadithBooksViewProps {
  bookmarks: string[];
  onToggleBookmark: (hadithId: string) => void;
}

export const HadithBooksView: React.FC<HadithBooksViewProps> = ({
  bookmarks,
  onToggleBookmark,
}) => {
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);

  if (selectedBook) {
    const bookHadiths = HADITH_ITEMS.filter((h) => h.bookId === selectedBook.id);

    return (
      <div className="space-y-5">
        {/* Back Button & Book Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedBook(null)}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-[#176B4D] dark:text-[#9DD6B9] hover:bg-[#D4F2E2]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-extrabold text-base text-[#181D19] dark:text-[#E1E5E1]">
              {selectedBook.nameBengali}
            </h3>
            <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
              {selectedBook.compilerBengali} • মোট হাদিস: {selectedBook.totalHadithBengali} টি
            </p>
          </div>
        </div>

        {/* Book Description Box */}
        <div className="p-4 rounded-2xl bg-[#E8EFEA]/70 dark:bg-[#252F28] border border-[#176B4D]/15 text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
          {selectedBook.description}
        </div>

        {/* Hadith List in this Book */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#717A74] dark:text-[#8B958E]">
            <span>সংগৃহীত হাদিসসমূহ ({bookHadiths.length} টি)</span>
          </div>

          {bookHadiths.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 text-xs text-[#717A74] dark:text-[#8B958E]">
              এই গ্রন্থের অন্যান্য হাদিস শীঘ্রই সমৃদ্ধ করা হবে ইনশাআল্লাহ।
            </div>
          ) : (
            bookHadiths.map((hadith) => (
              <HadithCard
                key={hadith.id}
                hadith={hadith}
                isBookmarked={bookmarks.includes(hadith.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-gradient-to-r from-[#176B4D]/10 via-[#176B4D]/5 to-transparent border border-[#176B4D]/20 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#176B4D] dark:text-[#9DD6B9]">
            <BookMarked className="w-4 h-4" />
            <span>সিহাহ সিত্তাহ ও মূল হাদিস গ্রন্থ</span>
          </div>
          <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
            উম্মতের নির্ভরযোগ্য মুহাদ্দিসীনগণের রচিত মূল বিশুদ্ধ কিতাবসমূহ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {HADITH_BOOKS.map((book) => {
          const availableCount = HADITH_ITEMS.filter((h) => h.bookId === book.id).length;
          return (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedBook(book);
              }}
              className="group p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:border-[#176B4D] dark:hover:border-[#9DD6B9] shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-[#181D19] dark:text-[#E1E5E1] group-hover:text-[#176B4D] dark:group-hover:text-[#9DD6B9] transition-colors">
                      {book.nameBengali}
                    </h3>
                    <p className="text-[11px] font-serif text-[#176B4D] dark:text-[#9DD6B9] mt-0.5">
                      {book.nameArabic}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#176B4D] dark:text-[#9DD6B9] bg-[#D4F2E2]/60 dark:bg-[#005236]/40 px-2 py-0.5 rounded-full shrink-0">
                    {book.totalHadithBengali} হাদিস
                  </span>
                </div>

                <p className="text-xs font-medium text-[#717A74] dark:text-[#8B958E]">
                  সংকলক: {book.compilerBengali}
                </p>

                <p className="text-xs text-[#414A45] dark:text-[#C1CAC4] leading-relaxed line-clamp-2">
                  {book.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8EFEA] dark:border-[#3A4D43]/40 text-xs font-bold text-[#176B4D] dark:text-[#9DD6B9]">
                <span>হাদিস পড়ুন ({availableCount} টি)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
