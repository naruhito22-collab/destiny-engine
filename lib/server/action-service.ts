import 'server-only';

import { dailySeed } from '../engine/seed';
import { selectActionPattern, type PatternHistory } from '../engine/action-patterns';
import { selectGenerationAxes } from '../engine/generation-axes';
import { generateActionWithOpenAI } from './generate-action';
import { requireServerEnv } from './env';
import type { ActionLevel, Category } from '@/lib/types/destiny';

export type ActionDailyData={
  identity:{userId:string;localDate:string;engineVersion:string};
  coreResult:{primaryCategory:Category;secondaryCategory?:Category|null};
  numerology:{actionType:string};
  iching:{primaryPosture:string};
  tarot:{primaryAction:Category;mood:string;caution?:string|null};
  nineStarKi:{directionModifier?:string|null};
  rokuyo:{timeModifier?:string|null;tempoModifier?:string|null};
};

export async function generateActionForDailyData(args:{
  daily:ActionDailyData;
  level:ActionLevel;
  recentPatternHistory?:PatternHistory[];
  recentActions?:string[];
}){
  const salt=requireServerEnv('DESTINY_SEED_SALT');
  const seed=dailySeed({
    userId:args.daily.identity.userId,
    localDate:args.daily.identity.localDate,
    engineVersion:args.daily.identity.engineVersion,
    salt,
  });

  const pattern=selectActionPattern({
    primaryCategory:args.daily.coreResult.primaryCategory,
    level:args.level,
    localDate:args.daily.identity.localDate,
    seedHex:seed,
    recentHistory:args.recentPatternHistory,
    directionModifier:args.daily.nineStarKi.directionModifier??null,
    timeModifier:args.daily.rokuyo.timeModifier??args.daily.rokuyo.tempoModifier??null,
  });

  const axes=selectGenerationAxes({
    primaryCategory:args.daily.coreResult.primaryCategory,
    level:args.level,
    seedHex:seed,
    randomBoost:args.daily.coreResult.primaryCategory==='chance',
  });

  const action=await generateActionWithOpenAI({
    level:args.level,
    primaryCategory:args.daily.coreResult.primaryCategory,
    secondaryCategory:args.daily.coreResult.secondaryCategory,
    numerologyAction:args.daily.numerology.actionType,
    ichingPosture:args.daily.iching.primaryPosture,
    tarotPrimaryAction:args.daily.tarot.primaryAction,
    tarotMood:args.daily.tarot.mood,
    tarotCaution:args.daily.tarot.caution??null,
    directionModifier:args.daily.nineStarKi.directionModifier??null,
    timeModifier:args.daily.rokuyo.timeModifier??args.daily.rokuyo.tempoModifier??null,
    pattern,
    selectedAxes:axes.selectedAxes,
    recentActions:args.recentActions,
  });

  return {
    level:args.level,
    pattern,
    axes,
    action,
  };
}
