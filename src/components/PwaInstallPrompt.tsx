import React,{useEffect,useState} from 'react';

type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};

export const PwaInstallPrompt:React.FC=()=>{
 const [installEvent,setInstallEvent]=useState<InstallEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 useEffect(()=>{
  const onBefore=(e:Event)=>{e.preventDefault();setInstallEvent(e as InstallEvent)};
  const onInstalled=()=>{setInstalled(true);setInstallEvent(null)};
  window.addEventListener('beforeinstallprompt',onBefore);
  window.addEventListener('appinstalled',onInstalled);
  if(window.matchMedia('(display-mode: standalone)').matches)setInstalled(true);
  return()=>{window.removeEventListener('beforeinstallprompt',onBefore);window.removeEventListener('appinstalled',onInstalled)};
 },[]);
 if(!installEvent||installed)return null;
 const install=async()=>{await installEvent.prompt();const choice=await installEvent.userChoice;if(choice.outcome==='accepted')setInstallEvent(null)};
 return <button type="button" onClick={install} className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-2xl bg-[#176B4D] text-white shadow-lg text-xs font-bold hover:opacity-95">অ্যাপ ইনস্টল করুন</button>;
};
