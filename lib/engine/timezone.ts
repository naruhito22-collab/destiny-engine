export function localDateTimeToUtcDate(localDate:string,time:string,timeZone:string){
  const [y,m,d]=localDate.split('-').map(Number);
  const [hh,mm,ss]=time.split(':').map(Number);
  const desiredPseudo=Date.UTC(y,m-1,d,hh||0,mm||0,ss||0);

  let guess=desiredPseudo;
  for(let i=0;i<2;i++){
    const parts=new Intl.DateTimeFormat('en-US',{
      timeZone,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date(guess));
    const get=(type:string)=>Number(parts.find(p=>p.type===type)?.value);
    const actualPseudo=Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'));
    guess += desiredPseudo-actualPseudo;
  }
  return new Date(guess);
}

export function astrologyInstantFromDate(date:Date){
  return {
    year:date.getUTCFullYear(),
    month:date.getUTCMonth()+1,
    day:date.getUTCDate(),
    hour:date.getUTCHours(),
    minute:date.getUTCMinutes(),
    second:date.getUTCSeconds(),
  };
}
