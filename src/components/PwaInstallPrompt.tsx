import React, { useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const PwaInstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const onBefore = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setShowIosHelp(false);
    };

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setInstalled(standalone);
    setIos(isIos);
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setInstallEvent(null);
  };

  if (ios) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIosHelp((value) => !value)}
          className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-2xl bg-[#176B4D] text-white shadow-lg text-xs font-bold hover:opacity-95"
        >
          iPhone-এ ইনস্টল
        </button>
        {showIosHelp && (
          <div className="fixed bottom-36 right-4 z-40 w-[min(320px,calc(100vw-2rem))] p-4 rounded-2xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43] shadow-xl text-xs leading-relaxed">
            Safari-তে এই পেজের <strong>Share</strong> বাটনে চাপুন, তারপর <strong>Add to Home Screen</strong> নির্বাচন করুন।
            <button type="button" onClick={() => setShowIosHelp(false)} className="block mt-3 text-[#176B4D] dark:text-[#9DD6B9] font-bold">
              বন্ধ করুন
            </button>
          </div>
        )}
      </>
    );
  }

  if (!installEvent) return null;

  return (
    <button
      type="button"
      onClick={install}
      className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-2xl bg-[#176B4D] text-white shadow-lg text-xs font-bold hover:opacity-95"
    >
      অ্যাপ ইনস্টল করুন
    </button>
  );
};
