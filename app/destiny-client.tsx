'use client';
import { useEffect,useState } from 'react';

type DailyRow={data:any};
type ActionRow={action_text:string;level:number;generation_meta?:any};
const CATEGORY_LABELS:Record<string,string>={exploration:'探索',connection:'つながり',creation:'創造',learning:'学び',challenge:'挑戦',organization:'整理',reflection:'内省',body:'身体',contribution:'貢献',change:'変化',decision:'決断',chance:'機会'};
const categoryLabel=(value:unknown)=>typeof value==='string'?(CATEGORY_LABELS[value]||value):'—';
function todayLocal(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}

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
   const check=()=>setActiveDate(todayLocal());
   const timer=window.setInterval(check,15000);
   window.addEventListener('focus',check);
   return ()=>{window.clearInterval(timer);window.removeEventListener('focus',check);};
 },[]);
 useEffect(()=>{setDaily(null);setAction(null);setOracle(null);},[activeDate]);

 async function requestReading(theme?:string){
   const r=await fetch('/api/reading',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({birthDate,localDate:activeDate,...(theme?{theme}:{})}),cache:'no-store'});
   const j=await r.json();
   if(!r.ok)throw new Error(j.error||'生成に失敗しました。');
   return j;
 }
 async function calculate(){
   setBusy(true);setMessage('運命を演算しています…');setAction(null);setOracle(null);
   try{const j=await requestReading();setDaily(j.daily);setAction(j.action);setMessage('新しいACTIONを生成しました。');}
   catch(e:any){setMessage(e.message||'演算に失敗しました。');}
   finally{setBusy(false);}
 }
 async function consultOracle(){
   setBusy(true);setMessage('ORACLEを占っています…');
   try{const j=await requestReading(oracleTheme);setOracle(j.oracle);setMessage('新しいORACLEを生成しました。');}
   catch(e:any){setMessage(e.message||'ORACLEの生成に失敗しました。');}
   finally{setBusy(false);}
 }

  return <div className="stack">
    <section className="card profile-card stack">
      <label>生年月日<input type="date" value={birthDate} onChange={e=>{setBirthDate(e.target.value);setDaily(null);setAction(null);setOracle(null);}} /></label>
      <p className="meta">生年月日や占い結果は保存されません。</p>
    </section>

    <section className="card hero-card stack">
      <div className="row between"><span className="date-tag">{activeDate.replaceAll("-",".")}</span><span className="date-tag">今日の24時間</span></div>
      <h2 className="section-heading">今日の一手</h2>
      {action ? <>
        <p className="action-text">{action.action_text}</p>
      </> : <h2>まだ今日の運命は演算されていません。</h2>}
      <button onClick={calculate} disabled={busy||!birthDate}>{busy?'演算中…':action?'もう一度占う':'今日の運命を演算する'}</button>
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
      <label>テーマ<select value={oracleTheme} onChange={e=>{setOracle(null);setOracleTheme(e.target.value)}}>
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
