// Attach data-workgroup to each published article inside <workgroup-cards>.
(() => {
  const motions = {
    'تربیت بدنی': ['translateY(30px) scale(.97)', 'translateY(-4px) scale(1.008)', 'none'],
    'مالی': ['translateY(30px) scaleX(.985)', 'none'],
    'آموزش': ['perspective(800px) rotateY(-8deg) translateY(30px)', 'none'],
    'تدارکات': ['translate(16px,30px)', 'none'],
    'هدایت و برنامه‌ریزی': ['translate(8px,30px)', 'none'],
    'پذیرش': ['translateY(30px) scale(.965)', 'none'],
    'علوم اسلامی': ['translateY(30px)', 'none'],
    'خدمات': ['translate(-7px,30px)', 'none'],
    'سازماندهی': ['scaleY(.97) translateY(30px)', 'none'],
    'فرهنگی': ['rotate(-1deg) translateY(30px)', 'none']
  };
  const ease = [0.22, 1, 0.36, 1];
  let engine;

  class WorkgroupCards extends HTMLElement {
    connectedCallback() {
      this.played = new WeakSet();
      this.running = new Map();
      this.preference = matchMedia('(prefers-reduced-motion: reduce)');
      this.onPreference = () => { if (this.preference.matches) this.stop(); };
      this.preference.addEventListener('change', this.onPreference);
      this.observer = new MutationObserver(() => this.schedule());
      this.observer.observe(this, { childList: true, subtree: true });
      const intro = document.getElementById('intro');
      if (intro) this.observer.observe(intro, { attributes: true, attributeFilter: ['hidden'] });
      this.schedule();
    }

    async schedule() {
      const cards = [...this.querySelectorAll('[data-workgroup]')].filter(el => !this.played.has(el));
      if (!cards.length) return;
      const intro = document.getElementById('intro');
      if (!this.preference.matches) {
        engine ||= import('https://esm.sh/framer-motion@12.23.12/dom?bundle')
          .then(module => module.animate).catch(() => null);
      }
      if (intro && !intro.hidden) return;
      cards.forEach(el => this.played.add(el));
      if (this.preference.matches) return;
      // Only wait for the engine briefly. Cards are readable even if the CDN is offline.
      const animate = await Promise.race([engine, new Promise(resolve => setTimeout(resolve, 80, null))]);
      if (!this.isConnected || this.preference.matches) return;
      cards.filter(el => this.contains(el)).forEach((el, i) => {
        const transform = motions[el.dataset.workgroup] || ['translateY(30px)', 'none'];
        const duration = transform.length === 3 ? 0.62 : 0.52;
        const delay = i * 0.075;
        const opts = { duration, delay, ease };
        let control;
        if (animate) {
          control = animate(el, { transform, opacity: transform.length === 3 ? [0, 1, 1] : [0, 1] }, opts);
        } else if (el.animate) {
          control = el.animate(transform.map((t, j) => ({ transform: t, opacity: j ? 1 : 0 })), {
            duration: duration * 1000, delay: delay * 1000,
            fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)'
          });
        }
        if (control) this.running.set(el, control);
      });
    }

    stop() {
      this.running.forEach((animation, card) => {
        animation.cancel();
        card.style.removeProperty('transform');
        card.style.removeProperty('opacity');
      });
      this.running.clear();
    }

    disconnectedCallback() {
      this.observer.disconnect();
      this.preference.removeEventListener('change', this.onPreference);
      this.stop();
    }
  }
  customElements.define('workgroup-cards', WorkgroupCards);
})();
