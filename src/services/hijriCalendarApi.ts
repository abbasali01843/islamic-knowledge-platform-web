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

function datePartsInTimezone(date: Date, timezone?: number): { day:number; month:number; year:number } {
  if (timezone === undefined || !Number.isFinite(timezone)) {
    return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
  }
  const shifted = new Date(date.getTime() + timezone * 60 * 60 * 1000);
  return { day: shifted.getUTCDate(), month: shifted.getUTCMonth() + 1, year: shifted.getUTCFullYear() };
}

const parse=(x:any):HijriDate=>{
  const h=x.hijri,g=x.gregorian;
  const n=Number(h.day),m=Number(h.month.number);
  const [year,month,day]=String(g.date).split('-').map(Number);
  const weekday=Number.isFinite(year)&&Number.isFinite(month)&&Number.isFinite(day)
    ? new Date(Date.UTC(year,month-1,day)).getUTCDay() : 0;
  return {
    readable:g.date, gregorian:g.date, hijriDay:n, hijriMonth:m, hijriYear:Number(h.year),
    monthNameBn:MONTHS[m-1]?.[0]??h.month.en, monthNameAr:MONTHS[m-1]?.[1]??h.month.ar, weekdayBn:bnDays[weekday]
  };
};

export async function fetchHijriDate(date=new Date(),timezone?:number):Promise<HijriDate>{
  const parts=datePartsInTimezone(date,timezone);
  const dd=String(parts.day).padStart(2,'0'),mm=String(parts.month).padStart(2,'0'),yy=parts.year;
  const r=await fetch(`${ROOT}/gToH/${dd}-${mm}-${yy}`,{cache:'no-store'});
  if(!r.ok)throw Error('Hijri date unavailable');
  const j=await r.json();
  return parse(j.data);
}
export async function fetchHijriMonth(year:number,month:number,latitude=22.3569,longitude=91.7832,method=1){
  const r=await fetch(`${ROOT}/hijriCalendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`,{cache:'no-store'});
  if(!r.ok)throw Error('Hijri calendar unavailable');
  return (await r.json()).data;
}
export {MONTHS};