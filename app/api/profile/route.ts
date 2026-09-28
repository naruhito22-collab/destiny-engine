import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedUser } from '@/lib/server/action-repository';

const Body=z.object({
  birth_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birth_time:z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  timezone:z.string().min(1).default('Asia/Tokyo'),
  default_level:z.union([z.literal(1),z.literal(2),z.literal(3)]).default(1),
});

export async function POST(request:Request){
  try{
    const body=Body.parse(await request.json());
    const {supabase,user}=await requireAuthenticatedUser();
    const {data,error}=await supabase.from('profiles').upsert({
      id:user.id,
      birth_date:body.birth_date,
      birth_time:body.birth_time||null,
      timezone:body.timezone,
      default_level:body.default_level,
      updated_at:new Date().toISOString(),
    }).select('*').single();
    if(error) throw error;
    return NextResponse.json({profile:data});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED'){
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    }
    if(error instanceof z.ZodError){
      return NextResponse.json({error:'INVALID_REQUEST',details:error.flatten()},{status:400});
    }
    console.error(error);
    return NextResponse.json({error:'PROFILE_SAVE_FAILED'},{status:500});
  }
}

export async function GET(){
  try{
    const {supabase,user}=await requireAuthenticatedUser();
    const {data,error}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
    if(error) throw error;
    return NextResponse.json({profile:data});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHENTICATED'){
      return NextResponse.json({error:'UNAUTHENTICATED'},{status:401});
    }
    return NextResponse.json({error:'PROFILE_FETCH_FAILED'},{status:500});
  }
}
