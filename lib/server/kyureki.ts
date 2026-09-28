import 'server-only';

import { calculateRokuyoFromLunarDate, type RokuyoName } from '../engine/rokuyo';

export type KyurekiDate = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
};

export type GregorianRokuyoResult = {
  localDate: string;
  kyureki: KyurekiDate;
  rokuyoName: RokuyoName;
  index: number;
  calculationVersion: string;
  provider: 'shirabe_v1';
};

type ShirabeCalendarResponse = {
  date?: string;
  kyureki?: {
    year?: number;
    month?: number;
    day?: number;
    is_leap_month?: boolean;
  };
  rokuyo?: {
    name?: string;
  };
};

const DEFAULT_BASE_URL = 'https://shirabe.dev/api/v1/calendar';

function assertLocalDate(localDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error('localDate must be YYYY-MM-DD');
  }
}

function parseKyurekiResponse(data: ShirabeCalendarResponse): KyurekiDate {
  const k = data.kyureki;
  if (
    !k ||
    !Number.isInteger(k.year) ||
    !Number.isInteger(k.month) ||
    !Number.isInteger(k.day) ||
    (k.month as number) < 1 ||
    (k.month as number) > 12 ||
    (k.day as number) < 1 ||
    (k.day as number) > 30
  ) {
    throw new Error('Invalid kyureki response');
  }

  return {
    year: k.year as number,
    month: k.month as number,
    day: k.day as number,
    isLeapMonth: Boolean(k.is_leap_month),
  };
}

export async function getRokuyoForGregorianDate(
  localDate: string,
): Promise<GregorianRokuyoResult> {
  assertLocalDate(localDate);

  const baseUrl = process.env.KYUREKI_API_BASE_URL || DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}/${localDate}`, {
    cache: 'force-cache',
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Kyureki provider failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ShirabeCalendarResponse;
  const kyureki = parseKyurekiResponse(data);
  const calculated = calculateRokuyoFromLunarDate(kyureki.month, kyureki.day);

  // The provider also returns rokuyo. We use our own formula as the source of
  // truth and only use the provider value as an integrity check.
  if (data.rokuyo?.name && data.rokuyo.name !== calculated.rokuyoName) {
    throw new Error(
      `Rokuyo mismatch: provider=${data.rokuyo.name}, calculated=${calculated.rokuyoName}`,
    );
  }

  return {
    localDate,
    kyureki,
    rokuyoName: calculated.rokuyoName,
    index: calculated.index,
    calculationVersion: calculated.calculationVersion,
    provider: 'shirabe_v1',
  };
}
