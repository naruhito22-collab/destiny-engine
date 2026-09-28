import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/server/action-repository';
import { createDailyDestinyForUser } from '@/lib/server/create-daily';

const Body=z.object({
  local_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request:Request){
  try{
    const body=Body.parse(await request.json());
    const {user}=await requireAuthenticatedUser();
    const result=await createDailyDestinyForUser({userId:user.id,localDate:body.local_date});
    return NextResponse.json({daily:result.row,reused:result.reused},{status:result.reused?200:201});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED'){
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    }
    if(error instanceof Error&&error.message==='PROFILE_INCOMPLETE'){
      return NextResponse.json({error:'PROFILE_INCOMPLETE'},{status:422});
    }
    if(error instanceof z.ZodError){
      return NextResponse.json({error:'INVALID_REQUEST',details:error.flatten()},{status:400});
    }
    console.error(error);
    return NextResponse.json({error:'DAILY_CREATION_FAILED'},{status:500});
  }
}
