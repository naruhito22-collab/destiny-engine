import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getActionForDailyDestiny,
  insertActionOnce,
  requireAuthenticatedUser,
} from '@/lib/server/action-repository';
import { generateActionForDailyData } from '@/lib/server/action-service';

const Body=z.object({
  daily_destiny_id:z.string().uuid(),
  level:z.union([z.literal(1),z.literal(2),z.literal(3)]),
});

export async function POST(request:Request){
  try{
    const body=Body.parse(await request.json());
    const {supabase,user}=await requireAuthenticatedUser();

    const existing=await getActionForDailyDestiny(user.id,body.daily_destiny_id);
    if(existing){
      return NextResponse.json({action:existing,reused:true});
    }

    const {data:daily,error}=await supabase.from('daily_destiny')
      .select('id,user_id,data')
      .eq('id',body.daily_destiny_id)
      .eq('user_id',user.id)
      .single();
    if(error||!daily){
      return NextResponse.json({error:'DAILY_DESTINY_NOT_FOUND'},{status:404});
    }

    const generated=await generateActionForDailyData({
      daily:daily.data as any,
      level:body.level,
      recentPatternHistory:[],
      recentActions:[],
    });

    const saved=await insertActionOnce({
      userId:user.id,
      dailyDestinyId:daily.id,
      actionText:generated.action.action_text,
      level:body.level,
      safetyCheckResult:generated.action.safetyCheckResult,
      generationMeta:{
        pattern_id:generated.pattern.id,
        pattern_name:generated.pattern.patternName,
        axes:generated.axes,
        model:generated.action.model,
        generation_version:generated.action.generationVersion,
        short_reason:generated.action.short_reason,
        estimated_minutes:generated.action.estimated_minutes,
        direction_used:generated.action.direction_used,
        time_modifier_used:generated.action.time_modifier_used,
      },
    });

    return NextResponse.json({action:saved,reused:false},{status:201});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED'){
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    }
    if(error instanceof z.ZodError){
      return NextResponse.json({error:'INVALID_REQUEST',details:error.flatten()},{status:400});
    }
    console.error(error);
    return NextResponse.json({error:'ACTION_GENERATION_FAILED'},{status:500});
  }
}
