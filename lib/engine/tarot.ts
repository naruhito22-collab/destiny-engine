import { seededIndex } from './seed';
import type { Category } from '@/lib/types/destiny';

export type TarotMood='active'|'focused'|'reflective'|'relational'|'transformative'|'hopeful'|'controlled';
export interface TarotCard {
  id:number;
  name:string;
  primary:Category;
  secondary:Category;
  support:Category;
  mood:TarotMood;
  caution?:string;
}

export const MAJOR_ARCANA:TarotCard[]=[
{id:0,name:'The Fool',primary:'exploration',secondary:'challenge',support:'chance',mood:'active'},
{id:1,name:'The Magician',primary:'creation',secondary:'decision',support:'challenge',mood:'focused'},
{id:2,name:'The High Priestess',primary:'reflection',secondary:'learning',support:'exploration',mood:'reflective'},
{id:3,name:'The Empress',primary:'creation',secondary:'contribution',support:'connection',mood:'relational'},
{id:4,name:'The Emperor',primary:'organization',secondary:'decision',support:'challenge',mood:'controlled'},
{id:5,name:'The Hierophant',primary:'learning',secondary:'contribution',support:'connection',mood:'focused'},
{id:6,name:'The Lovers',primary:'connection',secondary:'decision',support:'creation',mood:'relational'},
{id:7,name:'The Chariot',primary:'challenge',secondary:'decision',support:'change',mood:'active'},
{id:8,name:'Strength',primary:'body',secondary:'reflection',support:'challenge',mood:'controlled'},
{id:9,name:'The Hermit',primary:'reflection',secondary:'learning',support:'organization',mood:'reflective'},
{id:10,name:'Wheel of Fortune',primary:'chance',secondary:'change',support:'exploration',mood:'transformative'},
{id:11,name:'Justice',primary:'decision',secondary:'organization',support:'reflection',mood:'focused'},
{id:12,name:'The Hanged Man',primary:'reflection',secondary:'change',support:'learning',mood:'reflective'},
{id:13,name:'Death',primary:'change',secondary:'organization',support:'decision',mood:'transformative',caution:'Do not translate this symbol into resignation, breakup, or other major irreversible decisions.'},
{id:14,name:'Temperance',primary:'organization',secondary:'connection',support:'body',mood:'controlled'},
{id:15,name:'The Devil',primary:'reflection',secondary:'change',support:'body',mood:'reflective',caution:'Avoid compulsive or harmful interpretations.'},
{id:16,name:'The Tower',primary:'change',secondary:'decision',support:'organization',mood:'transformative',caution:'Convert disruption symbolism into low-risk review or adjustment only.'},
{id:17,name:'The Star',primary:'creation',secondary:'exploration',support:'contribution',mood:'hopeful'},
{id:18,name:'The Moon',primary:'reflection',secondary:'exploration',support:'chance',mood:'reflective'},
{id:19,name:'The Sun',primary:'connection',secondary:'creation',support:'body',mood:'hopeful'},
{id:20,name:'Judgement',primary:'decision',secondary:'reflection',support:'change',mood:'focused'},
{id:21,name:'The World',primary:'organization',secondary:'contribution',support:'change',mood:'hopeful'},
];

export function drawTarot(seedHex:string){
  const card=MAJOR_ARCANA[seededIndex(seedHex,MAJOR_ARCANA.length,0)];
  return {
    cardId:card.id,
    cardName:card.name,
    orientation:'upright' as const,
    primaryAction:card.primary,
    secondaryAction:card.secondary,
    mood:card.mood,
    caution:card.caution ?? null,
    categoryScores:{[card.primary]:3,[card.secondary]:2,[card.support]:1},
    seedVersion:'daily_seed_v1',
    calculationVersion:'tarot_v1'
  };
}
