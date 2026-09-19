import type { DuaCategory, DuaCategoryKey, DuaItem } from '../types/dua';

const API_ROOT = 'https://dua-api.hisnul.workers.dev/api';
export const DUA_SOURCE_LABEL = 'ThelightHub Hisnul Muslim Dua API';
export const DUA_SOURCE_URL = 'https://github.com/ThelightHub/dua-api';

type ApiDua = { dua_global_id:number; duaname:string; categories?:Array<{id:number;name:string}>; segments?:Array<{arabic?:string;translations?:string;reference?:string}> };
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

async function getPage(page:number):Promise<ApiDua[]> {
 const res=await fetch(API_ROOT+'/books/1/duas?page='+page+'&limit=100',{headers:{Accept:'application/json'}});
 if(!res.ok) throw new Error('Dua API '+res.status);
 const json=(await res.json()) as ApiResponse;
 return Array.isArray(json.data)?json.data:[];
}

export async function fetchLiveDuas():Promise<DuaItem[]> {
 const first=await getPage(1);
 const pages=first.length?Math.max(1,Number((await fetch(API_ROOT+'/books/1/duas?page=1&limit=100').then(r=>r.json()) as ApiResponse).pagination?.pages||1)):1;
 const rest=await Promise.all(Array.from({length:Math.max(0,pages-1)},(_,i)=>getPage(i+2)));
 return [...first,...rest.flat()].map((d):DuaItem=> {
   const segment=d.segments?.[0]||{};
   const category=mapCategory(d.categories?.[0]?.name||'');
   return {id:'api-dua-'+d.dua_global_id,category,titleBengali:d.duaname,arabicText:d.segments?.map(s=>s.arabic||'').filter(Boolean).join('\n'),bengaliTransliteration:'',bengaliMeaning:d.segments?.map(s=>s.translations||'').filter(Boolean).join('\n'),reference:segment.reference||'Hisnul Muslim',tags:(d.categories||[]).map(c=>c.name),sourceLabel:DUA_SOURCE_LABEL,sourceUrl:DUA_SOURCE_URL};
 });
}
