import 'server-only';

import { getRokuyoForGregorianDate } from './kyureki';
import {
  generateDailyDestinyData,
  type DailyDestinyInput,
} from '../engine/daily-destiny';

type ServerDailyInput=Omit<DailyDestinyInput,'lunarDate'>;

export async function generateServerDailyDestinyData(input:ServerDailyInput){
  const kyureki=await getRokuyoForGregorianDate(input.localDate);
  return generateDailyDestinyData({
    ...input,
    lunarDate:kyureki.kyureki,
  });
}
