(()=>{
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={camera:'M3 7h4l2-3h6l2 3h4v14H3z M12 17a4 4 0 1 0 0-.01',bookmark:'M6 3h12v19l-6-4-6 4z',play:'M8 4l12 8-12 8z',muted:'M11 4L6 8H2v8h4l5 4z M16 9l6 6 M22 9l-6 6',sound:'M11 4L6 8H2v8h4l5 4z M15 7c4 3 4 7 0 10 M18 4c7 5 7 11 0 16',home:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',posts:'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5',new:'M12 5v14 M5 12h14',growth:'M12 21V10 M12 15C4 16 3 10 4 6c6 0 9 2 8 9z M12 11c0-6 4-8 8-8 1 5-2 9-8 8',settings:'M12 12a4 4 0 1 0 0-.01 M4 21c0-7 16-7 16 0',bell:'M5 17h14l-2-4V9a5 5 0 0 0-10 0v4z M10 21h4',arrow:'M15 5l-7 7 7 7',calendar:'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4',users:'M9 11a4 4 0 1 0 0-.01 M2 21c0-8 14-8 14 0 M17 4a4 4 0 0 1 0 8 M18 15c4 0 5 3 5 6',heart:'M20 5c-3-3-7-1-8 1-2-3-6-4-9-1-4 5 3 11 9 15 6-4 12-10 8-15z',comment:'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4z',share:'M4 13L20 3l-5 18-5-7-6-1z M10 14L20 3',upload:'M12 16V3 M7 8l5-5 5 5 M3 15v6h18v-6',check:'M5 12l4 4L20 5',book:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 7-3 10-1V4c-4-1-7-2-10 1z M12 5v16',sport:'M3 9v6 M6 6v12 M6 12h12 M18 6v12 M21 9v6',money:'M2 5h20v14H2z M12 8a4 4 0 1 0 0 .01 M5 9v6 M19 9v6',file:'M5 2h10l5 5v15H5z M15 2v6h5 M9 13h7 M9 17h5',star:'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',logout:'M10 3H3v18h7 M8 12h13 M17 8l4 4-4 4',help:'M12 17h.01 M8 8a4 4 0 1 1 6 4c-2 1-2 2-2 3'};
const linkedIcons = { posts:'39366', home:'jJzviSBhm8Am', ring:'XsEEVB3VrdJo', group:'Bvw1MpqGTPxI', resolution:'J2BiCwr5UuGA', bell:'W4ac81quJG4J' };
Object.assign(paths, {ring:paths.heart, group:paths.users, resolution:paths.file, moon:'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M12 1v2 M12 21v2 M1 12h2 M21 12h2 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2'});
const icon = name => linkedIcons[name]
  ? `<span class="linked-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${paths[name]}"/></svg><img src="https://img.icons8.com/?size=100&amp;id=${linkedIcons[name]}&amp;format=png&amp;color=000000" alt="" onload="this.parentNode.classList.add('loaded')" onerror="this.hidden=true"></span>`
  : assetIcons[name]
  ? `<img class="asset-icon" src="assets/icon-${assetIcons[name]}.png" width="100" height="100" alt="" aria-hidden="true" draggable="false">`
  : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.users}"/></svg>`;
const assetIcons = { growth: 'growth', sport: 'dumbbell', book: 'reading', settings: 'profile', support: 'support', plans: 'plans', sleep: 'sleep', game: 'game', social: 'social', leisureSport: 'leisure-sport' };
const routes = {
  home:['/','خانهٔ اخوت'], posts:['/posts/','پست‌ها'], new:['/posts/new/','پست جدید'],
  growth:['/growth/','رشد فردی'], settings:['/profile/','پروفایل من'], chat:['/chat/','همراه اخوت'],
  reels:['/reels/','ریلز'], oversight:['/coach/','پنل نظارتی'], weekly:['/admin/reports/','گزارش هفتگی'],
  login:['/login/','ورود به اخوت'], recovery:['/forgot-password/','بازیابی رمز عبور'],
  notifications:['/notifications/','اعلان‌ها']
};
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function saved(key) { try {return JSON.parse(localStorage.getItem('okhovat-ui-'+key))} catch {return null} }
function save(key,value) { try {localStorage.setItem('okhovat-ui-'+key,JSON.stringify(value))} catch {} }
function routeKey() {
  const path=location.pathname.replace(/\/index\.html$/,'/').replace(/\/?$/,'/');
  return Object.keys(routes).find(key=>routes[key][0]===path);
}
function link(key,content,cls='') {
  return `<a href="${routes[key][0]}" class="${cls}" ${routeKey()===key?'aria-current="page"':''}>${content}</a>`;
}
function navItem(key,cls) {
  return link(key,icon(key)+'<span>'+routes[key][1]+'</span>',cls+(routeKey()===key?' active':''));
}
function chrome(key) {
  const label=routes[key]?.[1] || 'صفحه پیدا نشد';
  document.title=label+' | اخوت';
  const coach=currentRole()==='coach';
  const coachPages=['home','posts','oversight','settings'];
  $('#sidebar').innerHTML=link('home','<img src="/assets/logo-ui.webp" alt=""><div><strong>اخوت</strong><small>کنار هم، رو به رشد</small></div>','brand')+
    '<div class="navs">'+(coach?coachPages:['home','posts','new','growth','settings']).map(k=>navItem(k,'navitem')).join('')+'</div>';
  const dark=document.body.dataset.theme==='dark';
  $('#header').innerHTML=key==='chat' && (authorized() || chatProbe?.active)
    ? link('settings',icon('settings')+'<span class="sr-only">پروفایل</span>','iconbtn chat-profile')
    : `<div class="breadcrumb">${link('home','اخوت')} / ${label}</div><div class="header-actions"><button class="iconbtn theme-button" aria-pressed="${dark}" aria-label="حالت تاریک" onclick="toggleTheme()">${icon(dark?'moon':'sun')}</button>${link('notifications',icon('bell')+'<span class="sr-only">اعلان‌ها</span>','iconbtn bell-button')}${authorized()?link('settings',icon('settings')+' پروفایل','btn'):link('login','ورود به اخوت','btn')}${coach?'<button class="link" onclick="memberShell.logout()">خروج</button>':''}</div>`;
  $('#mobileNav').classList.toggle('coach-dock',coach);
  $('#mobileNav').innerHTML=coach?coachPages.map(k=>navItem(k,'mobileitem')).join(''):navItem('home','mobileitem')+`<details class="capsule-menu"><summary aria-label="منوی اخوت"><img src="/assets/logo-ui.webp" alt="اخوت"></summary><button class="capsule-shade" aria-label="بستن منو" onclick="closePublicCapsule()"></button><div class="capsule-shortcuts">${[['new','new'],['growth','growth'],['reels','play']].map(([k,glyph])=>link(k,icon(glyph)+'<span>'+routes[k][1]+'</span>')).join('')}</div></details>`+navItem('posts','mobileitem');
}
function closeCapsule(){const menu=document.querySelector('.capsule-menu[open]');if(menu){menu.open=false;menu.querySelector('summary').focus()}}
function toggleTheme(){
  document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';
  save('theme',document.body.dataset.theme);chrome(routeKey());$('.theme-button').focus();
}
function home() {
  return `<div class="page-title"><div><h1>خانهٔ اخوت</h1><p>اطلاعیه‌ها و برنامه‌های این هفته</p></div></div>
  <okhovat-welcome style="display:block">سلام دوست عزیز، به سامانهٔ ما خوش آمدی. اگر کمکی خواستی بهم بگو.</okhovat-welcome>
  <div class="columns home-columns"><section><div class="sectionhead"><h2>برنامه‌های هفته</h2></div><div class="card">هنوز برنامه‌ای منتشر نشده است.</div><div class="sectionhead"><h2>محتوای کارگروه‌ها</h2></div><workgroup-cards class="cards workgroup-cards" id="workgroup-list"><div class="card">هنوز محتوایی منتشر نشده است.</div></workgroup-cards></section><aside class="rail"><div class="card"><h3>گزارش روزانه</h3>${link('growth','ثبت رشد فردی '+icon('arrow'),'btn soft full')}</div></aside></div>`;
}
let expiryTimer,memberScript;
function currentRole(){return window.okApi.user?.role||'member';}
function authorized(){return !!window.okApi.user && window.okApi.user.expires*1000>Date.now();}
async function logoutTest(){
  try{await okApi.request('logout','POST');signalAccountChange();location.replace('/login/');}
  catch{alert('خروج انجام نشد. دوباره تلاش کن.');}
}
function watchExpiry(){
  clearTimeout(expiryTimer);
  if(authorized())expiryTimer=setTimeout(()=>location.replace('/login/'),window.okApi.user.expires*1000-Date.now());
}
function signalAccountChange(){try{localStorage.setItem('okhovat-session-change',String(Date.now()));}catch{}}
window.addEventListener('storage',e=>{if(e.key==='okhovat-session-change')location.reload();});
function normalized(value){return value.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632))}
async function submitTestLogin(event){
  event.preventDefault();
  const form=event.currentTarget;
  const code=normalized(form.elements.code.value.trim());
  const button=form.querySelector('button'), error=form.querySelector('[role=alert]');
  button.disabled=true;
  try {
    await okApi.request('login','POST',{code,password:form.elements.password.value});
    const next=new URLSearchParams(location.search).get('next') || '/';
    const target=new URL(next,location.origin);
    const allowed=target.origin===location.origin && Object.values(routes).some(([p])=>p===target.pathname);
    const destination=allowed?target.pathname+target.hash:'/';
    signalAccountChange();location.replace(destination);
  } catch (cause){error.textContent=cause.message||'ورود انجام نشد.';}
  finally {button.disabled=false}
}
function testLogin(){
  return `<section class="card access-page login-page"><img class="login-logo" src="/assets/logo-ui.webp" alt="اخوت"><h1>ورود به اخوت</h1><form onsubmit="submitTestLogin(event)" oninput="this.querySelector('[role=alert]').textContent=''"><label class="field">کد گروهی<input name="code" required inputmode="numeric" autocomplete="username"></label><label class="field">رمز عبور<input name="password" type="password" required autocomplete="current-password" aria-describedby="login-error"></label><p id="login-error" class="login-error" role="alert"></p><button class="btn full">ورود</button></form></section>`;
}
let chatProbe;
function checkChatSession(){
  if(chatProbe || typeof fetch!=='function')return;
  const probe={loading:true};
  chatProbe=probe;
  fetch('/api/assistant/session/',{cache:'no-store',headers:{Accept:'application/json'}})
    .then(async response=>{
      if(response.status===404 || response.status===405 ||
          (response.ok && response.headers.get('content-type')?.includes('text/html'))) return;
      if(!response.ok)throw Error();
      const session=await response.json();
      if(typeof session.authenticated!=='boolean')throw Error();
      probe.server=true;probe.csrf=session.csrf;probe.active=session.authenticated;
    }).catch(()=>{probe.failed=true}).finally(()=>{
      probe.loading=false;
      if(chatProbe===probe && routeKey()==='chat')renderRoute();
    });
}
function openChat(){
  checkChatSession();
  if(chatProbe?.loading)return '<p role="status">در حال باز کردن گفتگو…</p>';
  if(chatProbe?.failed)return '<p role="alert">ارتباط با دستیار برقرار نشد.</p><button class="btn" onclick="location.reload()">تلاش دوباره</button>';
  if(chatProbe?.server && !chatProbe.active)return '<p>برای دیدن گزارش‌ها، با حساب سامانه وارد شو.</p><a class="btn" href="/api/assistant/login/">ورود به سامانه</a>';
  return authorized() || chatProbe?.active ? memberPage('chat') : accessPage('chat');
}
function memberPage(key){
  if(key==='weekly' || (key==='oversight' && currentRole()!=='coach'))return '<section class="card access-page"><h1>دسترسی محدود</h1><p>این بخش برای نقش شما فعال نیست.</p></section>';
  if(key==='login')return testLogin();
  if(key==='recovery')return accessPage(key);
  if(window.memberView)return window.memberView(key);
  if(!memberScript){
    memberScript=document.createElement('script');
    memberScript.src='/member-preview.js?v=profile2';
    memberScript.onload=renderRoute;
    memberScript.onerror=()=>{
      memberScript=null;
      if(authorized())$('#app').innerHTML='<p>بارگذاری انجام نشد.</p><button class="btn" onclick="memberShell.refresh()">تلاش دوباره</button>';
    };
    document.head.append(memberScript);
  }
  return '<p role="status">در حال بارگذاری…</p>';
}
const initialLoginQuery=routeKey()==='login'?location.search:
  routeKey() && routeKey()!=='home'?'?next='+encodeURIComponent(location.pathname+location.hash):'';
window.memberShell={authorized,currentRole,page:routeKey,tourGo(key){
  if(!Object.hasOwn(routes,key) || routeKey()===key)return;
  history.replaceState(null,'',routes[key][0]+(key==='login'?initialLoginQuery:''));renderRoute();
},chatSession:()=>chatProbe,logout:logoutTest,refresh:()=>renderRoute(),header:()=>chrome(routeKey()),go(key){
  if(!Object.hasOwn(routes,key))return;
  history.pushState(null,'',routes[key][0]);renderRoute();window.scrollTo(0,0);
}};
window.submitTestLogin=submitTestLogin;
function accessPage(key){
  if(key==="login")return testLogin();
  const recovery=key==='recovery', title=routes[key][1];
  const signIn='<a class="btn" href="/login/?next='+encodeURIComponent(routes[key][0]+location.hash)+'">ورود به اخوت</a>';
  return `<section class="card access-page login-page"><img class="login-logo" src="/assets/logo-ui.webp" alt="اخوت"><h1>${title}</h1>
  <p>${recovery?'بازیابی رمز پس از اتصال سامانه به سرویس حساب‌ها فعال می‌شود.':'برای دیدن این بخش وارد حساب خود شو.'}</p>
  ${key==='login'?link('recovery','فراموشی رمز عبور','link'):key==='recovery'?link('login','بازگشت به ورود','link'):signIn}
  </section>`;
}
let navigated=false;
function finishRoute(){
  const loader=$('#route-loader');
  if (!$('#site-style').dataset.ready) return;
  if(!loader.classList.contains('route-change') || motionPreference.matches) loader.hidden=true;
  else loader.classList.add('route-done');
}
window.addEventListener('style-ready',finishRoute);
$('#route-loader').addEventListener('animationend',event=>{
  if(event.animationName==='logo-exit') event.currentTarget.hidden=true;
});
function watchSection(section){
  const images=[...section.querySelectorAll('img')].filter(img=>!img.complete && img.loading!=='lazy');
  if(!images.length)return;
  section.classList.add('section-loading');
  section.setAttribute('aria-busy','true');
  const pending=new Set(images);
  function settle(img){
    pending.delete(img);
    if(!pending.size){
      section.classList.remove('section-loading');
      section.removeAttribute('aria-busy');
    }
  }
  images.forEach(img=>{
    const done=()=>{img.removeEventListener('load',done);img.removeEventListener('error',done);settle(img)};
    img.addEventListener('load',done);img.addEventListener('error',done);
    if(img.complete)done();
  });
}
function fitChatViewport(){
  const viewport=window.visualViewport;
  if(viewport && document.body.classList.contains('chat-is-open')){
    document.body.style.setProperty('--chat-height',viewport.height+'px');
    document.body.style.setProperty('--chat-top',viewport.offsetTop+'px');
  }
}
window.visualViewport?.addEventListener('resize',fitChatViewport);
window.visualViewport?.addEventListener('scroll',fitChatViewport);
function renderRoute(){
  const loader=$('#route-loader');
  if(navigated){
    loader.className='route-change';loader.hidden=false;
    // Restart the small completion cue even on rapid back/forward navigation.
    for(const animation of loader.getAnimations?.() || []) animation.cancel();
  }
  const key=routeKey();
  if(key!=='chat' && chatProbe){window.resetAssistantChat?.();chatProbe=null;}
  document.body.classList.toggle('chat-is-open',key==='chat' && (authorized() || chatProbe?.active));
  fitChatViewport();
  chrome(key);
  $('#app').innerHTML=key==='chat'?openChat():key==='home'?home():key?(authorized()?memberPage(key):accessPage(key)):'<h1>صفحه پیدا نشد</h1>'+link('home','بازگشت به خانه');
  document.querySelectorAll('#app .card,#app .hero,#sidebar .brand,#mobileNav summary').forEach(watchSection);
  finishRoute();
  if(!navigated){
    $('#app').dataset.ready='yes';
    window.dispatchEvent(new Event('app-ready'));
  }
  navigated=true;window.dispatchEvent(new Event('okhovat-route'));
}
document.addEventListener('click',e=>{
  const a=e.target.closest?.('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.shiftKey||e.altKey||e.metaKey||a.target||a.hasAttribute('download'))return;
  const url=new URL(a.href);
  if(url.origin!==location.origin||!Object.values(routes).some(([path])=>path===url.pathname))return;
  e.preventDefault();closeCapsule();
  if(url.href!==location.href)history.pushState(null,'',url.href);
  renderRoute();window.scrollTo(0,0);$('#app').focus({preventScroll:true});
});
window.addEventListener('popstate',renderRoute);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCapsule()});
document.body.dataset.theme=saved('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
if(location.pathname==='/' && location.hash.startsWith('#post-'))history.replaceState(null,'','/posts/'+location.hash);
async function start(){
  try{await okApi.init();watchExpiry();renderRoute();}
  catch{document.documentElement.classList.remove('intro-active');$('#intro').hidden=true;
    $('#route-loader').hidden=true;$('#app').innerHTML='<p role="alert">ارتباط با FastAPI برقرار نشد. سایت را از نشانی سرور اجرا کن.</p><button class="btn" onclick="location.reload()">تلاش دوباره</button>';}
}
start();

window.toggleTheme=toggleTheme;window.closePublicCapsule=closeCapsule;
})();
