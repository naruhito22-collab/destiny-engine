import { seededIndex } from './seed';
import type { ActionLevel, Category } from '@/lib/types/destiny';

export type TargetAxis='PLACE'|'OBJECT'|'INFORMATION'|'PERSON'|'ROUTINE'|'IDEA'|'BODY'|'ENVIRONMENT';
export type ActionAxis='OBSERVE'|'CHOOSE'|'MOVE'|'CREATE'|'ASK'|'SPEAK'|'REMOVE'|'ARRANGE'|'TRY'|'RECORD'|'SHARE'|'STOP';
export type NoveltyAxis='FAMILIAR'|'ADJACENT'|'NEW'|'RANDOM';
export type IntensityAxis='LOW'|'MEDIUM'|'HIGH';
export type OutcomeAxis='EXPERIENCE'|'DISCOVERY'|'OUTPUT'|'CONNECTION'|'REDUCTION'|'DECISION'|'AWARENESS';

const TARGETS:Record<Category,TargetAxis[]>={
  exploration:['PLACE','INFORMATION','OBJECT'],
  connection:['PERSON','INFORMATION'],
  creation:['IDEA','OBJECT'],
  learning:['INFORMATION','IDEA'],
  challenge:['ROUTINE','PLACE','IDEA'],
  organization:['OBJECT','ENVIRONMENT','ROUTINE'],
  reflection:['IDEA','BODY','ROUTINE'],
  body:['BODY','ROUTINE','ENVIRONMENT'],
  contribution:['PERSON','INFORMATION'],
  change:['ROUTINE','ENVIRONMENT','OBJECT'],
  decision:['IDEA','ROUTINE'],
  chance:['PLACE','PERSON','INFORMATION','OBJECT'],
};

const ACTIONS:Record<Category,ActionAxis[]>={
  exploration:['OBSERVE','CHOOSE','MOVE','TRY'],
  connection:['ASK','SPEAK','SHARE'],
  creation:['CREATE','RECORD'],
  learning:['OBSERVE','RECORD'],
  challenge:['TRY','MOVE','CREATE'],
  organization:['REMOVE','ARRANGE','STOP'],
  reflection:['OBSERVE','RECORD','STOP'],
  body:['MOVE','OBSERVE','TRY'],
  contribution:['SHARE','SPEAK','ASK'],
  change:['TRY','ARRANGE','CHOOSE'],
  decision:['CHOOSE','STOP','RECORD'],
  chance:['CHOOSE','TRY','OBSERVE'],
};

const OUTCOMES:Record<Category,OutcomeAxis[]>={
  exploration:['DISCOVERY','EXPERIENCE'],
  connection:['CONNECTION','AWARENESS'],
  creation:['OUTPUT','EXPERIENCE'],
  learning:['DISCOVERY','AWARENESS'],
  challenge:['EXPERIENCE','OUTPUT'],
  organization:['REDUCTION','OUTPUT'],
  reflection:['AWARENESS','DISCOVERY'],
  body:['AWARENESS','EXPERIENCE'],
  contribution:['CONNECTION','OUTPUT'],
  change:['EXPERIENCE','DISCOVERY'],
  decision:['DECISION','REDUCTION'],
  chance:['EXPERIENCE','DISCOVERY'],
};

function pick<T>(seed:string,values:T[],offset:number){
  return values[seededIndex(seed,values.length,offset)];
}

export function selectGenerationAxes(args:{
  primaryCategory:Category;
  level:ActionLevel;
  seedHex:string;
  randomBoost?:boolean;
}){
  const target=pick(args.seedHex,TARGETS[args.primaryCategory],6);
  const action=pick(args.seedHex,ACTIONS[args.primaryCategory],12);
  const noveltyPool:NoveltyAxis[]=args.level===1
    ? ['FAMILIAR','ADJACENT']
    : args.level===2
      ? ['ADJACENT','NEW']
      : ['NEW'];
  if(args.randomBoost) noveltyPool.push('RANDOM');
  const novelty=pick(args.seedHex,noveltyPool,18);
  const intensity:IntensityAxis=args.level===1?'LOW':args.level===2?'MEDIUM':'HIGH';
  const outcome=pick(args.seedHex,OUTCOMES[args.primaryCategory],30);

  return {
    target,action,novelty,intensity,outcome,
    selectedAxes:[target,action,novelty,intensity,outcome],
    calculationVersion:'generation_axes_v1',
  };
}
