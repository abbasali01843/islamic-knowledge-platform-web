import React, { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  GraduationCap,
  MapPin,
  ScrollText,
  XCircle,
} from 'lucide-react';
import { fetchWebModulesContent } from '../services/webModulesApi';
import type { GuideItem, QuizItem, WebModulesContent } from '../services/webModulesApi';
import { LoadingView, ErrorView } from './ui/StateViews';

type ModuleId = 'QIBLA' | 'HAJJ' | 'SEERAH' | 'QUIZ';

const modules = [
  {
    id: 'QIBLA' as const,
    title: 'কিবলা',
    icon: Compass,
    desc: 'GPS ও কম্পাস দিয়ে কাবার দিক নির্ণয় করুন।',
  },
  {
    id: 'HAJJ' as const,
    title: 'হজ',
    icon: MapPin,
    desc: 'হজের ধাপ ও প্রয়োজনীয় নির্দেশনা।',
  },
  {
    id: 'SEERAH' as const,
    title: 'সীরাত',
    icon: ScrollText,
    desc: 'রাসূল ﷺ-এর জীবনের ধারাবাহিক পাঠ।',
  },
  {
    id: 'QUIZ' as const,
    title: 'কুইজ',
    icon: GraduationCap,
    desc: 'ইসলামিক জ্ঞান যাচাইয়ের ছোট কুইজ।',
  },
];

export const WebModulesScreen: React.FC<{
  onBack: () => void;
  initialModule?: ModuleId | 'RAMADAN';
}> = ({ onBack, initialModule }) => {
  const resolvedInitial =
    initialModule === 'RAMADAN' || !initialModule ? null : initialModule;

  const [active, setActive] = useState<ModuleId | null>(resolvedInitial);
  const [content, setContent] = useState<WebModulesContent | null>(null);
  const [contentError, setContentError] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [heading, setHeading] = useState(0);
  const [orientationSupported, setOrientationSupported] = useState(true);
  const [geo, setGeo] = useState('অবস্থান নেওয়া হয়নি');
  const [qibla, setQibla] = useState<number | null>(null);
  const [compassActive, setCompassActive] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [compassError, setCompassError] = useState('');

  useEffect(() => {
    setActive(resolvedInitial);
    setQ(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  }, [resolvedInitial]);

  const loadContent = async () => {
    setLoadingContent(true);
    setContentError(false);
    try {
      setContent(await fetchWebModulesContent());
    } catch {
      setContentError(true);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    setOrientationSupported('DeviceOrientationEvent' in window);
  }, []);

  const select = (id: ModuleId) => {
    setActive(id);
    setQ(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const locate = () => {
    setGeoError('');
    if (!window.isSecureContext) {
      setGeoError('GPS-এর জন্য HTTPS বা localhost প্রয়োজন।');
      return;
    }
    if (!navigator.geolocation) {
      setGeoError('এই ব্রাউজারে GPS সমর্থিত নয়।');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lon = p.coords.longitude;
        setGeo(lat.toFixed(5) + ', ' + lon.toFixed(5));
        const kaabaLat = (21.422487 * Math.PI) / 180;
        const kaabaLon = (39.826206 * Math.PI) / 180;
        const phi = (lat * Math.PI) / 180;
        const lam = (lon * Math.PI) / 180;
        const y = Math.sin(kaabaLon - lam) * Math.cos(kaabaLat);
        const x =
          Math.cos(phi) * Math.sin(kaabaLat) -
          Math.sin(phi) * Math.cos(kaabaLat) * Math.cos(kaabaLon - lam);
        setQibla(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
      },
      (e) =>
        setGeoError(
          e.code === 1 ? 'অবস্থান অনুমতি দেওয়া হয়নি।' : 'GPS অবস্থান পাওয়া যায়নি।'
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onOrientation = useCallback((e: DeviceOrientationEvent) => {
    const webkit = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    const a =
      typeof webkit.webkitCompassHeading === 'number'
        ? webkit.webkitCompassHeading
        : e.alpha;
    if (a != null) setHeading(a);
  }, []);

  const startCompass = async () => {
    setCompassError('');
    if (!orientationSupported) {
      setCompassError('এই ব্রাউজারে device orientation সমর্থিত নয়।');
      return;
    }
    if (!window.isSecureContext) {
      setCompassError('কম্পাসের জন্য HTTPS বা localhost প্রয়োজন।');
      return;
    }
    try {
      const D = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (D.requestPermission) {
        const ok = await D.requestPermission();
        if (ok !== 'granted') {
          setCompassError('কম্পাস ব্যবহারের অনুমতি দেওয়া হয়নি।');
          return;
        }
      }
      window.addEventListener('deviceorientationabsolute', onOrientation as EventListener);
      window.addEventListener('deviceorientation', onOrientation as EventListener);
      setCompassActive(true);
    } catch {
      setCompassActive(false);
      setCompassError('এই ডিভাইসে কম্পাস চালু করা যায়নি।');
    }
  };

  useEffect(
    () => () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        onOrientation as EventListener
      );
      window.removeEventListener('deviceorientation', onOrientation as EventListener);
    },
    [onOrientation]
  );

  const answer = (a: string, quiz: QuizItem[]) => {
    if (answered) return;
    setSelectedAnswer(a);
    setAnswered(true);
    if (a === quiz[q].answer) setScore((s) => s + 1);
  };

  const quiz = content?.quiz ?? [];
  const progressPct = quiz.length ? Math.round(((q + (answered ? 1 : 0)) / quiz.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7 space-y-5 pb-28">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[var(--ikp-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        ফিরে যান
      </button>

      {!active ? (
        <>
          <div className="rounded-3xl p-6 bg-gradient-to-r from-[#176B4D] to-[#0A3D2B] text-white">
            <h1 className="text-2xl font-black">ইলম ও আমল</h1>
            <p className="mt-2 text-sm text-white/80">
              কিবলা, হজ, সীরাত ও কুইজ — উৎস-উল্লেখসহ
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {modules.map((m) => {
              const I = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => select(m.id)}
                  className="text-left p-5 rounded-3xl ikp-surface border border-[var(--ikp-border)] active:scale-[0.99] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--ikp-primary-soft)] flex items-center justify-center text-[var(--ikp-primary)]">
                    <I className="w-5 h-5" />
                  </div>
                  <h2 className="mt-3 font-black text-[var(--ikp-text)]">
                    {m.title}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--ikp-text-muted)]">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="text-xs font-bold text-[var(--ikp-primary)]"
          >
            ← সব মডিউল
          </button>

          {active === 'QIBLA' && (
            <div className="text-center py-8 space-y-5 max-w-xl mx-auto rounded-3xl ikp-surface border border-[var(--ikp-border)] p-6">
              <Compass
                className="w-24 h-24 mx-auto text-[var(--ikp-primary)] transition-transform duration-200"
                style={{
                  transform: `rotate(${(qibla ?? 0) - heading}deg)`,
                }}
              />
              <h2 className="text-xl font-black text-[var(--ikp-text)]">
                কিবলা কম্পাস
              </h2>
              <p className="text-xs text-[#717A74]">
                কাবার দিক পেতে GPS ও device orientation অনুমতি দিন।
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={locate}
                  className="px-4 py-2 rounded-xl bg-[var(--ikp-primary)] text-white text-xs font-bold"
                >
                  GPS অবস্থান
                </button>
                <button
                  type="button"
                  onClick={startCompass}
                  className="px-4 py-2 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43] text-xs font-bold"
                >
                  {compassActive ? 'কম্পাস চালু' : 'কম্পাস চালু করুন'}
                </button>
              </div>
              <p className="text-xs text-[#717A74]">{geo}</p>
              {qibla != null && (
                <p className="text-sm font-bold text-[var(--ikp-primary)]">
                  কিবলা বিয়ারিং: {qibla.toFixed(1)}°
                </p>
              )}
              {qibla != null && (
                <p className="text-xs text-[#717A74] leading-relaxed">
                  ফোনটি সমতল রেখে ধীরে ঘোরান। তীরটি কাবার দিকে নির্দেশ করবে।
                </p>
              )}
              {geoError && (
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {geoError}
                </p>
              )}
              {compassError && (
                <p role="alert" className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {compassError}
                </p>
              )}
            </div>
          )}

          {active !== 'QIBLA' && loadingContent && (
            <LoadingView message="কনটেন্ট লোড হচ্ছে…" />
          )}

          {active !== 'QIBLA' && !loadingContent && contentError && (
            <ErrorView
              title="কনটেন্ট লোড করা যায়নি"
              description="অনলাইন উৎস থেকে ডাটা পাওয়া যাচ্ছে না।"
              onRetry={() => void loadContent()}
            />
          )}

          {!loadingContent && !contentError && content && active === 'HAJJ' && (
            <Guide title="হজের ধাপ" items={content.hajj} />
          )}
          {!loadingContent && !contentError && content && active === 'SEERAH' && (
            <Guide title="সীরাত পাঠ" items={content.seer} />
          )}

          {!loadingContent && !contentError && content && active === 'QUIZ' && (
            <div className="space-y-5">
              {quiz.length === 0 ? (
                <p className="text-center text-sm text-[#717A74] py-12">
                  এখনো কোনো প্রশ্ন নেই।
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#717A74]">
                      <span>
                        প্রশ্ন {q + 1}/{quiz.length}
                      </span>
                      <span className="text-[var(--ikp-primary)]">
                        স্কোর: {score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--ikp-surface-muted)] overflow-hidden">
                      <div
                        className="h-full bg-[#176B4D] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <h2 className="text-lg font-black text-[var(--ikp-text)] leading-snug">
                    {quiz[q].question}
                  </h2>

                  <div className="grid gap-2">
                    {quiz[q].options.map((a) => {
                      const isCorrect = a === quiz[q].answer;
                      const isSelected = selectedAnswer === a;
                      let cls =
                        'text-left p-4 rounded-2xl border font-semibold transition-colors ';
                      if (!answered) {
                        cls +=
                          'border-[#E8EFEA] dark:border-[#3A4D43] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943]';
                      } else if (isCorrect) {
                        cls +=
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200';
                      } else if (isSelected) {
                        cls +=
                          'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200';
                      } else {
                        cls += 'border-[#E8EFEA] dark:border-[#3A4D43] opacity-60';
                      }
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => answer(a, quiz)}
                          disabled={answered}
                          className={cls}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{a}</span>
                            {answered && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            )}
                            {answered && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 shrink-0" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <p className="text-xs text-[#717A74]">উৎস: {quiz[q].source}</p>
                  )}

                  {answered &&
                    (q < quiz.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQ((x) => x + 1);
                          setAnswered(false);
                          setSelectedAnswer(null);
                        }}
                        className="w-full py-3 rounded-2xl bg-[var(--ikp-primary)] text-white text-sm font-bold"
                      >
                        পরের প্রশ্ন
                      </button>
                    ) : (
                      <div className="p-5 rounded-2xl bg-[var(--ikp-surface-muted)] text-center space-y-3">
                        <p className="font-black text-[var(--ikp-text)]">
                          কুইজ শেষ — স্কোর {score}/{quiz.length}
                        </p>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-[var(--ikp-primary)] text-white text-xs font-bold"
                          onClick={() => {
                            setQ(0);
                            setScore(0);
                            setAnswered(false);
                            setSelectedAnswer(null);
                          }}
                        >
                          আবার শুরু
                        </button>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {content && active !== 'QIBLA' && active !== 'QUIZ' && !loadingContent && (
            <p className="text-[11px] text-[#717A74] text-center">
              কনটেন্ট সংস্করণ {content.version} • আপডেট {content.updatedAt}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Guide: React.FC<{ title: string; items: GuideItem[] }> = ({ title, items }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-black text-[var(--ikp-text)]">{title}</h2>
    {items.map((x, i) => (
      <div
        key={x.title}
        className="p-4 rounded-2xl ikp-surface border border-[var(--ikp-border)]"
      >
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--ikp-primary)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-bold text-sm text-[var(--ikp-text)]">
              {i + 1}. {x.title}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ikp-text-muted)]">
              {x.text}
            </p>
            <p className="mt-2 text-[11px] text-[#717A74]">উৎস: {x.source}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);
