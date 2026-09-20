import React,{useEffect,useMemo,useState} from 'react';
import {BookOpen,Search,Sun,Flame,Loader2,RefreshCw from 'lucide-react';
import type {DuaCategoryKey,DuaItem} from '../../types/dua';
import {DUA_CATEGORIES,DUA_SOURCE_LABEL,DUA_SOURCE_URL,fetchLiveDuas} from '../../services/duaApi';
import {DuaCard} from './DuaCard';
import {TasbeehCounter} from './TasbeehCounter';
import {toBengaliNumerals} from '../../utils/prayerCalculation';

type Tab='LIBRARY'|'TASBEEH'|'MORNING_EVENING';
export const DuaScreen:React.FC=()=>{
 const [tab,setTab]=useState<Tab>('LIBRARY'),[category,setCategory]=useState<DuaCategoryKey>('ALL'),[query,setQuery]=useState(''),[duas,setDuas]=useState<DuaItem[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 const [bookmarks,setBookmarks]=useState<string[]>([]);
 useEffect(()=>{let cancelled=false;setLoading(true);setError(false);fetchLiveDuas().then(d=>{if(!cancelled)setDuas(d)}).catch(()=>{if(!cancelled)setError(true)}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[]);
 const toggle=(id:string)=>setBookmarks(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];return next});
 const filtered=useMemo(()=>duas.filter(d=>(category==='ALL'||d.category===category)&&(!query.trim()||[d.titleBengali,d.bengaliMeaning,d.arabicText,d.reference,...(d.tags||[])].join(' ').toLowerCase().includes(query.toLowerCase().trim()))),[duas,category,query]);
 const morning=duas.filter(d=>d.category==='MORNING_EVENING');
 return <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
  <div><h1 className="text-2xl font-bold">দোয়া ও হিসনুল মুসলিম</h1><p className="text-xs text-[#717A74] mt-1">অনলাইন উৎস থেকে সরাসরি লোড হওয়া বাংলা অনুবাদসহ মাসনূন দোয়া ও যিকির</p></div>
  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8EFEA] dark:bg-[#222C25] rounded-2xl">
   {([['LIBRARY','দোয়া ভাণ্ডার',BookOpen],['TASBEEH','ডিজিটাল তাসবীহ',Flame],['MORNING_EVENING','সকাল-সন্ধ্যা',Sun]] as const).map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 ${tab===id?'bg-white dark:bg-[#1A221C] text-[#176B4D] shadow-xs':'text-[#717A74]'}`}><Icon className="w-4 h-4"/>{label}</button>)}
  </div>
  {tab==='TASBEEH'?<TasbeehCounter/>:tab==='MORNING_EVENING'?<div className="space-y-4"><div className="p-4 rounded-2xl bg-[#D4F2E2]/30 border border-[#176B4D]/20 text-xs">সকাল-সন্ধ্যার {toBengaliNumerals(morning.length)}টি দোয়া অনলাইন API থেকে লোড হয়েছে।</div>{morning.map(d=><DuaCard key={d.id} dua={d} isBookmarked={bookmarks.includes(d.id)} onToggleBookmark={toggle}/>)}</div>:
  <div className="space-y-5">
   <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#717A74]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="দোয়া খুঁজুন..." className="w-full pl-9 py-3 rounded-2xl border border-[#E8EFEA] dark:border-[#3A4D43]/60 bg-white dark:bg-[#1A221C] text-xs"/></div><div className="flex gap-1 overflow-x-auto no-scrollbar">{DUA_CATEGORIES.filter(c=>c.id!=='FAVORITES').map(c=><button key={c.id} onClick={()=>setCategory(c.id)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold ${category===c.id?'bg-[#176B4D] text-white':'bg-[#E8EFEA] dark:bg-[#252F28]'}`}>{c.nameBengali}</button>)}</div></div>
   {loading?<div className="p-12 text-center"><Loader2 className="w-7 h-7 animate-spin mx-auto text-[#176B4D]"/></div>:error?<div className="p-8 text-center rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20"><p className="text-sm font-bold">দোয়া API পাওয়া যাচ্ছে না</p><button onClick={()=>location.reload()} className="mt-3 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold"><RefreshCw className="w-3.5 h-3.5 inline mr-1"/>আবার চেষ্টা করুন</button></div>:<>{filtered.map(d=><DuaCard key={d.id} dua={d} isBookmarked={bookmarks.includes(d.id)} onToggleBookmark={toggle}/>)}</>}
   <p className="text-[10px] text-[#717A74]">সূত্র: <a href={DUA_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">{DUA_SOURCE_LABEL}</a> • কনটেন্ট অনলাইনে লোড হয়</p>
  </div>}
 </div>;
};
