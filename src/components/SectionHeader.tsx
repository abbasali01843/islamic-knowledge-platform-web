import React from 'react';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <h2 className="text-[17px] sm:text-lg font-bold tracking-tight text-[var(--ikp-text)]">
        {title}
      </h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="ikp-focus-ring shrink-0 rounded-lg px-2 py-1 text-xs sm:text-sm font-semibold text-[var(--ikp-primary)] transition-colors hover:bg-[var(--ikp-primary-soft)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
