import 'server-only';

import { z } from 'zod';
import { getOpenAIClient } from './openai';
import { buildOracleReading, type OracleTheme } from '@/lib/engine/oracle-reading';
import type { DailyDestinyData } from '@/lib/types/destiny';

export const ORACLE_AI_VERSION='oracle-ai-v1';

const OracleSchema=z.object({
  reading:z.string().min(15).max(180),
  suggestion:z.string().min(5).max(100),
}).strict();

export async function generateOracleWithOpenAI(daily:DailyDestinyData,theme:OracleTheme){
  // The deterministic engine remains the source of truth for all divination signals.
  const evidence=buildOracleReading(daily,theme);
  const client=getOpenAIClient();
  const model=process.env.OPENAI_MODEL||'gpt-5.6-luna';
  const instructions=[
    'あなたはDESTINY ENGINEの占い解釈者。渡された占術データだけを根拠に、選択テーマに合った文章を新しく書く。',
    '占術結果の計算・改変は禁止。未来の出来事、他人の本心、健康状態、収益などを事実として断定しない。',
    'readingは自然な日本語の短い運勢を1〜2文、合計80字以内を目安にする。',
    'suggestionは今日できる具体的な行動を1文、50字以内を目安にする。',
    'テンプレートを繰り返さず、テーマ固有の場面・判断・行動を示す。',
    'readingとsuggestionで同じ内容を繰り返さない。',
    '本文に占術名、CORE、六曜、テンポ補正、専門用語、根拠の説明、免責文を入れない。',
    '健康・投資・法律・高額な契約の判断を勧めない。医療上の予測や金銭的成功の保証をしない。',
    '出力は指定JSONだけ。',
  ].join('\n');
  const response=await client.responses.create({
    model,
    instructions,
    input:JSON.stringify({
      theme,
      theme_title:evidence.title,
      divination_evidence:evidence.basis,
      core_guidance:evidence.reading,
      theme_action_seed:evidence.suggestion,
    }),
    text:{format:{type:'json_schema',name:'oracle_reading',strict:true,schema:{
      type:'object',additionalProperties:false,
      properties:{reading:{type:'string'},suggestion:{type:'string'}},
      required:['reading','suggestion'],
    }}},
  });
  if(!response.output_text)throw new Error('ORACLE_AI_EMPTY');
  const generated=OracleSchema.parse(JSON.parse(response.output_text));
  const forbidden=/六曜|テンポ補正|数秘術|タロット|西洋占星術|九星気学|CORE/i;
  if(forbidden.test(generated.reading+' '+generated.suggestion))throw new Error('ORACLE_AI_TECHNICAL_JARGON');
  return {
    ...evidence,
    reading:generated.reading,
    suggestion:generated.suggestion,
    calculationVersion:ORACLE_AI_VERSION,
  };
}
