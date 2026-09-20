import React,{useEffect,useState,useCallback} from 'react';
import {ArrowLeft,CheckCircle2,Compass,Flame,GraduationCap,MapPin,ScrollText,RefreshCw} from 'lucide-react';
import {fetchWebModulesContent} from '../services/webModulesApi';
import type {GuideItem,QuizItem,WebModulesContent} from '../services/webModulesApi';

type ModuleId='QIBLA'|'RAMADAN'|'HAJJ'|'SEERAH'|'QUIZ';
const modules=[
 {id:'QIBLA' as const,title:'কিবলা',icon:Compass,desc:'ব্রাউজারের GPS ও orientation ব্যবহার করে কাবার দিক নির্ণয় করুন।'},
 {id:'RAMADAN' as const,title:'রমজান',icon:Flame,desc:'অনলাইন উৎস-ভিত্তিক রমজান গাইড ও সময়সূচির নির্দেশনা।'},
 {id:'HAJJ' as const,title:'হজ',icon:MapPin,desc:'অনলাইন উৎস-ভিত্তিক হজের ধাপ ও প্রয়োজনীয় নির্দেশনা।'},
 {id:'SEERAH' as const,title:'সীরাত',icon:ScrollText,desc:'উৎস-উল্লেখসহ রাসূল ﷺ-এর জীবনের ধারাবাহিক পাঠ।'},
 {id:'QUIZ' as const,title:'কুইজ',icon:GraduationCap,desc:'উৎস-উল্লেখসহ ইসলামিক জ্ঞান যাচাইয়ের ছোট কুইজ।'}
];

export const WebModulesScreen:React.FC<{onBack:()=>void;initialModule?:ModuleId}>=({onBack,initialModule})=>{
 const [active,setActive]=useState<ModuleId|null>(initialModule??null);
 const [content,setContent]=useState<WebModulesContent|null>(null);
 const [contentError,setContentError]=useState('');
 const [loadingContent,setLoadingContent]=useState(true);
 const [q,setQ]=useState(0); const [score,setScore]=useState(0); const [answered,setAnswered]=useState(false);
 const [heading,setHeading]=useState(0); const [orientationSupported,setOrientationSupported]=useState(true); const [geo,setGeo]=useState<string>('অবস্থান নেওয়া হয়নি'); const [qibla,setQibla]=useState<number|null>(null); const [compassActive,setCompassActive]=useState(false); const [geoError,setGeoError]=useState(''); const [compassError,setCompassError]=useState('');
 useEffect(()=>{setActive(initialModule??null);setQ(0);setScore(0);setAnswered(false)},[initialModule]);
 const loadContent=async()=>{setLoadingContent(true);setContentError('');try{setContent(await fetchWebModulesContent())}catch(e){setContentError(e instanceof Error?e.message:'অনলাইন কনটেন্ট লোড করা যায়নি।')}finally{setLoadingContent(false)}};
 useEffect(()=>{loadContent()},[]);
 useEffect(()=>{setOrientationSupported('DeviceOrientationEvent' in window)},[]);
 const select=(id:ModuleId)=>{setActive(id);setQ(0);setScore(0);setAnswered(false);};
 const locate=()=>{setGeoError('');if(!window.isSecureContext){setGeoError('GPS-এর জন্য HTTPS বা localhost প্রয়োজন।');return;}if(!navigator.geolocation){setGeoError('এই ব্রাউজারে GPS সমর্থিত নয়।');return;}navigator.geolocation.getCurrentPosition(p=>{const lat=p.coords.latitude,lon=p.coords.longitude;setGeo(lat.toFixed(5)+', '+lon.toFixed(5));const kaabaLat=21.422487*Math.PI/180,kaabaLon=39.826206*Math.PI/180,phi=lat*Math.PI/180,lam=lon*Math.PI/180;const y=Math.sin(kaabaLon-lam)*Math.cos(kaabaLat);const x=Math.cos(phi)*Math.sin(kaabaLat)-Math.sin(phi)*Math.cos(kaabaLat)*Math.cos(kaabaLon-lam);setQibla((Math.atan2(y,x)*180/Math.PI+360)%360)},e=>setGeoError(e.code===1?'অবস্থান অনুমতি দেওয়া হয়নি।':'GPS অবস্থান পাওয়া যায়নি।'),{enableHighAccuracy:true,timeout:10000,maximumAge:0});};
 const onOrientation=useCallback((e:DeviceOrientationEvent)=>{const webkit=e as DeviceOrientationEvent & {webkitCompassHeading?:number};const a=typeof webkit.webkitCompassHeading==='number'?webkit.webkitCompassHeading:e.alpha;if(a!=null)setHeading(a)},[]);
 const startCompass=async()=>{setCompassError('');if(!orientationSupported){setCompassError('এই ব্রাউজারে device orientation সমর্থিত নয়।');return;}if(!window.isSecureContext){setCompassError('কম্পাসের জন্য HTTPS বা localhost প্রয়োজন।');return;}try{const D=DeviceOrientationEvent as unknown as {requestPermission?:()=>Promise<string>};if(D.requestPermission){const ok=await D.requestPermission();if(ok!=='granted'){setCompassError('কম্পাস ব্যবহারের অনুমতি দেওয়া হয়নি।');return;}}window.addEventListener('deviceorientationabsolute',onOrientation as EventListener);window.addEventListener('deviceorientation',onOrientation as EventListener); setCompassActive(true)}catch{setCompassActive(false);setCompassError('এই ডিভাইসে কম্পাস চালু করা যায়নি।')}};
 useEffect(()=>()=>{window.removeEventListener('deviceorientationabsolute',onOrientation as EventListener);window.removeEventListener('deviceorientation',onOrientation as EventListener)},[onOrientation]);
 const answer=(a:string,quiz:QuizItem[])=>{if(answered)return;setAnswered(true);if(a===quiz[q].answer)setScore(s=>s+1);};
 const guide=(title:string,items:GuideItem[])=><Guide title={title} items={items}/>;
 const quiz=content?.quiz??[];
 return <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
  <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#176B4D]"><ArrowLeft className="w-4 h-4"/>ফিরে যান</button>
  {!active?<><div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#176B4D] to-[#0A3D2B] text-white"><h1 className="text-2xl sm:text-3xl font-black">ইসলামিক জ্ঞান ও আমল</h1><p className="mt-2 text-sm sm:text-base text-white/80">অনলাইন উৎস-ভিত্তিক কনটেন্ট—ইসলামিক কনটেন্ট অফলাইনে ক্যাশ করা হয় না।</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{modules.map(m=>{const I=m.icon;return <button key={m.id} onClick={()=>select(m.id)} className="text-left p-5 rounded-3xl bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60 hover:-translate-y-0.5 transition-transform"><I className="w-7 h-7 text-[#176B4D]"/><h2 className="mt-3 font-black">{m.title}</h2><p className="mt-1 text-xs text-[#717A74]">{m.desc}</p></button>})}</div></>:
  <div className="rounded-3xl p-5 sm:p-8 bg-white dark:bg-[#1A221C] border border-[#E8EFEA] dark:border-[#3A4D43]/60">
   <button onClick={()=>setActive(null)} className="text-xs font-bold text-[#176B4D]">← সব মডিউল</button>
   {active==='QIBLA'&&<div className="text-center py-8 space-y-5 max-w-xl mx-auto"><Compass className="w-24 h-24 mx-auto text-[#176B4D]" style={{transform:'rotate('+((qibla??0)-heading)+'deg)'}}/><h2 className="text-xl font-black">কিবলা কম্পাস</h2><p className="text-xs text-[#717A74]">কাবার দিক পেতে GPS ও device orientation অনুমতি দিন।</p><button onClick={locate} className="px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold">GPS অবস্থান</button><p className="text-xs">{geo}</p>{qibla!=null&&<p className="text-xs text-[#717A74]">ফোনটি সমতল রেখে ধীরে ঘোরান। তীরটি কাবার দিকে নির্দেশ করবে। কম্পাসের পাঠ অস্থির হলে খোলা জায়গায় আবার চেষ্টা করুন।</p>}{geoError&&<p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{geoError}</p>}<button onClick={startCompass} className="px-4 py-2 rounded-xl border text-xs font-bold">{compassActive?'কম্পাস চালু':'কম্পাস চালু করুন'}</button>{compassError&&<p role="alert" className="text-xs font-semibold text-amber-700 dark:text-amber-300">{compassError}</p>}{qibla!=null&&<p className="text-xs font-bold">কিবলা বিয়ারিং: {qibla.toFixed(1)}°</p>}</div>}
   {loadingContent&&active!=='QIBLA'&&<div className="py-16 text-center text-sm text-[#717A74]">অনলাইন কনটেন্ট লোড হচ্ছে…</div>}
   {!loadingContent&&contentError&&active!=='QIBLA'&&<div className="py-12 text-center space-y-3"><p className="text-sm font-semibold">{contentError}</p><button onClick={loadContent} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold"><RefreshCw className="w-4 h-4"/>আবার চেষ্টা করুন</button></div>}
   {!loadingContent&&!contentError&&content&&active==='RAMADAN'&&guide('রমজান',content.ramadan)}
   {!loadingContent&&!contentError&&content&&active==='HAJJ'&&guide('হজের ধাপ',content.hajj)}
   {!loadingContent&&!contentError&&content&&active==='SEERAH'&&guide('সীরাত পাঠ',content.seer)}
   {!loadingContent&&!contentError&&content&&active==='QUIZ'&&<div className="py-5 space-y-5 max-w-2xl mx-auto">{quiz.length>0&&<><div className="flex justify-between text-xs font-bold"><span>প্রশ্ন {q+1}/{quiz.length}</span><span>স্কোর: {score}</span></div><h2 className="text-xl font-black">{quiz[q].question}</h2><div className="grid gap-2">{quiz[q].options.map(a=><button key={a} onClick={()=>answer(a,quiz)} className="text-left p-4 rounded-2xl border font-semibold hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943]">{a}</button>)}</div>{answered&&(q<quiz.length-1?<button onClick={()=>{setQ(x=>x+1);setAnswered(false)}} className="px-4 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold">পরের প্রশ্ন</button>:<div className="p-4 rounded-2xl bg-[#E8EFEA] font-bold">কুইজ শেষ — স্কোর {score}/{quiz.length} <button className="ml-3 underline" onClick={()=>{setQ(0);setScore(0);setAnswered(false)}}>আবার শুরু</button></div>)}{answered&&<p className="text-xs text-[#717A74]">উৎস: {quiz[q].source}</p>}</>}</div>}
   {content&&active!=='QIBLA'&&active!=='QUIZ'&&<p className="mt-6 text-[11px] text-[#717A74] text-center">কনটেন্ট সংস্করণ {content.version} • আপডেট {content.updatedAt} • উৎস-উল্লেখ প্রতিটি অংশে দেওয়া আছে।</p>}
  </div>}
 </div>;
};

const Guide:React.FC<{title:string,items:GuideItem[]}>=({title,items})=><div className="py-5 space-y-4 max-w-3xl mx-auto"><h2 className="text-2xl font-black">{title}</h2>{items.map((x,i)=><div key={x.title} className="p-4 rounded-2xl bg-[#F4F8F5] dark:bg-[#1E2821]"><div className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#176B4D] shrink-0"/><div><b>{i+1}. {x.title}</b><p className="mt-1 text-sm leading-6">{x.text}</p><p className="mt-2 text-[11px] text-[#717A74]">উৎস: {x.source}</p></div></div></div>)}</div>;
