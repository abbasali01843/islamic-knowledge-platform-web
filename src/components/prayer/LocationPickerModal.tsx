import React, { useState, useMemo } from 'react';
import { X, Search, Navigation, Check, MapPin } from 'lucide-react';
import { LocationConfig } from '../../types/prayer';
import { BANGLADESH_DISTRICTS, INTERNATIONAL_CITIES } from '../../data/bangladeshDistricts';
import { requestBrowserLocation } from '../../utils/browserLocation';

interface LocationPickerModalProps {
  currentLocation: LocationConfig;
  onSelectLocation: (loc: LocationConfig) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const divisions = ['ALL', 'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'আন্তর্জাতিক'];

  const filteredLocations = useMemo(() => {
    let list: LocationConfig[] = [];
    if (selectedDivision === 'ALL') {
      list = [...BANGLADESH_DISTRICTS, ...INTERNATIONAL_CITIES];
    } else if (selectedDivision === 'আন্তর্জাতিক') {
      list = INTERNATIONAL_CITIES;
    } else {
      list = BANGLADESH_DISTRICTS.filter((d) => d.division === selectedDivision);
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (loc) =>
        loc.nameBengali.toLowerCase().includes(query) ||
        loc.nameEnglish.toLowerCase().includes(query) ||
        (loc.division && loc.division.toLowerCase().includes(query)) ||
        loc.country.toLowerCase().includes(query)
    );
  }, [searchQuery, selectedDivision]);

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsError(null);

    try {
      const gpsConfig = await requestBrowserLocation();
      onSelectLocation(gpsConfig);
      onClose();
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error
        ? (error as { code?: number }).code
        : undefined;
      setGpsError(
        code === 1
          ? 'লোকেশন পারমিশন দেওয়া হয়নি। অনুগ্রহ করে পারমিশন দিন বা তালিকা থেকে জেলা নির্বাচন করুন।'
          : 'অবস্থান নির্ণয় করা সম্ভব হয়নি। তালিকা থেকে জেলা বেছে নিন।'
      );
    } finally {
      setIsDetectingGps(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#1A221C] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-black/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8EFEA] dark:border-[#3A4D43]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] flex items-center justify-center text-[#176B4D] dark:text-[#9DD6B9]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#181D19] dark:text-[#E1E5E1]">
                অবস্থান নির্বাচন করুন
              </h3>
              <p className="text-xs text-[#717A74] dark:text-[#8B958E]">
                বাংলাদেশের ৬৪টি জেলা ও আন্তর্জাতিক শহর
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#717A74] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto-detect Button */}
        <div className="p-4 pb-2 space-y-2">
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="w-full py-2.5 px-4 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] text-[#002114] dark:text-[#D4F2E2] font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.99]"
          >
            <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'অবস্থান সনাক্ত করা হচ্ছে...' : 'বর্তমান GPS অবস্থান স্বয়ংক্রিয়ভাবে শনাক্ত করুন'}</span>
          </button>

          {gpsError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl">
              {gpsError}
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717A74]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="জেলার নাম খুঁজুন (যেমন: চট্টগ্রাম, Sylhet)..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[#F0F5F1] dark:bg-[#252F28] text-[#181D19] dark:text-[#E1E5E1] placeholder-[#717A74] border border-transparent focus:border-[#176B4D] dark:focus:border-[#9DD6B9] outline-hidden"
            />
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {divisions.map((div) => {
              const isSelected = selectedDivision === div;
              return (
                <button
                  key={div}
                  type="button"
                  onClick={() => setSelectedDivision(div)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#176B4D] text-white'
                      : 'bg-[#E8EFEA] dark:bg-[#2B352E] text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#dce6e0]'
                  }`}
                >
                  {div === 'ALL' ? 'সকল জেলা' : div}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-[#E8EFEA] dark:divide-[#3A4D43]/40">
          {filteredLocations.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#717A74]">
              কোনো জেলা বা শহর পাওয়া যায়নি।
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isCurrent = currentLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`w-full py-3 px-2 flex items-center justify-between text-left rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-[#D4F2E2]/60 dark:bg-[#005236]/40'
                      : 'hover:bg-[#F0F5F1] dark:hover:bg-[#252F28]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">
                        {loc.nameBengali}
                      </span>
                      <span className="text-xs text-[#717A74] dark:text-[#8B958E]">
                        ({loc.nameEnglish})
                      </span>
                      {loc.division && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#E8EFEA] dark:bg-[#344037] text-[#414A45] dark:text-[#C1CAC4]">
                          {loc.division}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#717A74] dark:text-[#8B958E] flex items-center gap-2">
                      <span>{loc.country}</span>
                      <span>•</span>
                      <span>
                        অক্ষাংশ: {loc.latitude}°, দ্রাঘিমাংশ: {loc.longitude}°
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="w-7 h-7 rounded-full bg-[#176B4D] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F7FAF7] dark:bg-[#141B16] border-t border-[#E8EFEA] dark:border-[#3A4D43]/60 text-center text-xs text-[#717A74]">
          GPS ব্যবহার করলে আপনার বর্তমান স্থান ও ডিভাইসের সময়-অফসেট অনুযায়ী নামাজের সময় পুনর্গণনা করা হবে।
        </div>
      </div>
    </div>
  );
};
