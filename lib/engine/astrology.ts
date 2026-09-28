import { Engine } from 'caelus';
import { embeddedData } from 'caelus/data-embedded';
import type { Category, ScoreMap } from '@/lib/types/destiny';

type Planet =
  | 'sun'|'moon'|'mercury'|'venus'|'mars'
  | 'jupiter'|'saturn'|'uranus'|'neptune'|'pluto';

type AspectName='CONJUNCTION'|'SEXTILE'|'SQUARE'|'TRINE'|'OPPOSITION';

export type AstrologyInstant={
  year:number;
  month:number;
  day:number;
  hour:number;
  minute?:number;
  second?:number;
  latitude?:number;
  longitude?:number;
};

export type AstrologyOptions={
  birthTimeAvailable:boolean;
  natal:AstrologyInstant;
  transit:AstrologyInstant;
};

const PLANETS:Planet[]=[
  'sun','moon','mercury','venus','mars',
  'jupiter','saturn','uranus','neptune','pluto',
];

const PLANET_WEIGHTS:Record<Planet,number>={
  sun:1, moon:1, mercury:1, venus:1, mars:1,
  jupiter:0.8, saturn:0.8, uranus:0.5, neptune:0.5, pluto:0.5,
};

const PLANET_SCORES:Record<Planet,ScoreMap>={
  sun:{decision:3,creation:2,challenge:1},
  moon:{reflection:3,body:2,connection:1},
  mercury:{learning:3,connection:2,exploration:1},
  venus:{connection:3,creation:2,contribution:1},
  mars:{challenge:3,decision:2,body:1},
  jupiter:{exploration:3,learning:2,chance:1},
  saturn:{organization:3,learning:2,decision:1},
  uranus:{change:3,exploration:2,challenge:1},
  neptune:{reflection:3,creation:2,chance:1},
  pluto:{change:3,reflection:2,decision:1},
};

const SIGN_MODIFIERS:ScoreMap[]=[
  {challenge:1,decision:1},       // Aries
  {body:1,organization:1},       // Taurus
  {connection:1,learning:1},     // Gemini
  {connection:1,body:1},         // Cancer
  {creation:1,decision:1},       // Leo
  {organization:1,learning:1},   // Virgo
  {connection:1,contribution:1}, // Libra
  {reflection:1,change:1},       // Scorpio
  {exploration:1,learning:1},    // Sagittarius
  {decision:1,organization:1},   // Capricorn
  {change:1,exploration:1},      // Aquarius
  {creation:1,reflection:1},     // Pisces
];

const ASPECTS:{name:AspectName;angle:number;orb:number;strength:number;caution:boolean}[]=[
  {name:'CONJUNCTION',angle:0,orb:8,strength:1.0,caution:false},
  {name:'SEXTILE',angle:60,orb:5,strength:0.7,caution:false},
  {name:'SQUARE',angle:90,orb:7,strength:1.0,caution:true},
  {name:'TRINE',angle:120,orb:7,strength:0.9,caution:false},
  {name:'OPPOSITION',angle:180,orb:8,strength:1.0,caution:true},
];

const engine=new Engine(embeddedData);

function chartFor(i:AstrologyInstant){
  return engine.chart(
    i.year,i.month,i.day,i.hour,i.minute??0,i.second??0,
    i.latitude??0,i.longitude??0,'whole_sign',
  );
}

function lonDiff(a:number,b:number){
  const d=Math.abs(a-b)%360;
  return d>180?360-d:d;
}

function signIndex(lon:number){
  return Math.floor((((lon%360)+360)%360)/30);
}

function addScores(target:Record<string,number>,source:ScoreMap,factor:number){
  for(const [category,value] of Object.entries(source)){
    target[category]=(target[category]??0)+(value??0)*factor;
  }
}

function detectAspect(a:number,b:number){
  const diff=lonDiff(a,b);
  let best:(typeof ASPECTS)[number]&{orbDelta:number}|null=null;
  for(const aspect of ASPECTS){
    const orbDelta=Math.abs(diff-aspect.angle);
    if(orbDelta<=aspect.orb&&(!best||orbDelta<best.orbDelta)){
      best={...aspect,orbDelta};
    }
  }
  return best;
}

function normalizeTop3(raw:Record<string,number>){
  const ordered=Object.entries(raw)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
    .slice(0,3);
  const normalized:ScoreMap={};
  if(ordered[0]) normalized[ordered[0][0] as Category]=3;
  if(ordered[1]) normalized[ordered[1][0] as Category]=2;
  if(ordered[2]) normalized[ordered[2][0] as Category]=1;
  return {
    primaryCategory:ordered[0]?.[0] as Category|undefined,
    secondaryCategory:ordered[1]?.[0] as Category|undefined,
    tertiaryCategory:ordered[2]?.[0] as Category|undefined,
    normalizedScores:normalized,
  };
}

export function calculateDailyAstrology(options:AstrologyOptions){
  const natal=chartFor(options.natal) as any;
  const transit=chartFor(options.transit) as any;
  const raw:Record<string,number>={};
  const events:Array<Record<string,unknown>>=[];
  const cautionFlags:string[]=[];

  for(const transitPlanet of PLANETS){
    const tLon=transit.bodies[transitPlanet].lon as number;
    const baseWeight=PLANET_WEIGHTS[transitPlanet];

    // Daily background theme from the transiting planet and current sign.
    addScores(raw,PLANET_SCORES[transitPlanet],0.25*baseWeight);
    addScores(raw,SIGN_MODIFIERS[signIndex(tLon)],0.25*baseWeight);

    for(const natalPlanet of PLANETS){
      if(!options.birthTimeAvailable&&natalPlanet==='moon') continue;

      const nLon=natal.bodies[natalPlanet].lon as number;
      const aspect=detectAspect(tLon,nLon);
      if(!aspect) continue;

      const exactness=Math.max(0,1-aspect.orbDelta/aspect.orb);
      const strength=aspect.strength*(0.5+0.5*exactness)*baseWeight;

      addScores(raw,PLANET_SCORES[transitPlanet],strength);
      addScores(raw,PLANET_SCORES[natalPlanet],strength*0.5);
      addScores(raw,SIGN_MODIFIERS[signIndex(tLon)],strength*0.35);

      if(aspect.caution){
        cautionFlags.push(`${transitPlanet}_${aspect.name}_${natalPlanet}`);
      }

      events.push({
        transitPlanet,
        natalPlanet,
        aspect:aspect.name,
        orb:Number(aspect.orbDelta.toFixed(3)),
        strength:Number(strength.toFixed(3)),
      });
    }
  }

  const normalized=normalizeTop3(raw);

  return {
    ...normalized,
    rawScores:Object.fromEntries(
      Object.entries(raw).map(([k,v])=>[k,Number(v.toFixed(4))])
    ),
    majorTransits:events
      .sort((a,b)=>(b.strength as number)-(a.strength as number))
      .slice(0,12),
    cautionFlags:[...new Set(cautionFlags)],
    birthTimeMode:options.birthTimeAvailable?'KNOWN':'UNKNOWN_MOON_EXCLUDED',
    calculationVersion:'astrology_v1_caelus_0.24.1',
  };
}
