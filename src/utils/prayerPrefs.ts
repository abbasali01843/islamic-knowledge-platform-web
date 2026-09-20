import type { LocationConfig, Madhab, CalculationMethod, DailySalahTracker } from '../types/prayer';

const PREFS_KEY='ikp-prayer-prefs-v1';
const TRACKER_KEY='ikp-salah-tracker-v1';

export type PrayerPrefs={location:LocationConfig|null;madhab:Madhab;calcMethod:CalculationMethod};
const DEFAULT_PREFS:PrayerPrefs={location:null,madhab:'HANAFI',calcMethod:'IFB'};

function emptyTracker(dateKey:string):DailySalahTracker{return{date:dateKey,fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false};}
function isCalculationMethod(value:unknown):value is CalculationMethod{return value==='IFB'||value==='MWL'||value==='ISNA'||value==='UMM_AL_QURA'||value==='EGYPT';}

export function loadPrayerPrefs():PrayerPrefs{
  if(typeof window==='undefined')return{...DEFAULT_PREFS};
  try{
    const raw=localStorage.getItem(PREFS_KEY);if(!raw)return{...DEFAULT_PREFS};
    const data=JSON.parse(raw) as Partial<PrayerPrefs>;
    return{
      location:data.location&&typeof data.location==='object'&&typeof data.location.latitude==='number'?(data.location as LocationConfig):null,
      madhab:data.madhab==='STANDARD'?'STANDARD':'HANAFI',
      calcMethod:isCalculationMethod(data.calcMethod)?data.calcMethod:'IFB',
    };
  }catch{return{...DEFAULT_PREFS};}
}
export function savePrayerPrefs(prefs:PrayerPrefs):void{if(typeof window==='undefined')return;try{localStorage.setItem(PREFS_KEY,JSON.stringify(prefs));}catch{}}
export function loadSalahTracker(dateKey:string):DailySalahTracker{if(typeof window==='undefined')return emptyTracker(dateKey);try{const raw=localStorage.getItem(TRACKER_KEY);if(!raw)return emptyTracker(dateKey);const data=JSON.parse(raw) as DailySalahTracker;if(data&&data.date===dateKey)return{date:dateKey,fajr:!!data.fajr,dhuhr:!!data.dhuhr,asr:!!data.asr,maghrib:!!data.maghrib,isha:!!data.isha};return emptyTracker(dateKey);}catch{return emptyTracker(dateKey);}}
export function saveSalahTracker(tracker:DailySalahTracker):void{if(typeof window==='undefined')return;try{localStorage.setItem(TRACKER_KEY,JSON.stringify(tracker));}catch{}}
