import { CATEGORIES, type Category, type ScoreMap } from '@/lib/types/destiny';

export type CoreSources={
  astrology:ScoreMap;
  numerology:ScoreMap;
  iching:ScoreMap;
  tarot:ScoreMap;
};

export type CoreWeights={
  astrology:number;
  numerology:number;
  iching:number;
  tarot:number;
};

const DEFAULT_WEIGHTS:CoreWeights={
  astrology:1,
  numerology:1,
  iching:1,
  tarot:1,
};

function score(map:ScoreMap,category:Category){
  return map[category]??0;
}

function plus3Count(sources:CoreSources,category:Category){
  return Object.values(sources).filter(map=>score(map,category)===3).length;
}

function primaryOf(map:ScoreMap){
  return [...CATEGORIES].sort((a,b)=>score(map,b)-score(map,a))[0];
}

export function mergeIChingScores(
  primary:ScoreMap,
  secondary?:ScoreMap|null,
):ScoreMap{
  if(!secondary) return {...primary};

  const out:ScoreMap={...primary};
  for(const category of CATEGORIES){
    const secondaryValue=secondary[category]??0;
    if(!secondaryValue) continue;
    // Notion spec: resulting hexagram is only a correction, maximum +1.
    const correction=secondaryValue/3;
    out[category]=(out[category]??0)+correction;
  }
  return out;
}

export function mergeCoreScores(args:{
  sources:CoreSources;
  weights?:Partial<CoreWeights>;
  previousPrimaryCategory?:Category|null;
}){
  const weights={...DEFAULT_WEIGHTS,...args.weights};
  const totals:Record<Category,number>=Object.fromEntries(
    CATEGORIES.map(c=>[c,0])
  ) as Record<Category,number>;

  for(const category of CATEGORIES){
    totals[category]=
      score(args.sources.astrology,category)*weights.astrology+
      score(args.sources.numerology,category)*weights.numerology+
      score(args.sources.iching,category)*weights.iching+
      score(args.sources.tarot,category)*weights.tarot;
  }

  const fixedOrder=new Map(CATEGORIES.map((c,i)=>[c,i]));

  const ordered=[...CATEGORIES].sort((a,b)=>{
    if(totals[b]!==totals[a]) return totals[b]-totals[a];

    const b3=plus3Count(args.sources,b);
    const a3=plus3Count(args.sources,a);
    if(b3!==a3) return b3-a3;

    const sourceOrder:(keyof CoreSources)[]=['astrology','iching','numerology','tarot'];
    for(const source of sourceOrder){
      const diff=score(args.sources[source],b)-score(args.sources[source],a);
      if(diff!==0) return diff;
    }

    if(args.previousPrimaryCategory){
      const aPrev=a===args.previousPrimaryCategory;
      const bPrev=b===args.previousPrimaryCategory;
      if(aPrev!==bPrev) return aPrev?1:-1;
    }

    return (fixedOrder.get(a)??999)-(fixedOrder.get(b)??999);
  });

  const primaryCategory=ordered[0];
  const secondaryCategory=ordered[1];

  const sourcePrimaries={
    astrology:primaryOf(args.sources.astrology),
    numerology:primaryOf(args.sources.numerology),
    iching:primaryOf(args.sources.iching),
    tarot:primaryOf(args.sources.tarot),
  };
  const agreements=Object.values(sourcePrimaries)
    .filter(c=>c===primaryCategory).length;

  return {
    primaryCategory,
    secondaryCategory,
    categoryScores:Object.fromEntries(
      CATEGORIES.map(c=>[c,Number(totals[c].toFixed(4))])
    ) as Record<Category,number>,
    tieBreakReason:'deterministic_core_v1',
    agreementScoreInternal:agreements/4,
    sourcePrimaries,
    weights,
    calculationVersion:'core_v1',
  };
}
