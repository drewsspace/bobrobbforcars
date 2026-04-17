/* ============================================
   BOB ROBB — site interactions
   ============================================ */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupLoader();
    setupNav();
    setupMobileMenu();
    setupSplitWords();
    setupReveal();
    setupHeroParallax();
    setupScrollProgress();
    setupCounters();
    setupPortraitReveal();
    setupMagneticButtons();
    setupSectionIndicator();
    setupProcessPin();
    setupContactForm();
    setupFooter();
    setupLenis();
  }

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  function setupLenis() {
    if (prefersReducedMotion || !window.Lenis) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor link interop
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

  /* ---------- LOADER ---------- */
  function setupLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 650);
    });
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

  /* ---------- SPLIT WORDS (hero only, runs once) ---------- */
  function setupSplitWords() {
    const targets = document.querySelectorAll('[data-split-words]');
    targets.forEach((el) => {
      const text = el.innerHTML;
      // Simple split on whitespace, preserving &mdash; etc.
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

    // Timeline: eyebrow -> h1 line 1 -> h1 line 2 -> sub
    window.addEventListener('load', () => {
      setTimeout(() => {
        const tl = gsap.timeline();
        tl.to('.hero-eyebrow .split-word', {
          y: 0,
          duration: 0.9,
          stagger: 0.04,
          ease: 'power3.out',
        }, 0)
          .to('.hero-line:not(.hero-line--em) .split-word', {
            y: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: 'power3.out',
          }, 0.15)
          .to('.hero-line--em .split-word', {
            y: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: 'power3.out',
          }, 0.35)
          .to('.hero-sub .split-word', {
            y: 0,
            duration: 0.8,
            stagger: 0.015,
            ease: 'power2.out',
          }, 0.75)
          .fromTo('.hero-ctas', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.95)
          .add(() => {
            document.querySelectorAll('.split-word-wrap').forEach((w) => w.classList.add('settled'));
          });
      }, 900); // allow loader to finish
    });
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

  /* ---------- HERO PARALLAX + MOUSE TRACKING ---------- */
  function setupHeroParallax() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const heroBg = document.querySelector('.hero-bg-img');
    const hero = document.querySelector('.hero');
    if (!heroBg) return;

    gsap.to(heroBg, {
      yPercent: 16,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    if (isTouch) return;

    // Mouse parallax applied to .hero-bg wrapper so we don't fight GSAP on .hero-bg-img
    const wrapper = document.querySelector('.hero-bg');
    if (!wrapper) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function tick() {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;
      wrapper.style.transform = `translate3d(${(-currentX * 14).toFixed(2)}px, ${(-currentY * 10).toFixed(2)}px, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
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
          const duration = 1600;
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

  /* ---------- PORTRAIT CLIP-PATH REVEAL ---------- */
  function setupPortraitReveal() {
    const portrait = document.querySelector('[data-portrait-reveal]');
    if (!portrait) return;
    if (prefersReducedMotion) {
      portrait.classList.add('revealed');
      return;
    }
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

  /* ---------- MAGNETIC BUTTONS ---------- */
  function setupMagneticButtons() {
    if (prefersReducedMotion || isTouch) return;
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 0.35;
      const innerStrength = 0.55;
      const span = btn.querySelector('span');
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        if (span) span.style.transform = `translate(${x * innerStrength}px, ${y * innerStrength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        if (span) span.style.transform = '';
      });
    });
  }

  /* ---------- SECTION INDICATOR DOTS ---------- */
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
          // Map progress to current step (0..3)
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

      if (!name || !email) {
        form.reportValidity();
        return;
      }

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
