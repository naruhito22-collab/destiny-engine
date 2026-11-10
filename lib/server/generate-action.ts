import 'server-only';

import { getOpenAIClient } from './openai';
import { ActionOutputSchema, ACTION_OUTPUT_JSON_SCHEMA, validateActionSafety } from '../engine/action-output';
import type { ActionPattern } from '../engine/action-patterns';

export type GenerateActionInput={
  level:1|2|3;
  primaryCategory:string;
  secondaryCategory?:string|null;
  numerologyAction:string;
  ichingPosture:string;
  tarotPrimaryAction:string;
  tarotMood:string;
  tarotCaution?:string|null;
  directionModifier?:string|null;
  timeModifier?:string|null;
  pattern:ActionPattern;
  selectedAxes?:string[];
  recentActions?:string[];
};

function durationRule(level:1|2|3){
  if(level===1) return '5〜15分';
  if(level===2) return '30〜60分';
  return '5〜60分';
}

export async function generateActionWithOpenAI(input:GenerateActionInput){
  const client=getOpenAIClient();
  const model=process.env.OPENAI_MODEL||'gpt-5.6-luna';

  const instructions=[
    'あなたはDESTINY ENGINEのACTION具体化器。占術計算を変更してはいけない。',
    '今日の24時間の中で実行できる具体的な行動を1件だけ生成する。24時間連続の作業は要求しない。抽象的助言や複数案は禁止。',
    'action_textは日本語で40〜60文字以内を目安に、短く一目でわかる一つの行動だけを書く。長い説明、複数段階の手順、比較表、複数の選択肢、理由の説明を入れない。',
    '通話30分、外出60分、予算、日時などの細かい数値指定をaction_textに入れない。estimated_minutesは内部の見積もりとして別に返す。',
    'ユーザーの予定、交友関係、現在地、金銭状況を推測して決めつけない。相手の協力や約束が必要な行動を必須にせず、本人だけで今日着手できる形にする。',
    '重大な人生判断、高額支出、投資、借金、ギャンブル、退職、契約、結婚離婚、医療判断、危険行為は禁止。',
    '指定patternを必ず維持する。九星方位と六曜は自然に使える場合だけ反映する。',
    'risk_flagsは安全上の懸念がなければ空配列。',
  ].join('\n');

  const payload={
    primary_category:input.primaryCategory,
    secondary_category:input.secondaryCategory??null,
    level:input.level,
    duration_rule:durationRule(input.level),
    numerology_action:input.numerologyAction,
    iching_posture:input.ichingPosture,
    tarot_primary_action:input.tarotPrimaryAction,
    tarot_mood:input.tarotMood,
    tarot_caution:input.tarotCaution??null,
    direction_modifier:input.pattern.directionApplicable?(input.directionModifier??null):null,
    time_modifier:input.pattern.timeModifierApplicable?(input.timeModifier??null):null,
    selected_pattern:{
      id:input.pattern.id,
      name:input.pattern.patternName,
      definition:input.pattern.patternDefinition,
    },
    selected_axes:input.selectedAxes??[],
    recent_actions:(input.recentActions??[]).slice(0,14),
  };

  const response=await client.responses.create({
    model,
    instructions,
    input:JSON.stringify(payload),
    text:{
      format:{
        type:'json_schema',
        name:'destiny_action_output',
        strict:true,
        schema:ACTION_OUTPUT_JSON_SCHEMA,
      },
    },
  } as any);

  const raw=response.output_text;
  if(!raw) throw new Error('OpenAI returned no ACTION output');
  const parsed=ActionOutputSchema.parse(JSON.parse(raw));
  const safety=validateActionSafety(parsed,input.level);
  if(!safety.ok){
    throw new Error('ACTION safety validation failed: '+safety.reasons.join(','));
  }

  if(!input.pattern.directionApplicable&&parsed.direction_used!==null){
    throw new Error('ACTION used direction for a non-direction pattern');
  }

  return {
    ...parsed,
    model,
    generationVersion:'action_prompt_v2',
    safetyCheckResult:'PASS' as const,
  };
}
