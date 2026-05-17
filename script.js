/* =========================================================================
   HeXTalent — landing page interactions
   ========================================================================= */

(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Topbar scroll state — solidify the background once user scrolls
     ------------------------------------------------------------------ */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const updateTopbar = () => {
      if (window.scrollY > 24) {
        topbar.classList.add('is-scrolled');
      } else {
        topbar.classList.remove('is-scrolled');
      }
    };
    updateTopbar();
    window.addEventListener('scroll', updateTopbar, { passive: true });
  }

  /* ------------------------------------------------------------------
     Scroll reveal — observe any [data-anim] element and add .is-visible
     once it enters the viewport. Supports optional data-delay (ms).
     ------------------------------------------------------------------ */
  const animTargets = document.querySelectorAll('[data-anim]');

  if ('IntersectionObserver' in window && animTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || 0;
          if (delay) {
            setTimeout(() => el.classList.add('is-visible'), delay);
          } else {
            el.classList.add('is-visible');
          }
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    animTargets.forEach((el) => observer.observe(el));
  } else {
    // Fallback — show everything immediately
    animTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Card spotlight — soft mouse-tracking light on hover
     ------------------------------------------------------------------ */
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
})();
