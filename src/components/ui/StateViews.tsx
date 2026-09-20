import React from 'react';
import { Loader2, RefreshCw, Inbox, WifiOff } from 'lucide-react';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'লোড হচ্ছে…',
}) => (
  <div className="p-16 text-center space-y-3">
    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#176B4D] dark:text-[#9DD6B9]" />
    <p className="text-sm text-[#717A74] dark:text-[#8B958E]">{message}</p>
  </div>
);

interface EmptyViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 space-y-3">
    <Inbox className="w-10 h-10 text-[#717A74] mx-auto opacity-50" />
    <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">{title}</h4>
    {description && (
      <p className="text-xs text-[#717A74] dark:text-[#8B958E] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-2 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

interface ErrorViewProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'কিছু একটা সমস্যা হয়েছে',
  description = 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
  onRetry,
}) => (
  <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#1A221C] border border-red-200 dark:border-red-900/40 space-y-3">
    <WifiOff className="w-8 h-8 text-red-500 mx-auto opacity-80" />
    <h4 className="font-bold text-sm text-[#181D19] dark:text-[#E1E5E1]">{title}</h4>
    <p className="text-xs text-[#717A74] dark:text-[#8B958E]">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold inline-flex items-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        আবার চেষ্টা করুন
      </button>
    )}
  </div>
);
