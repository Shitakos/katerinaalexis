/* ===================== PARTICLES ===================== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const EMOJIS = ['❤️', '🌹', '✨', '💕', '🌸', '💫'];
  const COLORS = ['rgba(255,107,157,', 'rgba(196,77,255,', 'rgba(255,77,126,', 'rgba(255,215,0,'];

  function mkParticle() {
    const isHeart = Math.random() < 0.18;
    return {
      x: Math.random() * W,
      y: H + 20,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(Math.random() * 1.2 + 0.4),
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.5 + 0.1,
      emoji: isHeart ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
      emojiSize: Math.random() * 14 + 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
    };
  }

  for (let i = 0; i < 80; i++) {
    const p = mkParticle();
    p.y = Math.random() * H; // scatter initial
    particles.push(p);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.twinkle += p.twinkleSpeed;
      p.x += p.vx;
      p.y += p.vy;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      if (p.emoji) {
        ctx.globalAlpha = a;
        ctx.font = `${p.emojiSize}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + a + ')';
        ctx.fill();
      }
      if (p.y < -30 || p.x < -30 || p.x > W + 30) {
        particles[i] = mkParticle();
      }
    });
    if (particles.length < 100 && Math.random() < 0.3) particles.push(mkParticle());
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===================== PASSWORD ===================== */
window.addEventListener('DOMContentLoaded', function () {
  const PASSWORD = '1122024';
  const loginEl = document.getElementById('login');
  const contentEl = document.getElementById('content');
  const errorEl = document.getElementById('login-error');
  const pwInput = document.getElementById('password');

  document.getElementById('login-btn').addEventListener('click', checkPw);
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkPw(); });

  function checkPw() {
    if (pwInput.value === PASSWORD) {
      loginEl.style.transition = 'opacity 0.6s, transform 0.6s';
      loginEl.style.opacity = '0';
      loginEl.style.transform = 'scale(0.96)';
      setTimeout(() => {
        loginEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        buildGallery();
        startCounter();
      }, 600);
    } else {
      errorEl.textContent = '✦ Wrong password, love ✦';
      pwInput.style.borderColor = 'rgba(255,77,126,0.7)';
      pwInput.value = '';
      setTimeout(() => {
        errorEl.textContent = '';
        pwInput.style.borderColor = '';
      }, 2500);
    }
  }

  /* ===================== ANNIVERSARY COUNTER ===================== */
  function startCounter() {
    // Date: Dec 1 2024
    const start = new Date('2024-12-01T00:00:00');
    function update() {
      const now = new Date();
      const diff = now - start;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      document.getElementById('cnt-days').textContent = days;
      document.getElementById('cnt-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('cnt-mins').textContent = String(mins).padStart(2, '0');
      document.getElementById('cnt-secs').textContent = String(secs).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
  }

  /* ===================== GALLERY ===================== */
  const TOTAL = 37;
  let lightboxIdx = 0;

  function buildGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    for (let i = 1; i <= TOTAL; i++) {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.idx = i - 1;

      const img = document.createElement('img');
      img.src = `images/${i}.jpg`;
      img.alt = `Memory ${i}`;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.innerHTML = '<span>🔍</span>';

      card.appendChild(img);
      card.appendChild(overlay);
      card.addEventListener('click', () => openLightbox(i - 1));
      gallery.appendChild(card);
    }

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.card').forEach(c => obs.observe(c));
  }

  /* ===================== LIGHTBOX ===================== */
  function openLightbox(idx) {
    lightboxIdx = idx;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lb-img');
    img.src = `images/${lightboxIdx + 1}.jpg`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });

  document.getElementById('lb-prev').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx - 1 + TOTAL) % TOTAL;
    document.getElementById('lb-img').src = `images/${lightboxIdx + 1}.jpg`;
  });

  document.getElementById('lb-next').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx + 1) % TOTAL;
    document.getElementById('lb-img').src = `images/${lightboxIdx + 1}.jpg`;
  });

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lightboxIdx = (lightboxIdx - 1 + TOTAL) % TOTAL; document.getElementById('lb-img').src = `images/${lightboxIdx + 1}.jpg`; }
    if (e.key === 'ArrowRight') { lightboxIdx = (lightboxIdx + 1) % TOTAL; document.getElementById('lb-img').src = `images/${lightboxIdx + 1}.jpg`; }
  });

  /* ===================== MUSIC ===================== */
  const audios = document.querySelectorAll('audio');
  const trackBtns = document.querySelectorAll('.track-btn');
  const visualizer = document.querySelector('.player-visualizer');
  let musicStarted = false;

  function playSong(idx) {
    audios.forEach((a, i) => { a.pause(); a.currentTime = 0; trackBtns[i].classList.remove('active'); });
    audios[idx].play().catch(() => { });
    trackBtns[idx].classList.add('active');
    visualizer.classList.add('playing');
  }

  trackBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => { playSong(i); musicStarted = true; });
  });

  audios.forEach(a => {
    a.addEventListener('ended', () => { visualizer.classList.remove('playing'); });
  });

  function startMusicOnInteraction() {
    if (!musicStarted) {
      playSong(2);
      musicStarted = true;
      window.removeEventListener('click', startMusicOnInteraction);
      window.removeEventListener('touchstart', startMusicOnInteraction);
    }
  }

  window.addEventListener('click', startMusicOnInteraction);
  window.addEventListener('touchstart', startMusicOnInteraction);
});
