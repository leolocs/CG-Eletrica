document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const revealItems = document.querySelectorAll('.reveal');

  if (toggle && header) {
    const closeMenu = () => {
      header.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    };

    toggle.addEventListener('click', () => {
      header.classList.toggle('open');
      const isOpen = header.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    header.querySelector('.header-nav')?.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroVideo = document.querySelector('.hero-video');

  if (prefersReducedMotion && heroVideo) {
    heroVideo.pause();
  }

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

  if (!prefersReducedMotion && revealItems.length && 'IntersectionObserver' in window) {
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

  const solutionDialog = document.querySelector('[data-solution-dialog]');
  const solutionsGrid = document.querySelector('[data-solutions-grid]');

  if (solutionDialog && solutionsGrid) {
    const dialogContent = solutionDialog.querySelector('[data-solution-dialog-content]');
    const closeButton = solutionDialog.querySelector('[data-solution-close]');
    const templates = new Map(
      Array.from(document.querySelectorAll('[data-solution-template]')).map((template) => [
        template.dataset.solutionTemplate,
        template,
      ]),
    );
    const links = Array.from(solutionsGrid.querySelectorAll('[data-solution]'));
    let openerLink = null;
    let openedSlug = null;

    const updateLinkStates = (slug = null) => {
      links.forEach((link) => {
        const isActive = link.dataset.solution === slug;
        link.setAttribute('aria-expanded', String(isActive));
        link.closest('[data-solution-card]')?.classList.toggle('is-active', isActive);
      });
    };

    const clearHash = () => {
      if (window.location.hash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    };

    const closeDialog = ({ preserveHash = false } = {}) => {
      if (solutionDialog.open) {
        solutionDialog.close();
      }
      document.body.classList.remove('solution-dialog-open');
      dialogContent.replaceChildren();
      solutionDialog.removeAttribute('aria-labelledby');
      updateLinkStates();
      openedSlug = null;
      if (!preserveHash) clearHash();
      if (openerLink) {
        openerLink.focus();
        openerLink = null;
      }
    };

    const openDialog = (slug, linkRef, { updateHash = true } = {}) => {
      const template = templates.get(slug);
      if (!template) return false;

      dialogContent.replaceChildren(template.content.cloneNode(true));
      const dialogTitle = dialogContent.querySelector("h2[id]");

      if (dialogTitle) {
        solutionDialog.setAttribute("aria-labelledby", dialogTitle.id);
      }
      openedSlug = slug;
      openerLink = linkRef || links.find((link) => link.dataset.solution === slug) || null;

      updateLinkStates(slug);

      if (!solutionDialog.open) {
        solutionDialog.showModal();
      }
      document.body.classList.add('solution-dialog-open');

      if (updateHash && window.location.hash !== `#${slug}`) {
        history.pushState(null, '', `#${slug}`);
      }

      return true;
    };

    solutionsGrid.addEventListener('click', (event) => {
      const link = event.target.closest('[data-solution]');
      if (!link || !solutionsGrid.contains(link)) return;

      const slug = link.dataset.solution;
      if (!templates.has(slug)) return;

      event.preventDefault();
      if (openedSlug === slug && solutionDialog.open) {
        closeDialog();
        return;
      }
      openDialog(slug, link);
    });

    closeButton?.addEventListener('click', () => closeDialog());

    solutionDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });

    solutionDialog.addEventListener('click', (event) => {
      if (event.target === solutionDialog) {
        closeDialog();
      }
    });

    window.addEventListener('hashchange', () => {
      const slug = window.location.hash.slice(1);
      if (!slug) {
        if (solutionDialog.open) closeDialog({ preserveHash: true });
        return;
      }
      if (templates.has(slug)) {
        openDialog(slug, null, { updateHash: false });
      }
    });

    const initialSlug = window.location.hash.slice(1);
    if (initialSlug && templates.has(initialSlug)) {
      openDialog(initialSlug, null, { updateHash: false });
    }
  }
});
