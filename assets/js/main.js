document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const currentYear = document.querySelector('[data-current-year]');
  const revealItems = document.querySelectorAll('.reveal');
  const basePath = window.location.pathname.includes('/servicos/') ? '../' : '';
  const iconPath = `${basePath}assets/images/cg_logo_icon.webp`;

  document.querySelectorAll('.brand-mark').forEach((mark) => {
    if (mark.tagName === 'IMG') {
      mark.src = iconPath;
      mark.alt = 'CG Elétrica';
      return;
    }

    const image = document.createElement('img');
    image.className = 'brand-mark';
    image.src = iconPath;
    image.alt = 'CG Elétrica';
    mark.replaceWith(image);
  });

  document.querySelectorAll('.brand > span').forEach((label) => label.remove());
  document.querySelectorAll('a[href*="servicos.html"]').forEach((link) => {
    if (link.closest('.header-nav, .footer-links')) {
      link.textContent = 'Soluções';
    }
  });

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/webp';
  favicon.href = iconPath;
  document.head.appendChild(favicon);

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand"><img class="brand-mark" src="${iconPath}" alt="CG Elétrica" /></div>
            <p>Soluções em engenharia elétrica</p>
            <span>CREA 123.775-RJ</span>
          </div>
          <div>
            <h3>Menu</h3>
            <div class="footer-links">
              <a href="${basePath}index.html">Início</a>
              <a href="${basePath}empresa.html">Empresa</a>
              <a href="${basePath}servicos.html">Soluções</a>
              <a href="${basePath}projetos.html">Projetos</a>
              <a href="${basePath}contato.html">Contato</a>
            </div>
          </div>
          <div>
            <h3>Contato</h3>
            <div class="footer-social-links" aria-label="Redes sociais e contato">
              <a href="https://www.instagram.com/cadmoengenhariaeletrica/" target="_blank" rel="noreferrer" aria-label="Instagram"><img src="${basePath}assets/images/instagram.svg" alt="" /></a>
              <a href="https://wa.me/5522998440035" target="_blank" rel="noreferrer" aria-label="WhatsApp"><img src="${basePath}assets/images/whatsapp.svg" alt="" /></a>
              <a href="mailto:" aria-label="E-mail"><img src="${basePath}assets/images/maildotru.svg" alt="" /></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>©2026 CG Elétrica, Todos os direitos reservados</span>
          <small>Site Desenvolvido por: <a href="https://leolocs.com.br" target="_blank" rel="noreferrer">Leolocs</a></small>
        </div>
      </div>`;
  }

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      header.classList.toggle('open');
    });
  }

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
