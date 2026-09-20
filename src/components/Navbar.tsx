import React from 'react';
import { Home, BookOpen, Clock, Moon, BookMarked } from 'lucide-react';

interface NavbarProps {
  selectedTab: number;
  onSelectTab: (index: number) => void;
}

const paths = ['/', '/quran', '/prayer', '/dua', '/hadith'];

interface NavDestination {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedTab, onSelectTab }) => {
  const destinations: NavDestination[] = [
    { label: 'আজ', icon: Home },
    { label: 'কুরআন', icon: BookOpen },
    { label: 'নামাজ', icon: Clock },
    { label: 'দোয়া', icon: Moon },
    { label: 'হাদিস', icon: BookMarked },
  ];

  return (
    <nav
      aria-label="প্রধান নেভিগেশন"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ikp-border)] bg-[color-mix(in_srgb,var(--ikp-surface)_94%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,35,25,0.08)] backdrop-blur-xl dark:shadow-[0_-8px_30px_rgba(0,0,0,0.22)]"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 px-2 py-1.5">
        {destinations.map((dest, idx) => {
          const isSelected = selectedTab === idx;
          const IconComponent = dest.icon;
          return (
            <a
              key={dest.label}
              aria-current={isSelected ? 'page' : undefined}
              aria-label={dest.label}
              href={paths[idx]}
              onClick={(event) => {
                if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                  event.preventDefault();
                  onSelectTab(idx);
                }
              }}
              className={`ikp-focus-ring flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 transition-colors ${
                isSelected
                  ? 'text-[var(--ikp-primary)]'
                  : 'text-[var(--ikp-text-muted)] hover:bg-[var(--ikp-surface-muted)] hover:text-[var(--ikp-text)]'
              }`}
            >
              <span
                className={`flex h-8 min-w-12 items-center justify-center rounded-full transition-colors ${
                  isSelected ? 'bg-[var(--ikp-primary-soft)]' : ''
                }`}
              >
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`text-[10px] sm:text-[11px] ${isSelected ? 'font-bold' : 'font-medium'}`}>
                {dest.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
