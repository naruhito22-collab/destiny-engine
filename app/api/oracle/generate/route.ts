import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/server/action-repository';
import { generateOracleWithOpenAI, ORACLE_AI_VERSION } from '@/lib/server/generate-oracle';
import type { DailyDestinyData } from '@/lib/types/destiny';

const Body=z.object({
  daily_destiny_id:z.string().uuid(),
  theme:z.enum(['general','love','work','money','relationships','health','creation']),
});
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
    if(existing){
      if(existing.result?.calculationVersion===ORACLE_AI_VERSION){
        return NextResponse.json({oracle:existing,reused:true});
      }
      // Preserve the existing row identity and audit timestamp; replace only its obsolete interpretation.
      const updatedResult=await generateOracleWithOpenAI(daily.data as DailyDestinyData,body.theme);
      const {data:updated,error:updateError}=await supabase.from('oracle_results')
        .update({result:updatedResult}).eq('id',existing.id).eq('user_id',user.id).select('*').single();
      if(updateError)throw updateError;
      return NextResponse.json({oracle:updated,reused:false,upgraded:true});
    }
    const result=await generateOracleWithOpenAI(daily.data as DailyDestinyData,body.theme);
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
