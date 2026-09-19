import React from 'react';
import { Home, BookOpen, Clock, Moon, BookMarked } from 'lucide-react';

interface NavbarProps {
  selectedTab: number;
  onSelectTab: (index: number) => void;
}

interface NavDestination {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedTab, onSelectTab }) => {
  const destinations: NavDestination[] = [
    { label: 'হোম', icon: Home },
    { label: 'কুরআন', icon: BookOpen },
    { label: 'নামাজ', icon: Clock },
    { label: 'দোয়া', icon: Moon },
    { label: 'হাদিস', icon: BookMarked },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E2620]/95 backdrop-blur-md border-t border-[#E8EFEA] dark:border-[#3A4D43]/60 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {destinations.map((dest, idx) => {
          const isSelected = selectedTab === idx;
          const IconComponent = dest.icon;
          return (
            <button
              key={dest.label}
              type="button"
              onClick={() => onSelectTab(idx)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isSelected
                  ? 'text-[#176B4D] dark:text-[#9DD6B9]'
                  : 'text-[#717A74] dark:text-[#8B958E] hover:text-[#181D19] dark:hover:text-[#E1E5E1]'
              }`}
            >
              <div
                className={`px-4 py-1 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-[#D4F2E2] dark:bg-[#005236]'
                    : 'bg-transparent'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`text-[11px] mt-0.5 ${isSelected ? 'font-bold' : 'font-normal'}`}>
                {dest.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
