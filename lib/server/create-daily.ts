import 'server-only';

import { findSolarTerm, solsticePairForDate } from '../engine/solar-terms';
import { astrologyInstantFromDate, localDateTimeToUtcDate } from '../engine/timezone';
import { generateServerDailyDestinyData } from './daily-destiny';
import { requireServerEnv } from './env';
import { getPreviousDailyDestiny, getProfile, insertDailyDestinyOnce } from './daily-repository';

export const ENGINE_VERSION='0.1.0';

export async function createDailyDestinyForUser(args:{userId:string;localDate:string}){
  const profile=await getProfile(args.userId);
  if(!profile?.birth_date){
    throw new Error('PROFILE_INCOMPLETE');
  }

  const timezone=profile.timezone||'Asia/Tokyo';
  const existingBirthTime=typeof profile.birth_time==='string'&&profile.birth_time.length>=5;
  const natalLocalTime=existingBirthTime?profile.birth_time:'12:00:00';
  const natalDate=localDateTimeToUtcDate(profile.birth_date,natalLocalTime,timezone);
  const transitDate=localDateTimeToUtcDate(args.localDate,'12:00:00',timezone);

  const birthYear=Number(profile.birth_date.slice(0,4));
  const risshun=findSolarTerm(birthYear,'RISSHUN',timezone);
  const solstices=solsticePairForDate(args.localDate,timezone);
  const previous=await getPreviousDailyDestiny(args.userId,args.localDate);
  const previousPrimary=(previous?.data as any)?.coreResult?.primaryCategory??null;

  const data=await generateServerDailyDestinyData({
    userId:args.userId,
    localDate:args.localDate,
    timezone,
    engineVersion:ENGINE_VERSION,
    seedSalt:requireServerEnv('DESTINY_SEED_SALT'),
    birthDate:profile.birth_date,
    birthTimeAvailable:existingBirthTime,
    natal:astrologyInstantFromDate(natalDate),
    transit:astrologyInstantFromDate(transitDate),
    previousPrimaryCategory:previousPrimary,
    risshunDate:risshun.localDate,
    currentSolsticeDate:solstices.current.localDate,
    currentSolsticeKind:solstices.currentKind,
    nextSolsticeDate:solstices.next.localDate,
    nextSolsticeKind:solstices.nextKind,
  });

  return insertDailyDestinyOnce({
    userId:args.userId,
    localDate:args.localDate,
    engineVersion:ENGINE_VERSION,
    data:data as unknown as Record<string,unknown>,
  });
}
