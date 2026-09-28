export type NineStar=1|2|3|4|5|6|7|8|9;
export type Direction='N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW';
export type Palace=Direction|'CENTER';
export type DunMode='YANG'|'YIN';

export const NINE_STAR_NAMES:Record<NineStar,string>={
  1:'一白水星',2:'二黒土星',3:'三碧木星',4:'四緑木星',5:'五黄土星',
  6:'六白金星',7:'七赤金星',8:'八白土星',9:'九紫火星',
};

const FLY_ROUTE:Palace[]=['CENTER','NW','W','NE','S','N','SW','E','SE'];
const OPPOSITE:Record<Direction,Direction>={
  N:'S',NE:'SW',E:'W',SE:'NW',S:'N',SW:'NE',W:'E',NW:'SE',
};

const BRANCH_DIRECTIONS:Direction[]=[
  'N','NE','NE','E','SE','SE','S','SW','SW','W','NW','NW',
];

function parseDate(s:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('date must be YYYY-MM-DD');
  const [y,m,d]=s.split('-').map(Number);
  const date=new Date(Date.UTC(y,m-1,d));
  if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d){
    throw new Error('invalid Gregorian date');
  }
  return date;
}

function wrapStar(n:number):NineStar{
  return ((((n-1)%9)+9)%9+1) as NineStar;
}

function dayDiff(from:string,to:string){
  return Math.trunc((parseDate(to).getTime()-parseDate(from).getTime())/86400000);
}

export function calculateHonmeiStar(birthDate:string,risshunDate:string){
  const birth=parseDate(birthDate);
  const risshun=parseDate(risshunDate);
  if(birth.getUTCFullYear()!==risshun.getUTCFullYear()){
    throw new Error('risshunDate must belong to the birth Gregorian year');
  }
  const adjustedYear=birth<risshun?birth.getUTCFullYear()-1:birth.getUTCFullYear();
  const digitRoot=1+((adjustedYear-1)%9);
  const star=wrapStar(11-digitRoot);
  return {star,name:NINE_STAR_NAMES[star],adjustedYear,calculationVersion:'nine_star_honmei_v1'};
}

export function sexagenaryDayIndex(localDate:string){
  const d=parseDate(localDate);
  let y=d.getUTCFullYear();
  let m=d.getUTCMonth()+1;
  const day=d.getUTCDate();
  if(m<=2){ y-=1; m+=12; }
  const a=Math.floor(y/100);
  const b=2-a+Math.floor(a/4);
  const jdn=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+day+b-1524;
  return ((jdn+49)%60+60)%60;
}

export function dayBranchIndex(localDate:string){
  return sexagenaryDayIndex(localDate)%12;
}

export function dayBreakDirection(localDate:string):Direction{
  const branchDirection=BRANCH_DIRECTIONS[dayBranchIndex(localDate)];
  return OPPOSITE[branchDirection];
}

export function calculateDayStarFromAnchor(
  localDate:string,
  anchorDate:string,
  anchorStar:NineStar,
  mode:DunMode,
):NineStar{
  const delta=dayDiff(anchorDate,localDate);
  return wrapStar(anchorStar+(mode==='YANG'?delta:-delta));
}

export function buildDirectionBoard(centerStar:NineStar){
  const board={} as Record<Palace,NineStar>;
  FLY_ROUTE.forEach((palace,index)=>{
    board[palace]=wrapStar(centerStar+index);
  });
  return board;
}

function directionOfStar(board:Record<Palace,NineStar>,star:NineStar):Direction|null{
  for(const d of ['N','NE','E','SE','S','SW','W','NW'] as Direction[]){
    if(board[d]===star) return d;
  }
  return null;
}

export function calculateDirectionSignal(args:{
  localDate:string;
  centerStar:NineStar;
  honmeiStar:NineStar;
}){
  const board=buildDirectionBoard(args.centerStar);
  const exclusions=new Map<Direction,Set<string>>();

  const add=(direction:Direction|null,reason:string)=>{
    if(!direction) return;
    const reasons=exclusions.get(direction)??new Set<string>();
    reasons.add(reason);
    exclusions.set(direction,reasons);
  };

  const goou=directionOfStar(board,5);
  if(goou){
    add(goou,'GOOU_SATSU');
    add(OPPOSITE[goou],'ANKEN_SATSU');
  }

  const honmei=directionOfStar(board,args.honmeiStar);
  if(honmei){
    add(honmei,'HONMEI_SATSU');
    add(OPPOSITE[honmei],'HONMEITEKI_SATSU');
  }

  add(dayBreakDirection(args.localDate),'NICHIHA');

  const directions=['N','NE','E','SE','S','SW','W','NW'] as Direction[];
  const directionCandidates=directions.filter(d=>!exclusions.has(d));

  return {
    board,
    exclusions:Object.fromEntries(
      [...exclusions.entries()].map(([direction,reasons])=>[direction,[...reasons]])
    ) as Partial<Record<Direction,string[]>>,
    directionCandidates,
    calculationVersion:'nine_star_direction_v1',
  };
}
