import { Engine } from 'caelus';
import { embeddedData } from 'caelus/data-embedded';

const engine=new Engine(embeddedData);

export type SolarTermName='RISSHUN'|'SUMMER_SOLSTICE'|'WINTER_SOLSTICE';

const TARGETS:Record<SolarTermName,{longitude:number;month:number;dayStart:number;dayEnd:number}>={
  RISSHUN:{longitude:315,month:2,dayStart:2,dayEnd:6},
  SUMMER_SOLSTICE:{longitude:90,month:6,dayStart:19,dayEnd:23},
  WINTER_SOLSTICE:{longitude:270,month:12,dayStart:20,dayEnd:24},
};

function sunLongitudeAt(date:Date){
  const chart=engine.chart(
    date.getUTCFullYear(),
    date.getUTCMonth()+1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    0,0,'whole_sign',
  ) as any;
  return chart.bodies.sun.lon as number;
}

function signedDelta(lon:number,target:number){
  let d=((lon-target+540)%360)-180;
  if(d===-180) d=180;
  return d;
}

function formatLocalDate(date:Date,timeZone:string){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone,year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const get=(type:string)=>parts.find(p=>p.type===type)?.value;
  return [get('year'),get('month'),get('day')].join('-');
}

export function findSolarTerm(year:number,term:SolarTermName,timeZone='Asia/Tokyo'){
  const spec=TARGETS[term];
  let lo=new Date(Date.UTC(year,spec.month-1,spec.dayStart,0,0,0));
  let hi=new Date(Date.UTC(year,spec.month-1,spec.dayEnd,23,59,59));
  let dlo=signedDelta(sunLongitudeAt(lo),spec.longitude);
  let dhi=signedDelta(sunLongitudeAt(hi),spec.longitude);

  if(dlo===0){
    return {term,targetLongitude:spec.longitude,instantUtc:lo.toISOString(),localDate:formatLocalDate(lo,timeZone),calculationVersion:'solar_terms_v1_caelus_0.24.1'};
  }
  if(Math.sign(dlo)===Math.sign(dhi)){
    throw new Error('Solar term crossing not bracketed for '+term+' '+year);
  }

  for(let i=0;i<60;i++){
    const mid=new Date((lo.getTime()+hi.getTime())/2);
    const dmid=signedDelta(sunLongitudeAt(mid),spec.longitude);
    if(Math.abs(hi.getTime()-lo.getTime())<1000){
      lo=mid; break;
    }
    if(Math.sign(dmid)===Math.sign(dlo)){
      lo=mid; dlo=dmid;
    }else{
      hi=mid; dhi=dmid;
    }
  }

  const instant=new Date((lo.getTime()+hi.getTime())/2);
  return {
    term,
    targetLongitude:spec.longitude,
    instantUtc:instant.toISOString(),
    localDate:formatLocalDate(instant,timeZone),
    calculationVersion:'solar_terms_v1_caelus_0.24.1',
  };
}

export function solsticePairForDate(localDate:string,timeZone='Asia/Tokyo'){
  const year=Number(localDate.slice(0,4));
  const summer=findSolarTerm(year,'SUMMER_SOLSTICE',timeZone);
  const winter=findSolarTerm(year,'WINTER_SOLSTICE',timeZone);
  const previousWinter=findSolarTerm(year-1,'WINTER_SOLSTICE',timeZone);
  const nextSummer=findSolarTerm(year+1,'SUMMER_SOLSTICE',timeZone);

  if(localDate<summer.localDate){
    return {
      current:previousWinter, currentKind:'WINTER' as const,
      next:summer, nextKind:'SUMMER' as const,
    };
  }
  if(localDate<winter.localDate){
    return {
      current:summer, currentKind:'SUMMER' as const,
      next:winter, nextKind:'WINTER' as const,
    };
  }
  return {
    current:winter, currentKind:'WINTER' as const,
    next:nextSummer, nextKind:'SUMMER' as const,
  };
}
