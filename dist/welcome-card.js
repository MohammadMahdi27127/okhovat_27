// Dashboard component. It renders immediately; loading Motion never blocks navigation.
(() => {
  const text = 'سلام دوست عزیز، به سامانهٔ ما خوش آمدی. اگر کمکی خواستی بهم بگو.';
  const storageKey = 'okhovat-ui-welcome-v2';
  const curve = [0.22, 1, 0.36, 1];
  let seenInTab = false;
  let motionRequest;
  let animate;

  function prepareMotion() {
    if (!motionRequest) {
      motionRequest = import('https://esm.sh/framer-motion@12.23.12/dom?bundle')
        .then(module => { animate = module.animate; })
        .catch(() => {}); // The native animation below also works offline.
    }
  }

  function firstVisit() {
    if (seenInTab) return false;
    seenInTab = true;
    try {
      if (localStorage.getItem(storageKey) === 'true') return false;
      localStorage.setItem(storageKey, 'true');
    } catch { /* Keep the in-memory visit flag when storage is unavailable. */ }
    return true;
  }

  class WelcomeCard extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<section class="hero welcome-hero" dir="rtl" aria-labelledby="welcome-title">
        <div class="hero-copy">
          <h1 id="welcome-title" aria-label="${text}" style="display:grid">
            <span aria-hidden="true" style="grid-area:1/1;visibility:hidden">${text}</span>
            <span aria-hidden="true" data-copy style="grid-area:1/1">${text}</span>
          </h1>
          <a class="btn" href="/chat/">گفت‌وگو با همراه اخوت
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4z"/></svg>
          </a>
        </div>
        <div class="hero-art"><div class="orb"><span class="okhovat-logo" role="img" aria-label="لوگوی اخوت"></span></div></div>
      </section>`;
      this.card = this.firstElementChild;
      this.copy = this.querySelector('[data-copy]');
      this.preference = matchMedia('(prefers-reduced-motion: reduce)');
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.preference.addEventListener('change', () => {
        if (this.preference.matches) this.showComplete();
      }, options);
      if (!this.preference.matches) {
        this.card.style.opacity = '0';
        prepareMotion();
      }

      const intro = document.getElementById('intro');
      if (intro && !intro.hidden) {
        // Also works if the preloader script fails and its HTML error handler hides it.
        this.observer = new MutationObserver(() => { if (intro.hidden) this.start(); });
        this.observer.observe(intro, { attributes: true, attributeFilter: ['hidden'] });
      } else this.start();
    }

    start() {
      this.observer?.disconnect();
      const type = firstVisit();
      if (this.preference.matches) return this.showComplete();
      this.card.style.opacity = '1';
      if (animate) {
        this.animation = animate(this.card, { opacity: [0, 1], y: [30, 0] },
          { duration: 0.65, ease: curve });
      } else if (this.card.animate) {
        this.animation = this.card.animate([
          { opacity: 0, transform: 'translateY(30px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
      if (!type) return;
      const letters = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter('fa', { granularity: 'grapheme' }).segment(text), part => part.segment)
        : Array.from(text.normalize('NFC'));
      this.copy.textContent = '';
      this.copy.classList.add('typewriter');
      let count = 0;
      this.timer = setInterval(() => {
        this.copy.textContent += letters[count++];
        if (count === letters.length) this.finishTyping();
      }, 36);
    }

    finishTyping() {
      clearInterval(this.timer);
      this.copy.textContent = text;
      this.copy.classList.remove('typewriter');
    }

    showComplete() {
      this.animation?.cancel();
      this.card.style.opacity = '1';
      this.card.style.transform = 'none';
      this.finishTyping();
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.controller.abort();
      clearInterval(this.timer);
      this.animation?.cancel();
    }
  }

  customElements.define('okhovat-welcome', WelcomeCard);
})();
