/* =========================================================
   main.js — init, navigation, smooth scroll, intersection observer reveals
   ========================================================= */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky Nav state ---------- */
  const nav = $('.nav-wrap');
  if (nav) {
    const setScrolled = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- Mobile nav overlay ---------- */
  const toggle = $('.nav-toggle');
  const overlay = $('.nav-overlay');
  if (toggle && overlay) {
    const closeNav = () => {
      toggle.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const open = !overlay.classList.contains('open');
      overlay.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-overlay a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------- Lenis smooth scroll (optional) ---------- */
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
  const navOffset = -(navH + 16);

  /* scrollToTop helper — works with or without Lenis */
  function scrollToTop(immediate = false) {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate });
    } else {
      window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
    }
  }
  function scrollToBottom(immediate = false) {
    const max = document.documentElement.scrollHeight;
    if (window.lenis) {
      window.lenis.scrollTo(max, { immediate });
    } else {
      window.scrollTo({ top: max, behavior: immediate ? 'auto' : 'smooth' });
    }
  }
  window.scrollToTop = scrollToTop;

  if (window.Lenis && !prefersReducedMotion) {
    const lenis = new window.Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // Expose so other scripts (and Home/End handlers, brand-link) can use it
    window.lenis = lenis;
    window.__lenis = lenis;

    // anchor jumps via lenis — offset by nav height
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: navOffset });
          }
        }
      });
    });
  }

  /* Brand/logo link → always return to top */
  $$('.brand[href="index.html"], .brand[href="#"], a[data-scroll-top]').forEach(a => {
    a.addEventListener('click', (e) => {
      // Only intercept same-page brand clicks (not cross-page navigation away)
      const onIndex = /\/index\.html$|\/$/.test(location.pathname) || location.pathname.endsWith('index.html');
      if (a.getAttribute('href') === '#' || onIndex) {
        e.preventDefault();
        scrollToTop();
      }
    });
  });

  /* Home / End keyboard handlers (skip when typing in inputs/textareas) */
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'Home') { e.preventDefault(); scrollToTop(); }
    else if (e.key === 'End') { e.preventDefault(); scrollToBottom(); }
  });

  /* Ensure page never loads scrolled into the middle.
     Defer scripts run after DOM parse but before DOMContentLoaded fires,
     so register if still loading, otherwise call immediately. */
  const resetIfNoHash = () => { if (!location.hash) scrollToTop(true); };
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', resetIfNoHash, { once: true });
  } else {
    resetIfNoHash();
  }
  // Also override the browser's scroll-restoration so back/forward never lands mid-page
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- Nav inverts over dark sections ---------- */
  const darkSections = $$('[data-nav="dark"]');
  if (darkSections.length && 'IntersectionObserver' in window && nav) {
    const darkIO = new IntersectionObserver((entries) => {
      // Any dark section currently crossing the nav band -> invert
      const anyIntersecting = entries.some(en => en.isIntersecting);
      // Combine with state from sections not in this batch
      const stillDark = anyIntersecting || darkSections.some(sec => {
        const r = sec.getBoundingClientRect();
        return r.top < navH + 8 && r.bottom > 0;
      });
      nav.classList.toggle('on-dark', stillDark);
    }, {
      // Trigger band that matches the nav region at the top of the viewport
      rootMargin: `0px 0px -${Math.max(0, window.innerHeight - navH - 8)}px 0px`,
      threshold: 0
    });
    darkSections.forEach(s => darkIO.observe(s));
  }

  /* ---------- IntersectionObserver reveals ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Update copyright year ---------- */
  const y = $('.copy-year');
  if (y) y.textContent = new Date().getFullYear();
})();
