// ─── CalvinBot API endpoint ───
const CALVINBOT_API = 'https://calvinbot-api.joycalvin1604.workers.dev';

document.addEventListener('DOMContentLoaded', () => {

  // ——— Scroll Reveal (IntersectionObserver) ———
  // Must be initialized before navigateTo() references it (TDZ-safe)
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
  }

  // ——— Hash Routing ———
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');

  function navigateTo(hash) {
    const targetId = hash.replace('#', '') || 'home';
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
      target.querySelectorAll('[data-reveal]').forEach(el => {
        el.classList.remove('visible');
        if (observer) observer.observe(el);
      });
    }
    navLinks.forEach(a => a.classList.remove('active'));
    const match = document.querySelector(`.nav-link[data-section="${targetId}"]`);
    if (match) match.classList.add('active');
  }

  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const hash = a.getAttribute('href');
      history.pushState(null, '', hash);
      navigateTo(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  window.addEventListener('popstate', () => navigateTo(location.hash || '#home'));
  navigateTo(location.hash || '#home');

  // ─── Project Filter ───
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ─── Hero Parallax ───
  const heroTitle = document.querySelector('[data-hero-parallax]');
  if (heroTitle) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      heroTitle.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // ─── Particle Canvas ───
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  const MOUSE_RADIUS = 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update(mouseX, mouseY) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      if (mouseX !== undefined && mouseY !== undefined) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.08;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
      ctx.fill();
    }
  }

  let mouseX, mouseY;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function initParticles() {
    resize();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function connectParticles() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update(mouseX, mouseY);
      p.draw();
    });
    connectParticles();
    animId = requestAnimationFrame(animate);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { initParticles(); }, 200);
  });

  initParticles();
  animate();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animId);
    canvas.style.display = 'none';
  }

  // ─── CBot Widget ───
  (function initCBot() {
    const btn = document.getElementById('calvinbot-btn');
    const panel = document.getElementById('calvinbot-panel');
    const closeBtn = document.getElementById('calvinbot-close');
    const form = document.getElementById('calvinbot-form');
    const input = document.getElementById('calvinbot-input');
    const sendBtn = document.getElementById('calvinbot-send');
    const messages = document.getElementById('calvinbot-messages');
    let isOpen = false;

    function toggle() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
      if (isOpen) input.focus();
    }

    function close() { if (isOpen) toggle(); }

    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    closeBtn.addEventListener('click', close);

    function addMessage(text, type) {
      const div = document.createElement('div');
      div.className = `cb-msg cb-msg--${type}`;
      const inner = document.createElement('div');
      inner.className = 'cb-msg-content';
      inner.textContent = text;
      div.appendChild(inner);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'cb-msg cb-msg--bot cb-msg--typing';
      div.id = 'cb-typing';
      const inner = document.createElement('div');
      inner.className = 'cb-msg-content';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'cb-typing-dot';
        inner.appendChild(dot);
      }
      div.appendChild(inner);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const el = document.getElementById('cb-typing');
      if (el) el.remove();
    }

    async function handleSubmit(e) {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      addMessage(q, 'user');
      input.value = '';
      sendBtn.disabled = true;
      showTyping();
      try {
        const res = await fetch(CALVINBOT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        });
        removeTyping();
        const data = await res.json();
        addMessage(data.answer || 'No response received.', 'bot');
      } catch (err) {
        removeTyping();
        addMessage('Connection error. Please try again.', 'error');
      } finally {
        sendBtn.disabled = false;
      }
    }

    form.addEventListener('submit', handleSubmit);
  })();
});
