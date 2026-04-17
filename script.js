/* ============================================
   BOB ROBB — site interactions (v2: high-motion)
   ============================================ */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // shared state
  const state = {
    lenis: null,
    scrollVelocity: 0,   // px/frame (smoothed)
    scrollDirection: 1,  // 1 down, -1 up
    mouseX: 0,
    mouseY: 0,
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupLoader();
    setupNav();
    setupMobileMenu();
    setupCursor();
    setupHeroSpotlight();
    setupSplitWords();
    setupSplitLetters();
    setupBodyWordReveal();
    setupReveal();
    setupHeroParallax();
    setupParallaxLayers();
    setupScrollProgress();
    setupCounters();
    setupPortraitReveal();
    setupMagneticButtons();
    setupTilt();
    setupSectionIndicator();
    setupProcessPin();
    setupVelocityMarquee();
    setupContactForm();
    setupFooter();
    setupLenis();
    setupGlobalMouseTracking();
  }

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  function setupLenis() {
    if (prefersReducedMotion || !window.Lenis) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    state.lenis = lenis;
    window.__lenis = lenis;

    let lastY = 0;
    lenis.on('scroll', (e) => {
      const v = e.scroll - lastY;
      lastY = e.scroll;
      // smoothed velocity (low-pass)
      state.scrollVelocity = state.scrollVelocity * 0.85 + v * 0.15;
      state.scrollDirection = v >= 0 ? 1 : -1;
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      });
    });
  }

  /* ---------- GLOBAL MOUSE TRACKING ---------- */
  function setupGlobalMouseTracking() {
    if (isTouch) return;
    window.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
    }, { passive: true });
  }

  /* ---------- LOADER (v2: progress + slab reveal) ---------- */
  function setupLoader() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loaderBar');
    const num = document.getElementById('loaderNum');
    if (!loader) return;

    if (prefersReducedMotion) {
      loader.classList.add('done');
      setTimeout(() => loader.classList.add('hidden'), 200);
      return;
    }

    let progress = 0;
    const start = performance.now();
    const minDuration = 1100; // ms
    function tick(now) {
      const elapsed = now - start;
      const target = Math.min(100, (elapsed / minDuration) * 100);
      progress += (target - progress) * 0.18;
      const shown = Math.min(100, Math.round(progress));
      if (bar) bar.style.transform = `scaleX(${(shown / 100).toFixed(3)})`;
      if (num) num.textContent = shown;
      if (shown < 100 || elapsed < minDuration) {
        requestAnimationFrame(tick);
      } else {
        loader.classList.add('done');
        setTimeout(() => loader.classList.add('hidden'), 950);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- NAV scrolled state ---------- */
  function setupNav() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const update = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- MOBILE MENU ---------- */
  function setupMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- CUSTOM CURSOR ---------- */
  function setupCursor() {
    if (isTouch || prefersReducedMotion) return;
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    const label = document.getElementById('cursorLabel');
    if (!cursor || !ring || !dot) return;

    document.documentElement.classList.add('has-custom-cursor');
    cursor.classList.add('ready');

    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    function tick() {
      // dot follows fast, ring lerps slow
      dotX += (state.mouseX - dotX) * 0.55;
      dotY += (state.mouseY - dotY) * 0.55;
      ringX += (state.mouseX - ringX) * 0.18;
      ringY += (state.mouseY - ringY) * 0.18;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(var(--cursor-scale, 1))`;
      if (label) label.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Hover states
    const hoverSelectors = 'a, button, .magnetic, [data-cursor], input, textarea, select';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverSelectors);
      if (!target) return;
      cursor.classList.add('hovering');
      const cur = target.getAttribute('data-cursor');
      if (cur === 'view') {
        cursor.classList.add('cursor--view');
        if (label) label.textContent = 'View';
      } else if (cur === 'start') {
        cursor.classList.add('cursor--cta');
        if (label) label.textContent = '\u2192';
      } else if (cur === 'call') {
        cursor.classList.add('cursor--cta');
        if (label) label.textContent = 'Call';
      }
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverSelectors);
      if (!target) return;
      cursor.classList.remove('hovering', 'cursor--view', 'cursor--cta');
      if (label) label.textContent = '';
    });

    // Hide on leave
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));
  }

  /* ---------- HERO CURSOR SPOTLIGHT ---------- */
  function setupHeroSpotlight() {
    if (isTouch || prefersReducedMotion) return;
    const hero = document.querySelector('[data-cursor-spotlight]');
    const spot = document.getElementById('heroSpotlight');
    if (!hero || !spot) return;

    let x = 50, y = 50;        // percent
    let cx = 50, cy = 50;      // current
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width) * 100;
      y = ((e.clientY - rect.top) / rect.height) * 100;
    });
    hero.addEventListener('mouseenter', () => spot.classList.add('active'));
    hero.addEventListener('mouseleave', () => spot.classList.remove('active'));

    function tick() {
      cx += (x - cx) * 0.08;
      cy += (y - cy) * 0.08;
      spot.style.setProperty('--mx', cx.toFixed(2) + '%');
      spot.style.setProperty('--my', cy.toFixed(2) + '%');
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- SPLIT WORDS (eyebrow + sub) ---------- */
  function setupSplitWords() {
    const targets = document.querySelectorAll('[data-split-words]');
    targets.forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = '';
      words.forEach((word, i) => {
        const wrap = document.createElement('span');
        wrap.className = 'split-word-wrap';
        const inner = document.createElement('span');
        inner.className = 'split-word';
        inner.textContent = word;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });

    if (prefersReducedMotion || !window.gsap) {
      document.querySelectorAll('.split-word').forEach((w) => (w.style.transform = 'translateY(0)'));
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        gsap.to('.hero-eyebrow .split-word', {
          y: 0, duration: 0.9, stagger: 0.04, ease: 'power3.out',
        });
        gsap.to('.hero-sub .split-word', {
          y: 0, duration: 0.8, stagger: 0.012, ease: 'power2.out', delay: 0.85,
        });
        gsap.fromTo('.hero-ctas',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 1.1 }
        );
        setTimeout(() => {
          document.querySelectorAll('.split-word-wrap').forEach((w) => w.classList.add('settled'));
        }, 1800);
      }, 1100);
    });
  }

  /* ---------- SPLIT LETTERS (hero h1 — kinetic) ---------- */
  function setupSplitLetters() {
    const targets = document.querySelectorAll('[data-split-letters]');
    targets.forEach((el) => {
      const text = el.textContent;
      el.innerHTML = '';
      const words = text.split(/(\s+)/);
      words.forEach((token) => {
        if (/^\s+$/.test(token)) {
          el.appendChild(document.createTextNode(token));
          return;
        }
        const wordWrap = document.createElement('span');
        wordWrap.className = 'split-letter-word';
        [...token].forEach((ch) => {
          const wrap = document.createElement('span');
          wrap.className = 'split-letter-wrap';
          const letter = document.createElement('span');
          letter.className = 'split-letter';
          letter.textContent = ch;
          wrap.appendChild(letter);
          wordWrap.appendChild(wrap);
        });
        el.appendChild(wordWrap);
      });
    });

    if (prefersReducedMotion || !window.gsap) {
      document.querySelectorAll('.split-letter').forEach((l) => {
        l.style.transform = 'translateY(0) rotate(0)';
      });
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const lines = document.querySelectorAll('[data-split-letters]');
        lines.forEach((line, lineIdx) => {
          const letters = line.querySelectorAll('.split-letter');
          gsap.to(letters, {
            y: 0,
            rotate: 0,
            duration: 1.0,
            stagger: 0.018,
            ease: 'power3.out',
            delay: 0.15 + lineIdx * 0.18,
          });
        });
        setTimeout(() => {
          document.querySelectorAll('.split-letter-wrap').forEach((w) => w.classList.add('settled'));
        }, 2200);
      }, 1100);
    });
  }

  /* ---------- BODY WORD REVEAL ---------- */
  function setupBodyWordReveal() {
    const targets = document.querySelectorAll('[data-reveal-words]');
    targets.forEach((el) => {
      const text = el.textContent.trim();
      el.innerHTML = '';
      const tokens = text.split(/(\s+)/);
      tokens.forEach((tok) => {
        if (/^\s+$/.test(tok)) {
          el.appendChild(document.createTextNode(tok));
          return;
        }
        const wrap = document.createElement('span');
        wrap.className = 'rw-wrap';
        const inner = document.createElement('span');
        inner.className = 'rw';
        inner.textContent = tok;
        wrap.appendChild(inner);
        el.appendChild(wrap);
      });
    });

    if (!targets.length) return;
    if (prefersReducedMotion) {
      document.querySelectorAll('.rw').forEach((r) => (r.style.transform = 'translateY(0)'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const words = entry.target.querySelectorAll('.rw');
          if (window.gsap) {
            gsap.to(words, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.018,
              ease: 'power3.out',
            });
          } else {
            words.forEach((w, i) => {
              setTimeout(() => {
                w.style.transform = 'translateY(0)';
                w.style.opacity = '1';
              }, i * 18);
            });
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- REVEAL ON SCROLL (generic) ---------- */
  function setupReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- HERO PARALLAX (image scrub + clip on scroll) ---------- */
  function setupHeroParallax() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const heroBgImg = document.querySelector('.hero-bg-img');
    const heroContent = document.querySelector('.hero-content');
    if (!heroBgImg) return;

    gsap.to(heroBgImg, {
      yPercent: 22,
      scale: 1.18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    if (heroContent) {
      gsap.to(heroContent, {
        yPercent: -10,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  /* ---------- MULTI-LAYER PARALLAX ---------- */
  function setupParallaxLayers() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallaxSpeed || '0.3');
      gsap.to(el, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  function setupScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- COUNTERS ---------- */
  function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    if (prefersReducedMotion) {
      counters.forEach((c) => (c.textContent = c.dataset.count));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const duration = 1800;
          const start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
  }

  /* ---------- PORTRAIT CLIP-PATH SCRUBBED REVEAL ---------- */
  function setupPortraitReveal() {
    const portrait = document.querySelector('[data-portrait-reveal]');
    if (!portrait) return;
    if (prefersReducedMotion) {
      portrait.classList.add('revealed');
      return;
    }

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const img = portrait.querySelector('img');
      gsap.fromTo(portrait,
        { '--clip': '100%' },
        {
          '--clip': '0%',
          ease: 'none',
          scrollTrigger: {
            trigger: portrait,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.8,
          },
        }
      );
      if (img) {
        gsap.fromTo(img,
          { scale: 1.18 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: portrait,
              start: 'top 90%',
              end: 'top 20%',
              scrub: 1,
            },
          }
        );
      }
      // Simple class toggle so caption etc. can react
      ScrollTrigger.create({
        trigger: portrait,
        start: 'top 70%',
        onEnter: () => portrait.classList.add('revealed'),
      });
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              portrait.classList.add('revealed');
              io.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      io.observe(portrait);
    }
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  function setupMagneticButtons() {
    if (prefersReducedMotion || isTouch) return;
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 0.32;
      const innerStrength = 0.5;
      const span = btn.querySelector('span');
      let raf;
      let tx = 0, ty = 0, sx = 0, sy = 0;
      let curTx = 0, curTy = 0, curSx = 0, curSy = 0;

      function tick() {
        curTx += (tx - curTx) * 0.18;
        curTy += (ty - curTy) * 0.18;
        curSx += (sx - curSx) * 0.18;
        curSy += (sy - curSy) * 0.18;
        btn.style.transform = `translate(${curTx.toFixed(2)}px, ${curTy.toFixed(2)}px)`;
        if (span) span.style.transform = `translate(${curSx.toFixed(2)}px, ${curSy.toFixed(2)}px)`;
        if (Math.abs(tx - curTx) > 0.1 || Math.abs(ty - curTy) > 0.1) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      }
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        tx = x * strength; ty = y * strength;
        sx = x * innerStrength; sy = y * innerStrength;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      btn.addEventListener('mouseleave', () => {
        tx = 0; ty = 0; sx = 0; sy = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }

  /* ---------- 3D TILT ---------- */
  function setupTilt() {
    if (prefersReducedMotion || isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const max = 8; // degrees
      let rx = 0, ry = 0, cx = 0, cy = 0;
      let raf = null;
      let glowX = 50, glowY = 50;

      function tick() {
        cx += (rx - cx) * 0.14;
        cy += (ry - cy) * 0.14;
        card.style.transform = `perspective(900px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg) translateZ(0)`;
        card.style.setProperty('--glow-x', glowX + '%');
        card.style.setProperty('--glow-y', glowY + '%');
        if (Math.abs(rx - cx) > 0.05 || Math.abs(ry - cy) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      }
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        rx = (px - 0.5) * 2 * max;
        ry = -(py - 0.5) * 2 * max;
        glowX = px * 100;
        glowY = py * 100;
        card.classList.add('tilting');
        if (!raf) raf = requestAnimationFrame(tick);
      });
      card.addEventListener('mouseleave', () => {
        rx = 0; ry = 0;
        card.classList.remove('tilting');
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }

  /* ---------- SECTION INDICATOR ---------- */
  function setupSectionIndicator() {
    const indicator = document.getElementById('sectionIndicator');
    if (!indicator) return;
    const links = [...indicator.querySelectorAll('a')];
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = '#' + entry.target.id;
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
          // theme shift via section's data-theme (or default)
          const theme = entry.target.dataset.theme || (entry.target.classList.contains('hero') || entry.target.classList.contains('process-pin') || entry.target.classList.contains('contact') || entry.target.classList.contains('marquee') ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        });
      },
      { threshold: 0.4, rootMargin: '-30% 0px -30% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- PROCESS HORIZONTAL PIN ---------- */
  function setupProcessPin() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(max-width: 960px)').matches) return;

    const section = document.querySelector('.process-pin');
    const track = document.querySelector('.process-pin-track');
    const panels = document.querySelectorAll('.process-panel');
    const progressBar = document.querySelector('.process-progress-bar span');
    const progressLabel = document.querySelector('.process-progress-label');
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    function getScrollDistance() {
      return track.scrollWidth - window.innerWidth;
    }

    gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + getScrollDistance(),
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const panelCount = panels.length;
          const idx = Math.min(panelCount - 1, Math.floor(progress * panelCount * 0.999));
          const stepNum = idx + 1;
          if (progressLabel) progressLabel.textContent = String(stepNum).padStart(2, '0') + ' / 03';
          if (progressBar) progressBar.style.width = (stepNum / panelCount) * 100 + '%';
          panels.forEach((p, i) => p.classList.toggle('in-view', i === idx));
        },
      },
    });
  }

  /* ---------- VELOCITY-REACTIVE MARQUEE ---------- */
  function setupVelocityMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    if (prefersReducedMotion) {
      track.style.animation = 'none';
      return;
    }

    // Take over from CSS animation: we'll drive transform manually
    track.style.animation = 'none';

    const baseSpeed = 0.6; // px/frame
    const velocityBoost = 0.45;
    let x = 0;
    let halfWidth = 0;
    function measure() {
      halfWidth = track.scrollWidth / 2;
    }
    measure();
    window.addEventListener('resize', measure);

    function tick() {
      const v = state.scrollVelocity;
      const dir = state.scrollDirection;
      // Forward speed plus an extra contribution from scroll velocity
      const speed = baseSpeed + Math.abs(v) * velocityBoost;
      x -= speed * dir; // reverse marquee on scroll up
      // wrap
      if (halfWidth > 0) {
        if (x <= -halfWidth) x += halfWidth;
        if (x >= 0) x -= halfWidth;
      }
      // skew based on velocity
      const skew = Math.max(-8, Math.min(8, v * 0.4));
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- CONTACT FORM → MAILTO ---------- */
  function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const vehicle = (data.get('vehicle') || '').toString().trim();
      const timing = (data.get('timing') || '').toString().trim();
      const notes = (data.get('notes') || '').toString().trim();

      if (!name || !email) { form.reportValidity(); return; }

      const subject = `New inquiry from ${name}`;
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        vehicle ? `Vehicle of interest: ${vehicle}` : null,
        timing ? `Timing: ${timing}` : null,
        '',
        notes ? `Notes:\n${notes}` : null,
      ].filter(Boolean);

      const mailto =
        `mailto:brobb@suburbancollection.com` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      window.location.href = mailto;

      setTimeout(() => {
        const success = document.createElement('div');
        success.className = 'form-success reveal visible';
        success.innerHTML = `
          <h3>Your note is on its way.</h3>
          <p>If your mail client didn't open automatically, reach Bob directly at
          <a href="mailto:brobb@suburbancollection.com" style="color: var(--brass-soft); text-decoration: underline;">brobb@suburbancollection.com</a>
          or (248) 554&ndash;3591.</p>
        `;
        form.replaceWith(success);
      }, 400);
    });
  }

  /* ---------- FOOTER YEAR ---------- */
  function setupFooter() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }
})();
