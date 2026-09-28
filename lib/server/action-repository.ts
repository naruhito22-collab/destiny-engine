import 'server-only';

import { createSupabaseServerClient } from './supabase';

export async function requireAuthenticatedUser(){
  const supabase=await createSupabaseServerClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user) throw new Error('UNAUTHENTICATED');
  return {supabase,user};
}

export async function getTodayDailyDestiny(userId:string,localDate:string,engineVersion?:string){
  const supabase=await createSupabaseServerClient();
  let query=supabase.from('daily_destiny')
    .select('id,user_id,local_date,engine_version,data,created_at')
    .eq('user_id',userId)
    .eq('local_date',localDate)
    .order('created_at',{ascending:false})
    .limit(1);
  if(engineVersion) query=query.eq('engine_version',engineVersion);
  const {data,error}=await query.maybeSingle();
  if(error) throw error;
  return data;
}

export async function getActionForDailyDestiny(userId:string,dailyDestinyId:string){
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('action_history')
    .select('*')
    .eq('user_id',userId)
    .eq('daily_destiny_id',dailyDestinyId)
    .maybeSingle();
  if(error) throw error;
  return data;
}

export async function insertActionOnce(args:{
  userId:string;
  dailyDestinyId:string;
  actionText:string;
  level:number;
  generationMeta:Record<string,unknown>;
  safetyCheckResult:string;
}){
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('action_history')
    .insert({
      user_id:args.userId,
      daily_destiny_id:args.dailyDestinyId,
      action_text:args.actionText,
      level:args.level,
      generation_meta:args.generationMeta,
      safety_check_result:args.safetyCheckResult,
    })
    .select('*')
    .single();

  if(!error) return data;

  // Unique(daily_destiny_id) is the final idempotency guard.
  if((error as any).code==='23505'){
    const existing=await getActionForDailyDestiny(args.userId,args.dailyDestinyId);
    if(existing) return existing;
  }
  throw error;
}
