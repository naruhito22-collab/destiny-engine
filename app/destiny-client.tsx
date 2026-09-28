'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/browser/supabase';

type DailyRow={id:string;data:any};
type ActionRow={action_text:string;level:number;generation_meta?:any};

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
  const [birthTime,setBirthTime]=useState('');
  const [level,setLevel]=useState<1|2|3>(1);
  const [daily,setDaily]=useState<DailyRow|null>(null);
  const [action,setAction]=useState<ActionRow|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const supabase=getSupabaseBrowserClient();
    supabase.auth.getSession().then(({data})=>setLoggedIn(Boolean(data.session)));
    const {data}=supabase.auth.onAuthStateChange((_event,session)=>setLoggedIn(Boolean(session)));
    return ()=>data.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!loggedIn) return;
    fetch('/api/profile').then(async r=>{
      if(!r.ok) return;
      const j=await r.json();
      if(j.profile){
        setBirthDate(j.profile.birth_date||'');
        setBirthTime(j.profile.birth_time?.slice(0,5)||'');
        setLevel(j.profile.default_level||1);
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
        birth_time:birthTime?`${birthTime}:00`:null,
        timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Tokyo',
        default_level:level,
      })});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'PROFILE_SAVE_FAILED');
      setMessage('プロフィールを保存しました。');
    }catch(e:any){ setMessage(e.message||'保存に失敗しました。'); }
    finally{ setBusy(false); }
  }

  async function calculate(){
    setBusy(true); setMessage('運命を演算しています…'); setAction(null);
    try{
      const dres=await fetch('/api/daily/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({local_date:todayLocal()})});
      const dj=await dres.json();
      if(!dres.ok) throw new Error(dj.error||'DAILY_CREATION_FAILED');
      setDaily(dj.daily);

      const ares=await fetch('/api/action/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({daily_destiny_id:dj.daily.id,level})});
      const aj=await ares.json();
      if(!ares.ok) throw new Error(aj.error||'ACTION_GENERATION_FAILED');
      setAction(aj.action);
      setMessage(aj.reused?'今日のACTIONを読み込みました。':'今日のACTIONを生成しました。');
    }catch(e:any){ setMessage(e.message||'演算に失敗しました。'); }
    finally{ setBusy(false); }
  }

  async function signOut(){
    await getSupabaseBrowserClient().auth.signOut();
    setDaily(null); setAction(null);
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
    <section className="card stack">
      <div className="row between"><p className="muted">PROFILE</p><button className="ghost" onClick={signOut}>ログアウト</button></div>
      <label>生年月日<input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} /></label>
      <label>出生時刻（任意）<input type="time" value={birthTime} onChange={e=>setBirthTime(e.target.value)} /></label>
      <label>行動レベル<select value={level} onChange={e=>setLevel(Number(e.target.value) as 1|2|3)}><option value={1}>Level 1｜5〜15分</option><option value={2}>Level 2｜30〜60分</option><option value={3}>Level 3｜1〜6時間</option></select></label>
      <button className="secondary" onClick={saveProfile} disabled={busy||!birthDate}>設定を保存</button>
    </section>

    <section className="card hero-card stack">
      <p className="muted">ACTION｜運命行動</p>
      {action ? <>
        <p className="action-text">{action.action_text}</p>
        <p className="meta">Level {action.level}{action.generation_meta?.estimated_minutes?` · 約${action.generation_meta.estimated_minutes}分`:''}</p>
      </> : <h2>まだ今日の運命は演算されていません。</h2>}
      <button onClick={calculate} disabled={busy||!birthDate}>{busy?'演算中…':'今日の運命を演算する'}</button>
      {message&&<p className="status">{message}</p>}
    </section>

    {daily&&<section className="details">
      <p className="muted">CORE</p>
      <p>Primary: {daily.data?.coreResult?.primaryCategory||'—'}</p>
      <p>Secondary: {daily.data?.coreResult?.secondaryCategory||'—'}</p>
    </section>}
  </div>;
}
