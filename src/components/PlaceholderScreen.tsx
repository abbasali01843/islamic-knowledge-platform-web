import React from 'react';
import { Compass, Calendar, BookOpen, Sparkles } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  onGoHome?: () => void;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  onGoHome,
}) => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 pb-28">
      <div className="w-16 h-16 rounded-2xl bg-[#E8EFEA] dark:bg-[#3F4943] text-[#176B4D] dark:text-[#9DD6B9] flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#181D19] dark:text-[#E1E5E1]">{title}</h2>
      <p className="text-sm text-[#414A45] dark:text-[#C1CAC4] leading-relaxed">
        এই অংশে কাজ চলমান। নিচের মেনু থেকে কুরআন, নামাজ, দোয়া বা হাদিস ব্যবহার করতে পারেন।
      </p>

      <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
        {[
          { name: 'কুরআন', icon: BookOpen },
          { name: 'কিবলা', icon: Compass },
          { name: 'হিজরি ক্যালেন্ডার', icon: Calendar },
          { name: 'আরও টুলস', icon: Sparkles },
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

      {onGoHome && (
        <div className="pt-4">
          <button
            type="button"
            onClick={onGoHome}
            className="px-5 py-2.5 rounded-xl bg-[#176B4D] text-white dark:bg-[#9DD6B9] dark:text-[#003824] text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            আজ স্ক্রিনে ফিরে যান
          </button>
        </div>
      )}
    </div>
  );
};
