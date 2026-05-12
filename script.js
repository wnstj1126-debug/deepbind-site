/* ================================================
   Deepbind · script.js · v2.1
   ================================================ */
(function () {
  'use strict';

  /* ── 1. Header scroll ── */
  const header = document.querySelector('.site-header');
  if (header) {
    const tick = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── 2. Hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ── 3. Scroll fade-up ── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.10, rootMargin: '0px 0px -36px 0px' }
    );
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── 4. KPI count-up ── */
  function runCountUp(el) {
    const raw     = el.dataset.target || '0';
    const suffix  = el.dataset.suffix  || '';
    const prefix  = el.dataset.prefix  || '';
    const decimals= parseInt(el.dataset.decimals || '0', 10);
    const target  = parseFloat(raw);
    const dur     = 1900;
    const start   = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3); // ease out cubic
      el.textContent = prefix + (e * target).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const kpiEls = document.querySelectorAll('.kpi-val[data-target]');
  if (kpiEls.length && 'IntersectionObserver' in window) {
    const kio = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { runCountUp(e.target); kio.unobserve(e.target); }
      }),
      { threshold: 0.4 }
    );
    kpiEls.forEach(el => kio.observe(el));
  }

  /* ── 5. Hero canvas (node-link network) ── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const NODE_N = 38, CONN_DIST = 155;
    let W, H, nodes, raf;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    function initNodes() {
      nodes = Array.from({ length: NODE_N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .38,
        vy: (Math.random() - .5) * .38,
        r:  Math.random() * 1.8 + 1.1,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CONN_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(31,184,245,${(1 - d/CONN_DIST) * .26})`;
            ctx.lineWidth = .8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(31,184,245,.52)';
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas.parentElement || document.body);
    resize();
    initNodes();
    draw();

    // Pause when not visible (tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ── 6. Donut chart animation ── */
  const donut = document.getElementById('donut-applied');
  if (donut && 'IntersectionObserver' in window) {
    const dio = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        donut.style.strokeDashoffset = '-502';
        dio.disconnect();
      }
    }, { threshold: .3 });
    dio.observe(donut.closest('svg') || donut);
  }

  /* ── 7. Arch SVG tooltip ── */
  document.querySelectorAll('.arch-node[aria-label]').forEach(node => {
    node.addEventListener('mouseenter', () => {
      const label = node.getAttribute('aria-label');
      node.setAttribute('data-tip', label);
    });
  });

  /* ── 8. Lazy load images ── */
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if (lazyImgs.length) {
    if ('loading' in HTMLImageElement.prototype) {
      lazyImgs.forEach(img => { img.src = img.dataset.src; });
    } else if ('IntersectionObserver' in window) {
      const lio = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.src = e.target.dataset.src; lio.unobserve(e.target); }
        });
      });
      lazyImgs.forEach(img => lio.observe(img));
    }
  }

  /* ── 9. Smooth page reveal ── */
  document.documentElement.style.opacity = '0';
  window.addEventListener('load', () => {
    document.documentElement.style.transition = 'opacity .32s ease';
    document.documentElement.style.opacity    = '1';
  });

})();
