// FadeIn(group): each matching direct child enters once, in DOM order.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const active = new Set();
  const selector = 'fade-in > *,[data-reveal],.card,.page-title,.sectionhead,.schedule,details,.growth-tile,.feed-post,.feed-head,.feed-toolbar,.chat-header,.chat-messages,.chat-composer,.coach-record,.upload-zone,.banner';
  const duration = 0.58;
  const gap = 0.075;
  const ease = [0.22, 1, 0.36, 1];
  let motion;
  import('https://esm.sh/framer-motion@12.23.12/dom?bundle').then(module => { motion = module; }).catch(() => {});

  function track(control) {
    active.add(control);
    Promise.resolve(control.finished || control).then(()=>active.delete(control),()=>active.delete(control));
  }

  function FadeIn(elements) {
    const nodes = Array.from(elements).filter(el => !seen.has(el));
    nodes.forEach(el => seen.add(el));
    if (!nodes.length || preference.matches) return;
    if (motion?.animate && motion?.stagger) {
      track(motion.animate(nodes, { opacity:[0,1], y:[30,0] },
        { duration, ease, delay:motion.stagger(gap) }));
    } else {
      nodes.forEach((node,i) => {
        if(node.animate) track(node.animate([
          {opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}
        ],{duration:580,delay:i*75,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
      });
    }
  }

  function animateGroups(nodes) {
    const groups = new Map();
    for (const el of nodes) {
      if(!el.isConnected) continue;
      if(!groups.has(el.parentElement)) groups.set(el.parentElement,[]);
      groups.get(el.parentElement).push(el);
    }
    groups.forEach(FadeIn);
  }
  const viewport = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    const ready=entries.filter(entry=>entry.isIntersecting).map(entry=>entry.target);
    ready.forEach(el=>viewport.unobserve(el));
    animateGroups(ready);
  },{threshold:0}) : null;
  function scan(root) {
    if(!document.getElementById('intro')?.hidden && document.getElementById('intro')) return;
    const nodes=[...root.querySelectorAll(selector)].filter(el=>!seen.has(el) &&
      !el.closest('okhovat-welcome,[data-workgroup]') && !el.parentElement.closest(selector));
    if(viewport) nodes.forEach(el=>viewport.observe(el));
    else animateGroups(nodes);
  }
  const app=document.getElementById('app'), dialog=document.getElementById('modal');
  function refresh(){scan(app);if(dialog.open)scan(dialog)}
  const observer=new MutationObserver(changes=>{
    if(changes.some(c=>c.type==='attributes'||[...c.addedNodes].some(n=>n.nodeType===1))){
      refresh();
    }
    if(viewport) for(const c of changes) for(const n of c.removedNodes){
      if(n.nodeType===1 && !n.isConnected){viewport.unobserve(n);n.querySelectorAll(selector).forEach(el=>viewport.unobserve(el))}
    }
  });
  observer.observe(app,{childList:true,subtree:true});
  observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  const intro=document.getElementById('intro');
  if(intro)observer.observe(intro,{attributes:true,attributeFilter:['hidden']});
  preference.addEventListener('change',()=>{if(preference.matches){active.forEach(animation=>animation.cancel());active.clear()}});
  class FadeInGroup extends HTMLElement {
    connectedCallback(){ this.style.display='contents'; }
  }
  customElements.define('fade-in',FadeInGroup);
  window.FadeIn=FadeIn;
  refresh();
})();
