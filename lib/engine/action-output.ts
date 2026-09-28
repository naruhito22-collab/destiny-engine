import { z } from 'zod';

export const ActionOutputSchema=z.object({
  action_text:z.string().min(1).max(240),
  estimated_minutes:z.number().int().min(1).max(360),
  target_type:z.enum(['PLACE','OBJECT','INFORMATION','PERSON','ROUTINE','IDEA','BODY','ENVIRONMENT']),
  action_type:z.enum(['OBSERVE','CHOOSE','MOVE','CREATE','ASK','SPEAK','REMOVE','ARRANGE','TRY','RECORD','SHARE','STOP']),
  novelty_type:z.enum(['FAMILIAR','ADJACENT','NEW','RANDOM']),
  social_type:z.enum(['SOLO','ONE_TO_ONE','GROUP','INDIRECT','ANY']),
  direction_used:z.string().nullable(),
  time_modifier_used:z.string().nullable(),
  risk_flags:z.array(z.string()),
  short_reason:z.string().min(1).max(240),
});

export type ActionOutput=z.infer<typeof ActionOutputSchema>;

const PROHIBITED=[
  /投資|株を買|仮想通貨|暗号資産|借金|ローン/,
  /ギャンブル|賭け|競馬|パチンコ/,
  /退職|辞職|仕事を辞め/,
  /離婚|結婚し|婚姻/,
  /契約を解除|契約を締結/,
  /薬をやめ|服薬を中止|治療を変更|診断/,
  /大量に飲|泥酔|薬物/,
];

export function validateActionSafety(output:ActionOutput,level:1|2|3){
  const reasons:string[]=[];
  if(output.risk_flags.length) reasons.push('MODEL_RISK_FLAGS');
  if(PROHIBITED.some(re=>re.test(output.action_text))) reasons.push('PROHIBITED_CONTENT');

  if(level===1&&(output.estimated_minutes<5||output.estimated_minutes>15)){
    reasons.push('LEVEL_DURATION_MISMATCH');
  }
  if(level===2&&(output.estimated_minutes<30||output.estimated_minutes>60)){
    reasons.push('LEVEL_DURATION_MISMATCH');
  }
  if(level===3&&(output.estimated_minutes<60||output.estimated_minutes>360)){
    reasons.push('LEVEL_DURATION_MISMATCH');
  }

  return {ok:reasons.length===0,reasons};
}

export const ACTION_OUTPUT_JSON_SCHEMA={
  type:'object',
  additionalProperties:false,
  required:[
    'action_text','estimated_minutes','target_type','action_type','novelty_type',
    'social_type','direction_used','time_modifier_used','risk_flags','short_reason'
  ],
  properties:{
    action_text:{type:'string'},
    estimated_minutes:{type:'integer',minimum:1,maximum:360},
    target_type:{type:'string',enum:['PLACE','OBJECT','INFORMATION','PERSON','ROUTINE','IDEA','BODY','ENVIRONMENT']},
    action_type:{type:'string',enum:['OBSERVE','CHOOSE','MOVE','CREATE','ASK','SPEAK','REMOVE','ARRANGE','TRY','RECORD','SHARE','STOP']},
    novelty_type:{type:'string',enum:['FAMILIAR','ADJACENT','NEW','RANDOM']},
    social_type:{type:'string',enum:['SOLO','ONE_TO_ONE','GROUP','INDIRECT','ANY']},
    direction_used:{type:['string','null']},
    time_modifier_used:{type:['string','null']},
    risk_flags:{type:'array',items:{type:'string'}},
    short_reason:{type:'string'},
  },
} as const;
