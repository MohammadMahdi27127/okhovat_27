// Public chat entry point. Personal journal text and attachments stay out of statistics.
(() => {
  const fa = n => new Intl.NumberFormat('fa-IR', {maximumFractionDigits:2}).format(n);
  const labels = {week:'این هفته', previous:'هفتهٔ گذشته', today:'امروز', yesterday:'دیروز', compare:'این هفته تا امروز'};
  const norm = s => s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').trim();
  // Character trigrams recognize colloquial spellings without a network round trip.
  const examples = {
    stats:['ورزشم چطور پیش رفته','کتاب خوندنم بهتر شده','مطالعه من چطور پیش میره','این مدت چقدر فعالیت داشتم','وضعیت گزارشم چطوره','چند شب فرم پر کردم','روند فعالیتم رو بررسی کن','جمع ساعت تمرینم رو بگو','چند صفحه کتاب خوندم','عملکرد بچه های حلقه چطور بود'],
    guide:['چطور گزارش ثبت کنم','از کجا مصوباتم رو ببینم','چجوری فرم بسازم','دنبال بخش تنظیمات میگردم','میخوام یه پست بذارم','رمزم رو کجا عوض کنم'],
    greeting:['سلام خوبی','حالت چطوره','خوبی چه خبر','سلام رفیق','سلام علیکم','وقتت بخیر','صبح بخیر','خسته نباشید','سلام روزت بخیر','دمت گرم ممنون','درود بر شما']
  };
  function features(text){
    const terms=new Set();
    for(const word of norm(text).replace(/[^آ-ی ]/g,' ').split(/\s+/)){
      if(!word)continue;
      const padded='^'+word+'$';
      for(let i=0;i<=padded.length-3;i++)terms.add(padded.slice(i,i+3));
    }
    return terms;
  }
  const phrases=Object.entries(examples).flatMap(([kind,items])=>items.map(item=>[kind,features(item)]));
  function nearestIntent(text){
    const query=features(text);
    let best='guide', threshold=0.42;
    for(const [kind,terms] of phrases){
      let overlap=0;
      for(const term of terms)if(query.has(term))overlap++;
      const score=overlap/Math.sqrt(terms.size*query.size);
      if(score>threshold){best=kind;threshold=score;}
    }
    return best;
  }
  function intent(message) {
    const s = norm(message);
    const ring = /حلقه|هم حلقه|بچه ها|بقیه|همحلقه/.test(s);
    const other = /بقیه|دیگر|هم حلقه|غیر از (من|خودم)/.test(s);
    const compare = /مقایسه|نسبت به|فرق|بیشتر شده|کمتر شده/.test(s) || /این هفته/.test(s) && /هفته.{0,3}(قبل|پیش|گذشته)/.test(s);
    const period = compare?'compare':/دیروز/.test(s)?'yesterday':/امروز/.test(s)?'today':/هفته.{0,4}(پیش|قبل|گذشته)/.test(s)?'previous':'week';
    const guide = /کجا|چطور.*(ثبت|بساز|تغییر)|چگونه.*ثبت|راهنما|از کدوم/.test(s);
    const unsupported = /ماه|پارسال|[۰-۹0-9]+\s*(روز|هفته)|حلقه.{0,4}(دیگر|دیگه)|[۰-۹0-9]+\/[۰-۹0-9]+/.test(s);
    const stats = ring || /آمار|آماری|تحلیل|مشارکت|مقایسه|مطالعه ام|ورزشم|چقد|چند|چطور بوده|گزارشام|گزارش هام|ثبت کردم|ثبت کردیم|خلاصه|این هفته|هفته پیش|هفته قبل|عملکرد/.test(s);
    const greeting = /^(سلام|درود|خوبی|حالت چطوره|چه خبر|ممنون|مرسی|خسته نباشی)[ !؟،.]*$/.test(s) || /^(سلام|درود)[ ،!]+(خوبی|چطوری|حالت چطوره)[ ؟!]*$/.test(s);
    const kind=guide?'guide':stats?'stats':greeting?'greeting':nearestIntent(s);
    return {kind:kind==='stats' && unsupported?'unsupported':kind,scope:ring?(other?'peers':'ring'):'self',period};
  }
  function windows(period, now) {
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const val = key => Number(parts.find(p=>p.type===key).value);
    const date = Date.UTC(val('year'),val('month')-1,val('day'));
    const iso = offset => new Date(date+offset*86400000).toISOString().slice(0,10);
    const elapsed = (new Date(date).getUTCDay()+1)%7;
    if(period==='today') return [[iso(0),iso(0)]];
    if(period==='yesterday') return [[iso(-1),iso(-1)]];
    if(period==='previous') return [[iso(-elapsed-7),iso(-elapsed-1)]];
    const ranges = [[iso(-elapsed),iso(0)]];
    if(period==='compare') ranges.push([iso(-elapsed-7),iso(-7)]);
    return ranges;
  }
  function localSummary(rows,user,period,now=new Date()) {
    return windows(period,now).map(([start,end])=>{
      const days = new Map();
      for(const r of rows){
        const day=r.dateGregorian||r.day;
        if(r.userId===user && day>=start && day<=end) days.set(day,r);
      }
      const result={reports:days.size,sport:0,reading:0};
      for(const r of days.values()){result.sport+=Number(r.sport)||0;result.reading+=Number(r.reading)||0;}
      return result;
    });
  }
  function describe(data,q) {
    const group=q.scope!=='self';
    const summary=(r,when)=>{
      const subject=q.scope==='peers'?'هم‌حلقه‌ای‌هایت (بدون خودت)':q.scope==='ring'?'اعضای حلقه‌ات':'خودت';
      if(!r.reports) return when+' برای '+subject+' گزارشی ثبت نشده است.';
      const participation=group?fa(r.participants)+' نفر از '+fa(data.members)+' نفر، ':'';
      return when+' برای '+subject+'، '+participation+fa(r.reports)+' گزارش ثبت شده است؛ در مجموع '+fa(r.sport)+' ساعت ورزش و '+fa(r.reading)+' صفحه مطالعه.';
    };
    const [current,baseline]=data.results;
    let answer=summary(current,labels[q.period]);
    if(baseline){
      answer+='\n'+summary(baseline,'در همین روزهای هفتهٔ قبل');
      if(current.reports && baseline.reports){
        const diff=current.reading-baseline.reading;
        answer+='\nمطالعهٔ ثبت‌شده '+(diff?fa(Math.abs(diff))+' صفحه '+(diff>0?'بیشتر':'کمتر')+' شده است.':'در دو بازه برابر است.');
      }
    }
    return answer;
  }
  window.growthAssistant={intent,localSummary,describe};
})();
