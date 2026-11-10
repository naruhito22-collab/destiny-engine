import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { findSolarTerm, solsticePairForDate } from '@/lib/engine/solar-terms';
import { astrologyInstantFromDate, localDateTimeToUtcDate } from '@/lib/engine/timezone';
import { generateServerDailyDestinyData } from '@/lib/server/daily-destiny';
import { requireServerEnv } from '@/lib/server/env';
import { generateActionForDailyData } from '@/lib/server/action-service';
import { generateOracleWithOpenAI } from '@/lib/server/generate-oracle';
import { ORACLE_THEMES } from '@/lib/engine/oracle-reading';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const Input=z.object({
  birthDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  localDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  theme:z.enum(ORACLE_THEMES).optional(),
}).strict();

const requests=new Map<string,{count:number;reset:number}>();
function permitted(request:Request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  const now=Date.now();
  if(requests.size>5000)for(const [key,value] of requests)if(value.reset<now)requests.delete(key);
  const current=requests.get(ip);
  if(!current||current.reset<now){requests.set(ip,{count:1,reset:now+3600000});return true;}
  if(current.count>=20)return false;
  current.count++;
  return true;
}

export async function POST(request:Request){
  try{
    if(!permitted(request))return NextResponse.json({error:'しばらく時間をおいてからお試しください。'},{status:429});
    const body=Input.parse(await request.json());
    const birth=new Date(body.birthDate+'T12:00:00.000Z');
    const day=new Date(body.localDate+'T12:00:00.000Z');
    if(!Number.isFinite(birth.getTime())||!Number.isFinite(day.getTime())||
      birth.toISOString().slice(0,10)!==body.birthDate||
      day.toISOString().slice(0,10)!==body.localDate||
      birth>day||birth.getUTCFullYear()<1900||
      Math.abs(Date.now()-day.getTime())>172800000){
      return NextResponse.json({error:'日付を確認してください。'},{status:400});
    }
    const timezone='Asia/Tokyo';
    const risshun=findSolarTerm(birth.getUTCFullYear(),'RISSHUN',timezone);
    const solstices=solsticePairForDate(body.localDate,timezone);
    const daily=await generateServerDailyDestinyData({
      userId:randomUUID(),localDate:body.localDate,timezone,
      engineVersion:'0.3.0-no-storage',seedSalt:requireServerEnv('DESTINY_SEED_SALT'),
      birthDate:body.birthDate,birthTimeAvailable:false,
      natal:astrologyInstantFromDate(birth),
      transit:astrologyInstantFromDate(localDateTimeToUtcDate(body.localDate,'12:00:00',timezone)),
      previousPrimaryCategory:null,
      risshunDate:risshun.localDate,
      currentSolsticeDate:solstices.current.localDate,
      currentSolsticeKind:solstices.currentKind,
      nextSolsticeDate:solstices.next.localDate,
      nextSolsticeKind:solstices.nextKind,
    });
    if(body.theme){
      const result=await generateOracleWithOpenAI(daily,body.theme);
      return NextResponse.json({oracle:{result}},{headers:{'Cache-Control':'no-store'}});
    }
    const generated=await generateActionForDailyData({daily:daily as any,level:3});
    return NextResponse.json({
      daily:{data:daily},
      action:{
        action_text:generated.action.action_text,
        level:3,
        generation_meta:{
          short_reason:generated.action.short_reason,
          pattern_name:generated.pattern.patternName,
        },
      },
    },{headers:{'Cache-Control':'no-store'}});
  }catch(error){
    if(error instanceof z.ZodError)return NextResponse.json({error:'入力を確認してください。'},{status:400});
    console.error('PUBLIC_READING_FAILED',error);
    return NextResponse.json({error:'占いを生成できませんでした。少し待ってから再試行してください。'},{status:500});
  }
}
