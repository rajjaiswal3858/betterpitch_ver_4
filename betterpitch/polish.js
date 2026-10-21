// BetterPitch design layer (see polish.css and DESIGN.md). Injected into every
// HTML page by server.js. It only adds classes and CSS variables to existing
// elements; it never adds, removes or moves sections. Like content.js and
// hero.js it starts after React hydrates, and it re-runs when the page changes
// (client-side navigation, streamed or lazily rendered content).
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const scroller = () => document.getElementById('page-scroller');

  // ---- buttons and links ----
  const rgb = c => (c.match(/\d+(\.\d+)?/g) || []).map(Number);
  function classify() {
    // white cards (not the big white section panels, which hold a heading)
    document.querySelectorAll('main .rounded-2xl.bg-white').forEach(el => {
      if (el.dataset.bpCard || el.closest('#bp-hero')) return;
      el.dataset.bpCard = '1';
      if (!el.querySelector('h1, h2') && el.offsetHeight < innerHeight) el.classList.add('bp-card');
    });
    document.querySelectorAll('main button, main a, nav button, nav a, footer a').forEach(el => {
      if (el.dataset.bpDone || el.closest('#bp-hero, #artisan-chat')) return;
      el.dataset.bpDone = '1';
      const c = el.getAttribute('class') || '';
      const text = el.textContent.trim();
      if (!text) return; // icon-only buttons keep the site's own states
      if (/\bpy-3\.5\b/.test(c) && /\brounded-xl\b/.test(c)) {
        // the site's Button component: solid purple, white or outlined
        const [r, g, b, a = 1] = rgb(getComputedStyle(el).backgroundColor);
        const solid = a > .5 && r + g + b < 420; // dark brand fill
        const light = !solid && a > .5 && r > 230 && g > 230;
        el.classList.add('bp-btn', solid ? 'bp-solid' : light ? 'bp-light' : 'bp-ghost');
        el.addEventListener('pointerenter', aim);
        el.addEventListener('pointerleave', aim);
      } else if (/\bpx-3\b/.test(c) && /\bpy-1\.5\b/.test(c)) {
        el.classList.add('bp-pill'); // small "Case study" buttons
      } else if ((el.closest('nav') && /\bp-0\b/.test(c) && /rounded-none/.test(c)) || (el.closest('footer') && !el.querySelector('img, svg') && text.length < 40)) {
        el.classList.add('bp-draw');
      }
    });
  }
  // the fill starts where the pointer crossed the edge, and drains back out there
  function aim(e) {
    const r = this.getBoundingClientRect();
    this.style.setProperty('--bp-x', (e.clientX - r.left) + 'px');
    this.style.setProperty('--bp-y', (e.clientY - r.top) + 'px');
  }

  // ---- scroll reveals ----
  let io = null;
  function reveals() {
    if (reduced) return;
    const root = scroller();
    if (!io) {
      io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add('bp-in');
        // hand the element back to the site's own transitions once it has settled
        const done = () => {
          el.removeEventListener('transitionend', end);
          el.classList.remove('bp-rv', 'bp-rv-h', 'bp-in');
          el.style.removeProperty('--bp-d');
        };
        const end = e => { if (e.target === el && e.propertyName === 'translate') done(); };
        el.addEventListener('transitionend', end);
        setTimeout(done, 2500);
      }), { root, rootMargin: '0px 0px -12% 0px' });
    }
    const viewH = (root || document.documentElement).clientHeight;
    const below = el => el.getBoundingClientRect().top > viewH * .92;
    const mark = (el, cls, delay) => {
      if (el.dataset.bpRv || el.closest('#bp-hero, #artisan-chat, nav, [class*="embla"]')) return;
      el.dataset.bpRv = '1';
      if (!below(el)) return; // never hide what is already on screen
      el.classList.add(cls);
      if (delay) el.style.setProperty('--bp-d', delay + 'ms');
      io.observe(el);
    };
    // section headings rise out of their baseline; the line under them follows
    document.querySelectorAll('main h2, footer h2').forEach(h => {
      mark(h, 'bp-rv-h', 0);
      const p = h.nextElementSibling;
      if (p && p.tagName === 'P') mark(p, 'bp-rv', 140);
    });
    // groups of cards follow one another
    const groups = new Set();
    document.querySelectorAll('main .rounded-2xl').forEach(card => groups.add(card.parentElement));
    groups.forEach(g => {
      const cards = [...g.children].filter(c => /\brounded-2xl\b/.test(c.getAttribute('class') || '') && c.offsetHeight < viewH * 1.2);
      if (cards.length < 2) return;
      cards.forEach((c, i) => mark(c, 'bp-rv', Math.min(i, 5) * 70));
    });
  }

  // ---- smooth scroll (fine pointers only, never under reduced motion) ----
  let lenis = null;
  function smooth() {
    const wrapper = scroller();
    if (lenis || reduced || !finePointer || !window.Lenis || !wrapper) return;
    lenis = new window.Lenis({
      wrapper, content: wrapper, autoRaf: true, lerp: .12, anchors: true,
      __experimental__naiveDimensions: true, // the page grows as content streams in
      // menus, dropdowns and the chat panel keep their own native scrolling
      prevent: n => n !== wrapper && n.nodeType === 1 && (n.hasAttribute('data-lenis-prevent')
        || n.id === 'artisan-chat' || (/(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight)),
    });
  }

  // ---- skip link (keyboard): first tab stop, jumps past the header to the content ----
  function skipLink() {
    if (document.querySelector('.bp-skip')) return;
    const a = document.createElement('a');
    a.className = 'bp-skip';
    a.href = '#main';
    a.textContent = 'Skip to content';
    a.onclick = e => {
      e.preventDefault();
      const main = document.querySelector('main');
      if (!main) return;
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
      if (lenis) lenis.scrollTo(main, { offset: 0 }); else main.scrollIntoView();
    };
    document.body.prepend(a);
  }

  // ---- page changes ----
  let lastPath = location.pathname;
  function routeChanged() {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    const main = document.querySelector('main');
    if (main && !reduced) {
      main.classList.remove('bp-page-in');
      void main.offsetWidth;
      main.classList.add('bp-page-in');
      main.addEventListener('animationend', () => main.classList.remove('bp-page-in'), { once: true });
    }
  }

  // If React re-renders the whole document (a recoverable hydration error does
  // this), the old scroll container is detached: re-attach to the new one and
  // show anything that was waiting for a reveal on the old one.
  let bound = null;
  function rebind() {
    if (bound === scroller()) return;
    bound = scroller();
    if (lenis) { lenis.destroy(); lenis = null; }
    if (io) { io.disconnect(); io = null; }
    document.querySelectorAll('.bp-rv, .bp-rv-h').forEach(el => el.classList.remove('bp-rv', 'bp-rv-h'));
    smooth();
  }

  let t = 0;
  function refresh() {
    clearTimeout(t);
    t = setTimeout(() => { skipLink(); rebind(); routeChanged(); classify(); reveals(); }, 120);
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    skipLink();
    bound = scroller();
    classify();
    reveals();
    smooth();
    new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
    addEventListener('popstate', refresh);
  }
  // same timing as content.js: after load plus a beat for hydration
  addEventListener('load', () => setTimeout(start, 320));
  setTimeout(start, 4000);
})();
