'use client';

import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/browser/supabase';

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
  const [email,setEmail]=useState('');
  const [loggedIn,setLoggedIn]=useState(false);
  const [birthDate,setBirthDate]=useState('');
  const [daily,setDaily]=useState<DailyRow|null>(null);
  const [action,setAction]=useState<ActionRow|null>(null);
  const [oracleTheme,setOracleTheme]=useState('general');
  const [oracle,setOracle]=useState<any>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [activeDate,setActiveDate]=useState(todayLocal);
  const [profileOpen,setProfileOpen]=useState(false);
  const [evidenceOpen,setEvidenceOpen]=useState(false);
  const [oracleHistory,setOracleHistory]=useState<Record<string,any>>({});

  useEffect(()=>{
    const supabase=getSupabaseBrowserClient();
    supabase.auth.getSession().then(({data}:{data:{session:Session|null}})=>setLoggedIn(Boolean(data.session)));
    const {data}=supabase.auth.onAuthStateChange((_event:AuthChangeEvent,session:Session|null)=>setLoggedIn(Boolean(session)));
    return ()=>data.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    const check=()=>{const next=todayLocal();setActiveDate(previous=>previous===next?previous:next);};
    const timer=window.setInterval(check,15000);
    window.addEventListener('focus',check);
    document.addEventListener('visibilitychange',check);
    return ()=>{window.clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
  },[]);

  useEffect(()=>{
    setDaily(null);setAction(null);setOracle(null);setOracleHistory({});
  },[activeDate,loggedIn]);

  useEffect(()=>{
    if(!loggedIn) return;
    let cancelled=false;
    async function restoreToday(){
      try{
        const r=await fetch(`/api/daily?date=${activeDate}`,{cache:'no-store'});
        if(!r.ok)return;
        const j=await r.json();
        if(cancelled||!j.daily)return;
        setDaily(j.daily);
        const a=await fetch(`/api/action?daily_destiny_id=${encodeURIComponent(j.daily.id)}`,{cache:'no-store'});
        if(a.ok){const result=await a.json();if(!cancelled)setAction(result.action||null);}
      }catch{ /* The user can still generate a new reading. */ }
    }
    restoreToday();
    return ()=>{cancelled=true;};
  },[loggedIn,activeDate]);

  useEffect(()=>{
    if(!loggedIn) return;
    fetch('/api/profile').then(async r=>{
      if(!r.ok) return;
      const j=await r.json();
      if(j.profile){
        setBirthDate(j.profile.birth_date||'');
      }
    });
  },[loggedIn]);

  async function sendMagicLink(){
    setBusy(true); setMessage('');
    try{
      const supabase=getSupabaseBrowserClient();
      const redirectTo=`${window.location.origin}/auth/callback?next=/`;
      const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});
      if(error) throw error;
      setMessage('ログイン用リンクをメールに送りました。');
    }catch(e:any){ setMessage(e.message||'ログインに失敗しました。'); }
    finally{ setBusy(false); }
  }

  async function saveProfile(){
    setBusy(true); setMessage('');
    try{
      const r=await fetch('/api/profile',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        birth_date:birthDate,
        timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Tokyo',
        default_level:3,
      })});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'PROFILE_SAVE_FAILED');
      setDaily(null);setAction(null);setOracle(null);setOracleHistory({});
      setMessage('生年月日を保存しました。新しい生年月日で「今日の運命を演算する」を押してください。');
    }catch(e:any){ setMessage(e.message||'保存に失敗しました。'); }
    finally{ setBusy(false); }
  }

  async function calculate(){
    setBusy(true); setMessage('運命を演算しています…'); setAction(null);
    try{
      const dres=await fetch('/api/daily/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({local_date:activeDate})});
      const dj=await dres.json();
      if(!dres.ok) throw new Error(dj.error||'DAILY_CREATION_FAILED');
      setDaily(dj.daily);
      setOracle(null);setOracleHistory({});

      const ares=await fetch('/api/action/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({daily_destiny_id:dj.daily.id,level:3})});
      const aj=await ares.json();
      if(!ares.ok) throw new Error(aj.error||'ACTION_GENERATION_FAILED');
      setAction(aj.action);
      setMessage(aj.reused?'今日のACTIONを読み込みました。':'今日のACTIONを生成しました。');
    }catch(e:any){ setMessage(e.message||'演算に失敗しました。'); }
    finally{ setBusy(false); }
  }

  async function consultOracle(){
    setBusy(true);setMessage('ORACLEを演算しています…');
    try{
      let active=daily;
      if(active?.data?.identity?.localDate!==activeDate){
        active=null;
        setDaily(null);setAction(null);setOracle(null);
      }
      if(!active){
        const r=await fetch('/api/daily/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({local_date:activeDate})});
        const j=await r.json();if(!r.ok)throw new Error(j.error||'DAILY_CREATION_FAILED');
        active=j.daily;setDaily(active);
      }
      if(!active)throw new Error('DAILY_DESTINY_NOT_FOUND');
      const r=await fetch('/api/oracle/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({daily_destiny_id:active.id,theme:oracleTheme})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'ORACLE_FAILED');
      setOracle(j.oracle);setOracleHistory(previous=>({...previous,[oracleTheme]:j.oracle}));setMessage(j.reused?'今日のORACLEを読み込みました。':'ORACLEを演算しました。');
    }catch(e:any){setMessage(e.message||'ORACLEの演算に失敗しました。');}
    finally{setBusy(false);}
  }

  async function signOut(){
    await getSupabaseBrowserClient().auth.signOut();
    setDaily(null); setAction(null); setOracle(null);
  }

  if(!loggedIn){
    return <section className="card stack">
      <p className="muted">SIGN IN</p>
      <h2>メールでログイン</h2>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      <button onClick={sendMagicLink} disabled={busy||!email}>ログインリンクを送る</button>
      {message&&<p className="status">{message}</p>}
    </section>;
  }

  return <div className="stack">
    <section className="card profile-card stack">
      <div className="row between"><div><p className="muted">PROFILE</p><p className="meta">生年月日の設定</p></div><button className="ghost" onClick={()=>setProfileOpen(v=>!v)} aria-expanded={profileOpen}>{profileOpen?"閉じる":"設定を変更 ＋"}</button></div>
      {profileOpen&&<>
      <label>生年月日<input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} /></label>
      <button className="secondary" onClick={saveProfile} disabled={busy||!birthDate}>設定を保存</button><button className="ghost" onClick={signOut}>ログアウト</button></>}
    </section>

    <section className="card hero-card stack">
      <div className="row between"><span className="date-tag">{activeDate.replaceAll("-",".")}</span><span className="date-tag">今日の24時間</span></div>
      <h2 className="section-heading">今日の一手</h2>
      {action ? <>
        <p className="action-text">{action.action_text}</p>
      </> : <h2>まだ今日の運命は演算されていません。</h2>}
      {!action&&<button onClick={calculate} disabled={busy||!birthDate}>{busy?'演算中…':'今日の運命を演算する'}</button>}
      {message&&<p className="status">{message}</p>}
    </section>

    {action?.generation_meta&&<section className="card stack">
      <div className="row between"><span></span><button className="ghost" onClick={()=>setEvidenceOpen(v=>!v)} aria-expanded={evidenceOpen}>{evidenceOpen?"詳細を閉じる −":"6占術の内訳 ＋"}</button></div>
      <h2 className="section-heading">なぜ、この一手なのか</h2>
      {action.generation_meta.short_reason&&<p>{action.generation_meta.short_reason}</p>}
      {evidenceOpen&&daily?.data&&<div className="evidence-grid">
        <p>西洋占星術：{categoryLabel(daily.data.astrology?.primaryCategory)}（出生時刻不明・月の出生位置を除外）</p>
        <p>数秘術：{daily.data.numerology?.actionType||'詳細未取得'}</p>
        <p>易：{daily.data.iching?.primaryPosture||'詳細未取得'}</p>
        <p>タロット：{categoryLabel(daily.data.tarot?.primaryAction)}</p>
        <p>九星気学：{daily.data.nineStarKi?.directionModifier||'方向補正なし'}</p>
        <p>六曜：{daily.data.rokuyo?.timeModifier||daily.data.rokuyo?.tempoModifier||'時間補正なし'}</p>
      </div>}
    </section>}

    <section className="card stack">
      <h2 className="section-heading">運命を、もう少し深く。</h2>
      <label>テーマ<select value={oracleTheme} onChange={e=>{setOracle(oracleHistory[e.target.value]||null);setOracleTheme(e.target.value)}}>
        <option value="general">総合</option><option value="love">恋愛</option><option value="work">仕事</option><option value="money">お金</option><option value="relationships">人間関係</option><option value="health">健康</option><option value="creation">創作</option>
      </select></label>
      <button onClick={consultOracle} disabled={busy||!birthDate}>{busy?'演算中…':'ORACLEを占う'}</button>
      {oracle?.result&&<div className="oracle-result stack"><p className="muted">TODAY'S ORACLE</p><h2>{oracle.result.title}</h2><p className="oracle-reading">{oracle.result.reading}</p><div className="oracle-suggestion"><strong>今日のヒント</strong><p>{oracle.result.suggestion}</p></div><details className="oracle-basis"><summary>占術の根拠・注意事項</summary><p>{oracle.result.basis}</p><p>{oracle.result.disclaimer}</p></details></div>}
    </section>

    {daily&&<section className="details">
      <p className="muted">CORE</p>
      <p>中心テーマ：{categoryLabel(daily.data?.coreResult?.primaryCategory)}</p>
      <p>補助テーマ：{categoryLabel(daily.data?.coreResult?.secondaryCategory)}</p>
    </section>}
  </div>;
}
