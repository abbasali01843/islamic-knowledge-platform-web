export type GuideItem={title:string;text:string;source:string};
export type QuizItem={question:string;options:string[];answer:string;source:string};
export type WebModulesContent={version:number;updatedAt:string;sources:{label:string;url:string}[];ramadan:GuideItem[];hajj:GuideItem[];seer:GuideItem[];quiz:QuizItem[]};

const CONTENT_URL='https://raw.githubusercontent.com/abbasali01843/islamic-knowledge-platform-web/main/content/modules.json';

export async function fetchWebModulesContent():Promise<WebModulesContent>{
 const response=await fetch(CONTENT_URL,{cache:'no-store'});
 if(!response.ok) throw new Error('অনলাইন কনটেন্ট লোড করা যায়নি ('+response.status+')');
 return response.json() as Promise<WebModulesContent>;
}
