import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/server/action-repository';

const Body=z.object({
  daily_destiny_id:z.string().uuid(),
  theme:z.enum(['general','love','work','money','relationships','health','creation']),
});
const titles:Record<string,string>={general:'総合運',love:'恋愛運',work:'仕事運',money:'金運',relationships:'対人運',health:'健康運',creation:'創作運'};
const guidance:Record<string,string>={
  general:'今日の優先順位を一つ決め、小さく行動に移しましょう。',
  love:'相手の意向を確かめ、率直で丁寧な対話を心がけましょう。',
  work:'重要な課題を一つ選び、次の具体的な一歩を決めましょう。',
  money:'衝動的な判断を避け、支出と目的を整理しましょう。',
  relationships:'相手の話を聞く時間を意識して作りましょう。',
  health:'無理をせず、休息と日々の生活習慣を整えましょう。',
  creation:'アイデアを一つ選び、小さな試作から始めましょう。',
};
export async function POST(request:Request){
  try{
    const body=Body.parse(await request.json());
    const {supabase,user}=await requireAuthenticatedUser();
    const {data:daily,error:dailyError}=await supabase.from('daily_destiny')
      .select('id,user_id,data').eq('id',body.daily_destiny_id).eq('user_id',user.id).maybeSingle();
    if(dailyError)throw dailyError;
    if(!daily)return NextResponse.json({error:'DAILY_DESTINY_NOT_FOUND'},{status:404});
    const {data:existing,error:existingError}=await supabase.from('oracle_results').select('*')
      .eq('user_id',user.id).eq('daily_destiny_id',daily.id).eq('theme',body.theme).maybeSingle();
    if(existingError)throw existingError;
    if(existing)return NextResponse.json({oracle:existing,reused:true});
    const d=daily.data as any;
    const primary=d?.coreResult?.primaryCategory||'reflection';
    const secondary=d?.coreResult?.secondaryCategory||null;
    const number=d?.numerology?.actionType||'未取得';
    const posture=d?.iching?.primaryPosture||'未取得';
    const tarot=d?.tarot?.primaryAction||'未取得';
    const basis=`CORE: ${primary}${secondary?' / '+secondary:''}｜数秘術: ${number}｜易: ${posture}｜タロット: ${tarot}`;
    const result={
      title:titles[body.theme],
      reading:`今日の中心テーマは「${primary}」${secondary?'、補助テーマは「'+secondary+'」':''}です。占術の計算結果をもとに、${titles[body.theme]}の観点から行動を考えます。`,
      suggestion:guidance[body.theme],
      basis,
      disclaimer:'占いは内省のための参考情報です。健康・投資などの専門的判断を代替しません。',
      calculationVersion:'oracle-rules-v1',
    };
    const {data:created,error:insertError}=await supabase.from('oracle_results').insert({
      user_id:user.id,daily_destiny_id:daily.id,theme:body.theme,result,
    }).select('*').single();
    if(insertError){
      if(insertError.code==='23505'){
        const {data:row,error}=await supabase.from('oracle_results').select('*')
          .eq('user_id',user.id).eq('daily_destiny_id',daily.id).eq('theme',body.theme).single();
        if(error)throw error;
        return NextResponse.json({oracle:row,reused:true});
      }
      throw insertError;
    }
    return NextResponse.json({oracle:created,reused:false},{status:201});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED')return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    if(error instanceof z.ZodError)return NextResponse.json({error:'INVALID_REQUEST',details:error.flatten()},{status:400});
    console.error(error);
    return NextResponse.json({error:'ORACLE_GENERATION_FAILED'},{status:500});
  }
}
