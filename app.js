/* ============================================================
   GITHUB CONFIG — fill these in, then push to GitHub
   ============================================================
   1. Go to github.com → Settings → Developer settings
      → Fine-grained tokens → Generate new token
   2. Set: Repository access = only katerinaalexis-main
      Permissions → Contents: Read and Write
   3. Paste the token below (keep the quotes)
   ============================================================ */
const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'Shitakos';
const GITHUB_REPO = 'katerinaalexis';
const GITHUB_BRANCH = 'main';

const GH_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/images`;
const GH_HDR = () => ({ Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' });

/* ===================== PARTICLES ===================== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const EMOJIS = ['❤️', '🌹', '✨', '💕', '🌸', '💫'];
  const COLORS = ['rgba(255,107,157,', 'rgba(196,77,255,', 'rgba(255,77,126,', 'rgba(255,215,0,'];
  function mkP() {
    const isE = Math.random() < 0.18;
    return {
      x: Math.random() * W, y: H + 20, vx: (Math.random() - 0.5) * 0.6, vy: -(Math.random() * 1.2 + 0.4),
      size: Math.random() * 3 + 1, alpha: Math.random() * 0.5 + 0.1,
      emoji: isE ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
      emojiSize: Math.random() * 14 + 10, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tw: Math.random() * Math.PI * 2, twS: Math.random() * 0.04 + 0.01
    };
  }
  for (let i = 0; i < 80; i++) { const p = mkP(); p.y = Math.random() * H; particles.push(p); }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.tw += p.twS; p.x += p.vx; p.y += p.vy;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.tw));
      if (p.emoji) { ctx.globalAlpha = a; ctx.font = `${p.emojiSize}px serif`; ctx.fillText(p.emoji, p.x, p.y); ctx.globalAlpha = 1; }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color + a + ')'; ctx.fill(); }
      if (p.y < -30 || p.x < -30 || p.x > W + 30) particles[i] = mkP();
    });
    if (particles.length < 100 && Math.random() < 0.3) particles.push(mkP());
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===================== APP ===================== */
window.addEventListener('DOMContentLoaded', function () {
  const PASSWORD = '1122024';
  const loginEl = document.getElementById('login');
  const contentEl = document.getElementById('content');
  const errorEl = document.getElementById('login-error');
  const pwInput = document.getElementById('password');

  let galleryImages = []; // { url, filename, sha }
  let lightboxIdx = 0;
  let manageMode = false;
  let musicStarted = false;

  /* ---- LOGIN ---- */
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
        document.getElementById('fab-group').classList.remove('hidden');
        buildGallery();
        startCounter();
        setupMusic();
      }, 600);
    } else {
      errorEl.textContent = '✦ Wrong password, love ✦';
      pwInput.style.borderColor = 'rgba(255,77,126,0.7)';
      pwInput.value = '';
      setTimeout(() => { errorEl.textContent = ''; pwInput.style.borderColor = ''; }, 2500);
    }
  }

  /* ---- COUNTER ---- */
  function startCounter() {
    const start = new Date('2024-12-01T00:00:00');
    function update() {
      const diff = Date.now() - start;
      document.getElementById('cnt-days').textContent = Math.floor(diff / 86400000);
      document.getElementById('cnt-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
      document.getElementById('cnt-mins').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      document.getElementById('cnt-secs').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }
    update(); setInterval(update, 1000);
  }

  /* ---- GITHUB API ---- */
  async function fetchGitHubImages() {
    try {
      const res = await fetch(GH_BASE, { headers: GH_HDR() });
      if (!res.ok) throw new Error('API error ' + res.status);
      const files = await res.json();
      return files
        .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map(f => ({ url: f.download_url, filename: f.name, sha: f.sha }));
    } catch (e) {
      console.error('GitHub fetch error:', e);
      return [];
    }
  }

  async function uploadToGitHub(file, onPct) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const b64 = e.target.result.split(',')[1];
        const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
        const name = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        onPct && onPct(20);
        try {
          const res = await fetch(`${GH_BASE}/${name}`, {
            method: 'PUT', headers: GH_HDR(),
            body: JSON.stringify({ message: `💕 Add ${name}`, content: b64, branch: GITHUB_BRANCH })
          });
          onPct && onPct(100);
          if (!res.ok) { reject(new Error('Upload failed')); return; }
          const d = await res.json();
          resolve({ url: d.content.download_url, filename: d.content.name, sha: d.content.sha });
        } catch (err) { reject(err); }
      };
      reader.readAsDataURL(file);
    });
  }

  async function deleteFromGitHub(filename, sha) {
    const res = await fetch(`${GH_BASE}/${filename}`, {
      method: 'DELETE', headers: GH_HDR(),
      body: JSON.stringify({ message: `🗑️ Remove ${filename}`, sha, branch: GITHUB_BRANCH })
    });
    return res.ok;
  }

  /* ---- GALLERY ---- */
  async function buildGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '<div class="gallery-loading">Loading memories 💕</div>';
    galleryImages = await fetchGitHubImages();
    gallery.innerHTML = '';
    galleryImages.forEach((img, i) => gallery.appendChild(createCard(img, i)));
    setupScrollReveal();
  }

  function createCard(imgData, idx) {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = imgData.url; img.alt = imgData.filename; img.loading = 'lazy';
    const viewOv = document.createElement('div');
    viewOv.className = 'card-overlay'; viewOv.innerHTML = '<span>🔍</span>';
    const delBtn = document.createElement('button');
    delBtn.className = 'card-delete-btn'; delBtn.innerHTML = '✕'; delBtn.title = 'Delete photo';
    delBtn.addEventListener('click', e => { e.stopPropagation(); confirmDelete(imgData, card, idx); });
    card.appendChild(img); card.appendChild(viewOv); card.appendChild(delBtn);
    card.addEventListener('click', () => { if (!manageMode) openLightbox(idx); });
    return card;
  }

  function setupScrollReveal() {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.card').forEach(c => obs.observe(c));
  }

  /* ---- LIGHTBOX ---- */
  function openLightbox(idx) {
    lightboxIdx = idx;
    document.getElementById('lb-img').src = galleryImages[idx].url;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });
  document.getElementById('lb-prev').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('lb-img').src = galleryImages[lightboxIdx].url;
  });
  document.getElementById('lb-next').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx + 1) % galleryImages.length;
    document.getElementById('lb-img').src = galleryImages[lightboxIdx].url;
  });
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lightboxIdx = (lightboxIdx - 1 + galleryImages.length) % galleryImages.length; document.getElementById('lb-img').src = galleryImages[lightboxIdx].url; }
    if (e.key === 'ArrowRight') { lightboxIdx = (lightboxIdx + 1) % galleryImages.length; document.getElementById('lb-img').src = galleryImages[lightboxIdx].url; }
  });

  /* ---- MANAGE MODE ---- */
  document.getElementById('fab-manage').addEventListener('click', () => {
    manageMode = !manageMode;
    document.getElementById('gallery').classList.toggle('manage-mode', manageMode);
    const btn = document.getElementById('fab-manage');
    btn.classList.toggle('active', manageMode);
    btn.title = manageMode ? 'Exit manage mode' : 'Manage photos';
  });

  /* ---- DELETE ---- */
  function confirmDelete(imgData, card, idx) {
    const modal = document.getElementById('delete-modal');
    document.getElementById('delete-filename').textContent = imgData.filename;
    modal.classList.add('open');

    const yes = document.getElementById('delete-yes');
    const no = document.getElementById('delete-no');
    function close() { modal.classList.remove('open'); }

    const yesClone = yes.cloneNode(true); yes.replaceWith(yesClone);
    const noClone = no.cloneNode(true); no.replaceWith(noClone);

    document.getElementById('delete-yes').addEventListener('click', async () => {
      const btn = document.getElementById('delete-yes');
      btn.textContent = 'Deleting…'; btn.disabled = true;
      const ok = await deleteFromGitHub(imgData.filename, imgData.sha);
      if (ok) {
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        card.style.opacity = '0'; card.style.transform = 'scale(0.8)';
        setTimeout(() => { card.remove(); galleryImages.splice(idx, 1); }, 400);
        close();
      } else {
        btn.textContent = '✗ Error'; btn.disabled = false;
      }
    });
    document.getElementById('delete-no').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }

  /* ---- UPLOAD ---- */
  let selectedFiles = [];

  document.getElementById('fab-upload').addEventListener('click', () => {
    document.getElementById('upload-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    resetUpload();
  });
  function closeUpload() {
    document.getElementById('upload-modal').classList.remove('open');
    document.body.style.overflow = '';
    resetUpload();
  }
  function resetUpload() {
    selectedFiles = [];
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('upload-status').textContent = '';
    document.getElementById('upload-input').value = '';
    const btn = document.getElementById('upload-submit');
    btn.textContent = 'Upload to Our Gallery ✦'; btn.disabled = false;
  }
  document.getElementById('upload-close').addEventListener('click', closeUpload);
  document.getElementById('upload-modal').addEventListener('click', e => { if (e.target === document.getElementById('upload-modal')) closeUpload(); });

  const dropZone = document.getElementById('upload-drop');
  const fileInput = document.getElementById('upload-input');
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
  });
  fileInput.addEventListener('change', () => handleFiles(Array.from(fileInput.files)));

  function handleFiles(files) {
    selectedFiles = files;
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = '';
    files.forEach((file, i) => {
      const item = document.createElement('div');
      item.className = 'upload-preview-item'; item.id = `upitem-${i}`;
      const thumb = document.createElement('img');
      thumb.src = URL.createObjectURL(file); thumb.alt = file.name;
      const info = document.createElement('div'); info.className = 'upload-preview-info';
      info.innerHTML = `<span class="up-name">${file.name}</span>
        <div class="up-bar"><div class="up-fill" id="upfill-${i}"></div></div>
        <span class="up-status" id="upstat-${i}">Ready</span>`;
      item.appendChild(thumb); item.appendChild(info);
      preview.appendChild(item);
    });
  }

  document.getElementById('upload-submit').addEventListener('click', async () => {
    if (!selectedFiles.length) { document.getElementById('upload-status').textContent = 'Pick at least one photo first.'; return; }
    const btn = document.getElementById('upload-submit');
    btn.disabled = true; btn.textContent = 'Uploading…';
    let ok = 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      const fill = document.getElementById(`upfill-${i}`);
      const stat = document.getElementById(`upstat-${i}`);
      if (stat) stat.textContent = 'Uploading…';
      try {
        const imgData = await uploadToGitHub(selectedFiles[i], pct => { if (fill) fill.style.width = pct + '%'; });
        if (fill) fill.style.width = '100%';
        if (stat) { stat.textContent = '✓ Done'; stat.style.color = '#7dffb3'; }
        galleryImages.push(imgData);
        const card = createCard(imgData, galleryImages.length - 1);
        document.getElementById('gallery').appendChild(card);
        setTimeout(() => card.classList.add('visible'), 50);
        ok++;
      } catch (err) {
        if (fill) fill.style.background = '#ff4d7e';
        if (stat) { stat.textContent = '✗ Failed'; stat.style.color = '#ff4d7e'; }
      }
    }
    btn.textContent = `Done! ${ok}/${selectedFiles.length} uploaded ✦`;
    document.getElementById('upload-status').textContent =
      ok === selectedFiles.length ? '💕 Added! Vercel will redeploy in ~1 min.' : '⚠️ Some failed — check your GitHub token.';
    setTimeout(closeUpload, 3500);
  });

  /* ---- MUSIC ---- */
  function setupMusic() {
    const audios = document.querySelectorAll('audio');
    const trackBtns = document.querySelectorAll('.track-btn');
    const visualizer = document.querySelector('.player-visualizer');

    function playSong(idx) {
      audios.forEach((a, i) => { a.pause(); a.currentTime = 0; trackBtns[i].classList.remove('active'); });
      audios[idx].play().catch(() => { });
      trackBtns[idx].classList.add('active');
      visualizer.classList.add('playing');
    }
    audios.forEach(a => a.addEventListener('ended', () => visualizer.classList.remove('playing')));
    trackBtns.forEach((btn, i) => btn.addEventListener('click', () => { playSong(i); musicStarted = true; }));

    function startOnInteraction() {
      if (!musicStarted) { playSong(2); musicStarted = true; window.removeEventListener('click', startOnInteraction); window.removeEventListener('touchstart', startOnInteraction); }
    }
    window.addEventListener('click', startOnInteraction);
    window.addEventListener('touchstart', startOnInteraction);
  }
});
