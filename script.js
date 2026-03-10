/* ═══════════════════════════════════════════════════════════════════════
   script.js — Alex Nova Portfolio
   Handles: Particles · Scroll Reveals · Nav · Skill Bars
            Project Flip · Contact Form · Visitor Counter · Back-to-top
═══════════════════════════════════════════════════════════════════════ */

/* ── 1. PARTICLE SYSTEM ─────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  // Palette of soft neon colours
  const COLORS = ['#a78bfa', '#38bdf8', '#f472b6', '#2dd4bf', '#fbbf24'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = rand(0, W);
      this.y  = init ? rand(0, H) : H + 10;
      this.r  = rand(1, 2.8);
      this.vx = rand(-0.3, 0.3);
      this.vy = rand(-0.4, -1.2);
      this.alpha = rand(0.3, 0.9);
      this.color = COLORS[Math.floor(rand(0, COLORS.length))];
      this.life  = 0;
      this.maxLife = rand(180, 400);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      // Fade in/out
      const progress = this.life / this.maxLife;
      this.currentAlpha = this.alpha * Math.sin(progress * Math.PI);
      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.currentAlpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnParticles(count) {
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  spawnParticles(120);
  loop();
})();


/* ── 2. NAVBAR: scroll-state & mobile toggle ────────────────────────── */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const menuBtn   = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll → add `.scrolled`
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    toggleBackTop();
  }, { passive: true });

  // Mobile menu toggle
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    menuBtn.innerHTML = isOpen
      ? '<i class="ph ph-x"></i>'
      : '<i class="ph ph-list"></i>';
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.innerHTML = '<i class="ph ph-list"></i>';
    });
  });
})();


/* ── 3. BACK TO TOP ──────────────────────────────────────────────────── */
const backTopBtn = document.getElementById('backTop');

function toggleBackTop() {
  backTopBtn.classList.toggle('visible', window.scrollY > 300);
}


/* ── 4. SCROLL REVEAL (IntersectionObserver) ────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ── 5. SKILL BARS — animate width when in view ─────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.getAttribute('data-width');
        // Small delay so card reveal and bar both feel staggered
        setTimeout(() => { bar.style.width = width + '%'; }, 300);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ── 6. HERO PARALLAX (subtle mouse-follow on orbs) ────────────────── */
(function initParallax() {
  const orbs = document.querySelectorAll('.orb');

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;  // -1 … 1
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  }, { passive: true });
})();


/* ── 7. CONTACT FORM — validate, store, animate ─────────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const successEl  = document.getElementById('formSuccess');
  const resetBtn   = document.getElementById('resetFormBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      shakeForm(form);
      return;
    }
    if (!isValidEmail(email)) {
      shakeField(document.getElementById('femail'));
      return;
    }

    // Save to localStorage
    const submissions = JSON.parse(localStorage.getItem('portfolio_contacts') || '[]');
    submissions.push({
      name, email,
      social  : form.social.value.trim(),
      message,
      ts      : new Date().toISOString()
    });
    localStorage.setItem('portfolio_contacts', JSON.stringify(submissions));

    // Show success
    successEl.classList.add('visible');
    form.reset();
  });

  // Reset → back to form
  resetBtn.addEventListener('click', () => {
    successEl.classList.remove('visible');
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
  }

  function shakeField(el) {
    el.style.borderColor = '#f87171';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 1500);
  }
})();


/* ── 8. VISITOR COUNTER ──────────────────────────────────────────────── */
(function initVisitorCounter() {
  const countEl = document.getElementById('visitorCount');
  if (!countEl) return;

  // Increment only once per session
  const SESSION_KEY = 'portfolio_visited_this_session';
  const COUNT_KEY   = 'portfolio_visitor_count';

  let count = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);

  if (!sessionStorage.getItem(SESSION_KEY)) {
    count++;
    localStorage.setItem(COUNT_KEY, count);
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  // Animated count-up
  animateCount(countEl, 0, count, 1800);
})();

/**
 * Smooth number count-up animation
 * @param {HTMLElement} el  - target element
 * @param {number}      from
 * @param {number}      to
 * @param {number}      dur - duration ms
 */
function animateCount(el, from, to, dur) {
  const start = performance.now();
  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / dur, 1);
    // Ease-out quad
    const eased = 1 - (1 - progress) ** 2;
    el.textContent = Math.floor(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = to;
  }
  requestAnimationFrame(step);
}


/* ── 9. SMOOTH SCROLL for anchor links (fallback for older browsers) ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = document.getElementById('navbar').offsetHeight;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 10. BUTTON RIPPLE EFFECT ────────────────────────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    Object.assign(ripple.style, {
      position   : 'absolute',
      width      : size + 'px',
      height     : size + 'px',
      left       : x + 'px',
      top        : y + 'px',
      borderRadius: '50%',
      background : 'rgba(255,255,255,0.25)',
      transform  : 'scale(0)',
      animation  : 'rippleAnim 0.55s ease-out forwards',
      pointerEvents: 'none'
    });

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* Inject ripple keyframe once */
(function addRippleStyle() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
    @keyframes shake {
      0%,100%{ transform: translateX(0) }
      20%    { transform: translateX(-8px) }
      40%    { transform: translateX(8px) }
      60%    { transform: translateX(-5px) }
      80%    { transform: translateX(5px) }
    }
    .shake { animation: shake 0.55s ease; }
  `;
  document.head.appendChild(s);
})();


/* ── 11. ACTIVE NAV LINK HIGHLIGHT on scroll ─────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const navH      = 80;

  function setActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH - 20) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + current
        ? 'rgba(255,255,255,0.95)'
        : '';
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();


/* ── 12. GLASS REFLECTION MOUSE EFFECT on cards ─────────────────────── */
(function initGlassReflection() {
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = ((e.clientX - rect.left) / rect.width)  * 100;
      const y     = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
      // subtle 3-D tilt
      const tiltX = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      const tiltY = ((e.clientX - rect.left) / rect.width  - 0.5) * -8;
      card.style.transform = `translateY(-4px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
