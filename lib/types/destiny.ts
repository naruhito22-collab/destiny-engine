export const CATEGORIES = [
  'exploration','connection','creation','learning','challenge','organization',
  'reflection','body','contribution','change','decision','chance'
] as const;

export type Category = typeof CATEGORIES[number];
export type ScoreMap = Partial<Record<Category, number>>;
export type ActionLevel = 1 | 2 | 3;

export interface DailyDestinyData {
  identity: {
    userId: string;
    localDate: string;
    timezone: string;
    engineVersion: string;
    calculationId: string;
    createdAt: string;
  };
  numerology: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
    actionType: string;
    categoryScores: ScoreMap;
    calculationVersion: string;
  };
  iching?: Record<string, unknown>;
  tarot?: Record<string, unknown>;
  astrology?: Record<string, unknown>;
  nineStarKi?: Record<string, unknown>;
  rokuyo?: Record<string, unknown>;
  coreResult?: {
    primaryCategory: Category;
    secondaryCategory?: Category;
    categoryScores: ScoreMap;
    tieBreakReason?: string;
    agreementScoreInternal?: number;
    cautionFlags?: string[];
  };
}
