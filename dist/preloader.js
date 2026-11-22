(() => {
  const intro = document.getElementById('intro');
  const word = intro.querySelector('strong');
  const counter = intro.querySelector('output');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const start = performance.now();
  const state = { progress: 0 };
  let readyAt = null;
  let readyValue = 0;
  let frame;
  let tween;
  let finished = false;
  let failed = false;
  let lastValue = -1;

  function paint(value) {
    const percent = Math.floor(value);
    if (percent === lastValue) return;
    lastValue = percent;
    counter.value = percent + '%';
    const gray = Math.round(44 + 201 * value / 100);
    word.style.color = 'rgb(' + [gray, gray, gray].join(',') + ')';
  }

  function dismiss() {
    intro.hidden = true;
    window.dispatchEvent(new Event('okhovat-intro-dismissed'));
    document.documentElement.classList.remove('intro-active');
  }

  function finish() {
    if (finished || failed) return;
    finished = true;
    cancelAnimationFrame(frame);
    paint(100);
    document.documentElement.classList.remove('intro-active');
    if (motion.matches) return dismiss();
    if (window.gsap) {
      window.gsap.to(intro, { opacity: 0, duration: 0.38, delay: 0.09, ease: 'power2.inOut', onComplete: dismiss });
    } else if (intro.animate) {
      intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, delay: 90, fill: 'forwards' }).onfinish = dismiss;
    } else dismiss();
  }

  function tick(now) {
    if (finished || failed) return;
    if (readyAt === null) {
      state.progress = 94 * (1 - Math.exp(-(now - start) / 1050));
    } else {
      const fraction = Math.min(1, (now - readyAt) / duration());
      state.progress = readyValue + (100 - readyValue) * (1 - (1 - fraction) ** 2);
      if (fraction === 1) return finish();
    }
    paint(state.progress);
    frame = requestAnimationFrame(tick);
  }

  function duration() { return Math.max(220, 1050 - (readyAt - start)); }

  function onReady() {
    if (failed || finished || readyAt !== null || !document.getElementById('app').dataset.ready ||
        !document.getElementById('site-style').dataset.ready) return;
    readyAt = performance.now();
    readyValue = state.progress;
    if (motion.matches) return finish();
    if (window.gsap) {
      cancelAnimationFrame(frame);
      tween = window.gsap.to(state, {
        progress: 100, duration: duration() / 1000, ease: 'power2.out',
        onUpdate: () => paint(state.progress), onComplete: finish
      });
    } else {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    }
  }

  function onFailure() {
    failed = true;
    cancelAnimationFrame(frame);
    tween?.kill();
    intro.querySelector('small').textContent = 'بارگذاری انجام نشد.';
    intro.querySelector('button').hidden = false;
    word.style.color = '#eee';
  }

  window.addEventListener('app-ready', onReady);
  window.addEventListener('style-ready', onReady);
  window.addEventListener('app-error', onFailure);
  if (!motion.matches) frame = requestAnimationFrame(tick);
  if (document.documentElement.dataset.bootError) onFailure();
  else onReady();
})();
