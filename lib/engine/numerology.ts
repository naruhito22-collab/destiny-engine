import type { ScoreMap } from '@/lib/types/destiny';

const scoreMap: Record<number, { action: string; scores: ScoreMap }> = {
  1: { action: 'START', scores: { challenge: 3, decision: 2, creation: 1 } },
  2: { action: 'CONNECT', scores: { connection: 3, contribution: 2, reflection: 1 } },
  3: { action: 'EXPRESS', scores: { creation: 3, connection: 2, chance: 1 } },
  4: { action: 'ORDER', scores: { organization: 3, learning: 2, body: 1 } },
  5: { action: 'CHANGE', scores: { change: 3, exploration: 2, challenge: 1 } },
  6: { action: 'CARE', scores: { contribution: 3, connection: 2, body: 1 } },
  7: { action: 'STUDY', scores: { learning: 3, reflection: 2, exploration: 1 } },
  8: { action: 'ACHIEVE', scores: { decision: 3, challenge: 2, organization: 1 } },
  9: { action: 'RELEASE', scores: { reflection: 3, change: 2, contribution: 1 } },
};

export function reduce1to9(value: number): number {
  let n = Math.abs(Math.trunc(value));
  while (n > 9) n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  return n || 9;
}

export function personalYear(birthMonth: number, birthDay: number, year: number) {
  return reduce1to9(birthMonth + birthDay + reduce1to9(year));
}

export function personalMonth(py: number, month: number) {
  return reduce1to9(py + month);
}

export function personalDay(pm: number, day: number) {
  return reduce1to9(pm + day);
}

export function calculateNumerology(birthDate: string, localDate: string) {
  const [, bm, bd] = birthDate.split('-').map(Number);
  const [year, month, day] = localDate.split('-').map(Number);
  const py = personalYear(bm, bd, year);
  const pm = personalMonth(py, month);
  const pd = personalDay(pm, day);
  const mapped = scoreMap[pd];
  return {
    personalYear: py,
    personalMonth: pm,
    personalDay: pd,
    actionType: mapped.action,
    categoryScores: mapped.scores,
    calculationVersion: 'numerology_v1',
  };
}
