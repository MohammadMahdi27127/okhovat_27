(() => {
  const home = ['home', '.page-title h1', 'خانهٔ اخوت', 'برنامه‌های هفته و اطلاعیه‌های کارگروه‌ها را اینجا می‌بینی.'];
  const community = [
    ['posts', '.feed-head h1', 'پست‌های اعضا', 'نوشته‌های اعضا را بخوان و به آن‌ها واکنش نشان بده. در «پست‌های ترند شده» پیشنهادهای اعضا به مربی را می‌بینی.'],
    ['new', '#postForm label, #app h1', 'انتشار پست', 'از این فرم می‌توانی متن و تصویرت را برای اعضا منتشر کنی.']
  ];
  const guide = ['chat', '.chat-header h1', 'همراه اخوت', 'دربارهٔ بخش‌های سایت بپرس یا بنویس «این هفته چقدر مطالعه کردم؟» تا دستیار گزارش‌هایت را بررسی کند.'];
  const alerts = ['notifications', '#app h1', 'اعلان‌ها', 'از زنگ بالای صفحه به این بخش می‌رسی و اعلان‌های تازه‌ات را می‌بینی.'];
  const paths = {
    guest: [home, ['login', '.login-page h1', 'ورود به اخوت', 'کد گروهی و رمز عبورت را وارد کن. بعد از ورود، راهنما بخش‌های مخصوص حساب تو را نشان می‌دهد.']],
    member: [home, ...community,
      ['growth', '.daily-growth-form h2', 'گزارش رشد فردی', 'ساعت ورزش، تعداد صفحه‌های مطالعه و تمرین مهارت امروزت را اینجا ثبت کن.'],
      ['growth', '.plans-button', 'برنامه و مطالعهٔ من', 'با این دکمه برنامهٔ ورزشی و نام کتابی را که می‌خوانی وارد کن.'],
      ['reels', '#app h1', 'ریلز', 'این بخش برای ویدیوهای کوتاه در نظر گرفته شده و به‌زودی فعال می‌شود.'],
      ['settings', '.profile-info h2', 'پروفایل من', 'خلاصهٔ فعالیت‌هایت را ببین. در «وضعیت من» برنامهٔ ورزشی و کتاب در حال مطالعه‌ات را پیدا می‌کنی.'],
      alerts, guide],
    coach: [home, ...community,
      ['oversight', '.coach-tabs', 'پنل نظارتی', 'در «نظرات فردی» گزارش یک عضو را ببین. در «نظرات جمعی» شاخصی مثل ورزش یا مطالعه را برای مقایسه انتخاب کن.'],
      ['oversight', 'form[onsubmit*=submitGrowthMessage] select', 'پیام رشد فردی', 'در بخش نظرات جمعی می‌توانی برای یک نفر، یک حلقه، یک کارگروه یا همهٔ اعضا پیام بگذاری و پیام‌های قبلی‌ات را ببینی.'],
      ['settings', '.coach-panel form h2', 'امتیازدهی مربی', 'از فهرست کارگروه‌ها یا حلقه‌ها یکی را انتخاب کن، امتیازش را وارد کن و دکمهٔ ثبت را بزن.'],
      alerts, guide]
  };
  const key = role => 'okhovat-tour-v1-' + role;
  const memory = new Map();
  function read(role) {
    try { return localStorage.getItem(key(role)) ?? memory.get(role); }
    catch { return memory.get(role); }
  }
  function save(role, value) {
    memory.set(role, value);
    try { localStorage.setItem(key(role), value); } catch {}
  }

  const panel = document.createElement('dialog');
  panel.id = 'site-tour';
  panel.setAttribute('aria-labelledby','tour-heading');
  panel.setAttribute('aria-describedby','tour-copy');
  panel.innerHTML = '<small></small><h2 id="tour-heading"></h2><p id="tour-copy"></p><div class="tour-actions"><button class="btn" data-action="next"></button><button class="btn light" data-action="back">قبلی</button><button class="link" data-action="later">بعداً</button></div>';
  document.body.append(panel);
  let role, index, target, paused = false, waiting = false, frame;
  function clear(){
    target?.classList.remove('tour-highlight');
    target=null;
    if(panel.open) panel.close();
  }
  function place(){
    if(!target || !panel.open)return;
    const gap=12, rect=target.getBoundingClientRect(), height=panel.offsetHeight;
    const below=rect.bottom+gap, above=rect.top-height-gap;
    const top=below+height<=innerHeight-gap ? below : above>=gap ? above :
      (rect.top+rect.bottom)/2<innerHeight/2 ? innerHeight-height-gap : gap;
    panel.style.top=Math.max(gap,top)+'px';
    const left=(rect.left+rect.right-panel.offsetWidth)/2;
    panel.style.left=Math.max(gap,Math.min(left,innerWidth-panel.offsetWidth-gap))+'px';
  }
  function show(){
    const shell=window.memberShell;
    if(!shell || !document.querySelector('#intro').hidden || paused)return;
    const active=shell.authorized()?shell.currentRole():'guest';
    if(role!==active){
      clear();waiting=false;role=active;
      if(active!=='guest' && read('guest')!=='done')save('guest','done');
    }
    const steps=paths[role], stored=read(role);
    if(stored==='done' || waiting){clear();return;}
    index=Math.min(steps.length-1,Math.max(0,parseInt(stored,10)||0));
    const [route,selector,title,copy]=steps[index];
    if(shell.page()!==route){clear();shell.tourGo(route);return;}
    const anchor=document.querySelector(selector) || document.querySelector('#app h1, #app [role=alert]');
    if(!anchor)return;
    if(target!==anchor){
      target?.classList.remove('tour-highlight');
      target=anchor;
      target.classList.add('tour-highlight');
      target.scrollIntoView({block:'center',behavior:'instant'});
    }
    panel.querySelector('small').textContent='راهنمای اخوت · '+(index+1).toLocaleString('fa-IR')+' از '+steps.length.toLocaleString('fa-IR');
    panel.querySelector('h2').textContent=title;
    panel.querySelector('p').textContent=copy;
    const next=panel.querySelector('[data-action="next"]');
    next.textContent=index<steps.length-1?'بعدی':role==='guest'?'ورود به حساب':'تمام شد';
    panel.querySelector('[data-action="back"]').disabled=index===0;
    if(!panel.open){panel.showModal();next.focus({preventScroll:true});}
    place();
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(show);}
  function postpone(){paused=true;clear();}
  panel.addEventListener('cancel',event=>{event.preventDefault();postpone();});
  panel.addEventListener('click',event=>{
    const action=event.target.dataset.action;
    if(!action)return;
    if(action==='later'){postpone();return;}
    if(action==='next' && index===paths[role].length-1){
      if(role==='guest'){waiting=true;clear();document.querySelector('.login-page input')?.focus();return;}
      save(role,'done');clear();return;
    }
    save(role,String(index+(action==='next'?1:-1)));
    show();
  });
  window.addEventListener('resize',place);
  document.addEventListener('scroll',place,true);
  window.addEventListener('okhovat-route',schedule);
  window.addEventListener('okhovat-intro-dismissed',schedule);
  window.addEventListener('storage',event=>{if(event.key===key(role))schedule();});
  schedule();
})();
