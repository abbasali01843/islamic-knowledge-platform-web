import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles, ChevronRight, Copy, Check, Loader2 } from 'lucide-react';
import { HadithItem } from '../../types/hadith';
import { fetchHadithSection } from '../../services/hadithApi';
import { toBengaliNumerals } from '../../utils/prayerCalculation';

export const NawawiFortyView: React.FC = () => {
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [selected, setSelected] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchHadithSection('nawawi', 1).then(data => {
      if (!cancelled) setHadiths(data);
    }).catch(() => {
      if (!cancelled) setHadiths([]);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const current = hadiths.find(h => Number(h.hadithNumber) === selected) ?? hadiths[0];

  const copy = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.arabicText + '\n\n' + current.bengaliText);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-7 h-7 animate-spin mx-auto text-[#176B4D]"/></div>;

  if (!current) return <div className="p-8 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] text-center text-sm">ইমাম নববীর ৪০ হাদিসের অনলাইন ডেটা এখন পাওয়া যাচ্ছে না।</div>;

  return <div className="space-y-6">
    <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0D442F] text-white shadow-md space-y-3">
      <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#9DD6B9]"/><div><h2 className="font-extrabold text-lg">ইমাম নববীর চল্লিশ হাদিস</h2><p className="text-xs text-white/80">الأربعون النووية • অনলাইন উৎস থেকে লোড হচ্ছে</p></div></div>
      <p className="text-xs text-white/90 leading-relaxed">এই সংকলনের আরবি ও বাংলা পাঠ অনলাইন Hadith API থেকে সরাসরি আনা হয়।</p>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{hadiths.map((h,i) => { const n=Number(h.hadithNumber)||i+1; return <button key={h.id} type="button" onClick={()=>setSelected(n)} className={`min-w-[48px] py-2 px-3 rounded-2xl text-xs font-bold ${Number(current.hadithNumber)===n?'bg-[#176B4D] text-white':'bg-[#E8EFEA] dark:bg-[#252F28]'}`}>{toBengaliNumerals(n)}</button>; })}</div>
    <div className="rounded-3xl p-6 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] shadow-md space-y-5">
      <div className="flex items-start justify-between border-b border-[#E8EFEA] pb-3"><div><span className="text-xs font-bold text-[#176B4D]">হাদিস নং: {toBengaliNumerals(Number(current.hadithNumber))}</span><h3 className="font-extrabold text-base mt-1">ইমাম নববীর ৪০ হাদিস</h3></div><button type="button" onClick={copy} className="p-2.5 rounded-xl">{copied?<Check className="w-4 h-4 text-emerald-600"/>:<Copy className="w-4 h-4"/>}</button></div>
      <div className="p-5 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821] text-right"><div dir="rtl" className="text-xl sm:text-2xl font-serif text-[#176B4D] leading-loose" style={{fontFamily:"'Amiri', serif"}}>{current.arabicText}</div></div>
      <div><span className="text-[11px] font-bold text-[#717A74]">বাংলা অনুবাদ:</span><p className="text-sm leading-relaxed mt-1">{current.bengaliText}</p></div>
      <div className="p-3 rounded-2xl bg-[#E8EFEA] dark:bg-[#252F28] text-xs font-semibold">মূল উৎস: {current.bookNameBengali} ({toBengaliNumerals(Number(current.hadithNumber))}) • {current.gradeLabelBengali}</div>
      <div className="flex justify-end"><button type="button" onClick={()=>{const i=hadiths.indexOf(current);setSelected(Number(hadiths[(i+1)%hadiths.length].hadithNumber));}} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold">পরবর্তী হাদিস <ChevronRight className="w-4 h-4"/></button></div>
    </div>
  </div>;
};
