export type ZakatRecipient={id:string;nameArabic:string;nameBengali:string;descriptionBengali:string;source:string};
export type ZakatFaq={question:string;answer:string;source:string};
export type ZakatContent={version:number;updatedAt:string;sources:{label:string;url:string}[];recipients:ZakatRecipient[];faqs:ZakatFaq[]};
const CONTENT_URL='https://raw.githubusercontent.com/abbasali01843/islamic-knowledge-platform-web/main/content/zakat.json';
export async function fetchZakatContent():Promise<ZakatContent>{const response=await fetch(CONTENT_URL,{cache:'no-store'});if(!response.ok)throw new Error('অনলাইন যাকাত কনটেন্ট লোড করা যায়নি ('+response.status+')');return response.json() as Promise<ZakatContent>;}
