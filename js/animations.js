/* =========================================================
   animations.js — GSAP + ScrollTrigger timelines
   ========================================================= */

(() => {
  if (!window.gsap) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Hero headline word reveal ---------- */
  const heroHeadline = document.querySelector('[data-split]');
  if (heroHeadline) {
    const html = heroHeadline.innerHTML;
    const wrapWord = (w) => `<span class="word-wrap"><span class="word">${w}</span></span>`;
    // Match each unit: either <em>...</em>, run of non-whitespace, or whitespace.
    // Preserves original spacing so trailing punctuation stays glued to its word.
    const parts = html.match(/<em>[^<]*<\/em>|\S+|\s+/g) || [];
    const out = parts.map(p => {
      if (/^\s+$/.test(p)) return p;
      if (/^<em>/.test(p)) {
        const inner = p.replace(/<\/?em>/g, '');
        return wrapWord(`<em>${inner}</em>`);
      }
      return wrapWord(p);
    }).join('');
    heroHeadline.innerHTML = out;

    heroHeadline.querySelectorAll('.word-wrap').forEach(w => {
      w.style.display = 'inline-block';
      w.style.overflow = 'hidden';
      w.style.verticalAlign = 'top';
    });
    heroHeadline.querySelectorAll('.word').forEach(w => {
      w.style.display = 'inline-block';
      w.style.willChange = 'transform';
    });

    const tl = gsap.timeline({ delay: 0.2 });
    tl.from('.hero .eyebrow', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
      .from(heroHeadline.querySelectorAll('.word'), {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.06
      }, '-=0.3')
      .from('.hero-subhead', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.hero-ctas > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.5')
      .from('.hero-trust', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .from('.hero-visual', { scale: 0.92, opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=1.1')
      .from('.stat-chip', { scale: 0.85, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.6)' }, '-=0.6');
  }

  if (!window.ScrollTrigger) return;
  const ST = window.ScrollTrigger;

  /* ---------- Parallax on hero chips ---------- */
  document.querySelectorAll('.stat-chip').forEach((chip, i) => {
    gsap.to(chip, {
      y: (i + 1) * -30,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  /* ---------- Process timeline progress line ---------- */
  const track = document.querySelector('.process-track');
  if (track) {
    gsap.to(track, {
      '--progress': '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.8,
        onUpdate: (self) => {
          const steps = track.querySelectorAll('.process-step');
          const idx = Math.floor(self.progress * steps.length);
          steps.forEach((s, i) => s.classList.toggle('active', i <= idx));
        }
      }
    });
  }

  /* ---------- Subtle scroll-driven parallax for about frame ---------- */
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const strength = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      y: () => -window.innerHeight * strength,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  /* ---------- Section-heading reveal ---------- */
  document.querySelectorAll('.section-head').forEach(head => {
    gsap.from(head.children, {
      y: 30,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: head,
        start: 'top 80%'
      }
    });
  });
})();
