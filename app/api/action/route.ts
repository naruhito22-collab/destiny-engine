import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getActionForDailyDestiny, requireAuthenticatedUser } from '@/lib/server/action-repository';

const Query=z.string().uuid();

export async function GET(request:Request){
  try{
    const {supabase,user}=await requireAuthenticatedUser();
    const id=Query.parse(new URL(request.url).searchParams.get('daily_destiny_id'));
    const {data:daily,error}=await supabase.from('daily_destiny')
      .select('id').eq('id',id).eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    if(!daily)return NextResponse.json({error:'DAILY_DESTINY_NOT_FOUND'},{status:404});
    const action=await getActionForDailyDestiny(user.id,id);
    return NextResponse.json({action});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED')
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    if(error instanceof z.ZodError)
      return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
    console.error(error);
    return NextResponse.json({error:'ACTION_FETCH_FAILED'},{status:500});
  }
}
