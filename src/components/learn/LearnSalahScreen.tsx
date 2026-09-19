import React,{useEffect,useState} from 'react';
import {ArrowLeft,BookOpen,Droplet,Loader2,RefreshCw,Copy,Check} from 'lucide-react';
import {fetchSalahGuide,SalahGuideContent} from '../../services/salahGuideApi';

interface Props{onBack:()=>void}
type Tab='salah'|'rakat'|'wudu';

export const LearnSalahScreen:React.FC<Props>=({onBack})=>{
 const [data,setData]=useState<SalahGuideContent|null>(null);
 const [tab,setTab]=useState<Tab>('salah');
 const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const [copied,setCopied]=useState<string|null>(null);
 const load=async()=>{setLoading(true);setError('');try{setData(await fetchSalahGuide())}catch{setError('ইন্টারনেট সংযোগ প্রয়োজন। গাইডটি অনলাইন উৎস থেকে লোড করা যাচ্ছে না।')}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const copy=async(id:string,text:string)=>{try{await navigator.clipboard.writeText(text);setCopied(id);setTimeout(()=>setCopied(null),1500)}catch{}};
 return <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-5">
  <div className="flex items-center gap-3"><button onClick={onBack} className="p-2.5 rounded-2xl border"><ArrowLeft className="w-5 h-5"/></button><div><h1 className="text-xl font-black">সালাত ও অজু শিক্ষা</h1><p className="text-xs text-[#717A74]">অনলাইন, উৎস-উল্লেখসহ গাইড</p></div></div>
  {loading?<div className="py-16 text-center"><Loader2 className="w-7 h-7 animate-spin mx-auto text-[#176B4D]"/><p className="mt-3 text-sm">গাইড লোড হচ্ছে…</p></div>:
  error?<div className="p-6 rounded-3xl border text-center space-y-3"><p className="text-sm">{error}</p><button onClick={()=>void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold"><RefreshCw className="w-4 h-4"/>আবার চেষ্টা করুন</button></div>:
  data&&<><div className="flex gap-2 p-1.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#222C25] overflow-x-auto">
   {([['salah','নামাজের ধাপ',BookOpen],['rakat','রাকাত সূচি',BookOpen],['wudu','অজু',Droplet]] as const).map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={'flex-1 min-w-[110px] py-2.5 rounded-xl text-xs font-bold '+(tab===id?'bg-white dark:bg-[#1A221C] text-[#176B4D] shadow-sm':'text-[#414A45]') }><Icon className="w-4 h-4 inline mr-1.5"/>{label}</button>)}
  </div>
  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 text-xs">{data.methodology}</div>
  {tab==='salah'&&<div className="space-y-3">{data.salahSteps.map((s,i)=><div key={s.id} className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border"><div className="flex justify-between gap-3"><div><span className="text-[11px] text-[#176B4D] font-bold">ধাপ {i+1}</span><h2 className="font-black mt-1">{s.title}</h2></div><button onClick={()=>void copy(s.id,s.arabic+'\n'+s.meaning)} className="p-2"><{copied===s.id?Check:Copy} className="w-4 h-4"/></button></div><p dir="rtl" className="mt-4 text-xl leading-loose text-[#176B4D]">{s.arabic}</p><p className="mt-3 text-sm font-semibold">{s.meaning}</p><p className="mt-2 text-xs text-[#717A74] leading-relaxed">{s.instruction}</p></div>)}</div>}
  {tab==='rakat'&&<div className="space-y-3">{data.prayers.map(p=><div key={p.id} className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border"><div className="flex justify-between"><h2 className="font-black">{p.name}</h2><span className="text-[#176B4D] font-black">{p.farz} ফরজ</span></div><p className="mt-2 text-sm">{p.sunnah}</p><p className="mt-2 text-xs text-[#717A74]">{p.note}</p></div>)}</div>}
  {tab==='wudu'&&<div className="space-y-3"><div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border"><h2 className="font-black">হানাফি-ভিত্তিক ৪ ফরজ</h2><ol className="mt-3 space-y-1 text-sm">{data.wuduFarz.map(x=><li key={x}>• {x}</li>)}</ol></div>{data.wuduSteps.map(s=><div key={s.id} className="p-5 rounded-3xl bg-white dark:bg-[#1A221C] border"><div className="flex justify-between gap-3"><h2 className="font-black">{s.title}</h2><span className="text-[11px] text-[#176B4D]">{s.type}</span></div>{s.arabic&&<p dir="rtl" className="mt-3 text-lg text-[#176B4D]">{s.arabic}</p>}<p className="mt-2 text-sm text-[#717A74]">{s.instruction}</p></div>)}</div>}
  <div className="pt-2 text-[11px] text-[#717A74]">উৎস: {data.sources.map((s,i)=><React.Fragment key={s.url}>{i>0?' • ':''}<a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></React.Fragment>)}</div></>}
 </div>
}