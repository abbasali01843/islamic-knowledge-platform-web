import React from 'react';
import { BookOpen, Compass, HeartHandshake, Calendar, Moon, Sparkles } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  onGoHome?: () => void;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, onGoHome }) => {
  const getDetails = (t: string) => {
    switch (t) {
      case 'হাদিস':
        return {
          subtitle: 'সহিহ বুখারী, মুসলিম ও অন্যান্য হাদিস গ্রন্থ সংকলন',
          description:
            'পরবর্তী মাইলস্টোন (v0.3.0-alpha) হিসেবে হাদিস মডিউল যুক্ত হতে যাচ্ছে। এখানে সনদ, তাহকিক ও বাংলা অর্থসহ অফলাইন হাদিস পড়ার সুবিধা থাকবে।',
          icon: BookOpen,
        };
      case 'আরও':
      default:
        return {
          subtitle: 'আসন্ন মডিউল ও ইসলামিক টুলস',
          description:
            'নামাজের সময়সূচি, কিবলা কম্পাস, রমজান সহায়িকা, হজ-উমরাহ গাইড, যাকাত ক্যালকুলেটর এবং ইসলামিক ক্যালেন্ডার তৈরির কাজ চলমান রয়েছে।',
          icon: Sparkles,
        };
    }
  };

  const details = getDetails(title);
  const IconComponent = details.icon;

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 pb-28">
      <div className="w-16 h-16 rounded-2xl bg-[#E8EFEA] dark:bg-[#3F4943] text-[#176B4D] dark:text-[#9DD6B9] flex items-center justify-center mx-auto shadow-2xs">
        <IconComponent className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#181D19] dark:text-[#E1E5E1]">
        {title}
      </h2>
      <p className="text-sm font-medium text-[#176B4D] dark:text-[#9DD6B9]">
        {details.subtitle}
      </p>
      <p className="text-sm text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
        {details.description}
      </p>

      {title === 'আরও' && (
        <div className="grid grid-cols-2 gap-2.5 pt-4 text-left">
          {[
            { name: 'নামাজ সময়সূচি', icon: Moon },
            { name: 'কিবলা কম্পাস', icon: Compass },
            { name: 'দোয়া ও যিকর', icon: HeartHandshake },
            { name: 'ইসলামিক ক্যালেন্ডার', icon: Calendar },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.name}
                className="p-3 rounded-xl bg-white dark:bg-[#1E2620] border border-[#E8EFEA] dark:border-[#3A4D43]/60 flex items-center gap-2.5"
              >
                <ItemIcon className="w-4 h-4 text-[#176B4D] dark:text-[#9DD6B9]" />
                <span className="text-xs font-semibold text-[#181D19] dark:text-[#E1E5E1]">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {onGoHome && (
        <div className="pt-6">
          <button
            type="button"
            onClick={onGoHome}
            className="px-5 py-2.5 rounded-xl bg-[#176B4D] text-white dark:bg-[#9DD6B9] dark:text-[#003824] text-sm font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all"
          >
            হোমে ফিরে যান
          </button>
        </div>
      )}
    </div>
  );
};
