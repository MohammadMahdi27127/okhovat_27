const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={camera:'M3 7h4l2-3h6l2 3h4v14H3z M12 17a4 4 0 1 0 0-.01',bookmark:'M6 3h12v19l-6-4-6 4z',play:'M8 4l12 8-12 8z',muted:'M11 4L6 8H2v8h4l5 4z M16 9l6 6 M22 9l-6 6',sound:'M11 4L6 8H2v8h4l5 4z M15 7c4 3 4 7 0 10 M18 4c7 5 7 11 0 16',home:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',posts:'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5',new:'M12 5v14 M5 12h14',growth:'M12 21V10 M12 15C4 16 3 10 4 6c6 0 9 2 8 9z M12 11c0-6 4-8 8-8 1 5-2 9-8 8',settings:'M12 12a4 4 0 1 0 0-.01 M4 21c0-7 16-7 16 0',bell:'M5 17h14l-2-4V9a5 5 0 0 0-10 0v4z M10 21h4',arrow:'M15 5l-7 7 7 7',calendar:'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4',users:'M9 11a4 4 0 1 0 0-.01 M2 21c0-8 14-8 14 0 M17 4a4 4 0 0 1 0 8 M18 15c4 0 5 3 5 6',heart:'M20 5c-3-3-7-1-8 1-2-3-6-4-9-1-4 5 3 11 9 15 6-4 12-10 8-15z',comment:'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4z',share:'M4 13L20 3l-5 18-5-7-6-1z M10 14L20 3',upload:'M12 16V3 M7 8l5-5 5 5 M3 15v6h18v-6',check:'M5 12l4 4L20 5',book:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 7-3 10-1V4c-4-1-7-2-10 1z M12 5v16',sport:'M3 9v6 M6 6v12 M6 12h12 M18 6v12 M21 9v6',money:'M2 5h20v14H2z M12 8a4 4 0 1 0 0 .01 M5 9v6 M19 9v6',file:'M5 2h10l5 5v15H5z M15 2v6h5 M9 13h7 M9 17h5',star:'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',logout:'M10 3H3v18h7 M8 12h13 M17 8l4 4-4 4',help:'M12 17h.01 M8 8a4 4 0 1 1 6 4c-2 1-2 2-2 3'};
const linkedIcons = { posts:'39366', home:'jJzviSBhm8Am', ring:'XsEEVB3VrdJo', group:'Bvw1MpqGTPxI', resolution:'J2BiCwr5UuGA', bell:'W4ac81quJG4J' };
Object.assign(paths, {ring:paths.heart, group:paths.users, resolution:paths.file, moon:'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M12 1v2 M12 21v2 M1 12h2 M21 12h2 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2'});
const icon = name => linkedIcons[name]
  ? `<span class="linked-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${paths[name]}"/></svg><img src="https://img.icons8.com/?size=100&amp;id=${linkedIcons[name]}&amp;format=png&amp;color=000000" alt="" onload="this.parentNode.classList.add('loaded')" onerror="this.hidden=true"></span>`
  : assetIcons[name]
  ? `<img class="asset-icon" src="assets/icon-${assetIcons[name]}.png" width="100" height="100" alt="" aria-hidden="true" draggable="false">`
  : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.users}"/></svg>`;
const navs=[['home','خانهٔ اخوت'],['posts','پست‌ها'],['new','پست جدید'],['growth','رشد فردی'],['settings','پروفایل من']];
const groups=['هدایت و برنامه‌ریزی','پذیرش','مالی','آموزش','علوم اسلامی','خدمات','تربیت بدنی','تدارکات','سازماندهی','فرهنگی'];
const members=[];
const avatar=(n,cls='')=>`<span class="avatar ${cls}">${esc(n.split(' ').map(a=>a[0]).slice(0,2).join(''))}</span>`;
const saved=k=>okApi.data[k]??null;
const save=(k,v)=>{okApi.data[k]=v;};
async function updateServer(action,onSuccess){
  try{await action();if(onSuccess)onSuccess();else render();}
  catch(error){toast(error.message);}
}
let state={page:'home',logged:false,role:'member',group:'آموزش',filter:'همه',pending:'home',forms:saved('forms')||[],answers:saved('answers')||[],posts:saved('posts')||[],tasks:saved('tasks')||{},cards:saved('cards')||{},growth:saved('growth')||[],ringLikes:saved('ringLikes')||{},liked:saved('liked')||{},comments:saved('comments')||{},bookmarks:saved('bookmarks')||{},following:saved('following')||{},recommended:saved('recommended')||{},activeAccount:null,resolutions:saved('resolutions')||[],sessionSummaries:saved('sessionSummaries')||{},chatHistory:[],personalStatus:saved('personalStatus')||{},coachReadIds:saved('coachReadIds')||[],notifications:saved('notifications')||[]};
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3600)}
function closeModal(){$('#modal').close()}
function modal(html){pauseReelForModal();$('#modal').className='';$('#modal').removeAttribute('aria-labelledby');$('#modal').innerHTML=`<button class="close" onclick="closeModal()" aria-label="بستن">×</button>${html}`;$('#modal').showModal()}
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
function go(page){window.memberShell.go(page==='help'?'chat':page)}
function render(){window.memberShell.refresh()}
function chrome(){window.memberShell.header()}
function title(h,p,extra=''){return `<div class="page-title"><div><h1>${h}</h1><p>${p}</p></div>${extra}</div>`}
const groupIcons=['calendar','users','money','growth','book','heart','sport','file','users','star'];
const groupDescriptions=['هم‌فکری برای مسیر پیش رو','منتظر دیدار دوباره‌تان هستیم','شفاف، ساده و در کنار هم','هر روز، یک چیز تازه یاد بگیریم','چند صفحه نزدیک‌تر به آگاهی','با هم، برای حال خوب جمع','بدنی سالم، همراهی پرانرژی','کارهای کوچک، اثرهای بزرگ','نظم جمع، مسئولیت همهٔ ما','روایت‌های ماندگار جمع ما'];
function previewRole(){return ''}
// Local prototype data. The final service supplies trend status and follower totals.
const TREND_MIN_FOLLOWERS = 30;
const communityProfiles = {};
const quickEmojis = ['😂', '😮', '😍', '😢', '👏', '🔥', '🙌', '❤️'];
let activeCommentPost = null;
let replyToComment = null;
let reelObserver = null;
let resumeVideo = null;

function trendingBadge(name) {
  const user = communityProfiles[name];
  return user?.isTrending && user.followers >= TREND_MIN_FOLLOWERS
    ? '<span class="trend-badge" title="همراه پرطرفدار و ترند" aria-label="همراه پرطرفدار و ترند"><img src="assets/trend-star.png" alt=""></span>'
    : '';
}

// Segment by grapheme so joined and skin-tone emoji remain intact, and escape all text.
function animatedText(text) {
  const segments = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('fa', { granularity: 'grapheme' }).segment(String(text ?? '')), part => part.segment)
    : Array.from(String(text ?? ''));
  return segments.map(part => /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(part)
    ? `<span class="emoji-motion">${esc(part)}</span>` : esc(part)).join('');
}

function allPosts(){return state.posts.filter(p=>!(saved('removedPosts')||[]).includes(p.id))}
function postById(id) { return allPosts().find(post => post.id === id); }
function faNumber(value) { return new Intl.NumberFormat('fa-IR').format(value); }
function postComments(id) {
  if (!state.comments[id]) {
    state.comments[id] = [];
  }
  // Retain comments saved by older versions of the prototype.
  state.comments[id] = state.comments[id].map((comment, i) => typeof comment === 'string'
    ? { id: `legacy-${i}`, name: currentUserName(), text: comment, likes: 0, replies: [] } : comment);
  return state.comments[id];
}
function commentCount(id) { return postComments(id).reduce((sum, comment) => sum + 1 + (comment.replies?.length || 0), 0); }
function selfAvatar() {
  const image = saved('avatar');
  return image ? `<img class="avatar" src="${esc(image)}" alt="تصویر من">` : avatar(currentUserName());
}

function mobileCapsule() {
  const destination = (page, label) => `<button class="mobileitem ${state.page === page ? 'active' : ''}" onclick="go('${page}')">${navIcon(page)}<span>${label}</span></button>`;
  return destination('home','خانه') + `<details class="capsule-menu"><summary aria-label="منوی اخوت"><img src="assets/logo.png" alt="اخوت"></summary>
    <button class="capsule-shade" aria-label="بستن منو" onclick="closeCapsule()"></button>
    <div class="capsule-shortcuts"><button onclick="go('new')">${icon('new')}<span>پست جدید</span></button><button onclick="go('growth')">${navIcon('growth')}<span>رشد فردی</span></button><button onclick="openReels()">${icon('play')}<span>ریلز</span></button></div></details>` + destination('posts','پست‌ها');
}
function closeCapsule() {
  const menu = document.querySelector('.capsule-menu[open]');
  if (menu) { menu.open = false; menu.querySelector('summary').focus(); }
}
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCapsule(); });
function openReels() {
  closeCapsule();
  modal('<h2>ریلز</h2><p class="helper">به‌زودی فعال می‌شود.</p>');
}
let feedTab = 'all';
function setFeedTab(tab) {
  feedTab = tab;
  render();
}
function posts() {
  const list = allPosts().filter(post => (feedTab!=='trending' || state.recommended[post.id]) && (feedTab !== 'following' || state.following[post.name]) && (state.filter === 'همه' || post.type === state.filter));
  return `<section class="community-feed"><header class="feed-head"><h1>پست‌ها</h1><button onclick="openReels()">${icon('play')} ریلز</button><button class="btn" onclick="go('new')">${icon('new')} پست جدید</button></header>
    <div class="feed-toolbar">${[['all','برای شما'],['following','دنبال‌شده‌ها'],['trending','پست‌های ترند شده']].map(([key,label]) => `<button aria-pressed="${feedTab === key}" onclick="setFeedTab('${key}')">${label}</button>`).join('')}
    <select aria-label="نوع پست" onchange="setPostFilter(this.value)">${['همه','حلقه','کارگروه','رشد فردی','شخصی'].map(type => `<option ${state.filter === type ? 'selected' : ''}>${type}</option>`).join('')}</select></div>
    ${list.length ? list.map(feedPost).join('') : '<p class="empty">هنوز پستی در این بخش نیست.</p>'}</section>`;
}
function feedPost(post) {
  const id = esc(post.id), own = post.name === currentUserName();
  const actions = [
    ['comments','comment','دیدگاه','commentPost',commentCount(post.id)],
    ['like','heart','پسندیدن','likeReel',reactionCount(post),likedByMe(id)],
    ['recommend','star','پیشنهاد به مربی','recommendPost',null,(saved('nominations')?.[id] || (state.recommended[id]?['demo-1024']:[])).includes(currentUserId())],
    ['bookmark','bookmark','ذخیره','toggleBookmark',null,!!state.bookmarks[id]],
    ['share','share','اشتراک‌گذاری','sharePost',null]
  ];
  const date = post.createdAt && new Date(post.createdAt);
  return `<article class="feed-post${post.coachPost?' coach-post':''}" id="post-${id}"><button class="feed-avatar" aria-label="پروفایل ${esc(post.name)}" onclick="authorProfile('${id}')">${own ? selfAvatar() : avatar(post.name)}</button><div class="feed-body">
    <header><button onclick="authorProfile('${id}')"><strong>${esc(post.name)}</strong>${post.coachPost?'<span class="coach-label">پست مربی</span>':''}${trendingBadge(post.name)}</button><small>${esc(post.type)}${date && Number.isFinite(date.valueOf()) ? ' · '+date.toLocaleDateString('fa-IR') : post.id.startsWith('demo') ? ' · نمونه' : ''}</small></header>
    <h2>${animatedText(post.title)}</h2><p>${animatedText(post.text)}</p>
    ${post.location ? `<small>${esc(post.location)}</small>` : ''}
    ${post.people?.length ? `<div class="feed-people">${post.people.map(n => `<span>${avatar(n)} ${esc(n)}</span>`).join('')}</div>` : ''}
    ${post.video ? `<video class="feed-media" src="${esc(post.video)}" controls playsinline preload="metadata"></video>` : post.image || post.media ? `<img class="feed-media" src="${esc(post.image || 'assets/reel-reading.svg')}" alt="${esc(post.title)}" loading="lazy">` : ''}
    ${post.file ? `<a class="link" download="${esc(post.fileName)}" href="${esc(post.file)}">${icon('file')} ${esc(post.fileName)}</a>` : ''}
    ${siteAdmin()?`<button class="link" onclick="moderationPanel('${id}')">مدیریت پست</button>`:''}<div class="feed-actions">${actions.map(([key,glyph,label,handler,count,pressed]) => `<button data-action="${key}" aria-label="${label}" title="${label}" ${pressed === undefined ? '' : `aria-pressed="${pressed}"`} onclick="${handler}('${id}')">${icon(glyph)}${count == null ? '' : `<span data-count="${key === 'like' ? 'likes' : 'comments'}">${faNumber(count)}</span>`}</button>`).join('')}</div></div></article>`;
}

function reelsPage() {
  const list = allPosts().filter(post => state.filter === 'همه' || post.type === state.filter);
  return `<div class="reels-layout"><section class="reels-stage" aria-label="روایت‌های اخوت">
    <div class="reels-top"><div class="reels-wordmark">اخوت <span>روایت‌ها</span></div>
      ${reelsFilter()}
      <button aria-label="پست جدید" onclick="go('new')">${icon('new')}</button></div>
    <div class="reels-stream" id="reelsStream" tabindex="0" aria-label="برای روایت بعدی به بالا بکشید">${list.length ? list.map(postCard).join('') : '<div class="reel-empty">هنوز روایتی در این بخش نداریم.<button class="btn" onclick="go(\'new\')">اولین روایت را بساز</button></div>'}</div>
    <div class="reels-position"><span id="reelsPosition">${list.length ? '۱' : '۰'}</span><span> / ${faNumber(list.length)}</span></div>
  </section><aside class="reels-info"><span class="eyebrow">روایت‌های اخوت</span><h1>پست‌های گروه</h1><p>روایت‌ها، گزارش حلقه‌ها و فعالیت کارگروه‌ها</p><div class="reels-tips"><span>${icon('heart')} با یک واکنش، همراه رفیقت باش</span><span>${icon('comment')} گفت‌وگو را از کامنت‌ها ادامه بده</span><span>${icon('star')} روایت خوب را به مربی پیشنهاد کن</span></div><div class="reels-navigation"><button class="iconbtn" onclick="stepReel(-1)" aria-label="روایت قبلی">↑</button><button class="iconbtn" onclick="stepReel(1)" aria-label="روایت بعدی">↓</button><small>اسکرول یا کلیدهای بالا و پایین</small></div><div class="reels-trend-info">${trendingBadge('محمد رضایی')}<span>نشان همراهان ترند و پرطرفدار</span></div><small>اطلاعات نمونه · تعامل‌ها در همین مرورگر ذخیره می‌شوند.</small><a class="reels-icon-credit" href="https://icons8.com" target="_blank" rel="noopener noreferrer">نشان ستاره از Icons8</a></aside></div>`;
}

function reelMedia(post) {
  if (post.video) return `<video class="reel-media" src="${esc(post.video)}" playsinline muted loop preload="metadata" aria-label="${esc(post.title)}"></video>`;
  if (post.image) return `<img class="reel-media" src="${esc(post.image)}" alt="${esc(post.title)}">`;
  if (post.media) return '<img class="reel-media reel-illustration" src="assets/reel-reading.svg" alt="تصویرسازی کتاب و فنجان چای کنار پنجره">';
  return `<div class="reel-text-cover ${post.type === 'رشد فردی' ? 'growth-cover' : ''}"><span class="reel-cover-mark">${icon(post.type === 'رشد فردی' ? 'growth' : 'users')}</span><span class="reel-cover-kicker">${esc(post.type === 'رشد فردی' ? 'یک قدم رو به رشد' : 'با هم، برای اخوت')}</span><h2>${animatedText(post.title)}</h2><p>${animatedText(post.text)}</p><span class="reel-cover-brand">اخوت · کنار هم، رو به رشد</span></div>`;
}

function postCard(post) {
  const id = esc(post.id), liked = likedByMe(post.id), following = !!state.following[post.name];
  return `<article class="reel" id="post-${id}" data-post-id="${id}" aria-label="${esc(post.title)}">
    <div class="reel-visual" ondblclick="likeReel('${id}',true)">${reelMedia(post)}<span class="reel-double-heart" aria-hidden="true">${icon('heart')}</span></div>
    ${post.video ? `<button class="reel-play" onclick="toggleReelVideo(this)" aria-label="پخش یا توقف ویدیو" aria-pressed="false">${icon('play')}</button><button class="reel-sound" onclick="toggleReelSound(this)" aria-label="روشن کردن صدای ویدیو" aria-pressed="false">${icon('muted')}</button>` : ''}
    <div class="reel-gradient"></div>
    <div class="reel-actions"><button class="reel-action ${liked ? 'is-liked' : ''}" data-action="like" aria-label="پسندیدن" aria-pressed="${liked}" onclick="likeReel('${id}')">${icon('heart')}<span data-count="likes">${faNumber(reactionCount(post))}</span></button>
      <button class="reel-action" onclick="commentPost('${id}')" aria-label="دیدن کامنت‌ها">${icon('comment')}<span data-count="comments">${faNumber(commentCount(post.id))}</span></button>
      <button class="reel-action" onclick="sharePost('${id}')" aria-label="اشتراک‌گذاری">${icon('share')}<span>اشتراک</span></button>
      <button class="reel-action ${state.bookmarks[post.id] ? 'is-saved' : ''}" data-action="bookmark" onclick="toggleBookmark('${id}')" aria-label="ذخیرهٔ پست" aria-pressed="${!!state.bookmarks[post.id]}">${icon('bookmark')}<span>ذخیره</span></button>
      <button class="reel-action ${state.recommended[post.id] ? 'is-recommended' : ''}" data-action="recommend" onclick="recommendPost('${id}')" aria-label="پیشنهاد به مربی" aria-pressed="${!!state.recommended[post.id]}">${icon('star')}<span>برای مربی</span></button></div>
    <div class="reel-caption"><span class="reel-category">${esc(post.type)}${post.id.startsWith('demo') ? ' · نمونه' : ''}</span><div class="reel-author">${post.name === currentUserName() ? selfAvatar() : avatar(post.name)}<button class="reel-author-name" onclick="authorProfile('${id}')">${esc(post.name)}${trendingBadge(post.name)}</button>${post.name !== currentUserName() ? `<button class="reel-follow ${following ? 'following' : ''}" data-follow="${esc(post.name)}" onclick="toggleFollow('${id}')" aria-pressed="${following}">${following ? 'دنبال می‌کنی' : 'دنبال کردن'}</button>` : ''}</div>
      <div class="reel-description"><h2>${animatedText(post.title)}</h2><p>${animatedText(post.text)}</p>${post.location ? `<span class="reel-location">${icon('calendar')} ${esc(post.location)}</span>` : ''}${post.people?.length ? `<div class="reel-attendees">${post.people.map(name => `<span>${avatar(name)}${esc(name)}</span>`).join('')}</div>` : ''}${post.file ? `<a class="reel-attachment" download="${esc(post.fileName)}" href="${esc(post.file)}">${icon('file')} ${esc(post.fileName)}</a>` : ''}</div><button class="reel-more" aria-expanded="false" onclick="toggleReelCaption(this)">بیشتر</button></div>
  </article>`;
}

function initReels() {
  reelObserver?.disconnect();
  if (state.page !== 'reels') return;
  const stream = $('#reelsStream');
  if (!stream) return;
  const reels = Array.from(stream.querySelectorAll('.reel'));
  const activate = reel => {
    if (!reel) return;
    if ($('#reelsPosition')) $('#reelsPosition').textContent = faNumber(reels.indexOf(reel) + 1);
    stream.querySelectorAll('video').forEach(video => {
      if (reel.contains(video) && !motionPreference.matches && !$('#modal').open && !video.dataset.manualPause) video.play().catch(() => {});
      else video.pause();
    });
  };
  if ('IntersectionObserver' in window) {
    reelObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target); });
    }, { root: stream, threshold: 0.65 });
    reels.forEach(reel => reelObserver.observe(reel));
  }
  stream.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || event.target !== stream) return;
    event.preventDefault(); stepReel(event.key === 'ArrowDown' ? 1 : -1);
  });
  const sharedId = location.hash.slice(1);
  const shared = reels.find(reel => 'post-' + encodeURIComponent(reel.dataset.postId) === sharedId);
  if (shared) stream.scrollTop = shared.offsetTop;
  activate(shared || reels[0]);
}
function stepReel(direction) {
  const stream = $('#reelsStream');
  stream?.scrollBy({ top: direction * stream.clientHeight, behavior: motionPreference.matches ? 'instant' : 'smooth' });
}
function toggleReelCaption(button) {
  const expanded = button.previousElementSibling.classList.toggle('expanded');
  button.setAttribute('aria-expanded', String(expanded));
  button.textContent = expanded ? 'کمتر' : 'بیشتر';
}
function animateReaction(element, className = 'reaction-pop') {
  if (!element || motionPreference.matches) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
}
function persistSocial() {
  ['liked', 'comments', 'bookmarks', 'following', 'recommended'].forEach(key => save(key, state[key]));
}
function ringOf(userId = currentUserId()) {

  return (saved('memberRings') || {})[userId] || '';
}
function ballot(id) {
  return (state.ringLikes[id] || {})[currentUserId()];
}
function likedByMe(id) {
  return !!ballot(id) || (currentUserId() === 'demo-1024' && !!state.liked[id] && !state.ringLikes[id]);
}
function reactionCount(post) {
  return (post.likes || 0) + (state.ringLikes[post.id] ? Object.keys(state.ringLikes[post.id]).length : Number(!!state.liked[post.id]));
}
function ringStandings() {
  const averages = saved('ringAverages') || {}, grades = saved('ringGrades') || {};
  const rows = new Map();
  function row(ring) {
    if (!rows.has(ring)) rows.set(ring,{ring,score:0,external:0});
    return rows.get(ring);
  }
  for (const [ring,avg] of Object.entries(averages)) row(ring).score += 2 * avg;
  for (const [ring,grade] of Object.entries(grades)) row(ring).score += 2 * grade;
  for (const report of state.growth) {
    const ring = report.ring || (report.userId && ringOf(report.userId));
    if (ring) row(ring).score += Number(report.sport || 0) + Number(report.reading || 0);
  }
  for (const post of state.posts) {
    const ring = post.ring || (post.authorId && ringOf(post.authorId));
    if (!ring) continue;
    const entry = row(ring);
    entry.score++;
    if (post.type !== 'حلقه') continue;
    for (const [user,vote] of Object.entries(state.ringLikes[post.id] || {})) {
      const voterRing = vote.ring || ringOf(user);
      if (user !== post.authorId && voterRing && voterRing !== ring) { entry.score++; entry.external++; }
    }
  }
  const sorted = [...rows.values()].sort((a,b)=>b.score-a.score || a.ring.localeCompare(b.ring,'fa'));
  sorted.forEach((item,i)=>{item.rank = i && sorted[i-1].score === item.score ? sorted[i-1].rank : i+1;});
  return sorted;
}
function rankingPart(key) {
  const rows = ringStandings(), mine = rows.find(r=>r.ring === ringOf());
  if (key==='leaders') return rows.slice(0,3).map(r=>`<div class="rank"><span class="num">${faNumber(r.rank)}</span>${avatar(r.ring)}<span>حلقهٔ ${esc(r.ring)}</span><b>${faNumber(r.score)}</b></div>`).join('') || '<p class="helper">هنوز امتیازی ثبت نشده است.</p>';
  return mine ? faNumber(mine[key]) : '—';
}
function coachRings() {
  return [...new Set([...coachRoster().map(p=>p.ring),...Object.values(saved('memberRings')||{}),...Object.keys(saved('ringGrades')||{}),...Object.keys(saved('ringAverages')||{}),...allPosts().map(p=>p.ring)].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fa'));
}
function gradeTargets(kind) { return kind==='ring'?coachRings():[...new Set(coachRoster().map(p=>p.group).filter(Boolean))]; }
function gradeStore(kind) { return kind==='ring'?'ringGrades':'groupGrades'; }
function optionsFor(pairs) {
  return pairs.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
}
function coachGradeCard(kind) {
  const label=kind==='ring'?'حلقه':'کارگروه';
  return `<form class="card" onsubmit="saveCoachGrade(event,'${kind}')"><h2>امتیاز ${label}</h2><label class="field">انتخاب ${label}<select required name="target" onchange="this.form.elements.grade.value=(saved(gradeStore('${kind}'))||{})[this.value]??''"><option value="">انتخاب کنید</option>${optionsFor(gradeTargets(kind).map(n=>[n,n]))}</select></label><label class="field">امتیاز مربی<input required name="grade" type="number" step="any" min="0" inputmode="decimal"></label><button class="btn">ثبت امتیاز ${label}</button></form>`;
}
function saveCoachGrade(e,kind){
  e.preventDefault(); const f=e.target.elements;
  return updateServer(()=>okApi.write('grades/'+kind,'PUT',{target:f.target.value,score:Number(f.grade.value)}),()=>toast('امتیاز ذخیره شد'));
}
function coachProfile() {
  return `<section class="coach-panel"><h1>${esc(currentUserName())}</h1>${coachGradeCard('group')}${coachGradeCard('ring')}</section>`;
}
const audienceNames={all:'همهٔ اعضا',group:'اعضای کارگروه',ring:'اعضای حلقه',person:'یک فرد'};
function messageChoices(scope) {
  if(scope==='person') return coachRoster().map(p=>[p.id,p.name]);
  return (scope==='group'?gradeTargets('group'):scope==='ring'?coachRings():[]).map(n=>[n,n]);
}
function updateMessageTarget(form) {
  const scope=form.elements.scope.value, select=form.elements.target;
  select.disabled=scope==='all';select.parentElement.hidden=select.disabled;
  select.innerHTML='<option value="">انتخاب گیرنده</option>'+optionsFor(messageChoices(scope));
}
function growthMessagePanel() {
  const archive=(saved('growthMessages')||[]).filter(m=>m.sender===currentUserId());
  return `<section class="card"><h2>پیام رشد فردی</h2><form onsubmit="submitGrowthMessage(event)"><label class="field">مخاطب<select name="scope" onchange="updateMessageTarget(this.form)">${optionsFor(Object.entries(audienceNames))}</select></label><label hidden>گیرنده<select name="target" disabled required></select></label><label class="field">متن پیام<textarea name="message" required maxlength="4000" rows="3"></textarea></label><button class="btn">ارسال پیام</button></form><h3 style="margin-top:24px">آرشیو پیام‌ها</h3>${archive.map(m=>`<article class="coach-record"><strong>${esc(m.label)}</strong> · <small>${new Date(m.date).toLocaleString('fa-IR')}</small><p style="white-space:pre-wrap">${esc(m.text)}</p></article>`).join('')||'<p class="helper">هنوز پیامی ارسال نکرده‌ای.</p>'}</section>`;
}
function submitGrowthMessage(e){
  e.preventDefault();const f=e.target.elements;
  return updateServer(()=>okApi.write('messages','POST',{scope:f.scope.value,target:f.target.value,text:f.message.value}),()=>{render();toast('پیام ارسال شد');});
}
function likeReel(id,force=false){return updateServer(()=>okApi.write('posts/'+id+'/votes/like','PUT',{active:force||!likedByMe(id)}));}
function toggleBookmark(id){return updateServer(()=>okApi.write('posts/'+id+'/votes/bookmark','PUT',{active:!state.bookmarks[id]}));}
function recommendPost(id){return updateServer(()=>okApi.write('posts/'+id+'/votes/recommend','PUT',{active:!(saved('nominations')?.[id]||[]).includes(currentUserId())}));}
function toggleFollow(id){
  const post=postById(id);if(!post)return;
  return updateServer(()=>okApi.write('follows/'+encodeURIComponent(post.authorId),'PUT',{active:!state.following[post.name]}),()=>{closeModal();render();});
}
function authorProfile(id) {
  const post = postById(id); if (!post) return;
  const profile = communityProfiles[post.name];
  modal(`<div class="author-profile">${avatar(post.name)}<h2>${esc(post.name)}${trendingBadge(post.name)}</h2><p class="helper">${faNumber(saved('followerCounts')?.[post.authorId]||0)} دنبال‌کننده</p>${post.name !== currentUserName() ? `<button class="btn" data-follow="${esc(post.name)}" aria-pressed="${!!state.following[post.name]}" onclick="toggleFollow('${esc(id)}')">${state.following[post.name] ? 'دنبال می‌کنی' : 'دنبال کردن'}</button>` : ''}</div>`);
}
function toggleReelVideo(button) {
  const video = button.closest('.reel').querySelector('video');
  if (video.paused) { delete video.dataset.manualPause; video.play().then(() => button.setAttribute('aria-pressed', 'true')).catch(() => toast('ویدیو قابل پخش نیست')); }
  else { video.dataset.manualPause = '1'; video.pause(); button.setAttribute('aria-pressed', 'false'); }
}
function toggleReelSound(button) {
  const video = button.closest('.reel').querySelector('video'); video.muted = !video.muted;
  button.innerHTML = icon(video.muted ? 'muted' : 'sound');
  button.setAttribute('aria-label', video.muted ? 'روشن کردن صدای ویدیو' : 'بی‌صدا کردن ویدیو');
  button.setAttribute('aria-pressed', String(!video.muted));
}

function commentPost(id) {
  if (!postById(id)) return;
  activeCommentPost = id; replyToComment = null;
  modal(`<div class="comments-sheet"><header class="comments-sheet-header"><span class="sheet-handle" aria-hidden="true"></span><h2 id="commentsTitle">دیدگاه‌ها <span id="commentTotal">${faNumber(commentCount(id))}</span></h2><button onclick="closeModal()" aria-label="بستن کامنت‌ها">×</button></header><div class="comments-list" id="commentsList" role="region" aria-label="دیدگاه‌ها" tabindex="0">${commentRows(id)}</div><div class="comment-composer"><div class="emoji-quickbar" aria-label="واکنش‌های سریع">${quickEmojis.map(emoji => `<button type="button" onclick="insertCommentEmoji('${emoji}',this)" aria-label="افزودن ${emoji}">${emoji}</button>`).join('')}</div><div id="replyContext" class="reply-context hidden"></div><form onsubmit="event.preventDefault();addComment('${esc(id)}',this)"><label class="comment-self-avatar">${selfAvatar()}</label><label class="sr-only" for="commentInput">دیدگاه خودت را بنویس</label><textarea id="commentInput" name="comment" rows="1" maxlength="2000" required placeholder="دیدگاهت را بنویس…" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"></textarea><button class="comment-send" aria-label="ارسال دیدگاه">${icon('share')}</button></form><small class="comments-local-note">دیدگاه‌ها در نسخهٔ آزمایشی در همین مرورگر ثبت می‌شوند.</small></div></div>`);
  $('#modal').className = 'comments-modal'; $('#modal').setAttribute('aria-labelledby', 'commentsTitle');
  document.body.classList.add('comments-open');
  const header = $('.comments-sheet-header'); let startY = null;
  header.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    startY = event.clientY; header.setPointerCapture(event.pointerId);
  });
  header.addEventListener('pointerup', event => { if (startY !== null && event.clientY - startY > 80) closeModal(); startY = null; });
}
function commentRow(comment, parentId = null) {
  return `<article id="comment-${esc(comment.id)}" class="comment-row ${parentId ? 'comment-reply' : ''}">${comment.name === currentUserName() ? selfAvatar() : avatar(comment.name)}<div class="comment-body"><div class="comment-byline"><b>${esc(comment.name)}${trendingBadge(comment.name)}</b><small>${comment.sample ? 'این هفته · نمونه' : 'همین حالا'}</small></div><p>${animatedText(comment.text)}</p><button class="comment-reply-button" onclick="startCommentReply('${esc(parentId || comment.id)}')">پاسخ دادن</button></div><button class="comment-like ${comment.liked ? 'is-liked' : ''}" aria-label="پسندیدن دیدگاه" aria-pressed="${!!comment.liked}" onclick="likeComment('${esc(comment.id)}',this)">${icon('heart')}<span>${faNumber((comment.likes || 0) + Number(!!comment.liked))}</span></button></article>`;
}
function commentRows(id) {
  const rows = postComments(id);
  return rows.length ? rows.map(comment => `<div class="comment-thread">${commentRow(comment)}${comment.replies?.length ? `<button class="view-replies" aria-expanded="false" onclick="toggleCommentReplies(this)">— مشاهدهٔ ${faNumber(comment.replies.length)} پاسخ</button><div class="comment-replies hidden">${comment.replies.map(reply => commentRow(reply, comment.id)).join('')}</div>` : ''}</div>`).join('') : '<div class="comments-empty">هنوز دیدگاهی نیست.<br><span>گفت‌وگو را تو شروع کن ✨</span></div>';
}
function toggleCommentReplies(button) {
  const hidden = button.nextElementSibling.classList.toggle('hidden');
  button.setAttribute('aria-expanded', String(!hidden));
  button.textContent = hidden ? '— مشاهدهٔ پاسخ‌ها' : '— پنهان کردن پاسخ‌ها';
}
function startCommentReply(id) {
  const comment = postComments(activeCommentPost).find(item => item.id === id); if (!comment) return;
  replyToComment = id;
  $('#replyContext').innerHTML = `<span>پاسخ به ${esc(comment.name)}</span><button type="button" onclick="cancelCommentReply()" aria-label="لغو پاسخ">×</button>`;
  $('#replyContext').classList.remove('hidden'); $('#commentInput').focus();
}
function cancelCommentReply() { replyToComment = null; $('#replyContext')?.classList.add('hidden'); }
function insertCommentEmoji(emoji, button) {
  const input = $('#commentInput'); if (!input) return;
  const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? start;
  input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
  input.focus(); input.setSelectionRange(start + emoji.length, start + emoji.length);
  animateReaction(button);
}
function refreshComments(id){
  $('#commentsList').innerHTML=commentRows(id);$('#commentTotal').textContent=faNumber(commentCount(id));
  const counter=document.getElementById('post-'+id)?.querySelector('[data-count=comments]');
  if(counter)counter.textContent=faNumber(commentCount(id));
}
function addComment(id,form){
  const text=form.elements.comment.value.trim();if(!text)return;
  return updateServer(()=>okApi.write('posts/'+id+'/comments','POST',{text,parent:replyToComment||null}),()=>{
    if(!$('#commentsList'))return;form.reset();cancelCommentReply();refreshComments(id);
  });
}
function likeComment(id,button){
  return updateServer(()=>okApi.write('comments/'+id+'/like','PUT',{active:button.getAttribute('aria-pressed')!=='true'}),()=>refreshComments(activeCommentPost));
}
async function sharePost(id) {
  const url = location.origin + '/posts/' + '#post-' + encodeURIComponent(id);
  try {
    if (navigator.share) await navigator.share({ title: postById(id)?.title || 'روایت‌های اخوت', url });
    else { await navigator.clipboard.writeText(url); toast('پیوند پست کپی شد'); }
  } catch (error) { if (error.name !== 'AbortError') toast('کپی پیوند انجام نشد؛ دوباره امتحان کن'); }
}

function attendees(){return `<span class="label">چه کسانی همراه بودند؟</span><div class="checks">${members.map(n=>`<label class="check"><input type="checkbox" name="people" value="${n}">${avatar(n)}${n}</label>`).join('')}</div>`}
function newPost(){let special=hasRole('leader')||hasRole('manager');return `${title('یک روایت تازه','اتفاق‌های خوب، با به اشتراک گذاشتن بیشتر می‌شوند.')}${previewRole()}<div class="form-shell"><form class="card" id="postForm" onsubmit="publishPost(event)"><div class="posthead">${avatar(currentUserName())}<div><b>${esc(currentUserName())}</b><small>انتشار برای همهٔ اعضای اخوت</small></div></div>${special?`<label class="field"><span>نوع روایت</span><select id="postType" onchange="$('#specialFields').classList.toggle('hidden',this.value==='شخصی')"><option value="${hasRole('leader')?'حلقه':'کارگروه'}">${hasRole('leader')?'برنامهٔ حلقه':'ثبت جلسهٔ کارگروه'}</option>${hasRole('leader')&&hasRole('manager')?'<option value="کارگروه">ثبت جلسهٔ کارگروه</option>':''}<option>شخصی</option></select></label>`:''}<label class="field"><span>عنوان ${special?'برنامه یا جلسه':'روایت'}</span><input name="title" required placeholder="این روایت دربارهٔ چیست؟"></label><label class="field"><span>${hasRole('manager')?'شرح جلسه و مصوبات':'متن روایت'}</span><textarea name="text" required placeholder="از اتفاق امروز بگو... می‌توانی #هشتگ هم اضافه کنی."></textarea></label>${special?`<div id="specialFields"><div class="row"><label class="field"><span>محل برگزاری</span><input name="location" placeholder="مثلاً کتابخانهٔ محله"></label><label class="field"><span>زمان برگزاری</span><input type="datetime-local" name="when"></label></div>${attendees()}</div>`:''}${uploadField('attachment','عکس، ویدیو یا فایل روایت')}<button class="btn full">انتشار روایت ${icon('arrow')}</button><p class="helper">انتشار در این نسخه فقط در همین مرورگر ذخیره می‌شود.</p></form></div>`}
const readFile=f=>new Promise((res,rej)=>{if(!f||!f.size)return res(null);const r=new FileReader;r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
async function publishPost(e){
  e.preventDefault(); const f=e.target, d=new FormData(f), file=d.get('attachment');
  const button=f.querySelector('[type=submit]') || f.querySelector('button.btn.full');
  if(button?.disabled)return;if(button)button.disabled=true;
  try{
    const media=await okApi.upload(file,'post');
    await okApi.write('posts','POST',{title:d.get('title'),text:d.get('text')||'',attachment:media?.url||'',medium:media?.medium||'file',fileName:file?.name||''});
    state.filter='همه';feedTab='all';go('posts');toast('پست منتشر شد');
  }catch(error){toast(error.message);}finally{if(button)button.disabled=false;}
}
function attendanceProfile(){
  const data=okApi.attendance;
  const heading='<section class="card"><h2>درصد حضور</h2>';
  const messages={missing_column:'ستون درصد حضور در شیت پذیرش پیدا نشد.',unknown_code:'کد گروهی تو در شیت پذیرش پیدا نشد یا تکراری است.',unavailable:'دریافت درصد حضور از شیت پذیرش ممکن نشد.'};
  if(data?.status!=='ok')return heading+'<p>'+ (messages[data?.status]||'در ورود بعدی، حضور از شیت پذیرش خوانده می‌شود.')+'</p></section>';
  const mark=n=>n===null?'ثبت نشده':faNumber(n)+'٪';
  const peers=data.peers.map(p=>'<li>'+esc(p.name)+' · '+mark(p.percent)+'</li>').join('');
  return heading+'<p>حضور من <strong>'+mark(data.percent)+'</strong></p><h3>هم‌حلقه‌ای‌ها'+(data.ring?' · '+esc(data.ring):'')+'</h3>'+
    (peers?'<ul>'+peers+'</ul>':'<p>'+(data.ring?'عضو دیگری در این حلقه پیدا نشد.':'نام حلقه در شیت مشخص نیست.')+'</p>')+
    '<small>آخرین بررسی: '+new Date(data.checked).toLocaleString('fa-IR',{timeZone:'Asia/Tehran'})+'</small></section>';
}
function settings(){
 const memberId = currentUserId();
 const ownPosts = state.posts.filter(post => post.authorId === memberId).length;
 const ownReports = state.growth.filter(report => report.userId === memberId).length;
 const stats = [
   ['پست', ownPosts],
   ['دنبال‌کننده', saved('followerCounts')?.[memberId] || 0],
   ['دنبال‌شونده', Object.values(state.following || {}).filter(Boolean).length],
   ['گزارش رشد', ownReports]
 ];
 return `<div class="profile-page">
   <div class="profile-page-heading"><h1>پروفایل من</h1>
     <button class="iconbtn profile-logout" onclick="memberShell.logout()" aria-label="خروج از حساب" title="خروج از حساب">${icon('logout')}</button>
   </div>
   <section class="card profile-overview">
     <div class="profile-identity">${profileAvatar()}<div><h2>${esc(currentUserName())}</h2><p>کد گروهی <b dir="ltr">${esc(currentGroupCode())}</b></p></div></div>
     <dl class="profile-stat-grid">${stats.map(([label, count]) => `<div class="profile-stat"><dt>${label}</dt><dd>${faNumber(count)}</dd></div>`).join('')}</dl>
   </section>
   <div class="profile-sections">${attendanceProfile()}<section class="card profile-status"><div class="accordion">${personalStatusPanel()}</div></section>${coachPanel()}</div>
 </div>`;
}
function managerTools(){return `<div class="manager-controls"><button class="btn soft" onclick="editCard()">${icon('new')} محتوای خانه</button><button class="btn soft" onclick="formBuilder()">${icon('file')} ایجاد فرم</button><button class="btn light" onclick="formsResults()">پاسخ فرم‌ها</button>${['تربیت بدنی','علوم اسلامی','آموزش'].includes(state.group)?'<button class="btn light" onclick="reports()">گزارش رشد اعضا</button>':''}</div>`}
function changePassword(e){e.preventDefault();if(e.target.newpass.value!==e.target.repeat.value)return toast('رمز جدید و تکرارش باید یکسان باشند');if(isCoach()) return coachChangePassword(e.target);toast('فرم معتبر است؛ تغییر واقعی رمز به اتصال دیتابیس نیاز دارد')}
function avatarDialog(){modal(`<h2>تصویر پروفایل من</h2>${uploadField('avatar','انتخاب تصویر پروفایل','image/*')}`)}
async function setAvatar(input){
  if(!validateFile(input)||!input.files[0])return;
  return updateServer(async()=>{const media=await okApi.upload(input.files[0],'avatar');await okApi.write('profile/avatar','PUT',{url:media.url});},()=>{closeModal();render();});
}
function editCard(){const c=state.cards[state.group]||{};modal(`<h2>کارت ${state.group}</h2><p class="helper">محتوا در کارت کارگروهت در خانهٔ اخوت نمایش داده می‌شود.</p><form onsubmit="saveCard(event)"><label class="field"><span>عنوان کارت</span><input name="title" required value="${esc(c.title||'')}" placeholder="عنوان کوتاه و روشن"></label><label class="field"><span>توضیحات</span><textarea name="text">${esc(c.text||'')}</textarea></label>${['هدایت و برنامه‌ریزی','پذیرش','مالی','علوم اسلامی','تربیت بدنی','سازماندهی','تدارکات'].includes(state.group)?`<span class="label">انتخاب همراهان</span><div class="checks">${members.map(n=>`<label class="check"><input type="checkbox" name="people" value="${n}" ${c.people?.includes(n)?'checked':''}>${avatar(n)}${n}</label>`).join('')}</div>`:''}${state.group==='تدارکات'?'<label class="field"><span>نام برنامه</span><input name="program"></label><label class="field"><span>نوع کار</span><select name="duty"><option>جمع</option><option>پخش</option><option>شست‌وشو</option></select></label>':''}${state.group==='مالی'?'<label class="field"><span>هزینه‌های ماه (هر خط: عنوان و مبلغ به تومان)</span><textarea name="expenses" placeholder="اردوی هفتگی: ۱۵۰۰۰۰۰"></textarea></label>':''}${uploadField('attachment','عکس یا فایل کارگروه')}<button class="btn full">ذخیرهٔ محتوای کارت</button></form>`)}
async function saveCard(e){e.preventDefault();const d=new FormData(e.target),f=d.get('attachment');if(f?.size>10*1024*1024)return toast('حجم فایل بیشتر از ۱۰ مگابایت است');const c={title:d.get('title'),text:d.get('text'),people:d.getAll('people'),expenses:d.get('expenses'),program:d.get('program'),duty:d.get('duty')};if(f?.size){const data=await readFile(f);if(f.type.startsWith('image/'))c.image=data;else{c.file=data;c.fileName=f.name}}state.cards[state.group]=c;try{save('cards',state.cards)}catch{return toast('فایل برای فضای پیش‌نمایش بزرگ است')}closeModal();toast('کارت کارگروه در خانهٔ اخوت به‌روز شد')}
let draftQuestions=[];
function formBuilder(){draftQuestions=[];modal(`<span class="badge">${state.group}</span><h2 style="margin-top:12px">یک فرم تازه بساز</h2><p class="helper">فرم برای همهٔ اعضا نمایش داده می‌شود. پاسخ‌ها فقط برای مسئول سازنده قابل دریافت خواهند بود.</p><form onsubmit="createForm(event)"><label class="field"><span>عنوان فرم</span><input name="title" required placeholder="مثلاً انتخاب زمان کلاس مهارت"></label><div id="questions"></div><button type="button" class="btn light full" onclick="addQuestion()">${icon('new')} افزودن پرسش</button><button class="btn full" style="margin-top:18px">انتشار فرم برای اعضا</button></form>`);addQuestion()}
function addQuestion(){const i=draftQuestions.length?Math.max(...draftQuestions)+1:0;draftQuestions.push(i);const el=document.createElement('div');el.className='form-question';el.id='question-'+i;el.innerHTML=`<label class="field"><span>متن پرسش</span><input required name="q${i}" placeholder="پرسشت را بنویس..."></label><label class="field"><span>نوع پاسخ</span><select name="type${i}" onchange="$('#options${i}').classList.toggle('hidden',!['radio','checkbox'].includes(this.value))"><option value="text">متن کوتاه</option><option value="textarea">پاسخ بلند</option><option value="number">عدد</option><option value="radio">تک‌انتخابی</option><option value="checkbox">چندانتخابی</option><option value="date">تاریخ</option></select></label><label class="field hidden" id="options${i}"><span>گزینه‌ها (با ویرگول جدا کن)</span><input name="options${i}" placeholder="شنبه، دوشنبه، چهارشنبه"></label><label class="check"><input type="checkbox" name="required${i}" checked>پاسخ الزامی</label><button type="button" style="margin-top:12px" onclick="$('#question-${i}').remove();draftQuestions=draftQuestions.filter(v=>v!==${i})">حذف پرسش</button>`;$('#questions').append(el)}
function createForm(e){e.preventDefault();if(!draftQuestions.length)return toast('حداقل یک پرسش اضافه کن');const d=new FormData(e.target),questions=draftQuestions.map(i=>({title:d.get('q'+i),type:d.get('type'+i),required:!!d.get('required'+i),options:(d.get('options'+i)||'').split(/[,،]/).map(x=>x.trim()).filter(Boolean)}));if(questions.some(q=>['checkbox','radio'].includes(q.type)&&q.options.length<2))return toast('برای پرسش انتخابی حداقل دو گزینه وارد کن');state.forms.push({id:Date.now(),title:d.get('title'),group:state.group,owner:currentUserId(),questions});save('forms',state.forms);closeModal();toast('فرم در صفحهٔ رشد فردی منتشر شد')}
function answerForm(i){const f=state.forms[i],old=state.answers.find(a=>a.formId===f.id);modal(`<span class="badge">${esc(f.group)}</span><h2 style="margin-top:12px">${esc(f.title)}</h2><form onsubmit="submitAnswer(event,${i})" style="margin-top:20px">${f.questions.map((q,j)=>`<div class="field"><span>${j+1}. ${esc(q.title)} ${q.required?'*':''}</span>${['radio','checkbox'].includes(q.type)?q.options.map(o=>`<label class="check" style="margin-bottom:8px"><input type="${q.type}" name="a${j}" value="${esc(o)}" ${old?.values[j]?.includes(o)?'checked':''} ${q.required&&q.type==='radio'?'required':''}>${esc(o)}</label>`).join(''):q.type==='textarea'?`<textarea name="a${j}" ${q.required?'required':''}>${esc(old?.values[j]?.[0]||'')}</textarea>`:`<input type="${q.type}" name="a${j}" value="${esc(old?.values[j]?.[0]||'')}" ${q.required?'required':''}>`}</div>`).join('')}<button class="btn full">ثبت پاسخ‌ها</button><p class="helper">پاسخ‌های فرم در پست‌ها نمایش داده نمی‌شوند.</p></form>`)}
function submitAnswer(e,i){e.preventDefault();const f=state.forms[i],d=new FormData(e.target),values=f.questions.map((q,j)=>d.getAll('a'+j));if(f.questions.some((q,j)=>q.required&&!values[j].length))return toast('پرسش‌های الزامی را پاسخ بده');state.answers=state.answers.filter(a=>a.formId!==f.id);state.answers.push({formId:f.id,name:currentUserName(),code:'۱۰۲۴',date:new Date().toLocaleString('fa-IR'),values});save('answers',state.answers);closeModal();render();toast('پاسخ‌های فرم ثبت شد')}
function formsResults(){const forms=state.forms.filter(f=>f.group===state.group);modal(`<h2>پاسخ فرم‌های ${state.group}</h2><p class="helper">نمونهٔ دسترسی مسئول سازنده؛ مجوزها در نسخهٔ نهایی در سرور بررسی می‌شوند.</p>${forms.length?forms.map(f=>`<div class="form-item"><h3>${esc(f.title)}</h3><p class="helper">${state.answers.filter(a=>a.formId===f.id).length} پاسخ ثبت شده</p><button class="btn soft" onclick="exportForm(${f.id})">دانلود اکسل پاسخ‌ها</button></div>`).join(''):'<p class="empty">اولین فرم کارگروهت را بساز.</p>'}`)}
function exportForm(id){const f=state.forms.find(f=>f.id===id),rows=state.answers.filter(a=>a.formId===id).map(a=>[a.name,a.code,a.date,...a.values.map(v=>v.join('، '))]);exportExcel('پاسخ‌های '+f.title,['نام','کد گروهی','زمان ثبت',...f.questions.map(q=>q.title)],rows)}
function exportExcelXml(name,headers,rows){const xml=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));const content='<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Responses"><Table>'+[headers,...rows].map(r=>'<Row>'+r.map(v=>'<Cell><Data ss:Type="String">'+xml(v)+'</Data></Cell>').join('')+'</Row>').join('')+'</Table></Worksheet></Workbook>';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'application/vnd.ms-excel;charset=utf-8'}));a.download=name+'.xml';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('فایل سازگار با Excel دانلود شد')}
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
function exportExcel(name,headers,rows){
 const xml=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
 const sheet=`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" rightToLeft="1"/></sheetViews><sheetData>${[headers,...rows].map((r,i)=>`<row r="${i+1}">${r.map((v,j)=>`<c r="${col(j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
 const files={
 '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
 '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':'<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="پاسخ‌ها" sheetId="1" r:id="rId1"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':sheet};
 const blob=new Blob([zipFiles(files)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('فایل اکسل دانلود شد')
}
function zipFiles(files){const encoder=new TextEncoder(),chunks=[],central=[];let offset=0;const crc=data=>{let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0};const header=(size,vals)=>{let a=new Uint8Array(size),v=new DataView(a.buffer);for(const [o,n,w]of vals)w===2?v.setUint16(o,n,true):v.setUint32(o,n,true);return a};for(const [name,content]of Object.entries(files)){const n=encoder.encode(name),d=encoder.encode(content),c=crc(d);const h=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,c,4],[18,d.length,4],[22,d.length,4],[26,n.length,2]]);chunks.push(h,n,d);const ch=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,c,4],[20,d.length,4],[24,d.length,4],[28,n.length,2],[42,offset,4]]);central.push(ch,n);offset+=h.length+n.length+d.length}let cs=central.reduce((s,c)=>s+c.length,0);const end=header(22,[[0,0x06054b50,4],[8,Object.keys(files).length,2],[10,Object.keys(files).length,2],[12,cs,4],[16,offset,4]]);const all=[...chunks,...central,end],out=new Uint8Array(offset+cs+22);let pos=0;for(const c of all){out.set(c,pos);pos+=c.length}return out}

function pauseReelForModal() {
  const video = Array.from(document.querySelectorAll('.reel video')).find(item => !item.paused);
  resumeVideo = video || null;
  video?.pause();
}
$('#modal').addEventListener('close', () => {
  document.body.classList.remove('comments-open');
  $('#modal').className = '';
  $('#modal').removeAttribute('aria-labelledby');
  activeCommentPost = null; replyToComment = null;
  if (resumeVideo?.isConnected && !motionPreference.matches && !document.hidden) resumeVideo.play().catch(() => {});
  resumeVideo = null;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('.reel video').forEach(video => video.pause());
});
const WELCOME_MESSAGE = 'سلام دوست عزیز، به سامانهٔ ما خوش آمدی. اگر کمکی خواستی بهم بگو.';
let welcomeTimer = null;
let chatReturnPage = 'home';

function playWelcome() {
  clearInterval(welcomeTimer);
  const element = $('#welcome');
  if (!element || state.page !== 'home') return;
  element.textContent = WELCOME_MESSAGE;
  element.classList.remove('typewriter');
  element.style.minHeight = '';
  if (saved('welcome-v2') || motionPreference.matches) return;
  const height = element.getBoundingClientRect().height;
  if (height) element.style.minHeight = height + 'px';
  element.textContent = '';
  element.classList.add('typewriter');
  const letters = Array.from(WELCOME_MESSAGE);
  let index = 0;
  welcomeTimer = setInterval(() => {
    if (!element.isConnected) { clearInterval(welcomeTimer); return; }
    element.textContent = letters.slice(0, ++index).join('');
    if (index === letters.length) {
      clearInterval(welcomeTimer);
      element.classList.remove('typewriter');
      element.style.minHeight = '';
      save('welcome-v2', true);
    }
  }, 36);
}

function hasGroupContent(content) {
  return !!content && ['title', 'text', 'image', 'file', 'expenses', 'program'].some(key => String(content[key] || '').trim());
}
function publishedGroups() { return groups.map((name, index) => ({ name, index })).filter(group => hasGroupContent(state.cards[group.name])); }
function home() {
  const published = publishedGroups();
  return `${title('خانهٔ اخوت', 'اطلاعیه‌ها و برنامه‌های این هفته', '<span class="badge">هفتهٔ جاری</span>')}
    <section class="hero welcome-hero"><div class="hero-copy"><h1 id="welcome" aria-label="${WELCOME_MESSAGE}">${WELCOME_MESSAGE}</h1><button class="btn" onclick="go('chat')">گفت‌وگو با همراه اخوت ${icon('comment')}</button></div><div class="hero-art"><div class="orb"><span class="okhovat-logo" role="img" aria-label="لوگوی سبز اخوت"></span></div></div></section>
    <div class="columns home-columns"><section><div class="sectionhead"><h2>قرار این هفته</h2><span class="sample">اطلاعات نمونه</span></div><div class="schedule"><div class="datebox"><b>۲۸</b><small>آبان</small></div><div><span class="badge">جلسهٔ عمومی</span><h3 style="margin-top:6px">جلسهٔ هفتگی اخوت</h3><p>پنجشنبه، ساعت ۱۸:۰۰ · سالن اجتماعات</p></div><button class="iconbtn" onclick="go('settings')" aria-label="جزئیات جلسه">${icon('arrow')}</button></div>
    <div class="sectionhead"><h2>محتوای کارگروه‌ها</h2>${published.length ? `<small>${faNumber(published.length)} کارگروه</small>` : ''}</div><workgroup-cards class="cards workgroup-cards">${published.length ? published.map(group => groupCard(group.name, group.index)).join('') : '<div class="workgroup-empty"><span class="tile-icon">' + icon('file') + '</span><p>هنوز محتوایی از کارگروه‌ها منتشر نشده است.</p></div>'}</workgroup-cards></section>
    <aside class="rail"><div class="card"><div class="top"><h3>حلقه‌های پیشرو</h3>${icon('star')}</div><small>امتیازهای ثبت‌شده در این مرورگر</small><div data-ranking="leaders">${rankingPart('leaders')}</div><button class="link" onclick="go('settings')">وضعیت حلقهٔ من ←</button></div><div class="card"><div class="top"><h3>گزارش روزانه</h3><span class="tile-icon">${icon('growth')}</span></div><button class="btn soft full" onclick="go('growth')">ثبت رشد فردی ${icon('arrow')}</button></div></aside></div>`;
}
function groupCard(name, index) {
  const content = state.cards[name];
  if (!hasGroupContent(content)) return '';
  return `<article class="card workgroup-card" data-workgroup="${esc(name)}"><div class="workgroup-heading"><span class="tile-icon">${icon(groupIcons[index])}</span><h3>${esc(name)}</h3></div><div class="workgroup-content">${content.title ? `<h4>${esc(content.title)}</h4>` : ''}${content.text ? `<p>${esc(content.text)}</p>` : ''}${content.image ? `<img src="${esc(content.image)}" alt="${esc(content.title || name)}" loading="lazy">` : ''}${content.file ? `<span class="workgroup-file">${icon('file')} ${esc(content.fileName || 'فایل پیوست')}</span>` : ''}${content.expenses ? '<span class="badge">فهرست هزینه‌ها</span>' : ''}${content.program ? `<span class="badge">${esc(content.program)} · ${esc(content.duty || '')}</span>` : ''}</div><button class="cardlink" onclick="groupDetail(${index})"><span>مشاهدهٔ محتوا</span>${icon('arrow')}</button></article>`;
}
function groupDetail(index) {
  if (!state.logged) { state.pending = 'home'; login(); return; }
  const name = groups[index], content = state.cards[name];
  if (!hasGroupContent(content)) { toast('هنوز محتوایی از این کارگروه منتشر نشده است'); return; }
  modal(`<span class="tile-icon">${icon(groupIcons[index])}</span><h2 style="margin-top:15px">${esc(name)}</h2><div class="published-content">${content.title ? `<h3>${esc(content.title)}</h3>` : ''}${content.text ? `<p>${esc(content.text)}</p>` : ''}${content.image ? `<img class="inline-image" src="${esc(content.image)}" alt="${esc(content.title || name)}">` : ''}${content.file ? `<a class="btn soft" download="${esc(content.fileName)}" href="${esc(content.file)}">دریافت ${esc(content.fileName || 'فایل')}</a>` : ''}${content.expenses ? `<h3>فهرست هزینه‌ها</h3><p class="pre-wrap">${esc(content.expenses)}</p>` : ''}${content.program ? `<p>${esc(content.program)} · ${esc(content.duty || '')}</p>` : ''}${content.people?.length ? `<div class="published-members">${content.people.map(person => `<div class="rank">${avatar(person)}${esc(person)}</div>`).join('')}</div>` : ''}</div>`);
}

function profileAvatar() {
  const image = saved('avatar');
  return `<label class="profile-avatar-control" aria-label="تغییر تصویر پروفایل">${image ? `<img class="avatar big-avatar" src="${esc(image)}" alt="تصویر پروفایل من">` : avatar(currentUserName(), 'big-avatar')}<span class="avatar-camera" aria-hidden="true">${icon('camera')}</span><input class="sr-only" type="file" accept="image/*" aria-label="انتخاب تصویر پروفایل" onchange="setAvatar(this)"></label>`;
}

function canCompleteTask(id) { return hasAnyRole(['leader','manager','admin']) || (id === 'concern' && hasRole('concern')); }
function taskView(id, label, subtitle, overdue) {
  const complete = !!state.tasks[id], interactive = canCompleteTask(id);
  return `<div class="task-capsule ${complete ? 'is-complete' : ''} ${interactive ? 'task-editable' : 'task-readonly'}" data-task-id="${esc(id)}" data-subtitle="${esc(subtitle)}" data-overdue="${overdue}">${interactive ? `<button class="task-toggle" aria-pressed="${complete}" aria-label="${complete ? 'برگرداندن به انجام نشده' : 'ثبت انجام'}: ${esc(label)}" onclick="toggleTask('${esc(id)}',this)"><span class="task-circle">${icon('check')}</span></button>` : '<span class="task-readonly-dot" aria-hidden="true"></span>'}<div class="task-description"><span class="task-title">${esc(label)}</span><small class="task-subtitle">${complete ? 'انجام شده' : esc(subtitle)}</small></div><span class="task-status ${overdue && !complete ? 'overdue' : ''}">${complete ? 'انجام شده' : overdue ? 'انجام نشده' : 'در جریان'}</span></div>`;
}
function toggleTask(id, button) {
  if (!canCompleteTask(id)) return;
  state.tasks[id] = !state.tasks[id]; save('tasks', state.tasks);
  const capsule = button.closest('.task-capsule'), complete = state.tasks[id];
  capsule.classList.toggle('is-complete', complete);
  button.setAttribute('aria-pressed', String(complete));
  button.setAttribute('aria-label', (complete ? 'برگرداندن به انجام نشده: ' : 'ثبت انجام: ') + capsule.querySelector('.task-title').textContent);
  capsule.querySelector('.task-subtitle').textContent = complete ? 'انجام شده' : capsule.dataset.subtitle;
  const status = capsule.querySelector('.task-status');
  status.textContent = complete ? 'انجام شده' : capsule.dataset.overdue === 'true' ? 'انجام نشده' : 'در جریان';
  status.classList.toggle('overdue', !complete && capsule.dataset.overdue === 'true');
}

function toggleReelsFilter(button) {
  const menu = $('#reelsFilterMenu'), open = menu.classList.toggle('hidden') === false;
  button.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('[aria-selected="true"]')?.focus();
}
function closeReelsFilter() {
  $('#reelsFilterMenu')?.classList.add('hidden');
  $('#reelsFilterButton')?.setAttribute('aria-expanded', 'false');
}
function setPostFilter(type) { state.filter = type; render(); $('#reelsFilterButton')?.focus(); }
function reelsFilter() {
  return `<div class="reels-filter"><button class="reels-filter-trigger" id="reelsFilterButton" aria-haspopup="listbox" aria-expanded="false" aria-controls="reelsFilterMenu" onclick="toggleReelsFilter(this)"><span>${esc(state.filter)}</span><img src="assets/chevron-down.png" alt=""></button><div class="reels-filter-menu hidden" id="reelsFilterMenu" role="listbox" aria-label="نوع روایت">${['همه','حلقه','کارگروه','رشد فردی','شخصی'].map(type => `<button role="option" aria-selected="${state.filter === type}" onclick="setPostFilter('${type}')"><span>${type}</span><span class="filter-selected-check">${icon('check')}</span></button>`).join('')}</div></div>`;
}

function chatPage() {
  const history = state.chatHistory;
  return `<section class="chat-page"><header class="chat-header"><button class="iconbtn" onclick="go(chatReturnPage)" aria-label="بازگشت">${icon('arrow')}</button><span class="chat-brand"><span class="okhovat-logo" role="img" aria-label="اخوت"></span></span><div><h1>همراه اخوت</h1><small>دستیار رشد و راهنمای سامانه</small></div><button class="iconbtn chat-clear" aria-label="پاک کردن گفتگو" title="پاک کردن گفتگو" onclick="clearChat()" ${history.length ? '' : 'disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg></button></header><div class="chat-service-status">${icon('help')} ${window.memberShell?.chatSession?.()?.active?'گزارش‌های ثبت‌شدهٔ سامانه':'آمار شخصی بر اساس گزارش‌های ثبت‌شده در همین مرورگر'}</div><div class="chat-messages" id="chatMessages" role="log" aria-label="پیام‌های گفتگو" aria-live="polite">${history.length ? history.map(chatMessage).join('') : '<div class="chat-empty"><span class="chat-brand"><span class="okhovat-logo" role="img" aria-label="اخوت"></span></span><h2>در کدام بخش کمکت کنم؟</h2><p>دربارهٔ گزارش روزانه، مصوبات یا فرم‌های کارگروه بپرس.</p></div>'}</div><div class="chat-suggestions">${['این هفته چند روز گزارش ثبت کردم؟','مشارکت حلقه‌مون چطور بوده؟','مصوباتم کجاست؟'].map(text => `<button onclick="sendChatText('${text}')">${text}</button>`).join('')}</div><form aria-busy="${Boolean(pendingChat)}" class="chat-composer" onsubmit="submitChat(event)"><label class="sr-only" for="chatInput">پیام به همراه اخوت</label><textarea id="chatInput" name="message" rows="1" maxlength="2000" required placeholder="پیامت را بنویس…" onkeydown="if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();this.form.requestSubmit()}"></textarea><button class="btn" ${pendingChat ? 'disabled' : ''} aria-label="ارسال پیام">${icon('share')}</button></form></section>`;
}
function chatMessage(message) {
  return `<article class="chat-message ${message.role === 'user' ? 'from-user' : 'from-guide'}">${message.role !== 'user' ? '<span class="chat-message-label">همراه اخوت</span>' : ''}<p>${esc(message.text)}</p>${message.route ? `<button class="chat-route" onclick="go('${esc(message.route)}')">${esc(message.action)} ${icon('arrow')}</button>` : ''}</article>`;
}
function guideReply(text) {
  if (/ورزش|مطالعه|مهارت|روزانه|رشد/.test(text)) return { text: 'ورزش را با واحد ساعت، مطالعه را با تعداد صفحه و گزارش مهارت را در صفحهٔ رشد فردی ثبت کن. خلاصهٔ گزارش به‌صورت خودکار در پست‌ها منتشر می‌شود. برنامهٔ ورزشی و کتاب در حال مطالعه را هم از آیکون بالای همین صفحه ثبت کن.', route: 'growth', action: 'رفتن به رشد فردی' };
  if (/مصوبه|مصوبات|مسئولیت/.test(text)) return { text: 'مصوبات مربوط به حلقه یا کارگروهت در پروفایل، بخش «مصوبات و مسئولیت‌های من» نمایش داده می‌شوند. فقط مسئول مربوطه می‌تواند انجام آن‌ها را ثبت کند. مهلت هر مصوبه یک هفته است.', route: 'settings', action: 'مشاهدهٔ مصوبات' };
  if (/فرم|کارگروه/.test(text)) return { text: 'اگر مسئول کارگروه هستی، در پروفایل، بخش «کارگروه من»، دکمهٔ ایجاد فرم را بزن. فرم منتشرشده در صفحهٔ رشد فردی نمایش داده می‌شود و پاسخ‌ها از بخش پاسخ فرم‌ها به صورت اکسل دریافت می‌شوند.', route: 'settings', action: 'رفتن به کارگروه من' };
  if (/رمز|آواتار|تصویر|پروفایل/.test(text)) return { text: 'با لمس دوربین روی آواتارت در پروفایل می‌توانی تصویر را عوض کنی. در بخش «وضعیت من» هم برنامهٔ ورزشی و کتابت را ویرایش کن.', route: 'settings', action: 'باز کردن پروفایل' };
  if (/پست|روایت|کامنت/.test(text)) return { text: 'در صفحهٔ پست‌ها نوشته‌های اعضا را می‌بینی. برای انتشار نوشتهٔ خودت، «پست جدید» را انتخاب کن.', route: 'posts', action: 'دیدن پست‌ها' };
  if (/سلام|درود/.test(text)) return { text: 'سلام! من فعلاً راهنمای داخلی اخوت هستم. دربارهٔ بخش‌های سایت و روش استفاده از آن‌ها می‌توانم راهنمایی‌ات کنم.' };
  return { text: 'می‌توانی دربارهٔ گزارش‌های رشد خودت و حلقه‌ات بپرسی یا بگویی دنبال کدام بخش سایت هستی. برای پشتیبانی هم می‌توانی با 09052893115 تماس بگیری.' };
}
function submitChat(event) { event.preventDefault(); const text = event.target.elements.message.value.trim(); if (text) sendChatText(text); }
let pendingChat;
function resetAssistantChat(){
  pendingChat?.abort();pendingChat=null;state.chatHistory=[];
}
window.resetAssistantChat=resetAssistantChat;
async function answerChat(text, signal){
  let plan=growthAssistant.intent(text);
  let data;
  const session=window.memberShell?.chatSession?.();
  const greeting = /مرسی|ممنون/.test(text)?'خواهش می‌کنم!':'سلام، خوش اومدی! من خوبم، تو چطوری؟';
  if(plan.kind==='greeting')return {text:greeting};
  if(plan.kind==='guide' && /کجا|چطور|چگونه|مصوب|پروفایل|کارگروه|فرم|رمز|پست|آواتار/.test(text))return guideReply(text);
  if(session?.server){
    const response=await fetch('/api/assistant/chat/',{method:'POST',signal,cache:'no-store',
      headers:{'Content-Type':'application/json','X-Okhovat':'1','X-Okhovat-Account':currentUserId()},body:JSON.stringify({message:text,plan})});
    if(response.status===403)return {text:'نشست ورود پایان یافته است. برای بررسی دوباره، صفحه را تازه کن.'};
    if(!response.ok)throw Error();
    data=await response.json();plan=data.plan;
  }
  if(plan.kind==='greeting')return {text:greeting};
  if(plan.kind==='guide')return guideReply(text);
  if(plan.kind==='unsupported')return {text:'می‌توانم گزارش‌های خودت یا مجموع حلقه‌ات را برای امروز، دیروز، این هفته و هفتهٔ قبل بررسی کنم.'};
  if(data?.no_ring)return {text:'هنوز حلقه‌ای برای حساب تو ثبت نشده است.'};
  if(!data && plan.scope!=='self')return {text:'در این نسخه فقط گزارش‌های همین مرورگر در دسترس است. برای آمار هم‌حلقه‌ای‌ها، اتصال به سامانهٔ اعضا لازم است.'};
  if(!data)data={results:growthAssistant.localSummary(state.growth,currentUserId(),plan.period)};
  return {text:growthAssistant.describe(data,plan)};
}
async function sendChatText(text){
  if(pendingChat || !text.trim())return;
  const controller=new AbortController();pendingChat=controller;
  const pending={role:'guide',text:'در حال بررسی…'};
  state.chatHistory.push({role:'user',text:text.trim()},pending);
  render();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{Object.assign(pending,await answerChat(text,controller.signal));}
  catch{pending.text='پاسخ دریافت نشد. دوباره تلاش کن.';}
  finally{clearTimeout(timeout);}
  if(pendingChat!==controller)return;
  pendingChat=null;
  if(state.page==='chat' && $('#chatMessages')){
    render();
    const log=$('#chatMessages');if(log)log.scrollTop=log.scrollHeight;
  }
}
function clearChat(){resetAssistantChat();render();$('#chatInput')?.focus();}

document.addEventListener('click', event => {
  if (!event.target.closest('.reels-filter')) closeReelsFilter();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#reelsFilterButton')?.getAttribute('aria-expanded') === 'true') {
    closeReelsFilter(); $('#reelsFilterButton')?.focus();
  }
  const menu = $('#reelsFilterMenu');
  if (!menu || menu.classList.contains('hidden') || !event.target.closest('#reelsFilterMenu')) return;
  const options = Array.from(menu.querySelectorAll('[role="option"]'));
  let index = options.indexOf(document.activeElement);
  if (event.key === 'ArrowDown') index = (index + 1) % options.length;
  else if (event.key === 'ArrowUp') index = (index - 1 + options.length) % options.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = options.length - 1;
  else return;
  event.preventDefault(); options[index]?.focus();
});

// Dates retain a sortable Gregorian key plus the displayed Persian calendar date.
const APP_TIME_ZONE = 'Europe/Amsterdam';
const SELF_NAME = '';
const assetIcons = { growth: 'growth', sport: 'dumbbell', book: 'reading', settings: 'profile', support: 'support', plans: 'plans', sleep: 'sleep', game: 'game', social: 'social', leisureSport: 'leisure-sport' };
let uploadSequence = 0;
const uploadPreviewUrls = new Set();
function dateParts(date, calendar, locale = 'en-CA') {
  return Object.fromEntries(new Intl.DateTimeFormat(locale, { timeZone: APP_TIME_ZONE, calendar, numberingSystem: 'latn', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).filter(part => ['year', 'month', 'day'].includes(part.type)).map(part => [part.type, part.value]));
}
function todayKey() { const p = dateParts(new Date(), 'gregory'); return `${p.year}-${p.month}-${p.day}`; }
function reportDates(day = todayKey()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('تاریخ گزارش معتبر نیست');
  const date = new Date(day + 'T12:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) throw new Error('تاریخ گزارش معتبر نیست');
  const p = dateParts(date, 'persian');
  return { day, dateGregorian: day, dateJalali: `${p.year}-${p.month}-${p.day}`, timeZone: APP_TIME_ZONE, dateLabel: new Intl.DateTimeFormat('fa-IR', { timeZone: APP_TIME_ZONE, calendar: 'persian', dateStyle: 'full' }).format(date) };
}
function displayReportDate(record) {
  try { return reportDates(record.dateGregorian || record.day).dateLabel; } catch { return record.dateJalali || record.day || '—'; }
}
function statusPlanDialog() {
  const plan = state.personalStatus;
  modal(`<h2>برنامه و مطالعهٔ من</h2><div class="plan-tabs" role="tablist" aria-label="برنامه‌های من"><button id="sportPlanTab" role="tab" aria-selected="true" aria-controls="sportPlanPanel" onclick="setPlanTab('sport')">${icon('sport')} برنامهٔ ورزشی</button><button id="bookPlanTab" role="tab" aria-selected="false" aria-controls="bookPlanPanel" onclick="setPlanTab('book')">${icon('book')} کتاب در حال مطالعه</button></div><form onsubmit="savePersonalStatus(event)"><section role="tabpanel" aria-labelledby="sportPlanTab" id="sportPlanPanel"><label class="field"><span>برنامهٔ ورزشی تو</span><textarea name="sportPlan" maxlength="2000" placeholder="مثلاً شنبه و دوشنبه، یک ساعت باشگاه">${esc(plan.sportPlan || '')}</textarea></label><p class="helper">برای مسئول تربیت بدنی نمایش داده می‌شود.</p></section><section role="tabpanel" aria-labelledby="bookPlanTab" id="bookPlanPanel" class="hidden"><label class="field"><span>نام کتاب در حال مطالعه</span><input name="currentBook" maxlength="300" value="${esc(plan.currentBook || '')}" placeholder="نام کتاب را وارد کن"></label><p class="helper">برای مسئول علوم اسلامی نمایش داده می‌شود.</p></section><button class="btn full">ذخیرهٔ وضعیت من</button></form>`);
}
function setPlanTab(tab) {
  for (const name of ['sport', 'book']) {
    const prefix = name === 'sport' ? 'sportPlan' : 'bookPlan', selected = tab === name;
    $('#' + prefix + 'Panel').classList.toggle('hidden', !selected);
    $('#' + prefix + 'Tab').setAttribute('aria-selected', String(selected));
  }
}
function savePersonalStatus(e){
  e.preventDefault();const f=new FormData(e.target);
  return updateServer(()=>okApi.write('profile/status','PUT',{sportPlan:f.get('sportPlan')||'',currentBook:f.get('currentBook')||''}),()=>{closeModal();render();toast('وضعیت ذخیره شد');});
}
function personalStatusPanel() {
  const plan = state.personalStatus;
  return `<details open class="personal-status-panel"><summary>${icon('settings')}وضعیت من</summary><div class="personal-status-item"><span class="tile-icon">${icon('sport')}</span><div><h3>برنامهٔ ورزشی</h3><p>${esc(plan.sportPlan || 'هنوز ثبت نشده')}</p></div></div><div class="personal-status-item"><span class="tile-icon">${icon('book')}</span><div><h3>کتاب در حال مطالعه</h3><p>${esc(plan.currentBook || 'هنوز ثبت نشده')}</p></div></div><button class="btn soft" onclick="statusPlanDialog()">${icon('plans')} ویرایش برنامه و کتاب</button></details>`;
}

function uploadField(name, label, accept = '', existing = null) {
  const id = 'upload-' + (++uploadSequence);
  const fileHint = accept === 'image/*' ? 'فقط تصویر' : accept.includes('.html') ? 'فایل HTML' : 'عکس، ویدیو یا فایل';
  return `<div class="file-uploader" data-upload-name="${name}" ondragover="event.preventDefault();this.classList.add('is-dragging')" ondragleave="this.classList.remove('is-dragging')" ondrop="dropUpload(event,this)"><input class="sr-only upload-input" id="${id}" name="${name}" type="file" ${accept ? `accept="${accept}"` : ''} aria-describedby="${id}-hint" onchange="onUploadChange(this)"><label class="upload-dropzone" for="${id}"><span class="upload-glyph">${icon('upload')}</span><strong>${esc(label)}</strong><span class="upload-prompt">انتخاب فایل <span>یا کشیدن و رها کردن اینجا</span></span><small id="${id}-hint">${fileHint} · حداکثر ۱۰ مگابایت</small></label><div class="upload-selection ${existing ? '' : 'hidden'}">${existing ? `<span class="selected-file-icon">${icon('file')}</span><span class="selected-file-meta"><strong>${esc(existing.name || 'مستندات قبلی')}</strong><small>پیوست ذخیره‌شده</small></span><button type="button" class="upload-remove" onclick="removeUpload(this)" aria-label="حذف فایل">×</button>` : ''}</div>${name === 'proof' ? '<input type="hidden" name="removeProof" value="false">' : ''}</div>`;
}
function validateFile(input) {
  const file = input.files?.[0]; if (!file) return true;
  const accepted = (input.accept || '').split(',').map(type => type.trim()).filter(Boolean);
  const matches = !accepted.length || accepted.some(type => type.startsWith('.') ? file.name.toLowerCase().endsWith(type.toLowerCase()) : type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
  if (file.size > 10 * 1024 * 1024 || !matches) {
    input.value = ''; toast(!matches ? 'این نوع فایل برای این بخش مجاز نیست' : 'حجم فایل باید حداکثر ۱۰ مگابایت باشد'); return false;
  }
  return true;
}
function onUploadChange(input) {
  const field = input.closest('.file-uploader');
  if (!validateFile(input)) { if (field) field.querySelector('.upload-selection').classList.add('hidden'); return false; }
  if (!field || !input.files?.[0]) return true;
  if (input.name === 'avatar') { setAvatar(input); return true; }
  const file = input.files[0], preview = field.querySelector('.upload-selection');
  if (field.dataset.previewUrl) { URL.revokeObjectURL(field.dataset.previewUrl); uploadPreviewUrls.delete(field.dataset.previewUrl); }
  let media = `<span class="selected-file-icon">${icon('file')}</span>`;
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file); uploadPreviewUrls.add(url); field.dataset.previewUrl = url;
    media = `<img class="selected-file-thumb" src="${url}" alt="پیش‌نمایش فایل انتخاب‌شده">`;
  }
  const size = file.size >= 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : Math.ceil(file.size / 1024) + ' KB';
  preview.innerHTML = `${media}<span class="selected-file-meta"><strong>${esc(file.name)}</strong><small dir="ltr">${size}</small></span><button class="upload-remove" type="button" onclick="removeUpload(this)" aria-label="حذف فایل انتخاب‌شده">×</button>`;
  preview.classList.remove('hidden');
  const removed = field.querySelector('[name="removeProof"]'); if (removed) removed.value = 'false';
  return true;
}
function removeUpload(button) {
  const field = button.closest('.file-uploader'); field.querySelector('input[type="file"]').value = '';
  const removed = field.querySelector('[name="removeProof"]'); if (removed) removed.value = 'true';
  if (field.dataset.previewUrl) { URL.revokeObjectURL(field.dataset.previewUrl); uploadPreviewUrls.delete(field.dataset.previewUrl); delete field.dataset.previewUrl; }
  field.querySelector('.upload-selection').innerHTML = ''; field.querySelector('.upload-selection').classList.add('hidden');
}
function dropUpload(event, field) {
  event.preventDefault(); field.classList.remove('is-dragging');
  const files = event.dataTransfer?.files; if (!files?.length) return;
  if (files.length > 1) return toast('در هر بخش فقط یک فایل انتخاب کن');
  const input = field.querySelector('input[type="file"]');
  try { input.files = files; onUploadChange(input); } catch { toast('برای انتخاب فایل روی کادر بزن'); }
}
function releaseUploadPreviews() { uploadPreviewUrls.forEach(url => URL.revokeObjectURL(url)); uploadPreviewUrls.clear(); }
const leisureOptions = [['خواب', 'sleep'], ['ورزش', 'leisureSport'], ['بازی', 'game'], ['شبکه‌های اجتماعی', 'social']];
function leisurePicker(value = '') {
  return `<div class="leisure-picker"><span class="label">اوقات فراغت</span><input type="hidden" name="leisure" id="leisureValue" value="${esc(value)}"><button type="button" class="leisure-trigger" id="leisureTrigger" aria-expanded="false" aria-controls="leisureChoices" onclick="toggleLeisure()"><span id="leisureSelected">${esc(value || 'نوع اوقات فراغت را انتخاب کن')}</span><span class="field-chevron"></span></button><div id="leisureChoices" class="leisure-choices hidden" role="group" aria-label="انتخاب اوقات فراغت">${leisureOptions.map(([text, image]) => `<button type="button" aria-pressed="${text === value}" onclick="selectLeisure('${text}',this)">${icon(image)}<span>${text}</span></button>`).join('')}</div></div>`;
}
function toggleLeisure() {
  const hidden = $('#leisureChoices').classList.toggle('hidden'); $('#leisureTrigger').setAttribute('aria-expanded', String(!hidden));
}
function selectLeisure(value) {
  if (!leisureOptions.some(([label]) => label === value)) return;
  $('#leisureValue').value = value; $('#leisureSelected').textContent = value;
  $('#leisureChoices').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.textContent.trim() === value)));
  $('#leisureChoices').classList.add('hidden'); $('#leisureTrigger').setAttribute('aria-expanded', 'false'); $('#leisureTrigger').focus();
}

function growth() {
  const dates = reportDates(), current = state.growth.find(record => (record.userId || 'demo-1024')===currentUserId() && (record.dateGregorian || record.day) === dates.day), value = key => esc(current?.[key] ?? '');
  return `${title('رشد فردی','ثبت ورزش، مطالعه، مهارت و فعالیت‌های روزانه', `<button class="iconbtn plans-button" onclick="statusPlanDialog()" aria-label="ثبت برنامهٔ ورزشی و کتاب" title="برنامه و کتاب من">${icon('plans')}</button>`)}<div class="growth-date-row"><span class="growth-date">${icon('calendar')}<time datetime="${dates.day}">${dates.dateLabel}</time></span>${current ? '<span class="badge">گزارش امروز ثبت شده</span>' : ''}</div><div class="growth-main"><form class="card daily-growth-form" onsubmit="submitGrowth(event)"><input type="hidden" name="reportDay" value="${dates.day}"><div class="top"><h2>امروزت چطور گذشت؟</h2>${icon('growth')}</div><div class="growth-grid"><div class="growth-tile">${icon('sport')}<label for="sport">ورزش</label><input id="sport" name="sport" type="number" min="0" max="24" step="0.25" value="${value('sport') || '0'}" required><small>ساعت</small></div><div class="growth-tile">${icon('book')}<label for="reading">مطالعه</label><input id="reading" name="reading" type="number" min="0" max="10000" step="1" value="${value('reading') || '0'}" required><small>صفحه</small></div></div><div class="skill"><h3>مسیر مهارت من</h3><label class="field"><span>۱. عنوان مبحث تدریس‌شده</span><input name="skillTitle" value="${value('skillTitle')}" placeholder="مثلاً آموزش مبانی تدوین"></label><label class="field"><span>۲. چه چیزی از این مبحث یاد گرفتی؟</span><textarea name="learned" placeholder="خلاصه‌ای از موضوعی که متوجه شدی…">${value('learned')}</textarea></label><label class="field"><span>۳. امروز چه کار عملی انجام دادی؟</span><textarea name="practice" placeholder="شرح فعالیت و نتیجهٔ کار…">${value('practice')}</textarea></label>${uploadField('proof', '۴. مستندات فعالیت', '', current?.proof ? { name: current.proofName } : null)}</div><label class="field"><span>مسئولیت گروهی</span><textarea name="responsibility" placeholder="فعالیت امروزت برای گروه">${value('responsibility')}</textarea></label>${leisurePicker(current?.leisure)}<label class="growth-publish-option"><input type="checkbox" name="publish" ${current?.publish === true ? 'checked' : ''}><span><strong>گزارشم در پست‌ها منتشر شود</strong><small>خلاصهٔ ورزش، مطالعه و عنوان مهارت برای اعضا نمایش داده می‌شود.</small></span></label><button class="btn full growth-submit">${icon('check')} ${current ? 'به‌روزرسانی گزارش امروز' : 'ثبت رشد امروز'}</button></form><div class="sectionhead"><h2>فرم‌های کارگروه‌ها</h2><small>پاسخ‌ها در پست‌ها منتشر نمی‌شوند</small></div>${state.forms.length ? state.forms.map((form, i) => `<div class="card" style="margin-bottom:15px"><span class="badge">${esc(form.group)}</span><h3 style="margin-top:12px">${esc(form.title)}</h3><p>${faNumber(form.questions.length)} پرسش</p><button class="btn soft" onclick="answerForm(${i})">${state.answers.some(answer => answer.formId === form.id) ? 'ویرایش پاسخ من' : 'تکمیل فرم'}</button></div>`).join('') : '<div class="card"><h3>هنوز فرم فعالی نداریم</h3><p>فرم‌هایی که مسئولان منتشر کنند، همین‌جا نمایش داده می‌شوند.</p></div>'}</div>`;
}
async function submitGrowth(event) {
  if(blocked()) {event.preventDefault();return suspensionNotice();}
  event.preventDefault(); const data = new FormData(event.target), file = data.get('proof');
  if (file?.size > 10 * 1024 * 1024) return toast('حداکثر حجم فایل ۱۰ مگابایت است');
  let dates; try { dates = reportDates(data.get('reportDay') || todayKey()); } catch (error) { return toast(error.message); }
  const sport = Number(data.get('sport')), reading = Number(data.get('reading'));
  if (!Number.isFinite(sport) || sport < 0 || sport > 24 || !Number.isInteger(reading) || reading < 0 || reading > 10000) return toast('مقدار ورزش یا مطالعه معتبر نیست');
  const leisure = String(data.get('leisure') || ''); if (leisure && !leisureOptions.some(([text]) => text === leisure)) return toast('اوقات فراغت را از گزینه‌ها انتخاب کن');
  const previous=state.growth.find(r=>r.userId===currentUserId() && r.day===dates.day);
  const button=event.target.querySelector('button[type=submit]')||event.target.querySelector('button.btn.full');
  if(button?.disabled)return;if(button)button.disabled=true;
  try{
    const media=await okApi.upload(file,'proof'), keep=data.get('removeProof')!=='true';
    const record={publish:data.get('publish')==='on',day:dates.day,dateJalali:dates.dateJalali,sport,reading,leisure,proof:media?.url||(keep?previous?.proof:'')||'',proofName:file?.name||(keep?previous?.proofName:'')||''};
    for(const key of ['skillTitle','learned','practice','responsibility'])record[key]=String(data.get(key)||'');
    await okApi.write('growth','PUT',record);render();toast('گزارش رشد ذخیره شد');
  }catch(error){toast(error.message);}finally{if(button)button.disabled=false;}
}

function reports() {
  if (!hasAnyRole(['manager','admin']) || !['تربیت بدنی','علوم اسلامی','آموزش'].includes(state.group)) return toast('گزارش اختصاصی برای مسئول کارگروه مربوطه در دسترس است');
  const field = state.group === 'تربیت بدنی' ? 'sport' : state.group === 'علوم اسلامی' ? 'reading' : 'skill';
  const label = field === 'sport' ? 'ورزش (ساعت)' : field === 'reading' ? 'مطالعه (صفحه)' : 'عنوان مبحث مهارت';
  const plan = state.personalStatus, currentStatus = field === 'sport' ? plan.sportPlan : field === 'reading' ? plan.currentBook : null;
  const rows = state.growth.map(record => [displayReportDate(record), currentUserName(), field === 'sport' ? record.sport : field === 'reading' ? record.reading : record.skillTitle]);
  modal(`<h2>گزارش ${esc(state.group)}</h2>${field !== 'skill' ? `<div class="manager-personal-status"><h3>${field === 'sport' ? 'برنامهٔ ورزشی اعضا' : 'کتاب در حال مطالعهٔ اعضا'}</h3><div class="rank">${selfAvatar()}<div><b>${esc(currentUserName())}</b><p>${esc(currentStatus || 'هنوز ثبت نشده')}</p></div></div></div>` : ''}<div class="report-scroll"><table class="reporttable"><thead><tr><th>تاریخ شمسی</th><th>عضو</th><th>${label}</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${esc(value)}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="3">هنوز گزارشی ثبت نشده.</td></tr>'}</tbody></table></div>${field === 'skill' ? state.growth.filter(record => record.skillTitle).map(record => `<details style="margin-top:15px"><summary>${esc(record.skillTitle)}</summary><p>یادگیری: ${esc(record.learned)}</p><p>کار عملی: ${esc(record.practice)}</p>${record.proof ? `<a class="btn light" download="${esc(record.proofName)}" href="${esc(record.proof)}">دریافت مستندات</a>` : ''}</details>`).join('') : ''}<button class="btn full" style="margin-top:20px" onclick="exportGrowth('${field}')">دانلود اکسل گزارش</button>`);
}
function exportGrowth(field) {
  if (!hasAnyRole(['manager','admin'])) return;
  const expected = state.group === 'تربیت بدنی' ? 'sport' : state.group === 'علوم اسلامی' ? 'reading' : state.group === 'آموزش' ? 'skill' : null;
  if (field !== expected) return;
  const skill = field === 'skill', statusHeader = field === 'sport' ? 'برنامهٔ ورزشی' : 'کتاب در حال مطالعه';
  exportExcel('گزارش رشد ' + state.group, ['تاریخ شمسی','تاریخ میلادی','عضو', ...(skill ? ['عنوان مبحث','یادگیری','کار عملی'] : [field === 'sport' ? 'ورزش (ساعت)' : 'مطالعه (صفحه)', statusHeader])], state.growth.map(record => [record.dateJalali || displayReportDate(record), record.dateGregorian || record.day, currentUserName(), ...(skill ? [record.skillTitle, record.learned, record.practice] : [record[field], field === 'sport' ? record.sportPlan : record.currentBook])]));
}

function coachMessages() { if(isCoach() || !state.logged) return []; const received=(saved('growthMessages')||[]).filter(m=>m.recipients.includes(currentUserId())).map(m=>({...m,id:m.id+'-'+currentUserId()})); return received; }
function hasUnreadCoach() { return state.logged && coachMessages().some(message => !state.coachReadIds.includes(message.id)); }
function navIcon(page) {
  if (page==='weekly') return icon('file');
  if (page==='oversight') return icon('users');
  if (page === 'settings' && state.logged && saved('avatar')) return `<img class="nav-avatar" src="${esc(saved('avatar'))}" alt="تصویر پروفایل من">`;
  return icon(page);
}
function profileButton() {
  return `<button class="header-profile-button ${hasUnreadCoach() ? 'has-unread' : ''}" onclick="go('settings')" aria-label="پروفایل من${hasUnreadCoach() ? '، پیام خوانده‌نشده از مربی' : ''}">${saved('avatar') ? `<img class="nav-avatar" src="${esc(saved('avatar'))}" alt="تصویر من">` : icon('settings')}${hasUnreadCoach() ? '<span class="profile-unread-dot" aria-hidden="true"></span>' : ''}</button>`;
}
function onlineNotifications(){
  const labels={post:'پست جدید از اعضا',like:'پسند برای پست‌های تو',comment:'دیدگاه برای پست‌های تو'};
  return title('اعلان‌ها','فعالیت تازه در سامانه')+'<section class="card">'+
    (state.notifications.map(n=>'<p>'+faNumber(n.count)+' '+esc(labels[n.type])+'</p>').join('')||
    '<p>اعلان تازه‌ای نداری.</p>')+
    (state.notifications.length?'<button class="btn" onclick="readOnlineNotices()">خواندم</button>':'')+
    '</section>'+(isCoach()?'':coachPanel());
}
function readOnlineNotices(){return updateServer(()=>okApi.write('notices/read','POST'));}
function unreadNotifications() { return state.notifications.filter(item => !item.read).reduce((total, item) => total + (item.count || 1), 0); }
function coachPanel() {
  return `<details class="coach-message-panel" ontoggle="if(this.open)markCoachRead()"><summary>${avatar('مربی گروه')}<span>پیام مربی</span>${hasUnreadCoach() ? '<span class="badge coach-unread-label">خوانده‌نشده</span>' : ''}</summary>${coachMessages().map(message => `<article class="coach-message"><p>${esc(message.text)}</p>${message.sample ? '<small>پیام نمونه</small>' : ''}</article>`).join('')}</details>`;
}
function markCoachRead() {
  if(hasUnreadCoach())updateServer(()=>okApi.write('messages/read','POST'),()=>document.querySelector('.coach-unread-label')?.remove());
}
// Prototype deltas use local snapshots. A shared server must use immutable event IDs and a per-user read cursor.
function activitySnapshot() {
  const posts = allPosts(), reactions = {};
  posts.filter(post => post.name === currentUserName()).forEach(post => {
    const comments = postComments(post.id).flatMap(comment => [comment, ...(comment.replies || [])]).filter(comment => comment.name !== currentUserName()).length;
    reactions[post.id] = { likes: post.likes || 0, comments };
  });
  return { posts: posts.filter(post => post.name !== currentUserName()).map(post => post.id), reactions };
}
function collectLoginNotifications() {
  const old = saved('activitySnapshot') || { posts: [], reactions: {} }, current = activitySnapshot(), added = [];
  for (const id of current.posts.filter(id => !old.posts.includes(id))) added.push({ id: 'new-post:' + id, type: 'post', title: 'پست جدید از ' + postById(id).name, route: 'posts', postId: id, count: 1 });
  for (const [id, value] of Object.entries(current.reactions)) {
    const before = old.reactions[id] || { likes: 0, comments: 0 }, likes = Math.max(0, value.likes - before.likes), comments = Math.max(0, value.comments - before.comments);
    if (likes || comments) added.push({ id: `reaction:${id}:${value.likes}:${value.comments}`, type: 'reaction', title: `${faNumber(likes)} لایک و ${faNumber(comments)} دیدگاه جدید روی پست تو`, route: 'posts', postId: id, count: likes + comments });
  }
  for (const message of coachMessages().filter(message => !state.coachReadIds.includes(message.id))) added.push({ id: 'coach:' + message.id, type: 'coach', title: 'پیام خوانده‌نشده از مربی', route: 'settings', count: 1 });
  const fresh = added.filter(item => !state.notifications.some(previous => previous.id === item.id));
  state.notifications.unshift(...fresh.map(item => ({ ...item, read: false, createdAt: new Date().toISOString() })));
  save('notifications', state.notifications); save('activitySnapshot', current);
  return { posts: fresh.filter(item => item.type === 'post').length, reactions: fresh.filter(item => item.type === 'reaction').reduce((total, item) => total + item.count, 0), coach: fresh.filter(item => item.type === 'coach').length };
}
function notifications() {
  modal(`<h2>تغییرات جدید</h2><p class="helper">تغییرات نسبت به آخرین ورود · نسخهٔ آزمایشی این مرورگر</p><div class="notification-list">${state.notifications.length ? state.notifications.map((item, index) => `<button class="notification-item ${item.read ? '' : 'is-unread'}" onclick="openNotification(${index})"><span class="tile-icon">${icon(item.type === 'post' ? 'posts' : item.type === 'coach' ? 'comment' : 'heart')}</span><span>${esc(item.title)}<small>${new Intl.DateTimeFormat('fa-IR', { timeZone: APP_TIME_ZONE, calendar: 'persian', dateStyle: 'medium' }).format(new Date(item.createdAt))}</small></span>${!item.read ? '<i></i>' : ''}</button>`).join('') : '<div class="empty">تغییر جدیدی ثبت نشده است.</div>'}</div>${unreadNotifications() ? '<button class="btn light full" onclick="markNotificationsRead()">خواندن همهٔ اعلان‌ها</button>' : ''}`);
}
function markNotificationsRead() { state.notifications.forEach(item => item.read = true); save('notifications', state.notifications); chrome(); notifications(); }
function openNotification(index) {
  const item = state.notifications[index]; if (!item) return;
  item.read = true; save('notifications', state.notifications); closeModal();
  feedTab = 'all'; state.filter = 'همه'; go(item.route);
  if (item.type === 'coach') { const panel = $('.coach-message-panel'); if (panel) { panel.open = true; markCoachRead(); panel.scrollIntoView({ block: 'center', behavior: motionPreference.matches ? 'instant' : 'smooth' }); } }
  else if (item.postId) { document.getElementById('post-' + item.postId)?.scrollIntoView({block:'center'}); }
}


// The coach preview uses the same browser-local records as the member preview.
const adminNav=[['home','خانه'],['posts','پست‌ها'],['weekly','گزارش هفتگی'],['settings','پروفایل']];
function siteAdmin(){return !!okApi.user?.is_admin;}
function blocked(id=currentUserId()) { return (saved('suspensions')||{})[id]>Date.now(); }
function authorKey(post) {
  if(post.authorId) return post.authorId;
  return coachRoster().find(p=>p.name===post.name)?.id;
}
function moderationPanel(id) {
  const p=postById(id); if(!siteAdmin() || !p) return;
  modal(`<h2>حذف پست</h2><p>${esc(p.title)} · ${esc(p.name)}</p><p>این پست از فید همهٔ اعضا برداشته می‌شود.</p><button class="btn" onclick="removeServerPost('${esc(id)}',this)">حذف پست</button><button class="link" onclick="closeModal()">انصراف</button>`);
}
async function removeServerPost(id,button){
  button.disabled=true;
  try{await okApi.write('admin/posts/'+encodeURIComponent(id),'DELETE');closeModal();render();toast('پست از فید برداشته شد');}
  catch(e){toast(e.message);}finally{button.disabled=false;}
}
function registrationPanel(){
  return '<section class="card"><h2>ثبت عضو جدید</h2><form onsubmit="registerMember(event)"><label class="field">نام عضو<input name="name" required maxlength="120"></label><label class="field">کد گروهی<input name="code" inputmode="numeric" required maxlength="40"></label><label class="field">رمز ورود<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><label class="field">حلقه<input name="ring" maxlength="120"></label><label class="field">کارگروه<input name="team" maxlength="120"></label><button class="btn">ثبت عضو</button><p role="status"></p></form></section>';
}
async function registerMember(e){
  e.preventDefault();
  const f=e.target, data=Object.fromEntries(new FormData(f)), button=f.querySelector('button'), msg=f.querySelector('[role=status]');
  data.code=normalizeDigits(data.code.trim());
  button.disabled=true;
  try{await okApi.request('admin/members','POST',data);f.reset();msg.textContent='عضو ثبت شد و می‌تواند وارد سامانه شود.';}
  catch(err){msg.textContent=err.message;}finally{button.disabled=false;}
}
function suspensionNotice() { toast('دسترسی این حساب تا '+new Date((saved('suspensions')||{})[currentUserId()]).toLocaleString('fa-IR')+' تعلیق شده است'); }
let reportWeekOffset=0;
function weeklyData() {
  const date=new Date(todayKey()+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+1)%7+7*reportWeekOffset);
  const start=date.toISOString().slice(0,10);
  date.setUTCDate(date.getUTCDate()+6);
  const end=date.toISOString().slice(0,10), inside=d=>d && d>=start && d<=end;
  const nights=new Map(), meetings=new Map(), programs=new Map();
  for(const row of state.growth) {
    const day=row.dateGregorian||row.day, user=row.userId||'demo-1024';
    if(!inside(day)) continue;
    if(!nights.has(user)) nights.set(user,new Set());
    nights.get(user).add(day);
  }
  const removed=new Set(saved('removedPosts')||[]);
  for(const post of state.posts) {
    if(removed.has(post.id)||!post.createdAt) continue;
    const parts=dateParts(new Date(post.createdAt),'gregory');
    if(!inside([parts.year,parts.month,parts.day].join('-'))) continue;
    const bucket=post.type==='حلقه'?programs:post.type==='کارگروه'?meetings:null;
    const name=post.type==='حلقه'?post.ring:post.group;
    if(bucket && name) bucket.set(name,(bucket.get(name)||0)+1);
  }
  const members=coachRoster().filter(p=>p.id!=='local-coach');
  const counts=members.map(p=>[p.name,nights.get(p.id)?.size||0]).sort((a,b)=>b[1]-a[1]);
  return {start,end,sections:[
    ['ثبت رشد فردی','تعداد شب',counts.filter(r=>r[1])],
    ['بدون ثبت رشد','تعداد شب',counts.filter(r=>!r[1])],
    ['جلسه‌های ثبت‌شدهٔ کارگروه‌ها','تعداد جلسه',[...meetings]],
    ['برنامه‌های ثبت‌شدهٔ حلقه‌ها','تعداد برنامه',[...programs]]
  ]};
}
function weekly() {
  if(!siteAdmin()) return home();
  const {start,end,sections}=weeklyData();
  return `<div class="coach-panel">${title('گزارش هفتگی','بر اساس ثبت‌های موجود در همین مرورگر')}<div class="manager-controls"><button class="btn soft" onclick="reportWeekOffset--;render()">هفتهٔ قبل</button><b>${reportDates(start).dateLabel} تا ${reportDates(end).dateLabel}</b><button class="btn light" ${reportWeekOffset===0?'disabled':''} onclick="reportWeekOffset++;render()">هفتهٔ بعد</button></div>${sections.map(([label,unit,rows],i)=>`<section class="card"><div class="top"><h2>${label} · ${faNumber(rows.length)}</h2><button class="btn light" onclick="exportWeek(${i})">دانلود اکسل</button></div>${rows.map(([name,n])=>`<div class="rank"><span>${esc(name)}</span><b>${unit} · ${faNumber(n)}</b></div>`).join('')||'<p class="helper">موردی در این هفته ثبت نشده است.</p>'}</section>`).join('')}</div>`;
}
function exportWeek(i) {
  if(!siteAdmin()) return;
  const {start,end,sections}=weeklyData(), [label,unit,rows]=sections[i];
  exportExcel(label+'-'+start,['نام',unit,'شروع هفته','پایان هفته'],rows.map(r=>[...r,start,end]));
}

const coachNav = [['home','خانه'],['posts','پست‌ها'],['oversight','نظرات جمعی'],['settings','پروفایل']];
const coachState = { tab:'collective', metric:'sport', by:'person', scope:'all', group:'', member:'', ring:'', team:'', meeting:'', program:'' };
const metrics = {sport:'ورزش (ساعت)',reading:'مطالعه (صفحه)',attendance:'حضور (درصد)',activity:'فعالیت (تعداد پست)'};

function isCoach(){return window.memberShell.currentRole()==='coach'}
function coachRoster() {
  if(isCoach()) return okApi.data.directory || [];
  const source=[];
  const people=new Map(source.map(p=>[p.id,{...p}]));
  function add(id,name,group='',ring='') {
    if(id && !people.has(id)) people.set(id,{id,name:name||id,group,ring});
  }


  for(const p of state.posts) add(p.authorId,p.name,p.group,p.ring);
  for(const r of state.growth) add(r.userId,r.userName,r.group,r.ring);
  return Array.from(people.values());
}
function recentDay(day) {
  const today=todayKey(), start=new Date(today+'T12:00:00Z');
  start.setUTCDate(start.getUTCDate()-6);
  return !!day && day>=start.toISOString().slice(0,10) && day<=today;
}
function coachSelect(key,label,pairs,blank='') {
  const options=(blank?[['',blank],...pairs]:pairs).map(([v,t])=>`<option value="${esc(v)}" ${coachState[key]===v?'selected':''}>${esc(t)}</option>`).join('');
  return `<label class="field"><span>${label}</span><select onchange="coachSet('${key}',this.value)">${options}</select></label>`;
}
function coachSet(key,value) {
  coachState[key]=value;
  if(key==='team') coachState.meeting='';
  if(key==='ring') coachState.program='';
  render();
}
function personReports(person) {
  return state.growth.filter(r=>(r.userId||'demo-1024')===person.id && recentDay(r.dateGregorian||r.day)).sort((a,b)=>(b.dateGregorian||b.day).localeCompare(a.dateGregorian||a.day));
}
function programSelector(type,key,choice,labels) {
  const ring=type==='حلقه', roster=coachRoster();
  const entries=allPosts().filter(p=>p.type===type);
  const owner=p=>ring?(p.ring||roster.find(x=>x.name===p.name)?.ring):(p.group||roster.find(x=>x.name===p.name)?.group);
  const names=[...new Set([...labels,...entries.map(owner)].filter(Boolean))];
  const matching=entries.filter(p=>owner(p)===coachState[key] && coachState[key]);
  const post=matching.find(p=>p.id===coachState[choice]);
  return `<section class="card">${coachSelect(key,ring?'برنامه‌های حلقه':'جلسات کارگروه',names.map(n=>[n,n]),'انتخاب کنید')}${coachState[key]?matching.length?coachSelect(choice,ring?'انتخاب برنامه':'انتخاب جلسه',matching.map(p=>[p.id,p.title]),'انتخاب کنید'):'<p class="helper">گزارشی ثبت نشده است.</p>':''}${post?feedPost(post):''}</section>`;
}
function coachIndividual() {
  const people=coachRoster(), person=people.find(p=>p.id===coachState.member);
  const reports=person?personReports(person):[];
  return `<section class="card"><label class="field">جست‌وجوی عضو<input type="search" placeholder="نام عضو" oninput="filterCoachPeople(this.value)"></label>${coachSelect('member','انتخاب عضو',people.map(p=>[p.id,p.name]),'همهٔ افراد')}<h3>رشد فردی در هفت روز اخیر</h3>${reports.map(r=>`<article class="coach-record"><strong>${esc(displayReportDate(r))}</strong><p>ورزش ${faNumber(r.sport)} ساعت · مطالعه ${faNumber(r.reading)} صفحه</p>${[['مهارت',r.skillTitle],['یادگیری',r.learned],['تمرین',r.practice],['مسئولیت',r.responsibility],['اوقات فراغت',r.leisure]].filter(x=>x[1]).map(([label,val])=>`<p>${label} · ${esc(val)}</p>`).join('')}${r.proof?`<a class="link" href="${esc(r.proof)}" download="${esc(r.proofName)}">دریافت مستند فعالیت</a>`:''}</article>`).join('')||`<p class="helper">${person?'در این بازه گزارشی ثبت نشده است.':'یک عضو انتخاب کنید.'}</p>`}</section>${programSelector('کارگروه','team','meeting',groups)}${programSelector('حلقه','ring','program',[...people.map(p=>p.ring),...Object.keys(saved('ringAverages')||{})])}`;
}
function filterCoachPeople(query) {
  const select=document.querySelector('.coach-panel select');
  const people=coachRoster().filter(p=>p.name.includes(query.trim()));
  select.innerHTML='<option value="">انتخاب عضو</option>'+people.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
}
function collectiveRows() {
  const {metric,by,scope,group}=coachState, buckets=new Map();
  for(const p of coachRoster()) {
    if(scope==='group' && p.group!==group) continue;
    const reports=personReports(p);
    let n;
    if(metric==='attendance') n=p.percent;
    else if(metric==='activity') n=state.posts.filter(post=>(post.authorId===p.id || (!post.authorId && post.name===p.name)) && recentDay(post.dateGregorian || post.createdAt?.slice(0,10))).length;
    else n=reports.reduce((sum,r)=>sum+Number(r[metric]||0),0);
    const k=by==='person'?p.id:p[by];
    if(!k || !Number.isFinite(n)) continue;
    const b=buckets.get(k)||{name:by==='person'?p.name:k,sum:0,count:0};
    b.sum+=n;b.count++;buckets.set(k,b);
  }
  const rows=Array.from(buckets.values(),b=>({name:b.name,value:metric==='attendance'?b.sum/b.count:b.sum})).sort((a,b)=>b.value-a.value || a.name.localeCompare(b.name,'fa'));
  return scope==='top'?rows.slice(0,10):scope==='bottom'?rows.slice(-10):rows;
}
function coachCollective() {
  const rows=collectiveRows(), max=Math.max(1,...rows.map(r=>r.value));
  return `<section class="card coach-controls">${coachSelect('metric','شاخص',Object.entries(metrics))}${coachSelect('by','رده‌بندی',[['person','افراد'],['ring','حلقه‌ها'],['group','کارگروه‌ها']])}${coachSelect('scope','نمایش',[['all','اعضای کل'],['group','بر اساس کارگروه'],['top','ده نفر اول'],['bottom','ده نفر آخر']])}${coachState.scope==='group'?coachSelect('group','کارگروه',groups.map(g=>[g,g]),'انتخاب کارگروه'):''}</section><section class="card"><h2>${metrics[coachState.metric]}</h2><small>${coachState.metric==='attendance'?'آخرین درصدهای موجود در شیت · میانگین برای هر گروه':'مجموع هفت روز اخیر'}</small>${rows.length?`<div class="coach-chart" aria-hidden="true">${rows.map((r,i)=>`<div title="${esc(r.name)}"><small>${faNumber(r.value)}</small><i style="height:${Math.round(108*r.value/max)}px"></i><span>${faNumber(i+1)}</span></div>`).join('')}</div><ol class="coach-ranking">${rows.map(r=>`<li><span>${esc(r.name)}</span><b>${faNumber(r.value)}</b></li>`).join('')}</ol>`:'<p class="helper">داده‌ای برای این انتخاب در دسترس نیست.</p>'}</section>`;
}
function oversight() {
  if(!isCoach()) return home();
  return `<div class="coach-panel">${title('پنل نظارتی','گزارش‌های ثبت‌شده · هفت روز اخیر')}<div class="coach-tabs">${[['collective','نظرات جمعی'],['individual','نظرات فردی']].map(([k,label])=>`<button aria-pressed="${coachState.tab===k}" onclick="coachSet('tab','${k}')">${label}</button>`).join('')}</div>${coachState.tab==='individual'?coachIndividual():coachCollective()+growthMessagePanel()}</div>`;
}

function currentUserName() { return state.activeAccount?.name || SELF_NAME; }
function currentUserId() { return state.activeAccount?.id || 'demo-1024'; }
function currentGroupCode() { return state.activeAccount?.code || '1024'; }
function hasRole(role){return state.activeAccount?.roles.includes(role) || false}
function hasAnyRole(roles) { return roles.some(hasRole); }
function canManageSession(type) {
  return hasRole('admin') || (state.activeAccount ? state.activeAccount.sessions.includes(type) : type === 'general' && hasRole('resolutions'));
}
function normalizeDigits(text) {
  return String(text).replace(/[۰-۹]/g, char => String(char.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, char => String(char.charCodeAt(0) - 1632));
}
function sessionManagementPanel() {
  const types = ['general', 'concern'].filter(canManageSession);
  if (!types.length) return '';
  return `<details open><summary>${icon('calendar')}مدیریت جلسه‌ها</summary>${types.map(type => `<div class="session-management-row"><h3>${type === 'general' ? 'جلسهٔ عمومی' : 'جلسهٔ دغدغه‌مندان'}</h3><div class="manager-controls"><button class="btn soft" onclick="uploadSummary('${type}')">بارگذاری خلاصهٔ جلسه</button><button class="btn light" onclick="summaryView('${type}')">مشاهدهٔ خلاصه</button>${type === 'general' ? '<button class="btn light" onclick="resolutionPanel()">ثبت و پیگیری مصوبات</button>' : ''}</div></div>`).join('')}</details>`;
}
function sessionSummary(type) { return state.sessionSummaries[type] || (type === 'concern' ? saved('summary') : null); }
function summaryView(type = 'concern') {
  modal(`<h2>خلاصهٔ ${type === 'general' ? 'جلسهٔ عمومی' : 'جلسهٔ دغدغه‌مندان'}</h2>${sessionSummary(type) ? `<button class="btn soft full" style="margin-top:20px" onclick="showHtmlSummary('${type}')">مشاهدهٔ فایل خلاصهٔ جلسه</button>` : '<p class="helper">هنوز خلاصه‌ای بارگذاری نشده است.</p>'}${canManageSession(type) ? `<button class="link" onclick="uploadSummary('${type}')">بارگذاری فایل HTML</button>` : ''}`);
}
function showHtmlSummary(type = 'concern') {
  modal('<h2>فایل خلاصهٔ جلسه</h2><iframe id="summaryFrame" sandbox="" title="خلاصهٔ جلسه" style="width:100%;height:400px;border:1px solid var(--line);border-radius:12px;margin-top:20px"></iframe>');
  $('#summaryFrame').srcdoc = sessionSummary(type) || '';
}
function uploadSummary(type = 'concern') {
  if (!canManageSession(type)) return;
  modal(`<h2>بارگذاری خلاصهٔ ${type === 'general' ? 'جلسهٔ عمومی' : 'جلسهٔ دغدغه‌مندان'}</h2>${uploadField('summary','فایل HTML خلاصهٔ جلسه','.html,.htm')}<button class="btn full" onclick="saveSummary($('.upload-input[name=summary]'),'${type}')">ذخیرهٔ خلاصهٔ جلسه</button>`);
}
async function saveSummary(input, type = 'concern') {
  if (!canManageSession(type)) return;
  if (!input?.files?.[0]) return toast('یک فایل HTML انتخاب کن');
  if (!validateFile(input)) return;
  try { const next = { ...state.sessionSummaries, [type]: await input.files[0].text() }; save('sessionSummaries', next); state.sessionSummaries = next; }
  catch { return toast('ذخیرهٔ فایل انجام نشد؛ فایل کوچک‌تری انتخاب کن'); }
  closeModal(); toast('خلاصهٔ جلسه در این مرورگر ذخیره شد');
}
function resolutionPanel() {
  if (!hasAnyRole(['resolutions','admin'])) return;
  modal(`<h2>مصوبات جلسهٔ عمومی</h2><p class="helper">مهلت هر مصوبه یک هفته است. با ثبت انجام توسط مسئول مربوطه، وضعیت اینجا تغییر می‌کند.</p>${state.resolutions.length ? state.resolutions.map(item => `<div class="receipt"><span>${esc(item.title)}<small style="display:block">${esc(item.target)}</small></span><span class="badge">${state.tasks[item.id] ? 'انجام شده' : new Date(item.dueAt).getTime() < Date.now() ? 'انجام نشده · مهلت گذشته' : 'در جریان'}</span></div>`).join('') : '<p class="helper">هنوز مصوبهٔ جدیدی ثبت نشده است.</p>'}<form style="margin-top:20px" onsubmit="createResolution(event)"><label class="field"><span>متن مصوبه</span><textarea name="title" required maxlength="2000"></textarea></label><label class="field"><span>واحد مسئول</span><select name="target"><option>حلقهٔ سلمان</option>${groups.map(group => `<option>${esc(group)}</option>`).join('')}</select></label><button class="btn full">ثبت با مهلت یک هفته</button></form>`);
}
function createResolution(event) {
  event.preventDefault(); if (!hasAnyRole(['resolutions','admin'])) return;
  const data = new FormData(event.target), title = String(data.get('title') || '').trim(), target = String(data.get('target') || '');
  if (!title || !['حلقهٔ سلمان', ...groups].includes(target)) return;
  const now = Date.now(), item = { id: 'resolution-' + now, title, target, createdBy: currentUserId(), createdAt: new Date(now).toISOString(), dueAt: new Date(now + 7 * 86400000).toISOString() };
  const next = [...state.resolutions, item];
  try { save('resolutions', next); } catch { return toast('ذخیرهٔ مصوبه انجام نشد'); }
  state.resolutions = next; closeModal(); render(); toast('مصوبه با مهلت یک هفته ثبت شد');
}
function savedResolutionTasks() {
  return state.resolutions.map(item => {
    const overdue = new Date(item.dueAt).getTime() < Date.now();
    const due = new Intl.DateTimeFormat('fa-IR', { timeZone: APP_TIME_ZONE, dateStyle: 'medium' }).format(new Date(item.dueAt));
    return taskView(item.id, item.title, `${item.target} · مهلت ${due}`, overdue);
  }).join('');
}


const WEEK = 7 * 24 * 60 * 60 * 1000;
let expiryTimer;
let attendanceRun = 0;
let attendance = { message: 'در انتظار دریافت حضور' };

state.logged=true;
const account=okApi.user;
state.role=account.role;state.group=account.team;
state.activeAccount={id:account.code,code:account.code,name:account.name,roles:[account.role],sessions:[]};
window.applyServerState=()=>{
  for(const k of Object.keys(okApi.data))if(Object.hasOwn(state,k))state[k]=okApi.data[k];
};
let loadedPage;
window.memberView = function(page){
 if(!memberShell.authorized() && !(page==='chat' && memberShell.chatSession()?.active)) return '';
 state.page=page;releaseUploadPreviews();
 if(loadedPage!==page){
   loadedPage=page;
   if(['posts','oversight','settings','notifications'].includes(page)){
     okApi.refresh().then(()=>{if(memberShell.page()===page && !document.querySelector('#modal[open]') && !document.querySelector('#app input:focus,#app textarea:focus,#app select:focus')) render();}).catch(e=>toast(e.message));
   }
 }
 const views={posts,new:newPost,growth,settings:isCoach()?coachProfile:settings,oversight:isCoach()?oversight:null,chat:chatPage,
   notifications:onlineNotifications,
   reels:()=>title('ریلز','به‌زودی فعال می‌شود.')};
 const content=views[page]?.() || '';
 return page==='settings' && siteAdmin()?content+registrationPanel():content;
};
