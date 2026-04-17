/* ============================================
   BOB ROBB — site interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- LOADER ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    }, 600);
  });

  /* ---------- NAV: SCROLLED STATE ---------- */
  const navbar = document.getElementById('navbar');
  const updateNav = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- HERO PARALLAX (gentle) ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const heroBg = document.querySelector('.hero-bg-img');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 18,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  /* ---------- CONTACT FORM → MAILTO ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
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
        notes ? `Notes:\n${notes}` : null
      ].filter(Boolean);

      const mailto = `mailto:brobb@suburbancollection.com`
        + `?subject=${encodeURIComponent(subject)}`
        + `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      window.location.href = mailto;

      // Show inline confirmation after short delay
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
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

});
