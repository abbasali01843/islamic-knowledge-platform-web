import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Droplet, Copy, Check } from 'lucide-react';
import { fetchSalahGuide, SalahGuideContent } from '../../services/salahGuideApi';
import { LoadingView, ErrorView } from '../ui/StateViews';

interface Props {
  onBack: () => void;
}

type Tab = 'salah' | 'rakat' | 'wudu';

export const LearnSalahScreen: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<SalahGuideContent | null>(null);
  const [tab, setTab] = useState<Tab>('salah');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await fetchSalahGuide());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-7 pb-28 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="ফিরে যান"
          className="ikp-focus-ring p-2.5 rounded-2xl ikp-surface border border-[var(--ikp-border)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-[var(--ikp-text)]">
            সালাত ও অজু শিক্ষা
          </h1>
          <p className="text-xs text-[var(--ikp-text-muted)]">
            উৎস-উল্লেখসহ ধাপে ধাপে গাইড
          </p>
        </div>
      </div>

      {loading && <LoadingView message="গাইড লোড হচ্ছে…" />}

      {error && !loading && (
        <ErrorView
          title="গাইড লোড করা যায়নি"
          description="ইন্টারনেট সংযোগ প্রয়োজন। অনলাইন উৎস থেকে গাইড লোড করা যাচ্ছে না।"
          onRetry={() => void load()}
        />
      )}

      {data && !loading && (
        <>
          <div className="flex gap-1.5 p-1.5 rounded-2xl bg-[var(--ikp-surface-muted)] border border-[var(--ikp-border)] overflow-x-auto">
            {(
              [
                { id: 'salah' as Tab, label: 'নামাজের ধাপ', icon: BookOpen },
                { id: 'rakat' as Tab, label: 'রাকাত', icon: BookOpen },
                { id: 'wudu' as Tab, label: 'অজু', icon: Droplet },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  tab === id
                    ? 'bg-white dark:bg-[#1A221C] text-[var(--ikp-primary)] shadow-sm'
                    : 'text-[var(--ikp-text-muted)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs text-[var(--ikp-text-muted)] leading-relaxed">
            {data.methodology}
          </div>

          {tab === 'salah' && (
            <div className="space-y-3">
              {data.salahSteps.map((s, i) => (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl ikp-surface border border-[var(--ikp-border)]"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-[var(--ikp-primary)] font-bold">
                        ধাপ {i + 1}
                      </span>
                      <h2 className="font-black mt-1 text-[var(--ikp-text)]">
                        {s.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copy(s.id, s.arabic + '\n' + s.meaning)}
                      className="p-2 rounded-xl hover:bg-[#E8EFEA] dark:hover:bg-[#252F28]"
                      aria-label="কপি"
                    >
                      {copied === s.id ? (
                        <Check className="w-4 h-4 text-[#176B4D]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#717A74]" />
                      )}
                    </button>
                  </div>
                  <p dir="rtl" className="mt-4 text-xl leading-loose text-[var(--ikp-primary)]">
                    {s.arabic}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[var(--ikp-text)]">
                    {s.meaning}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ikp-text-muted)] leading-relaxed">
                    {s.instruction}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === 'rakat' && (
            <div className="space-y-3">
              {data.prayers.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl ikp-surface border border-[var(--ikp-border)]"
                >
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="font-black text-[var(--ikp-text)]">{p.name}</h2>
                    <span className="text-[var(--ikp-primary)] font-black text-sm shrink-0">
                      {p.farz} ফরজ
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--ikp-text-muted)]">{p.sunnah}</p>
                  <p className="mt-2 text-xs text-[var(--ikp-text-muted)]">{p.note}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'wudu' && (
            <div className="space-y-3">
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                <h2 className="font-black text-[var(--ikp-text)]">
                  হানাফি-ভিত্তিক ৪ ফরজ
                </h2>
                <ol className="mt-3 space-y-1.5 text-sm text-[var(--ikp-text-muted)]">
                  {data.wuduFarz.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ol>
              </div>
              {data.wuduSteps.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl ikp-surface border border-[var(--ikp-border)]"
                >
                  <div className="flex justify-between gap-3">
                    <h2 className="font-black text-[var(--ikp-text)]">{s.title}</h2>
                    <span className="text-[11px] font-bold text-[var(--ikp-primary)]">
                      {s.type}
                    </span>
                  </div>
                  {s.arabic && (
                    <p dir="rtl" className="mt-3 text-lg text-[var(--ikp-primary)]">
                      {s.arabic}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-[var(--ikp-text-muted)]">{s.instruction}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 text-[11px] text-[var(--ikp-text-muted)]">
            উৎস:{' '}
            {data.sources.map((s, i) => (
              <React.Fragment key={s.url}>
                {i > 0 ? ' • ' : ''}
                <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
