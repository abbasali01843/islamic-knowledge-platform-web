import type { DuaCategory, DuaCategoryKey, DuaItem } from '../types/dua';

const API_ROOT = 'https://dua-api.hisnul.workers.dev/api';
const REQUEST_TIMEOUT_MS = 10000;
const DETAIL_CONCURRENCY = 4;
export const DUA_SOURCE_LABEL = 'ThelightHub Hisnul Muslim Dua API';
export const DUA_SOURCE_URL = 'https://github.com/ThelightHub/dua-api';

type ApiDua = { dua_global_id:number; duaname:string; categories?:Array<{id:number;name:string}>; segments?:Array<{arabic?:string;transliteration?:string;translations?:string;reference?:string}> };
type ApiResponse = { success?:boolean; data?:ApiDua[]; pagination?:{pages:number} };

export const DUA_CATEGORIES: DuaCategory[] = [
 {id:'ALL',nameBengali:'সব দোয়া',nameEnglish:'All',iconName:'BookOpen',description:'অনলাইন Hisnul Muslim API'},
 {id:'MORNING_EVENING',nameBengali:'সকাল-সন্ধ্যা',nameEnglish:'Morning & Evening',iconName:'Sun',description:'সকাল ও সন্ধ্যার আমল'},
 {id:'SLEEP',nameBengali:'ঘুম',nameEnglish:'Sleep',iconName:'Moon',description:'ঘুম ও জাগরণের আমল'},
 {id:'PRAYER_SALAH',nameBengali:'সালাত',nameEnglish:'Prayer',iconName:'Sparkles',description:'সালাত সম্পর্কিত দোয়া'},
 {id:'FOOD_DRINK',nameBengali:'খাবার',nameEnglish:'Food & Drink',iconName:'Utensils',description:'খাবার ও পানীয়'},
 {id:'HOME_ENTER_EXIT',nameBengali:'বাড়ি',nameEnglish:'Home',iconName:'Home',description:'বাড়িতে প্রবেশ ও বের হওয়ার আমল'},
 {id:'TRAVEL_MOSQUE',nameBengali:'সফর ও মসজিদ',nameEnglish:'Travel & Mosque',iconName:'MapPin',description:'সফর ও মসজিদ সম্পর্কিত আমল'},
 {id:'DISTRESS_FORGIVENESS',nameBengali:'বিপদ ও ক্ষমা',nameEnglish:'Distress & Forgiveness',iconName:'Heart',description:'বিপদ, দুঃখ ও ক্ষমা প্রার্থনা'},
 {id:'SICKNESS_RUQYAH',nameBengali:'অসুস্থতা ও রুকইয়াহ',nameEnglish:'Sickness & Ruqyah',iconName:'Shield',description:'অসুস্থতা ও রুকইয়াহ'},
 {id:'FAVORITES',nameBengali:'বুকমার্ক',nameEnglish:'Favorites',iconName:'Bookmark',description:'আপনার সংরক্ষিত দোয়া'}
];

function mapCategory(name:string): DuaCategoryKey {
 const n=name.toLowerCase();
 if(/সকাল|সন্ধ্যা/.test(n)) return 'MORNING_EVENING';
 if(/ঘুম|জাগ/.test(n)) return 'SLEEP';
 if(/সালাত|নামাজ|ওযু|অজু/.test(n)) return 'PRAYER_SALAH';
 if(/খাবার|পান/.test(n)) return 'FOOD_DRINK';
 if(/বাড়ি|বাড়ি|প্রবেশ|বের/.test(n)) return 'HOME_ENTER_EXIT';
 if(/সফর|মসজিদ|ভ্রমণ/.test(n)) return 'TRAVEL_MOSQUE';
 if(/বিপদ|ক্ষমা|ইস্তিগফার|দুঃখ/.test(n)) return 'DISTRESS_FORGIVENESS';
 if(/অসুস্থ|রুকইয়াহ|রুকইয়া/.test(n)) return 'SICKNESS_RUQYAH';
 return 'ALL';
}

function withTimeout(signal?:AbortSignal): {signal:AbortSignal; cleanup:()=>void} {
 const controller=new AbortController();
 const timeoutId=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
 const abort=()=>controller.abort();
 if(signal){
  if(signal.aborted) controller.abort();
  else signal.addEventListener('abort',abort,{once:true});
 }
 return {signal:controller.signal,cleanup:()=>{window.clearTimeout(timeoutId);signal?.removeEventListener('abort',abort);}};
}

async function getPage(page:number,signal?:AbortSignal):Promise<{items:ApiDua[];pages:number}> {
 const request=withTimeout(signal);
 try {
  const res=await fetch(API_ROOT+'/books/1/duas?page='+page+'&limit=20',{headers:{Accept:'application/json'},signal:request.signal});
  if(!res.ok) throw new Error('Dua API '+res.status);
  const json=(await res.json()) as ApiResponse;
  return {items:Array.isArray(json.data)?json.data:[],pages:Math.max(1,Number(json.pagination?.pages||1))};
 } finally { request.cleanup(); }
}

async function getDuaDetail(id:number,signal?:AbortSignal):Promise<ApiDua> {
 const request=withTimeout(signal);
 try {
  const res=await fetch(API_ROOT+'/duas/'+id,{headers:{Accept:'application/json'},signal:request.signal});
  if(!res.ok) throw new Error('Dua API '+res.status);
  const json=(await res.json()) as {data?:ApiDua};
  if(!json.data) throw new Error('Dua detail unavailable');
  return json.data;
 } finally { request.cleanup(); }
}

async function getDetailsWithConcurrency(items:ApiDua[],signal?:AbortSignal):Promise<ApiDua[]> {
 const output:Array<ApiDua|undefined>=new Array(items.length);
 let cursor=0;
 async function worker(){
  while(true){
   if(signal?.aborted) throw new DOMException('Aborted','AbortError');
   const index=cursor++;
   if(index>=items.length) return;
   output[index]=await getDuaDetail(items[index].dua_global_id,signal);
  }
 }
 await Promise.all(Array.from({length:Math.min(DETAIL_CONCURRENCY,items.length)},()=>worker()));
 return output.filter((item):item is ApiDua=>Boolean(item));
}

export async function fetchLiveDuas(signal?:AbortSignal):Promise<DuaItem[]> {
 const first=await getPage(1,signal);
 const detailed=await getDetailsWithConcurrency(first.items,signal);
 return detailed.map((d):DuaItem=> {
   const segment=d.segments?.[0]||{};
   const category=mapCategory(d.categories?.[0]?.name||'');
   return {id:'api-dua-'+d.dua_global_id,category,titleBengali:d.duaname,arabicText:d.segments?.map(s=>s.arabic||'').filter(Boolean).join('\n')||'',bengaliTransliteration:d.segments?.map(s=>s.transliteration||'').filter(Boolean).join('\n')||'',bengaliMeaning:d.segments?.map(s=>s.translations||'').filter(Boolean).join('\n')||'',reference:segment.reference||'Hisnul Muslim',tags:(d.categories||[]).map(c=>c.name),sourceLabel:DUA_SOURCE_LABEL,sourceUrl:DUA_SOURCE_URL};
 });
}
