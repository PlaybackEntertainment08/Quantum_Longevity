/* =========================================================
   components.js — Swiper, accordion, counters, tilt, magnetic CTAs, particles
   ========================================================= */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Testimonials Swiper ---------- */
  if (window.Swiper && $('.testimonial-swiper')) {
    const swiper = new window.Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      centeredSlides: true,
      loop: true,
      speed: 800,
      breakpoints: {
        768: { slidesPerView: 1.4, spaceBetween: 24 },
        1024: { slidesPerView: 1.6, spaceBetween: 32 },
        1280: { slidesPerView: 1.8, spaceBetween: 40 }
      },
      navigation: {
        nextEl: '.swiper-nav .next',
        prevEl: '.swiper-nav .prev'
      },
      keyboard: { enabled: true }
    });

    // Build pagination dots dynamically from slide count
    const dotsHost = $('.swiper-dots');
    if (dotsHost) {
      const slideCount = $$('.testimonial-swiper .swiper-slide').length;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < slideCount; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        b.dataset.idx = String(i);
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', () => swiper.slideToLoop(i));
        frag.appendChild(b);
      }
      dotsHost.appendChild(frag);
      const updateDots = () => {
        const real = swiper.realIndex;
        $$('button', dotsHost).forEach((d, i) => d.classList.toggle('is-active', i === real));
      };
      swiper.on('slideChange', updateDots);
    }
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-q', item);
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Counter animations ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1800;
        if (prefersReducedMotion) {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
          counterIO.unobserve(el);
          return;
        }
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = prefix + val.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = prefix + target.toFixed(decimals) + suffix;
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ---------- Card tilt (vanilla) ---------- */
  if (!prefersReducedMotion) {
    $$('[data-tilt]').forEach(card => {
      const max = parseFloat(card.dataset.tilt) || 6;
      let rect = null;
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(900px) rotateY(${dx * max}deg) rotateX(${-dy * max}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        rect = null;
      });
    });
  }

  /* ---------- Magnetic CTAs ---------- */
  if (!prefersReducedMotion && window.matchMedia('(pointer:fine)').matches) {
    $$('[data-magnetic]').forEach(btn => {
      const strength = 0.35;
      const max = 10;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        const tx = Math.max(-max, Math.min(max, dx));
        const ty = Math.max(-max, Math.min(max, dy));
        btn.style.transform = `translate(${tx}px, ${ty}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 404 floating particles ---------- */
  const particleHost = $('.err-particles');
  if (particleHost && !prefersReducedMotion) {
    const count = 18;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      const left = Math.random() * 100;
      const dur = 12 + Math.random() * 18;
      const delay = Math.random() * -dur;
      const size = 3 + Math.random() * 5;
      s.style.cssText = `left:${left}%; width:${size}px; height:${size}px; animation-duration:${dur}s; animation-delay:${delay}s;`;
      frag.appendChild(s);
    }
    particleHost.appendChild(frag);
  }

  /* ---------- Newsletter feedback ---------- */
  $$('.newsletter').forEach(newsletter => {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', newsletter);
      if (!input || !input.value) return;
      input.disabled = true;
      input.value = 'Thank you. We\'ll be in touch.';
      setTimeout(() => { input.disabled = false; input.value = ''; }, 3000);
    });
  });

  /* ---------- Therapy category tabs ---------- */
  const tabGroups = $$('.cat-tabs');
  tabGroups.forEach(group => {
    const tabs = $$('.cat-tab', group);
    const panels = $$('.cat-panel', group);
    if (!tabs.length || !panels.length) return;

    const activate = (idx) => {
      tabs.forEach((t, i) => {
        const selected = i === idx;
        t.setAttribute('aria-selected', String(selected));
        t.setAttribute('tabindex', selected ? '0' : '-1');
      });
      panels.forEach((p, i) => {
        const active = i === idx;
        p.classList.toggle('is-active', active);
        p.hidden = !active;
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          activate(next);
          tabs[next].focus();
        }
      });
    });
    activate(0);
  });

  /* ---------- Blog filter chips ---------- */
  $$('[data-filter-group]').forEach(group => {
    const chips = $$('.chip', group);
    const cardsHost = document.querySelector(group.dataset.filterTarget || '.blog-grid');
    if (!chips.length || !cardsHost) return;
    const cards = $$('.blog-card', cardsHost);

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.category;
        chips.forEach(c => {
          const active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-pressed', String(active));
        });
        cards.forEach(card => {
          const cats = (card.dataset.category || '').split(/\s+/);
          const show = cat === 'all' || cats.includes(cat);
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  });

  /* ---------- Video walkthrough lightbox ---------- */
  const lightbox = $('.video-lightbox');
  if (lightbox) {
    const openers = $$('[data-video-open]');
    const closeBtn = $('.video-close', lightbox);
    let lastFocused = null;
    const open = () => {
      lastFocused = document.activeElement;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };
    const close = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };
    openers.forEach(o => o.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) close(); });
  }

  /* ---------- Contact form (no backend) ---------- */
  $$('.contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (btn) {
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = 'Request received — thank you';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = original; form.reset(); }, 3200);
      }
      // TODO: wire to real endpoint or mailto. No data leaves the page currently.
    });
  });
})();
