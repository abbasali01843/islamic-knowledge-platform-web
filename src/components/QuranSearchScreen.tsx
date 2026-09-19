import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Surah } from '../types';
import { findQuranSurah } from '../data/quranCatalog';
import { QuranReaderRepository } from '../data/quranRepository';

interface QuranSearchScreenProps {
  onResultClick: (surah: Surah, ayahNumber: number) => void;
}

export const QuranSearchScreen: React.FC<QuranSearchScreenProps> = ({ onResultClick }) => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim();

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return QuranReaderRepository.search(normalizedQuery).slice(0, 100);
  }, [normalizedQuery]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-[#181D19] dark:text-[#E1E5E1]">
        কুরআন অনুসন্ধান
      </h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717A74] dark:text-[#8B958E]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="আরবি বা বাংলা লিখুন"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#1E2620] border border-[#C1CAC4] dark:border-[#414A45] text-sm text-[#181D19] dark:text-[#E1E5E1] focus:outline-none focus:border-[#176B4D] dark:focus:border-[#9DD6B9] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            title="অনুসন্ধান মুছুন"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#717A74] dark:text-[#8B958E] hover:text-[#181D19] dark:hover:text-[#E1E5E1]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-[#414A45] dark:text-[#C1CAC4]">
        {normalizedQuery.length === 0
          ? '৬২৩৬ আয়াতের অফলাইন কনটেন্টে খুঁজুন'
          : `${results.length}টি ফলাফল দেখানো হচ্ছে (সর্বোচ্চ ১০০টি)`}
      </div>

      {/* Empty States or Results */}
      {normalizedQuery.length === 0 ? (
        <div className="text-center py-20 px-4 space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#E8EFEA] dark:bg-[#3F4943] text-[#176B4D] dark:text-[#9DD6B9] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-[#181D19] dark:text-[#E1E5E1]">
            কুরআনের আয়াত খুঁজুন
          </h3>
          <p className="text-sm text-[#414A45] dark:text-[#C1CAC4] max-w-sm mx-auto leading-relaxed">
            আরবি বা বাংলা শব্দ লিখে অফলাইন আয়াতের মধ্যে অনুসন্ধান করুন।
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 px-4 space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#E8EFEA] dark:bg-[#3F4943] text-[#717A74] dark:text-[#8B958E] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-[#181D19] dark:text-[#E1E5E1]">
            কোনো আয়াত পাওয়া যায়নি।
          </h3>
          <p className="text-sm text-[#414A45] dark:text-[#C1CAC4] max-w-sm mx-auto leading-relaxed">
            বাংলা বা আরবি শব্দের বানান পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ surahNumber, ayah }) => {
            const surah = findQuranSurah(surahNumber);
            if (!surah) return null;
            return (
              <button
                key={`${surahNumber}:${ayah.number}`}
                type="button"
                onClick={() => onResultClick(surah, ayah.number)}
                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-[#1E2620] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] border border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-2xs space-y-2.5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#176B4D] dark:text-[#9DD6B9]">
                    {surah.number}. {surah.nameBengali} • আয়াত {ayah.number}
                  </span>
                  <span className="font-arabic text-sm text-[#717A74] dark:text-[#8B958E]" dir="rtl">
                    {surah.nameArabic}
                  </span>
                </div>
                <p
                  dir="rtl"
                  className="font-arabic text-right text-base sm:text-lg text-[#181D19] dark:text-[#E1E5E1] line-clamp-2 leading-relaxed"
                >
                  {ayah.arabic}
                </p>
                <p className="text-sm text-[#414A45] dark:text-[#C1CAC4] font-bengali line-clamp-2 leading-relaxed">
                  {ayah.bengali}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
