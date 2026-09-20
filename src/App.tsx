import React,{useState,useEffect} from 'react';
import {Sun,Moon} from 'lucide-react';
import type {Surah,HomeDestination} from './types';
import {findQuranSurah} from './data/quranCatalog';
import {HomeScreen} from './components/HomeScreen';
import {QuranScreen} from './components/QuranScreen';
import {QuranReaderScreen} from './components/QuranReaderScreen';
import {PrayerTimesScreen} from './components/prayer/PrayerTimesScreen';
import {DuaScreen} from './components/dua/DuaScreen';
import {HadithScreen} from './components/hadith/HadithScreen';
import {LearnSalahScreen} from './components/learn/LearnSalahScreen';
import {ZakatScreen} from './components/zakat/ZakatScreen';
import {CalendarScreen} from './components/calendar/CalendarScreen';
import {Navbar} from './components/Navbar';
import {WebModulesScreen} from './components/WebModulesScreen';
import {PwaInstallPrompt} from './components/PwaInstallPrompt';

type Special='LEARN_SALAH'|'ZAKAT'|'CALENDAR'|null;
type WebModule='QIBLA'|'RAMADAN'|'HAJJ'|'SEERAH'|'QUIZ';
const moduleByPath:Record<string,WebModule>={'/qibla':'QIBLA','/ramadan':'RAMADAN','/hajj':'HAJJ','/seerah':'SEERAH','/quiz':'QUIZ'};

export const App:React.FC=()=>{
 const [selectedTab,setSelectedTab]=useState(0),[selectedSurahNumber,setSelectedSurahNumber]=useState(0),[selectedAyah,setSelectedAyah]=useState(0);
 const [showWebModules,setShowWebModules]=useState(false),[activeWebModule,setActiveWebModule]=useState<WebModule|null>(null);
 const [activeSpecialModule,setActiveSpecialModule]=useState<Special>(null);
 const [isOnline,setIsOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
 const [isDarkMode,setIsDarkMode]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const online=()=>setIsOnline(true),offline=()=>setIsOnline(false);window.addEventListener('online',online);window.addEventListener('offline',offline);return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offline)}},[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',isDarkMode)},[isDarkMode]);
 const applyRoute=()=>{
  const path=window.location.pathname.replace(/\/+$/,'')||'/';const queryModule=new URLSearchParams(window.location.search).get('module');
  setShowWebModules(false);setActiveWebModule(null);setActiveSpecialModule(null);setSelectedSurahNumber(0);setSelectedAyah(0);
  if(queryModule==='quran'){setSelectedTab(1);return} if(queryModule==='hadith'){setSelectedTab(4);return}
  if(path.startsWith('/quran/')){const n=Number(path.split('/')[2]);if(Number.isInteger(n)&&findQuranSurah(n)){setSelectedTab(1);setSelectedSurahNumber(n);return}}
  const tabs:Record<string,number>={'/':0,'/quran':1,'/prayer':2,'/dua':3,'/hadith':4};if(tabs[path]!==undefined){setSelectedTab(tabs[path]);return}
  if(path==='/learn/salah'){setActiveSpecialModule('LEARN_SALAH');return}if(path==='/zakat'){setActiveSpecialModule('ZAKAT');return}if(path==='/calendar'){setActiveSpecialModule('CALENDAR');return}
  if(moduleByPath[path]){setShowWebModules(true);setActiveWebModule(moduleByPath[path]);return}
 };
 const navigate=(path:string)=>{window.history.pushState({},'',path);applyRoute()};
 useEffect(()=>{applyRoute();const onPopState=()=>applyRoute();window.addEventListener('popstate',onPopState);return()=>window.removeEventListener('popstate',onPopState)},[]);
 const selectedSurah=findQuranSurah(selectedSurahNumber),isReaderOpen=selectedTab===1&&!!selectedSurah;
 const openSurah=(surah:Surah,ayahNumber:number|null)=>{navigate('/quran/'+surah.number);setSelectedSurahNumber(surah.number);setSelectedAyah(ayahNumber||0)};
 const handleQuickAction=(dest:HomeDestination)=>{const paths:Partial<Record<HomeDestination,string>>={QURAN:'/quran',PRAYER:'/prayer',DUA:'/dua',HADITH:'/hadith',LEARN_SALAH:'/learn/salah',ZAKAT:'/zakat',CALENDAR:'/calendar'};const p=paths[dest];if(p)navigate(p)};
 return <div className="min-h-screen bg-[#F7FAF7] dark:bg-[#101511] text-[#181D19] dark:text-[#E1E5E1] transition-colors flex flex-col">
  {!isReaderOpen&&!activeSpecialModule&&<header className="sticky top-0 z-30 bg-[#F7FAF7]/95 dark:bg-[#101511]/95 backdrop-blur border-b border-[#E8EFEA] dark:border-[#3A4D43]/60 px-4 py-2.5"><div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="font-bold text-base sm:text-lg tracking-tight text-[#176B4D] dark:text-[#9DD6B9]">ইসলামিক জ্ঞান</span><span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-[#D4F2E2] text-[#002114] dark:bg-[#005236] dark:text-[#D4F2E2] font-semibold">Web</span></div><div className="flex items-center gap-2"><button type="button" onClick={()=>navigate('/qibla')} className="px-3 py-2 rounded-xl bg-[#D4F2E2] dark:bg-[#005236] text-[#176B4D] dark:text-[#D4F2E2] text-xs font-bold">কিবলা</button><button type="button" onClick={()=>setIsDarkMode(v=>!v)} aria-label={isDarkMode?'লাইট মোড':'ডার্ক মোড'} className="p-2 rounded-xl text-[#414A45] dark:text-[#C1CAC4] hover:bg-[#E8EFEA] dark:hover:bg-[#3F4943] transition-colors">{isDarkMode?<Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}</button></div></div></header>}
  <main className="flex-1 w-full">{!isOnline&&<div className="sticky top-0 z-40 px-4 py-2 text-center text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-b border-amber-200 dark:border-amber-900">ইন্টারনেট সংযোগ নেই — এই Web App অনলাইন-ভিত্তিক; ডাটা লোড করতে ইন্টারনেট প্রয়োজন।</div>}
   {showWebModules&&<WebModulesScreen initialModule={activeWebModule??undefined} onBack={()=>navigate('/')}/>}
   {!showWebModules&&(activeSpecialModule==='LEARN_SALAH'?<LearnSalahScreen onBack={()=>navigate('/')}/>:activeSpecialModule==='ZAKAT'?<ZakatScreen onBack={()=>navigate('/')}/>:activeSpecialModule==='CALENDAR'?<CalendarScreen onBack={()=>navigate('/')}/>:<>
    {selectedTab===0&&<HomeScreen onQuickActionClick={handleQuickAction}/>}
    {selectedTab===1&&(!selectedSurah?<QuranScreen onSurahClick={openSurah}/>:<QuranReaderScreen surah={selectedSurah} initialAyah={selectedAyah>0?selectedAyah:null} onBack={()=>navigate('/quran')} onNavigateToSurah={next=>navigate('/quran/'+next.number)}/>)}
    {selectedTab===2&&<PrayerTimesScreen/>}{selectedTab===3&&<DuaScreen/>}{selectedTab===4&&<HadithScreen/>}
   </>)}
  </main>
  {!showWebModules&&!isReaderOpen&&<Navbar selectedTab={activeSpecialModule?-1:selectedTab} onSelectTab={idx=>navigate(['/', '/quran','/prayer','/dua','/hadith'][idx]||'/')}/>}
  <PwaInstallPrompt />
 </div>;
};
