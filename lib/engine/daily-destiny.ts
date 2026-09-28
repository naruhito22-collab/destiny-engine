import { createHash } from 'node:crypto';
import { calculateNumerology } from './numerology';
import { dailySeed, seededIndex } from './seed';
import { drawTarot } from './tarot';
import { drawIChing } from './iching';
import { calculateRokuyoFromLunarDate, rokuyoModifier } from './rokuyo';
import {
  calculateHonmeiStar,
  calculateDayStarFromSolstices,
  calculateDirectionSignal,
  type Direction,
  type SolsticeKind,
} from './nine-star';
import { calculateDailyAstrology, type AstrologyInstant } from './astrology';
import { mergeCoreScores, mergeIChingScores } from './core';

export type DailyDestinyInput={
  userId:string;
  localDate:string;
  timezone:string;
  engineVersion:string;
  seedSalt:string;
  birthDate:string;
  birthTimeAvailable:boolean;
  natal:AstrologyInstant;
  transit:AstrologyInstant;
  previousPrimaryCategory?:import('@/lib/types/destiny').Category|null;
  lunarDate:{year:number;month:number;day:number;isLeapMonth:boolean};
  risshunDate:string;
  currentSolsticeDate:string;
  currentSolsticeKind:SolsticeKind;
  nextSolsticeDate:string;
  nextSolsticeKind:SolsticeKind;
};

function calculationId(input:DailyDestinyInput){
  return createHash('sha256')
    .update([input.userId,input.localDate,input.engineVersion].join('|'))
    .digest('hex');
}

function chooseDirection(seed:string,candidates:Direction[]){
  if(!candidates.length) return null;
  return candidates[seededIndex(seed,candidates.length,36)];
}

export function generateDailyDestinyData(input:DailyDestinyInput){
  const seed=dailySeed({
    userId:input.userId,
    localDate:input.localDate,
    engineVersion:input.engineVersion,
    salt:input.seedSalt,
  });

  const numerology=calculateNumerology(input.birthDate,input.localDate);
  const tarot=drawTarot(seed);
  const iching=drawIChing(seed);
  const astrology=calculateDailyAstrology({
    birthTimeAvailable:input.birthTimeAvailable,
    natal:input.natal,
    transit:input.transit,
  });

  const honmei=calculateHonmeiStar(input.birthDate,input.risshunDate);
  const dayStar=calculateDayStarFromSolstices({
    localDate:input.localDate,
    currentSolsticeDate:input.currentSolsticeDate,
    currentKind:input.currentSolsticeKind,
    nextSolsticeDate:input.nextSolsticeDate,
    nextKind:input.nextSolsticeKind,
  });
  const directionSignal=calculateDirectionSignal({
    localDate:input.localDate,
    centerStar:dayStar.star,
    honmeiStar:honmei.star,
  });
  const directionModifier=chooseDirection(seed,directionSignal.directionCandidates);

  const rokuyoBase=calculateRokuyoFromLunarDate(
    input.lunarDate.month,
    input.lunarDate.day,
  );
  const rokuyo={
    gregorianDate:input.localDate,
    lunarYear:input.lunarDate.year,
    lunarMonth:input.lunarDate.month,
    lunarDay:input.lunarDate.day,
    leapMonth:input.lunarDate.isLeapMonth,
    rokuyoName:rokuyoBase.rokuyoName,
    ...rokuyoModifier(rokuyoBase.rokuyoName),
    calculationVersion:rokuyoBase.calculationVersion,
  };

  const ichingForCore=mergeIChingScores(
    iching.categoryScores,
    iching.secondaryCategoryScores,
  );
  const core=mergeCoreScores({
    previousPrimaryCategory:input.previousPrimaryCategory,
    sources:{
      astrology:astrology.normalizedScores,
      numerology:numerology.categoryScores,
      iching:ichingForCore,
      tarot:tarot.categoryScores,
    },
  });

  return {
    identity:{
      userId:input.userId,
      localDate:input.localDate,
      timezone:input.timezone,
      engineVersion:input.engineVersion,
      calculationId:calculationId(input),
      createdAt:new Date().toISOString(),
    },
    inputSnapshot:{
      birthDate:input.birthDate,
      birthTimeAvailable:input.birthTimeAvailable,
      locale:'ja-JP',
    },
    astrology,
    numerology,
    iching,
    tarot,
    nineStarKi:{
      mainStar:honmei,
      dayChartId:[input.localDate,dayStar.star].join(':'),
      dayStar,
      ...directionSignal,
      directionModifier,
      directionApplicable:directionModifier!==null,
      calculationVersion:'nine_star_v1',
    },
    rokuyo,
    coreResult:{
      primaryCategory:core.primaryCategory,
      secondaryCategory:core.secondaryCategory,
      categoryScores:core.categoryScores,
      tieBreakReason:core.tieBreakReason,
      agreementScoreInternal:core.agreementScoreInternal,
      cautionFlags:astrology.cautionFlags,
    },
    generationContext:{
      defaultLevel:1 as const,
      selectedLevel:null,
      selectedPatternId:null,
      selectedAxes:[],
      recentHistoryRefs:[],
      directionModifierUsed:null,
      timeModifierUsed:null,
    },
    actionOutput:{
      actionGenerated:false,
      executionStatus:'NOT_STARTED' as const,
    },
    oracleOutputs:{},
  };
}
