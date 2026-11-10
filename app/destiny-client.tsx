'use client';

import { useEffect, useState } from 'react';

type DailyRow={id:string;data:any};
type ActionRow={action_text:string;level:number;generation_meta?:any};
const CATEGORY_LABELS:Record<string,string>={exploration:'探索',connection:'つながり',creation:'創造',learning:'学び',challenge:'挑戦',organization:'整理',reflection:'内省',body:'身体',contribution:'貢献',change:'変化',decision:'決断',chance:'機会'};
const categoryLabel=(value:unknown)=>typeof value==='string'?(CATEGORY_LABELS[value]||value):'—';

function todayLocal(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export default function DestinyClient(){
  const [birthDate,setBirthDate]=useState('');
  const [daily,setDaily]=useState<DailyRow|null>(null);
  const [action,setAction]=useState<ActionRow|null>(null);
  const [oracleTheme,setOracleTheme]=useState('general');
  const [oracle,setOracle]=useState<any>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [activeDate,setActiveDate]=useState(todayLocal);
  const [evidenceOpen,setEvidenceOpen]=useState(false);
  

  useEffect(()=>{
    const check=()=>{const next=todayLocal();setActiveDate(previous=>previous===next?previous:next);};
    const timer=window.setInterval(check,15000);
    window.addEventListener('focus',check);
    document.addEventListener('visibilitychange',check);
    return ()=>{window.clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
  },[]);

  useEffect(()=>{
    setDaily(null);setAction(null);setOracle(null);
  },[activeDate]);

  async function calculate(){
    setBusy(true);setMessage('運命を演算しています…');setAction(null);setOracle(null);
    try{
      const r=await fetch('/api/reading',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({birthDate,localDate:activeDate}),cache:'no-store'});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'生成に失敗しました');
      setDaily(j.daily);setAction(j.action);setMessage('新しいACTIONを生成しました。');
    }catch(e:any){setMessage(e.message||'演算に失敗しました。');}
    finally{setBusy(false);}
  }

  async function consultOracle(){
    setBusy(true);setMessage('ORACLEを占っています…');
    try{
      const r=await fetch('/api/reading',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({birthDate,localDate:activeDate,theme:oracleTheme}),cache:'no-store'});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'生成に失敗しました');
      setOracle(j.oracle);setMessage('新しいORACLEを生成しました。');
    }catch(e:any){setMessage(e.message||'ORACLEの生成に失敗しました。');}
    finally{setBusy(false);}
  }

    <section className="card profile-card stack">
      <label>生年月日<input type="date" value={birthDate} onChange={e=>{setBirthDate(e.target.value);setDaily(null);setAction(null);setOracle(null);}} /></label>
      <p className="meta">生年月日や占い結果は保存されません。</p>
    </section>


