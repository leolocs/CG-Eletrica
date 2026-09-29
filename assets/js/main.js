document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const currentYear = document.querySelector('[data-current-year]');
  const revealItems = document.querySelectorAll('.reveal');

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      header.classList.toggle('open');
      const isOpen = header.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
  }

  const prefetchedPages = new Set(
    Array.from(document.querySelectorAll('link[rel="prefetch"]'), (link) => link.href),
  );
  const prefetchPage = (anchor) => {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) return;
    if (prefetchedPages.has(url.href)) return;

    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = url.href;
    document.head.appendChild(prefetch);
    prefetchedPages.add(url.href);
  };

  document.addEventListener('pointerover', (event) => {
    const anchor = event.target.closest('a[href]');
    if (anchor) prefetchPage(anchor);
  }, { passive: true });

  document.addEventListener('touchstart', (event) => {
    const anchor = event.target.closest('a[href]');
    if (anchor) prefetchPage(anchor);
  }, { passive: true });

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.counter').forEach((counter) => {
    const target = Number(counter.dataset.target);
    const prefix = counter.dataset.prefix || '';

    if (!Number.isFinite(target)) return;

    const render = (value) => {
      counter.textContent = `${prefix}${Math.round(value)}`;
    };

    if (prefersReducedMotion) {
      render(target);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      render(target * easedProgress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });

  const projectTrack = document.querySelector('.project-track');
  if (projectTrack) {
    projectTrack.querySelectorAll('.project-card').forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      projectTrack.appendChild(clone);
    });
    if (prefersReducedMotion) {
      projectTrack.style.animationPlayState = 'paused';
    }
  }

  if (!prefersReducedMotion && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
});
