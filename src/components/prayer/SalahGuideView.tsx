import React,{useEffect,useState} from 'react';
import {BookOpen,Loader2,RefreshCw} from 'lucide-react';
import {fetchSalahGuide,SalahGuideContent} from '../../services/salahGuideApi';

export const SalahGuideView:React.FC=()=>{
 const [data,setData]=useState<SalahGuideContent|null>(null);const [error,setError]=useState('');
 const load=async()=>{setError('');try{setData(await fetchSalahGuide())}catch{setError('অনলাইন গাইড লোড করা যায়নি।')}};
 useEffect(()=>{void load()},[]);
 if(!data&&!error)return <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#176B4D]"/></div>;
 if(error)return <div className="p-5 rounded-3xl border text-center space-y-3"><p className="text-sm">{error}</p><button onClick={()=>void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold"><RefreshCw className="w-4 h-4"/>আবার চেষ্টা করুন</button></div>;
 return <div className="space-y-4"><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#176B4D]"/><h2 className="font-black">সালাতের সংক্ষিপ্ত গাইড</h2></div><p className="text-xs text-[#717A74]">{data!.methodology}</p>{data!.salahSteps.map((s,i)=><div key={s.id} className="p-5 rounded-3xl border bg-white dark:bg-[#1A221C]"><span className="text-[11px] font-bold text-[#176B4D]">ধাপ {i+1}</span><h3 className="font-black mt-1">{s.title}</h3><p dir="rtl" className="mt-3 text-xl leading-loose text-[#176B4D]">{s.arabic}</p><p className="mt-2 text-sm">{s.meaning}</p><p className="mt-2 text-xs text-[#717A74]">{s.instruction}</p></div>)}</div>;
};