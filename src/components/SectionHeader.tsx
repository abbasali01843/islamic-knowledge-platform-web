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
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-lg font-semibold text-[#181D19] dark:text-[#E1E5E1]">
        {title}
      </h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-[#176B4D] dark:text-[#9DD6B9] hover:underline px-2 py-1 rounded transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
