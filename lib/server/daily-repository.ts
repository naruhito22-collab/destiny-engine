import 'server-only';

import { createSupabaseServerClient } from './supabase';

export async function getProfile(userId:string){
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('profiles')
    .select('id,birth_date,birth_time,birth_place,timezone,default_level')
    .eq('id',userId)
    .maybeSingle();
  if(error) throw error;
  return data;
}

export async function getPreviousDailyDestiny(userId:string,beforeDate:string){
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('daily_destiny')
    .select('id,local_date,data')
    .eq('user_id',userId)
    .lt('local_date',beforeDate)
    .order('local_date',{ascending:false})
    .limit(1)
    .maybeSingle();
  if(error) throw error;
  return data;
}

export async function insertDailyDestinyOnce(args:{
  userId:string;
  localDate:string;
  engineVersion:string;
  data:Record<string,unknown>;
}){
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('daily_destiny')
    .insert({
      user_id:args.userId,
      local_date:args.localDate,
      engine_version:args.engineVersion,
      data:args.data,
    })
    .select('id,user_id,local_date,engine_version,data,created_at')
    .single();

  if(!error) return {row:data,reused:false};
  if((error as any).code==='23505'){
    const {data:existing,error:readError}=await supabase.from('daily_destiny')
      .select('id,user_id,local_date,engine_version,data,created_at')
      .eq('user_id',args.userId)
      .eq('local_date',args.localDate)
      .eq('engine_version',args.engineVersion)
      .single();
    if(readError) throw readError;
    return {row:existing,reused:true};
  }
  throw error;
}
