/* ═══════════════════════════════════════════════
   Rob Araujo — Portfolio · main.js
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Scroll to top on load ───────────────── */
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => window.scrollTo({ top: 0, behavior: 'instant' }));

  /* ── Theme ───────────────────────────────── */
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeBtn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ── Load site config + projects ─────────── */
  let SITE = null;
  let ALL_PROJECTS = [];
  let currentFilter = 'all';

  async function loadData() {
    try {
      const [siteRes, projRes] = await Promise.all([
        fetch('_data/site.json'),
        fetch('_data/projects.json'),
      ]);
      SITE = await siteRes.json();
      ALL_PROJECTS = (await projRes.json()).filter(p => p.enabled !== false);
    } catch (e) {
      console.warn('Could not load JSON data, using embedded defaults:', e);
    }
    renderNav();
    renderSections();
    initGallery();
    initMisc();
  }

  /* ── Render Nav from data ─────────────────── */
  function renderNav() {
    if (!SITE) return;
    const tabsEl = document.getElementById('tabs');
    const mobLinksEl = document.getElementById('mob-links');
    if (!tabsEl) return;

    const items = SITE.nav.filter(n => n.enabled !== false);
    tabsEl.innerHTML = '';
    if (mobLinksEl) mobLinksEl.innerHTML = '';

    items.forEach((item, i) => {
      // Desktop tab
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.dataset.filter = item.filter;
      if (i === 0) btn.classList.add('active');
      btn.addEventListener('click', () => filterProjects(btn));
      li.appendChild(btn);
      tabsEl.appendChild(li);

      // Mobile link
      if (mobLinksEl) {
        const mbtn = document.createElement('button');
        mbtn.textContent = item.label;
        mbtn.dataset.filter = item.filter;
        if (i === 0) mbtn.classList.add('active');
        mbtn.addEventListener('click', () => mobFilter(mbtn));
        mobLinksEl.appendChild(mbtn);
      }
    });
  }

  /* ── Toggle sections from config ─────────── */
  function renderSections() {
    if (!SITE) return;
    const s = SITE.sections;
    const toggle = (id, enabled) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('section-hidden', !enabled);
    };
    toggle('gallery-section', s.gallery?.enabled !== false);
    toggle('about-section',   s.about?.enabled   !== false);
    toggle('contact-section', s.contact?.enabled !== false);
  }

  /* ── Gallery / Carousel ───────────────────── */
  let slides = [];      // array of slide DOM elements
  let currentSlide = 0;
  let itemsPerSlide = 3;

  function getItemsPerSlide() {
    const w = window.innerWidth;
    if (w <= 440)  return 1;
    if (w <= 920)  return 2;
    return 3;
  }

  function buildCarousel(projects) {
    const track = document.getElementById('carousel-track');
    const dotsEl = document.getElementById('carousel-dots');
    if (!track || !dotsEl) return;

    track.innerHTML = '';
    dotsEl.innerHTML = '';
    slides = [];
    currentSlide = 0;
    itemsPerSlide = getItemsPerSlide();

    const total = projects.length;
    if (total === 0) {
      track.innerHTML = '<div style="padding:4rem;text-align:center;color:var(--tx2)">Nenhum projeto encontrado.</div>';
      return;
    }

    // chunk projects into slides
    for (let i = 0; i < total; i += itemsPerSlide) {
      const chunk = projects.slice(i, i + itemsPerSlide);
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';

      chunk.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'pi';
        item.dataset.cat = proj.category;
        item.innerHTML = `
          <div class="pt">
            <img src="${proj.image}" alt="${proj.title}" loading="lazy">
          </div>
          <div class="pov">
            <span class="ptag">${proj.tag}</span>
            <p class="pname">${proj.title}</p>
          </div>`;
        slide.appendChild(item);
      });

      track.appendChild(slide);
      slides.push(slide);

      // dot
      const dot = document.createElement('button');
      dot.className = 'dot' + (slides.length === 1 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${slides.length}`);
      dot.addEventListener('click', () => goToSlide(slides.length - 1));
      dotsEl.appendChild(dot);
    }

    goToSlide(0, false);
    updateArrows();
  }

  function goToSlide(index, animate = true) {
    if (!slides.length) return;
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    const track = document.getElementById('carousel-track');
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });

    // update dots
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    updateArrows();
  }

  function updateArrows() {
    const prev = document.getElementById('carousel-prev');
    const next = document.getElementById('carousel-next');
    if (prev) prev.disabled = currentSlide === 0;
    if (next) next.disabled = currentSlide >= slides.length - 1;
  }

  /* ── Filter ──────────────────────────────── */
  function filterProjects(btn) {
    const f = btn.dataset.filter;
    if (f === 'about') { setActiveTab(btn); goTo('about-section'); return; }
    if (f === 'contact') { setActiveTab(btn); goTo('contact-section'); return; }

    currentFilter = f;
    setActiveTab(btn);

    // animate out
    const galSection = document.getElementById('gallery-section');
    galSection.classList.add('fading');

    setTimeout(() => {
      const filtered = f === 'all'
        ? ALL_PROJECTS
        : ALL_PROJECTS.filter(p => p.category === f);
      buildCarousel(filtered);
      galSection.classList.remove('fading');
      goTo('gallery-section');
    }, 180);
  }

  function setActiveTab(btn) {
    const f = btn.dataset.filter;
    document.querySelectorAll('.tabs button, .mob-links button')
      .forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  }

  /* ── Scroll helper ───────────────────────── */
  const NAV_H = 64;
  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_H - 10;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ── Init gallery controls ───────────────── */
  function initGallery() {
    buildCarousel(ALL_PROJECTS.length ? ALL_PROJECTS : getEmbeddedProjects());

    document.getElementById('carousel-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('carousel-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Rebuild on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newIps = getItemsPerSlide();
        if (newIps !== itemsPerSlide) {
          const filtered = currentFilter === 'all'
            ? ALL_PROJECTS
            : ALL_PROJECTS.filter(p => p.category === currentFilter);
          buildCarousel(filtered);
        }
      }, 200);
    });

    // Touch swipe
    let touchStartX = 0;
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      carousel.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
      }, { passive: true });
    }
  }

  /* ── Fallback embedded projects ──────────── */
  function getEmbeddedProjects() {
    // Projects are rendered server-side or via data attributes — fallback to empty
    return [];
  }

  /* ── Mobile menu ─────────────────────────── */
  function initMisc() {
    const hbg = document.getElementById('hbgBtn');
    const mob = document.getElementById('mobMenu');
    let mOpen = false;

    hbg?.addEventListener('click', () => {
      mOpen = !mOpen;
      mob?.classList.toggle('open', mOpen);
      hbg.classList.toggle('is-open', mOpen);
    });

    window.mobFilter = function (btn) {
      mOpen = false;
      mob?.classList.remove('open');
      hbg?.classList.remove('is-open');
      const f = btn.dataset.filter;
      const desktop = document.querySelector(`.tabs button[data-filter="${f}"]`);
      if (desktop) filterProjects(desktop);
      else { setActiveTab(btn); setTimeout(() => goTo(f === 'about' ? 'about-section' : 'contact-section'), 80); }
    };

    /* Active tab on scroll */
    const anchors = [
      { id: 'contact-section', f: 'about' },
      { id: 'about-section',   f: 'about' },
      { id: 'gallery-section', f: 'all'   },
    ];
    window.addEventListener('scroll', () => {
      const sy = window.scrollY + NAV_H + 80;
      for (const a of anchors) {
        const el = document.getElementById(a.id);
        if (el && el.offsetTop <= sy) {
          const b = document.querySelector(`.tabs button[data-filter="${a.f}"]`);
          if (b && !b.classList.contains('active')) setActiveTab(b);
          break;
        }
      }
    }, { passive: true });

    /* Back to top */
    const btt = document.getElementById('btt');
    window.addEventListener('scroll', () => btt?.classList.toggle('show', window.scrollY > 500), { passive: true });

    /* Fade in observer */
    const fo = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('vis'), i * 35);
          fo.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.fu').forEach(el => fo.observe(el));

    /* Contact form */
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        handleForm();
      });
    }
  }

  window.handleForm = function () {
    const n = document.getElementById('fname')?.value.trim();
    const e = document.getElementById('femail')?.value.trim();
    const m = document.getElementById('fmsg')?.value.trim();
    if (!n || !e || !m) { alert('Por favor, preencha todos os campos.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { alert('Por favor, insira um e-mail válido.'); return; }
    const subject = encodeURIComponent('Contato via Portfolio — ' + n);
    const body = encodeURIComponent('Nome: ' + n + '\nEmail: ' + e + '\n\n' + m);
    window.location.href = 'mailto:robaraujo3d@gmail.com?subject=' + subject + '&body=' + body;
    const msg = document.getElementById('formMsg');
    if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 6000); }
    ['fname', 'femail', 'fmsg'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  };

  /* ── Kick off ────────────────────────────── */
  loadData();

})();
