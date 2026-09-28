import { NextResponse } from 'next/server';
import { getTodayDailyDestiny, requireAuthenticatedUser } from '@/lib/server/action-repository';

export async function GET(request:Request){
  try{
    const {user}=await requireAuthenticatedUser();
    const url=new URL(request.url);
    const localDate=url.searchParams.get('date');
    const engineVersion=url.searchParams.get('engine_version')||undefined;
    if(!localDate||!/^\d{4}-\d{2}-\d{2}$/.test(localDate)){
      return NextResponse.json({error:'INVALID_DATE'},{status:400});
    }
    const daily=await getTodayDailyDestiny(user.id,localDate,engineVersion);
    if(!daily) return NextResponse.json({daily:null},{status:404});
    return NextResponse.json({daily});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED'){
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    }
    console.error(error);
    return NextResponse.json({error:'DAILY_FETCH_FAILED'},{status:500});
  }
}
