import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Moon } from 'lucide-react';
import { fetchHijriDate, fetchHijriMonth, MONTHS, HijriDate } from '../../services/hijriCalendarApi';
import { toBengaliNumerals } from '../../utils/prayerCalculation';
import { DEFAULT_LOCATION } from '../../data/bangladeshDistricts';
import { requestGrantedBrowserLocation } from '../../utils/browserLocation';
import type { LocationConfig } from '../../types/prayer';
import { LoadingView, ErrorView } from '../ui/StateViews';

const dateInputForTimezone=(date:Date,timezone:number):string=>{
  const shifted=new Date(date.getTime()+timezone*60*60*1000);
  return [shifted.getUTCFullYear(),String(shifted.getUTCMonth()+1).padStart(2,'0'),String(shifted.getUTCDate()).padStart(2,'0')].join('-');
};

export const CalendarScreen:React.FC<{onBack:()=>void}>=({onBack})=>{
  const [today,setToday]=useState<HijriDate|null>(null);
  const [location,setLocation]=useState<LocationConfig>(DEFAULT_LOCATION);
  const [month,setMonth]=useState<Array<{date:{gregorian:string};gregorian:{date:string};hijri:{day:string;month:{number:number;en:string}}}>>([]);
  const [customDate,setCustomDate]=useState(()=>dateInputForTimezone(new Date(),DEFAULT_LOCATION.timezone));
  const [converted,setConverted]=useState<HijriDate|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  useEffect(()=>{let cancelled=false;requestGrantedBrowserLocation().then(detected=>{if(!cancelled&&detected)setLocation(detected);});return()=>{cancelled=true;};},[]);

  const load=async()=>{
    setLoading(true);setError(false);
    try{
      const d=await fetchHijriDate(new Date(),location.timezone);
      const days=await fetchHijriMonth(d.hijriYear,d.hijriMonth,location.latitude,location.longitude,1);
      setToday(d);setMonth(days as typeof month);
    }catch{setError(true);}finally{setLoading(false);}
  };

  useEffect(()=>{void load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location]);

  useEffect(()=>{
    if(!customDate)return;
    const [y,m,d]=customDate.split('-').map(Number);
    fetchHijriDate(new Date(Date.UTC(y,m-1,d,12)),location.timezone).then(setConverted).catch(()=>setConverted(null));
  },[customDate,location.timezone]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-7 space-y-5 pb-28">
      <div className="flex items-center gap-3"><button type="button" onClick={onBack} aria-label="ফিরে যান" className="ikp-focus-ring p-2.5 rounded-2xl ikp-surface border border-[var(--ikp-border)] text-[var(--ikp-primary)]"><ArrowLeft className="w-5 h-5" /></button><div><h1 className="text-xl sm:text-2xl font-black text-[var(--ikp-text)]">হিজরি ক্যালেন্ডার</h1><p className="text-xs text-[var(--ikp-text-muted)]">অনলাইন AlAdhan ক্যালেন্ডার</p></div></div>
      {loading&&<LoadingView message="হিজরি ক্যালেন্ডার লোড হচ্ছে…" />}
      {error&&!loading&&<ErrorView title="ক্যালেন্ডার লোড করা যায়নি" description="হিজরি ক্যালেন্ডার অনলাইন উৎস থেকে লোড করা যাচ্ছে না।" onRetry={()=>void load()} />}
      {today&&!loading&&!error&&<>
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#176B4D] to-[#0E4933] text-white space-y-3"><span className="text-xs font-bold flex items-center gap-2 text-[#9DD6B9]"><Moon className="w-4 h-4" />আজকের হিজরি তারিখ</span><div className="text-3xl font-black">{toBengaliNumerals(today.hijriDay)} {today.monthNameBn} {toBengaliNumerals(today.hijriYear)} হিজরি</div><div dir="rtl" className="text-lg text-white/90">{today.hijriDay} {today.monthNameAr} {today.hijriYear} هـ</div></div>
        <div className="p-5 rounded-3xl ikp-surface border border-[var(--ikp-border)] space-y-3"><h2 className="font-black text-[var(--ikp-text)]">তারিখ রূপান্তর</h2><div className="grid sm:grid-cols-2 gap-4"><input type="date" value={customDate} onChange={e=>setCustomDate(e.target.value)} className="px-3 py-2.5 rounded-xl border border-[#E8EFEA] dark:border-[#3A4D43] bg-transparent text-sm" /><div className="p-3 rounded-2xl bg-[var(--ikp-surface-muted)] text-sm font-medium text-[var(--ikp-text)]">{converted?`হিজরি: ${toBengaliNumerals(converted.hijriDay)} ${converted.monthNameBn} ${toBengaliNumerals(converted.hijriYear)}`:'তারিখ পাওয়া যায়নি'}</div></div></div>
        <div className="space-y-3"><h2 className="font-black flex items-center gap-2 text-[var(--ikp-text)]"><CalendarIcon className="w-4 h-4 text-[var(--ikp-primary)]" />চলতি হিজরি মাস</h2><div className="grid sm:grid-cols-2 gap-2">{month.map(d=><div key={d.date.gregorian} className="p-3 rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-white dark:bg-[#1A221C]"><div className="flex justify-between text-xs font-bold text-[var(--ikp-text)]"><span>{d.gregorian.date}</span><span className="text-[var(--ikp-primary)]">{toBengaliNumerals(Number(d.hijri.day))} {MONTHS[Number(d.hijri.month.number)-1]?.[0]??d.hijri.month.en}</span></div></div>)}</div></div>
        <div className="text-[11px] text-[var(--ikp-text-muted)] leading-relaxed">সূত্র: <a className="underline" href="https://aladhan.com/islamic-calendar-api" target="_blank" rel="noreferrer">AlAdhan Islamic Calendar API</a>। চাঁদ দেখা বা স্থানীয় কর্তৃপক্ষের ঘোষণার কারণে তারিখে পার্থক্য হতে পারে।</div>
      </>}
    </div>
  );
};