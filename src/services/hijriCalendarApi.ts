export interface HijriDate {
  readable:string; gregorian:string; hijriDay:number; hijriMonth:number; hijriYear:number;
  monthNameBn:string; monthNameAr:string; weekdayBn:string;
}
const ROOT='https://api.aladhan.com/v1';
const MONTHS=[
 ['মুহররম','مُحَرَّم'],['সফর','صَفَر'],['রবিউল আউয়াল','رَبِيع الأَوَّل'],['রবিউস সানি','رَبِيع الآخِر'],
 ['জমাদিউল আউয়াল','جُمَادَى الأُولَى'],['জমাদিউস সানি','جُمَادَى الآخِرَة'],['রজব','رَجَب'],['শাবান','شَعْبَان'],
 ['রমজান','رَمَضَان'],['শাওয়াল','شَوَّال'],['জিলকদ','ذُو القَعْدَة'],['জিলহজ','ذُو الحِجَّة']
];
const bnDays=['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
const parse=(x:any):HijriDate=>{const h=x.hijri,g=x.gregorian;const n=Number(h.day),m=Number(h.month.number);return {readable:g.date,gregorian:g.date,hijriDay:n,hijriMonth:m,hijriYear:Number(h.year),monthNameBn:MONTHS[m-1]?.[0]??h.month.en,monthNameAr:MONTHS[m-1]?.[1]??h.month.ar,weekdayBn:bnDays[new Date(g.date.split('-').reverse().join('-')).getDay()]};};
export async function fetchHijriDate(date=new Date()):Promise<HijriDate>{const dd=String(date.getDate()).padStart(2,'0'),mm=String(date.getMonth()+1).padStart(2,'0'),yy=date.getFullYear();const r=await fetch(`${ROOT}/gToH/${dd}-${mm}-${yy}`,{cache:'no-store'});if(!r.ok)throw Error('Hijri date unavailable');const j=await r.json();return parse(j.data);}
export async function fetchHijriMonth(year:number,month:number){const r=await fetch(`${ROOT}/hijriCalendar/${year}/${month}?latitude=22.3569&longitude=91.7832&method=1`,{cache:'no-store'});if(!r.ok)throw Error('Hijri calendar unavailable');return (await r.json()).data;}
export {MONTHS};