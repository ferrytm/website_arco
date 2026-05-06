/* ================================================
   HKBP ARCO — Main Application
   Single-Page App with hash routing
   ================================================ */

(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const el = (tag, attrs = {}, ...children) => {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'innerHTML') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return { day: d.getDate(), month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() };
  };

  const formatCurrency = (num) => 'Rp ' + num.toLocaleString('id-ID');

  // Placeholder image generator (colored SVG via data URI)
  const placeholderImg = (text, hue = 220) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue},60%,25%)"/>
        <stop offset="100%" style="stop-color:hsl(${hue + 30},50%,40%)"/>
      </linearGradient></defs>
      <rect width="600" height="400" fill="url(#g)"/>
      <text x="300" y="185" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="18" fill="rgba(255,255,255,0.5)">📷</text>
      <text x="300" y="220" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">${text}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  };

  /* ---------- DOM references ---------- */
  const mainContent = $('#main-content');
  const navLinksContainer = $('#nav-links');
  const navActions = $('#nav-actions');
  const navToggle = $('#nav-toggle');
  const navbar = $('#navbar');
  const footer = $('#footer');
  const scrollTopBtn = $('#scroll-top');

  /* ---------- Toast System ---------- */
  let toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  function showToast(message, type = 'info') {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const t = el('div', { className: `toast ${type}` });
    t.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  /* ---------- Modal System ---------- */
  function openModal(title, bodyHTML, footerHTML) {
    let overlay = $('#modal-overlay');
    if (!overlay) {
      overlay = el('div', { className: 'modal-overlay', id: 'modal-overlay' });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>`;
    // Trigger reflow then activate
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.id === 'modal-close-btn') closeModal();
    });
  }

  function closeModal() {
    const overlay = $('#modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  /* ---------- Login Modal ---------- */
  function showLoginModal() {
    const body = `
      <form id="login-form">
        <div class="form-group">
          <label for="login-username">Username</label>
          <input type="text" id="login-username" class="form-control" placeholder="Masukkan username" autocomplete="username">
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" class="form-control" placeholder="Masukkan password" autocomplete="current-password">
        </div>
        <p id="login-error" style="color:var(--danger);font-size:var(--text-sm);display:none;margin-bottom:var(--space-md)"></p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Masuk</button>
      </form>
      <div style="margin-top:var(--space-lg);padding-top:var(--space-lg);border-top:1px solid var(--border-light)">
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-sm)">Akun demo untuk testing:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xs);font-size:var(--text-xs);color:var(--text-secondary)">
          <span>admin / admin123</span>
          <span>pendeta / pendeta123</span>
          <span>bendahara / bendahara123</span>
          <span>sekretaris / sekretaris123</span>
          <span>kontributor / kontributor123</span>
          <span>jemaat / jemaat123</span>
        </div>
      </div>`;
    openModal('Masuk ke Akun', body);

    // Wait for DOM
    requestAnimationFrame(() => {
      const form = $('#login-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = $('#login-username').value.trim();
          const password = $('#login-password').value;
          const submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Memproses...';
          const result = await Auth.login(username, password);
          if (result.success) {
            closeModal();
            updateNavUI();
            showToast(`Selamat datang, ${result.user.name}!`, 'success');
            navigateTo(currentPage);
          } else {
            const err = $('#login-error');
            err.textContent = result.message;
            err.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Masuk';
          }
        });
      }
    });
  }

  /* ---------- Navigation UI ---------- */
  function updateNavUI() {
    const user = Auth.getCurrentUser();

    // Remove previously injected dashboard link
    const existingDashLink = $('a[data-page="dashboard"]', navLinksContainer);
    if (existingDashLink) existingDashLink.remove();

    if (user) {
      // Inject dashboard nav link if user has dashboard access
      if (Auth.canAccessDashboard()) {
        const dashLink = document.createElement('a');
        dashLink.href = '#dashboard';
        dashLink.dataset.page = 'dashboard';
        dashLink.textContent = 'Dashboard';
        dashLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = '#dashboard';
          navigateTo('dashboard');
        });
        // Insert before the last link (Hubungi Kami)
        const lastLink = navLinksContainer.lastElementChild;
        navLinksContainer.insertBefore(dashLink, lastLink);
      }

      navActions.innerHTML = `
        <div class="nav-user">
          <div class="avatar">${user.initial}</div>
          <span>${user.name.split(' ').pop()}</span>
        </div>
        <button class="btn btn-sm btn-secondary" id="btn-logout">Keluar</button>`;
      $('#btn-logout').addEventListener('click', () => {
        Auth.logout();
        updateNavUI();
        showToast('Anda telah keluar.', 'info');
        navigateTo('beranda');
      });
    } else {
      navActions.innerHTML = `<button class="btn btn-sm btn-primary" id="btn-login">Masuk</button>`;
      $('#btn-login').addEventListener('click', showLoginModal);
    }
  }

  /* ---------- Routing ---------- */
  let currentPage = 'beranda';
  let currentDetail = null;

  function navigateTo(page, detail = null) {
    currentPage = page;
    currentDetail = detail;

    // Update nav active link
    $$('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    // Close mobile menu
    navLinksContainer.classList.remove('open');
    navToggle.classList.remove('active');

    // Page transition
    mainContent.style.opacity = '0';
    setTimeout(() => {
      renderPage(page, detail);
      mainContent.style.opacity = '1';
      // Scroll to top unless it's the beranda hero
      if (page !== 'beranda') window.scrollTo({ top: 0, behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      // Init scroll reveals
      initScrollReveal();
    }, 150);

    // Toggle footer visibility
    footer.style.display = page === 'login' ? 'none' : '';
  }

  function renderPage(page, detail) {
    const renderers = {
      beranda: renderBeranda,
      warta: renderWarta,
      khotbah: renderKhotbah,
      renungan: renderRenungan,
      jadwal: renderJadwal,
      dokumentasi: renderDokumentasi,
      blog: renderBlog,
      keuangan: renderKeuangan,
      kontak: renderKontak,
      dashboard: renderDashboard,
    };

    const renderer = renderers[page];
    if (renderer) {
      renderer(detail);
    } else {
      mainContent.innerHTML = `<div class="page-content container"><div class="empty-state"><div class="icon">🔍</div><h3>Halaman tidak ditemukan</h3><p>Halaman yang Anda cari tidak tersedia.</p><a href="#beranda" class="btn btn-primary">Kembali ke Beranda</a></div></div>`;
    }
  }

  /* ============================================
     PAGE: BERANDA (Home)
     ============================================ */
  function renderBeranda() {
    const latestKhotbah = AppData.khotbah[0];
    const latestRenungan = AppData.renungan[0];
    const upcomingEvents = AppData.jadwal.filter(j => !j.rutin).slice(0, 3);
    const rutinEvents = AppData.jadwal.filter(j => j.rutin).slice(0, 4);

    mainContent.innerHTML = `
      <!-- HERO -->
      <section class="hero" id="hero-section">
        <div class="hero-particles" id="hero-particles"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-badge">✦ Selamat Datang di HKBP ARCO</div>
            <h1>Bertumbuh dalam <span class="highlight">Iman, Kasih</span> dan Pengharapan</h1>
            <p>Bergabunglah bersama kami dalam persekutuan yang penuh kasih. Bersama kita melayani Tuhan dan sesama dengan sukacita.</p>
            <div class="hero-actions">
              <a href="#jadwal" class="btn btn-accent btn-lg">Jadwal Ibadah</a>
              <a href="#khotbah" class="btn btn-secondary btn-lg" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white">Khotbah Terbaru</a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-logo">
              <div class="hero-logo-ring"></div>
              <img src="assets/img/logo_hkbp.png" alt="Logo HKBP ARCO">
            </div>
          </div>
        </div>
      </section>

      <!-- STATS -->
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="stats-bar">
            <div class="glass-card stat-card reveal">
              <div class="stat-icon">⛪</div>
              <div class="stat-value">15+</div>
              <div class="stat-label">Tahun Melayani</div>
            </div>
            <div class="glass-card stat-card reveal">
              <div class="stat-icon">👥</div>
              <div class="stat-value">500+</div>
              <div class="stat-label">Jemaat Aktif</div>
            </div>
            <div class="glass-card stat-card reveal">
              <div class="stat-icon">🎵</div>
              <div class="stat-value">10</div>
              <div class="stat-label">Kegiatan Rutin / Minggu</div>
            </div>
            <div class="glass-card stat-card reveal">
              <div class="stat-icon">🤝</div>
              <div class="stat-value">50+</div>
              <div class="stat-label">Pelayan Aktif</div>
            </div>
          </div>
        </div>
      </section>

      <!-- RENUNGAN HARI INI -->
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-header reveal">
            <h2>Renungan Hari Ini</h2>
            <p>Mulai hari dengan firman Tuhan yang menguatkan</p>
            <div class="accent-line"></div>
          </div>
          <div class="renungan-today reveal" style="cursor:pointer" id="renungan-today-card">
            <span class="verse-ref">📖 ${latestRenungan.ayat}</span>
            <p class="verse-text">${latestRenungan.teksAyat}</p>
            <h3>${latestRenungan.judul}</h3>
            <p class="body-text">${latestRenungan.isi.substring(0, 200)}...</p>
            <div style="margin-top:var(--space-lg);display:flex;align-items:center;gap:var(--space-md)">
              <span style="font-size:var(--text-sm);opacity:0.7">— ${latestRenungan.penulis}</span>
              <span style="margin-left:auto;font-size:var(--text-sm);background:rgba(255,255,255,0.15);padding:6px 16px;border-radius:var(--radius-full)">Baca Selengkapnya →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- KHOTBAH TERBARU -->
      <section class="section" style="background:var(--primary-50);padding-bottom:var(--space-4xl)">
        <div class="container">
          <div class="section-header reveal">
            <h2>Khotbah Terbaru</h2>
            <p>Dengarkan firman Tuhan melalui khotbah mingguan</p>
            <div class="accent-line"></div>
          </div>
          <div class="grid-3" id="home-khotbah-grid">
            ${AppData.khotbah.slice(0, 3).map((k, i) => `
              <div class="card content-card reveal" data-khotbah-id="${k.id}" style="cursor:pointer">
                <div class="card-img-wrapper">
                  <img src="${placeholderImg(k.kategori, 210 + i * 30)}" alt="${k.judul}">
                  <span class="card-tag">${k.kategori}</span>
                </div>
                <div class="card-body">
                  <div class="card-meta">
                    <span>📅 ${formatDate(k.tanggal)}</span>
                    <span>📖 ${k.ayat}</span>
                  </div>
                  <h3>${k.judul}</h3>
                  <p>${k.isi.substring(0, 120)}...</p>
                </div>
                <div class="card-footer">
                  <div class="card-author">
                    <div class="avatar">MS</div>
                    <span>${k.pendeta}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;margin-top:var(--space-2xl)" class="reveal">
            <a href="#khotbah" class="btn btn-primary">Lihat Semua Khotbah →</a>
          </div>
        </div>
      </section>

      <!-- JADWAL TERDEKAT -->
      <section class="section">
        <div class="container">
          <div class="section-header reveal">
            <h2>Jadwal Kegiatan</h2>
            <p>Ikuti kegiatan ibadah dan persekutuan gereja</p>
            <div class="accent-line"></div>
          </div>
          <div class="grid-2">
            <!-- Kegiatan Rutin -->
            <div class="reveal">
              <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-sm)">
                <span style="width:8px;height:8px;background:var(--primary);border-radius:50%;display:inline-block"></span>
                Ibadah Rutin
              </h3>
              <div style="display:flex;flex-direction:column;gap:var(--space-md)">
                ${rutinEvents.map(j => `
                  <div class="schedule-item">
                    <div class="schedule-date">
                      <div class="day" style="font-size:var(--text-lg)">${j.hari.substring(0, 3)}</div>
                    </div>
                    <div class="schedule-info">
                      <h4>${j.nama}</h4>
                      <p>📍 ${j.tempat}</p>
                    </div>
                    <div class="schedule-time">${j.waktu}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <!-- Kegiatan Khusus -->
            <div class="reveal">
              <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-sm)">
                <span style="width:8px;height:8px;background:var(--accent);border-radius:50%;display:inline-block"></span>
                Kegiatan Mendatang
              </h3>
              <div style="display:flex;flex-direction:column;gap:var(--space-md)">
                ${upcomingEvents.length ? upcomingEvents.map(j => `
                  <div class="schedule-item" style="border-left:4px solid var(--accent)">
                    <div class="schedule-info">
                      <h4>${j.nama}</h4>
                      <p>📅 ${j.hari} · 📍 ${j.tempat}</p>
                      <p style="margin-top:var(--space-xs)">${j.deskripsi}</p>
                    </div>
                    <div class="schedule-time">${j.waktu}</div>
                  </div>
                `).join('') : '<div class="empty-state" style="padding:var(--space-xl)"><p>Belum ada kegiatan khusus mendatang</p></div>'}
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:var(--space-2xl)" class="reveal">
            <a href="#jadwal" class="btn btn-secondary">Lihat Jadwal Lengkap →</a>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section" style="background:linear-gradient(145deg,var(--bg-dark),var(--primary-darker));padding:var(--space-4xl) 0">
        <div class="container" style="text-align:center">
          <div class="reveal">
            <h2 style="font-size:var(--text-4xl);font-weight:800;color:white;margin-bottom:var(--space-md)">Mari Beribadah Bersama</h2>
            <p style="font-size:var(--text-lg);color:rgba(255,255,255,0.7);max-width:560px;margin:0 auto var(--space-xl)">
              Pintu gereja kami selalu terbuka untuk Anda. Datang dan rasakan kehangatan persekutuan di HKBP ARCO.
            </p>
            <div style="display:flex;gap:var(--space-md);justify-content:center;flex-wrap:wrap">
              <a href="#kontak" class="btn btn-accent btn-lg">Hubungi Kami</a>
              <a href="#dokumentasi" class="btn btn-lg" style="background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.2);color:white">Lihat Dokumentasi</a>
            </div>
          </div>
        </div>
      </section>
    `;

    // Generate floating particles
    createParticles();

    // Bind renungan click
    const renunganCard = $('#renungan-today-card');
    if (renunganCard) {
      renunganCard.addEventListener('click', () => {
        window.location.hash = '#renungan';
        navigateTo('renungan', latestRenungan.id);
      });
    }

    // Bind khotbah card clicks
    $$('[data-khotbah-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.khotbahId);
        window.location.hash = '#khotbah';
        navigateTo('khotbah', id);
      });
    });
  }

  function createParticles() {
    const container = $('#hero-particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 10 + 8) + 's';
      p.style.animationDelay = (Math.random() * 8) + 's';
      p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
      container.appendChild(p);
    }
  }

  /* ============================================
     PAGE: WARTA
     ============================================ */
  function renderWarta(detailId) {
    if (detailId) return renderWartaDetail(detailId);

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Warta Jemaat</span></div>
          <h1>Warta Jemaat</h1>
          <p>Kumpulan pengumuman dan jadwal pelayanan gereja</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:800px">
          ${AppData.warta.length ? AppData.warta.map(w => `
            <div class="card reveal" style="margin-bottom:var(--space-xl);padding:var(--space-xl)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin-bottom:var(--space-xs);font-size:var(--text-xl)">${w.judul}</h3>
                  <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-md)">📅 Minggu, ${formatDate(w.minggu)}</div>
                </div>
                ${w.tipe === 'pdf' ? `<span class="badge badge-danger">PDF Mode</span>` : `<span class="badge badge-primary">Web Mode</span>`}
              </div>
              <p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">
                ${w.tipe === 'pdf' ? 'Warta jemaat tersedia dalam format PDF yang bisa diunduh atau dibaca langsung.' : (w.isi ? w.isi.substring(0, 150) + '...' : '')}
              </p>
              ${w.tipe === 'pdf' 
                ? `<a href="${w.linkPdf}" target="_blank" class="btn btn-accent">Buka PDF Warta ↗</a>` 
                : `<button class="btn btn-primary btn-read-warta" data-id="${w.id}">Baca Warta →</button>`
              }
            </div>
          `).join('') : '<div class="empty-state"><div class="icon">📋</div><h3>Belum ada Warta Jemaat</h3></div>'}
        </div>
      </div>
    `;

    $$('.btn-read-warta').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('warta', parseInt(btn.dataset.id));
      });
    });
  }

  function renderWartaDetail(id) {
    const w = AppData.warta.find(x => x.id === id);
    if (!w) return navigateTo('warta');

    // Keuangan lampiran
    let keuanganHtml = '';
    if (w.lampirkanKeuangan && AppData.keuangan) {
      const ringkasan = AppData.keuangan.ringkasan;
      keuanganHtml = `
        <div style="margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:2px dashed var(--border-light)">
          <h3 style="text-align:center;margin-bottom:var(--space-lg)">Laporan Keuangan Mingguan</h3>
          <div class="grid-3">
            <div style="background:rgba(16,185,129,0.1);padding:var(--space-md);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:var(--text-sm);color:var(--text-muted)">Pemasukan</div>
              <div style="font-size:var(--text-lg);font-weight:700;color:var(--success)">${formatCurrency(ringkasan.totalPemasukan)}</div>
            </div>
            <div style="background:rgba(239,68,68,0.1);padding:var(--space-md);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:var(--text-sm);color:var(--text-muted)">Pengeluaran</div>
              <div style="font-size:var(--text-lg);font-weight:700;color:var(--danger)">${formatCurrency(ringkasan.totalPengeluaran)}</div>
            </div>
            <div style="background:rgba(30,59,179,0.1);padding:var(--space-md);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:var(--text-sm);color:var(--text-muted)">Saldo Akhir</div>
              <div style="font-size:var(--text-lg);font-weight:700;color:var(--primary)">${formatCurrency(ringkasan.saldo)}</div>
            </div>
          </div>
          <div style="text-align:center;margin-top:var(--space-md)">
            <a href="#keuangan" class="btn btn-sm btn-secondary">Lihat Detail Keuangan →</a>
          </div>
        </div>
      `;
    }

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><a href="#warta" id="back-warta">Warta Jemaat</a><span class="separator">›</span><span>${w.judul}</span></div>
          <h1>Warta Jemaat HKBP ARCO</h1>
          <p>${formatDate(w.minggu)}</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:800px">
          <div class="card reveal" style="padding:var(--space-2xl);background:white;box-shadow:0 10px 30px rgba(0,0,0,0.05)">
            <div style="text-align:center;border-bottom:3px solid var(--primary);padding-bottom:var(--space-xl);margin-bottom:var(--space-xl)">
              <img src="assets/img/logo_hkbp.png" alt="Logo" style="height:80px;margin-bottom:var(--space-md)">
              <h2>${w.judul}</h2>
              <p style="color:var(--text-muted)">📅 Minggu, ${formatDate(w.minggu)}</p>
            </div>
            
            <div style="margin-bottom:var(--space-2xl)">
              <h3 style="border-left:4px solid var(--accent);padding-left:var(--space-sm);margin-bottom:var(--space-md)">Pengumuman Umum</h3>
              <div style="white-space:pre-wrap;line-height:1.8;color:var(--text-secondary)">${w.isi || 'Tidak ada pengumuman umum.'}</div>
            </div>

            <div style="margin-bottom:var(--space-2xl)">
              <h3 style="border-left:4px solid var(--accent);padding-left:var(--space-sm);margin-bottom:var(--space-md)">Jadwal Pelayanan & Kegiatan</h3>
              <div style="white-space:pre-wrap;line-height:1.8;color:var(--text-secondary)">${w.jadwal || 'Tidak ada jadwal yang dicantumkan.'}</div>
            </div>

            ${keuanganHtml}

            <div style="margin-top:var(--space-2xl);text-align:center">
              <button onclick="window.print()" class="btn btn-primary" style="margin-right:var(--space-md)">🖨️ Cetak / Simpan PDF</button>
              <a href="#warta" class="btn btn-secondary" id="back-warta-btn">← Kembali</a>
            </div>
          </div>
        </div>
      </div>
    `;

    $('#back-warta')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('warta'); });
    $('#back-warta-btn')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('warta'); });
  }

  /* ============================================
     PAGE: KHOTBAH
     ============================================ */
  function renderKhotbah(detailId) {
    if (detailId) return renderKhotbahDetail(detailId);

    const categories = ['Semua', ...new Set(AppData.khotbah.map(k => k.kategori))];

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Khotbah</span></div>
          <h1>Khotbah Mingguan</h1>
          <p>Kumpulan khotbah dari ibadah mingguan HKBP ARCO</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <div class="filter-bar reveal" style="margin-bottom:var(--space-xl)">
            ${categories.map((c, i) => `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${c}">${c}</button>`).join('')}
          </div>
          <div class="grid-3" id="khotbah-grid">
            ${AppData.khotbah.map((k, i) => renderKhotbahCard(k, i)).join('')}
          </div>
        </div>
      </div>`;

    // Filter
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const grid = $('#khotbah-grid');
        const filtered = filter === 'Semua' ? AppData.khotbah : AppData.khotbah.filter(k => k.kategori === filter);
        grid.innerHTML = filtered.map((k, i) => renderKhotbahCard(k, i)).join('');
        bindKhotbahCards();
      });
    });

    bindKhotbahCards();
  }

  function renderKhotbahCard(k, i) {
    return `
      <div class="card content-card reveal" data-khotbah-id="${k.id}" style="cursor:pointer">
        <div class="card-img-wrapper">
          <img src="${placeholderImg(k.kategori, 210 + i * 25)}" alt="${k.judul}">
          <span class="card-tag">${k.kategori}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>📅 ${formatDate(k.tanggal)}</span>
            <span>📖 ${k.ayat}</span>
          </div>
          <h3>${k.judul}</h3>
          <p>${k.isi.substring(0, 120)}...</p>
        </div>
        <div class="card-footer">
          <div class="card-author">
            <div class="avatar">MS</div>
            <span>${k.pendeta}</span>
          </div>
        </div>
      </div>`;
  }

  function bindKhotbahCards() {
    $$('[data-khotbah-id]').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo('khotbah', parseInt(card.dataset.khotbahId));
      });
    });
  }

  function renderKhotbahDetail(id) {
    const k = AppData.khotbah.find(x => x.id === id);
    if (!k) return navigateTo('khotbah');

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><a href="#khotbah" id="back-khotbah">Khotbah</a><span class="separator">›</span><span>${k.judul}</span></div>
          <h1>${k.judul}</h1>
          <p>${k.pendeta} · ${formatDate(k.tanggal)}</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:800px">
          <div class="card reveal" style="overflow:visible">
            <div class="card-body" style="padding:var(--space-2xl)">
              <span class="badge badge-primary" style="margin-bottom:var(--space-lg)">${k.kategori}</span>
              
              <div class="renungan-today" style="margin-bottom:var(--space-xl)">
                <span class="verse-ref">📖 ${k.ayat}</span>
                <p class="verse-text">${k.teksAyat}</p>
              </div>

              <div style="font-size:var(--text-base);line-height:2;color:var(--text-secondary)">
                <p>${k.isi}</p>
              </div>

              <div style="margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-md)">
                <div class="avatar" style="width:48px;height:48px;font-size:var(--text-base);background:linear-gradient(135deg,var(--primary),var(--accent))">MS</div>
                <div>
                  <h4 style="font-weight:700">${k.pendeta}</h4>
                  <p style="font-size:var(--text-sm);color:var(--text-muted)">Pendeta HKBP ARCO</p>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:var(--space-xl);text-align:center">
            <a href="#khotbah" class="btn btn-secondary" id="back-to-khotbah">← Kembali ke Daftar Khotbah</a>
          </div>
        </div>
      </div>`;

    $('#back-khotbah')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('khotbah'); });
    $('#back-to-khotbah')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('khotbah'); });
  }

  /* ============================================
     PAGE: RENUNGAN
     ============================================ */
  function renderRenungan(detailId) {
    if (detailId) return renderRenunganDetail(detailId);

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Renungan</span></div>
          <h1>Renungan Harian</h1>
          <p>Bacaan harian untuk memperkuat iman dan memulai hari dengan firman Tuhan</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:900px">
          <!-- Today's Renungan - Featured -->
          <div class="renungan-today reveal" style="margin-bottom:var(--space-2xl);cursor:pointer" id="feat-renungan" data-renungan-id="${AppData.renungan[0].id}">
            <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg)">
              <span style="background:rgba(255,255,255,0.2);padding:4px 14px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:600">HARI INI</span>
              <span style="font-size:var(--text-sm);opacity:0.6">${formatDate(AppData.renungan[0].tanggal)}</span>
            </div>
            <span class="verse-ref">📖 ${AppData.renungan[0].ayat}</span>
            <p class="verse-text">${AppData.renungan[0].teksAyat}</p>
            <h3>${AppData.renungan[0].judul}</h3>
            <p class="body-text">${AppData.renungan[0].isi.substring(0, 250)}...</p>
            <div style="margin-top:var(--space-lg);display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:var(--text-sm);opacity:0.7">— ${AppData.renungan[0].penulis}</span>
              <span style="font-size:var(--text-sm);background:rgba(255,255,255,0.15);padding:6px 16px;border-radius:var(--radius-full)">Baca Selengkapnya →</span>
            </div>
          </div>

          <!-- Previous Renungans -->
          <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-lg)" class="reveal">Renungan Sebelumnya</h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-md)">
            ${AppData.renungan.slice(1).map(r => `
              <div class="card reveal" style="cursor:pointer" data-renungan-id="${r.id}">
                <div class="card-body" style="display:flex;gap:var(--space-xl);align-items:center">
                  <div style="min-width:64px;text-align:center;padding:var(--space-sm) var(--space-md);background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:var(--radius-md);color:white">
                    <div style="font-size:var(--text-2xl);font-weight:800;line-height:1">${formatShortDate(r.tanggal).day}</div>
                    <div style="font-size:var(--text-xs);opacity:0.8">${formatShortDate(r.tanggal).month}</div>
                  </div>
                  <div style="flex:1">
                    <div style="font-size:var(--text-xs);color:var(--primary);font-weight:600;margin-bottom:var(--space-xs)">📖 ${r.ayat}</div>
                    <h4 style="font-weight:700;margin-bottom:var(--space-xs)">${r.judul}</h4>
                    <p style="font-size:var(--text-sm);color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${r.isi.substring(0, 150)}...</p>
                  </div>
                  <span style="font-size:var(--text-sm);color:var(--primary);font-weight:600;white-space:nowrap">Baca →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;

    // Bind clicks
    $$('[data-renungan-id]').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo('renungan', parseInt(card.dataset.renunganId));
      });
    });
  }

  function renderRenunganDetail(id) {
    const r = AppData.renungan.find(x => x.id === id);
    if (!r) return navigateTo('renungan');

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><a href="#renungan" id="back-renungan-link">Renungan</a><span class="separator">›</span><span>${r.judul}</span></div>
          <h1>${r.judul}</h1>
          <p>${formatDate(r.tanggal)} · ${r.penulis}</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:800px">
          <div class="card reveal" style="overflow:visible">
            <div class="card-body" style="padding:var(--space-2xl)">
              <div class="renungan-today" style="margin-bottom:var(--space-xl)">
                <span class="verse-ref">📖 ${r.ayat}</span>
                <p class="verse-text">${r.teksAyat}</p>
              </div>

              <h3 style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-lg)">${r.judul}</h3>
              <div style="font-size:var(--text-base);line-height:2;color:var(--text-secondary)">
                <p>${r.isi}</p>
              </div>

              <div style="margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:1px solid var(--border-light)">
                <p style="font-size:var(--text-sm);color:var(--text-muted)">Ditulis oleh <strong style="color:var(--text)">${r.penulis}</strong></p>
              </div>
            </div>
          </div>
          <div style="margin-top:var(--space-xl);text-align:center">
            <a href="#renungan" class="btn btn-secondary" id="back-to-renungan">← Kembali ke Renungan</a>
          </div>
        </div>
      </div>`;

    $('#back-renungan-link')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('renungan'); });
    $('#back-to-renungan')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('renungan'); });
  }

  /* ============================================
     PAGE: JADWAL
     ============================================ */
  function renderJadwal() {
    const categories = ['Semua', ...new Set(AppData.jadwal.map(j => j.kategori))];
    const rutin = AppData.jadwal.filter(j => j.rutin);
    const khusus = AppData.jadwal.filter(j => !j.rutin);

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Jadwal</span></div>
          <h1>Jadwal Kegiatan</h1>
          <p>Jadwal ibadah dan kegiatan rutin maupun khusus HKBP ARCO</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <!-- Tabs -->
          <div class="tabs reveal">
            <button class="tab-btn active" data-tab="rutin">Kegiatan Rutin</button>
            <button class="tab-btn" data-tab="khusus">Kegiatan Khusus</button>
            <button class="tab-btn" data-tab="semua">Semua Jadwal</button>
          </div>

          <!-- Tab: Rutin -->
          <div class="tab-content active" id="tab-rutin">
            <div class="grid-2">
              ${renderJadwalByDay(rutin)}
            </div>
          </div>

          <!-- Tab: Khusus -->
          <div class="tab-content" id="tab-khusus">
            ${khusus.length ? `
              <div style="display:flex;flex-direction:column;gap:var(--space-md)">
                ${khusus.map(j => `
                  <div class="card">
                    <div class="card-body" style="display:flex;align-items:center;gap:var(--space-xl)">
                      <div style="min-width:80px;text-align:center;padding:var(--space-md);background:linear-gradient(135deg,var(--accent),var(--accent-dark));border-radius:var(--radius-lg);color:var(--bg-dark)">
                        <div style="font-size:var(--text-xs);font-weight:600">SPESIAL</div>
                        <div style="font-size:var(--text-xl);font-weight:800">★</div>
                      </div>
                      <div style="flex:1">
                        <h4 style="font-weight:700;margin-bottom:var(--space-xs)">${j.nama}</h4>
                        <p style="font-size:var(--text-sm);color:var(--text-secondary)">📅 ${j.hari}</p>
                        <p style="font-size:var(--text-sm);color:var(--text-secondary)">📍 ${j.tempat}</p>
                        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:var(--space-xs)">${j.deskripsi}</p>
                      </div>
                      <div class="badge badge-accent">${j.waktu}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<div class="empty-state"><div class="icon">📅</div><h3>Belum ada kegiatan khusus</h3></div>'}
          </div>

          <!-- Tab: Semua -->
          <div class="tab-content" id="tab-semua">
            <div class="table-wrapper">
              <table class="table">
                <thead><tr>
                  <th>Kegiatan</th>
                  <th>Hari/Tanggal</th>
                  <th>Waktu</th>
                  <th>Tempat</th>
                  <th>Kategori</th>
                </tr></thead>
                <tbody>
                  ${AppData.jadwal.map(j => `
                    <tr>
                      <td><strong>${j.nama}</strong><br><span style="font-size:var(--text-xs);color:var(--text-muted)">${j.deskripsi}</span></td>
                      <td>${j.hari}</td>
                      <td><span class="badge badge-primary">${j.waktu}</span></td>
                      <td>${j.tempat}</td>
                      <td><span class="badge ${j.rutin ? 'badge-primary' : 'badge-accent'}">${j.kategori}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;

    // Tab switching
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        $(`#tab-${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  function renderJadwalByDay(jadwalList) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayColors = { Minggu: '#E53E3E', Senin: '#3182CE', Selasa: '#38A169', Rabu: '#D69E2E', Kamis: '#805AD5', Jumat: '#DD6B20', Sabtu: '#319795' };
    const grouped = {};
    jadwalList.forEach(j => {
      const day = days.find(d => j.hari.startsWith(d)) || j.hari;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(j);
    });

    return Object.entries(grouped).map(([day, items]) => `
      <div class="reveal">
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
          <div style="width:12px;height:12px;border-radius:50%;background:${dayColors[day] || 'var(--primary)'}"></div>
          <h3 style="font-size:var(--text-xl);font-weight:700">${day}</h3>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          ${items.map(j => `
            <div class="schedule-item">
              <div class="schedule-info">
                <h4>${j.nama}</h4>
                <p style="font-size:var(--text-sm);color:var(--text-secondary)">📍 ${j.tempat}</p>
                <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-xs)">${j.deskripsi}</p>
              </div>
              <div class="schedule-time">${j.waktu}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  /* ============================================
     PAGE: DOKUMENTASI
     ============================================ */
  function renderDokumentasi() {
    // If AppData.dokumentasiDrive is not defined or has no folders, provide a safe fallback
    const drive = AppData.dokumentasiDrive || { folders: [] };
    const folders = drive.folders || [];
    
    // Extract unique categories, fallback to 'Semua' if none
    const categories = ['Semua', ...new Set(folders.map(f => f.kategori || 'Ibadah'))];

    // Build Drive gallery HTML with folder links
    const buildGalleryHTML = (filterKategori) => {
      const filteredFolders = filterKategori === 'Semua' ? folders : folders.filter(f => (f.kategori || 'Ibadah') === filterKategori);
      
      if (filteredFolders.length === 0) {
        return `<div class="text-center" style="padding:var(--space-xl); color:var(--text-muted)">Belum ada dokumentasi untuk kategori ini.</div>`;
      }

      return `
        <div class="drive-gallery reveal">
          ${filteredFolders.map(folder => `
            <a href="https://drive.google.com/drive/folders/${folder.folderId}" target="_blank" class="drive-img-card" style="text-decoration:none">
              <div style="background:var(--primary-50); height:160px; display:flex; align-items:center; justify-content:center; font-size:48px;">
                📁
              </div>
              <div class="drive-img-overlay" style="opacity:1; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:flex-end; padding:12px;">
                <span style="font-weight:700; font-size:14px; margin-bottom:4px">${folder.name}</span>
                <span style="font-size:10px; color:#ccc">${folder.kategori || 'Ibadah'} ↗</span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    };

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Dokumentasi</span></div>
          <h1>Dokumentasi Kegiatan</h1>
          <p>Kumpulan foto dan dokumentasi kegiatan gereja yang tersimpan di Google Drive.</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <div class="filter-bar reveal" style="margin-bottom:var(--space-xl)">
            ${categories.map((c, i) => `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${c}">${c}</button>`).join('')}
          </div>
          <div id="gallery-container">
            ${buildGalleryHTML('Semua')}
          </div>
        </div>
      </div>`;

    // Filter logic
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = $('#gallery-container');
        container.innerHTML = buildGalleryHTML(btn.dataset.filter);
        initScrollReveal();
      });
    });
  }

  /* ============================================
     PAGE: BLOG
     ============================================ */
  function renderBlog(detailId) {
    if (detailId) return renderBlogDetail(detailId);

    const categories = ['Semua', ...new Set(AppData.blogs.map(b => b.kategori))];

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Blog</span></div>
          <h1>Blog & Artikel</h1>
          <p>Tulisan, panduan, dan cerita inspiratif dari warga gereja</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <div class="filter-bar reveal" style="margin-bottom:var(--space-xl)">
            ${categories.map((c, i) => `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${c}">${c}</button>`).join('')}
          </div>

          <!-- Featured Article -->
          <div class="card reveal" style="margin-bottom:var(--space-xl);cursor:pointer" id="featured-blog" data-blog-id="${AppData.blogs[0].id}">
            <div style="display:grid;grid-template-columns:1fr 1fr;min-height:300px">
              <div style="overflow:hidden">
                <img src="${placeholderImg(AppData.blogs[0].kategori, 230)}" alt="${AppData.blogs[0].judul}" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div class="card-body" style="display:flex;flex-direction:column;justify-content:center;padding:var(--space-2xl)">
                <span class="badge badge-accent" style="width:fit-content;margin-bottom:var(--space-md)">${AppData.blogs[0].kategori}</span>
                <div class="card-meta" style="margin-bottom:var(--space-sm)">
                  <span>📅 ${formatDate(AppData.blogs[0].tanggal)}</span>
                </div>
                <h3 style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-md)">${AppData.blogs[0].judul}</h3>
                <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:var(--space-lg)">${AppData.blogs[0].ringkasan}</p>
                <div style="display:flex;align-items:center;gap:var(--space-sm)">
                  <div class="avatar" style="width:32px;height:32px;font-size:var(--text-xs);background:linear-gradient(135deg,var(--primary),var(--accent))">${AppData.blogs[0].penulis.charAt(0)}</div>
                  <span style="font-size:var(--text-sm);font-weight:600">${AppData.blogs[0].penulis}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid-3" id="blog-grid">
            ${AppData.blogs.slice(1).map((b, i) => renderBlogCard(b, i)).join('')}
          </div>
        </div>
      </div>`;

    // Featured click
    $('#featured-blog')?.addEventListener('click', () => {
      navigateTo('blog', AppData.blogs[0].id);
    });

    // Filter
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const filtered = filter === 'Semua' ? AppData.blogs : AppData.blogs.filter(b => b.kategori === filter);
        
        // Re-render featured + grid
        const grid = $('#blog-grid');
        const featured = $('#featured-blog');
        if (filtered.length > 0) {
          featured.style.display = '';
          featured.dataset.blogId = filtered[0].id;
          featured.querySelector('h3').textContent = filtered[0].judul;
          featured.querySelector('.badge').textContent = filtered[0].kategori;
          featured.querySelector('p[style*="secondary"]').textContent = filtered[0].ringkasan;
          grid.innerHTML = filtered.slice(1).map((b, i) => renderBlogCard(b, i)).join('');
        } else {
          featured.style.display = 'none';
          grid.innerHTML = '<div class="empty-state"><div class="icon">📝</div><h3>Belum ada artikel</h3></div>';
        }
        bindBlogCards();
      });
    });

    bindBlogCards();
  }

  function renderBlogCard(b, i) {
    return `
      <div class="card content-card reveal" data-blog-id="${b.id}" style="cursor:pointer">
        <div class="card-img-wrapper">
          <img src="${placeholderImg(b.kategori, 180 + i * 40)}" alt="${b.judul}">
          <span class="card-tag">${b.kategori}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>📅 ${formatDate(b.tanggal)}</span>
          </div>
          <h3>${b.judul}</h3>
          <p>${b.ringkasan}</p>
        </div>
        <div class="card-footer">
          <div class="card-author">
            <div class="avatar">${b.penulis.charAt(0)}</div>
            <span>${b.penulis}</span>
          </div>
        </div>
      </div>`;
  }

  function bindBlogCards() {
    $$('[data-blog-id]').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo('blog', parseInt(card.dataset.blogId));
      });
    });
  }

  function renderBlogDetail(id) {
    const b = AppData.blogs.find(x => x.id === id);
    if (!b) return navigateTo('blog');

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><a href="#blog" id="back-blog-link">Blog</a><span class="separator">›</span><span>${b.judul}</span></div>
          <h1>${b.judul}</h1>
          <p>${b.penulis} · ${formatDate(b.tanggal)}</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container" style="max-width:800px">
          <div class="card reveal">
            <img src="${placeholderImg(b.kategori, 230)}" alt="${b.judul}" style="width:100%;height:300px;object-fit:cover">
            <div class="card-body" style="padding:var(--space-2xl)">
              <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-xl)">
                <span class="badge badge-primary">${b.kategori}</span>
                <span style="font-size:var(--text-sm);color:var(--text-muted)">📅 ${formatDate(b.tanggal)}</span>
              </div>
              
              <div style="font-size:var(--text-base);line-height:2;color:var(--text-secondary)">
                <p>${b.isi}</p>
              </div>

              <div style="margin-top:var(--space-xl);display:flex;flex-wrap:wrap;gap:var(--space-sm)">
                ${b.tags.map(t => `<span class="badge badge-primary">#${t}</span>`).join('')}
              </div>

              <div style="margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:var(--space-md)">
                <div class="avatar" style="width:48px;height:48px;font-size:var(--text-base);background:linear-gradient(135deg,var(--primary),var(--accent))">${b.penulis.charAt(0)}</div>
                <div>
                  <h4 style="font-weight:700">${b.penulis}</h4>
                  <p style="font-size:var(--text-sm);color:var(--text-muted)">Penulis</p>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top:var(--space-xl);text-align:center">
            <a href="#blog" class="btn btn-secondary" id="back-to-blog">← Kembali ke Blog</a>
          </div>
        </div>
      </div>`;

    $('#back-blog-link')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('blog'); });
    $('#back-to-blog')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('blog'); });
  }

  /* ============================================
     PAGE: KEUANGAN (requires login)
     ============================================ */
  function renderKeuangan() {
    if (!Auth.isLoggedIn()) {
      mainContent.innerHTML = `
        <div class="page-header">
          <div class="container">
            <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Keuangan</span></div>
            <h1>Laporan Keuangan</h1>
            <p>Transparansi keuangan gereja untuk jemaat</p>
          </div>
        </div>
        <div class="page-content">
          <div class="container">
            <div class="access-denied reveal">
              <div class="lock-icon">🔒</div>
              <h2>Akses Terbatas</h2>
              <p>Halaman ini memerlukan login untuk melihat laporan keuangan gereja.</p>
              <button class="btn btn-primary btn-lg" id="keuangan-login-btn">Masuk untuk Melihat</button>
            </div>
          </div>
        </div>`;
      $('#keuangan-login-btn')?.addEventListener('click', showLoginModal);
      return;
    }

    const fin = AppData.keuangan;
    const maxVal = Math.max(...fin.bulanan.map(b => Math.max(b.pemasukan, b.pengeluaran)));

    // Build weekly groups from transactions
    const weeklyGroups = buildWeeklyReport(fin.transaksi);
    // Build category summary
    const catSummary = buildCategorySummary(fin.transaksi);

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Keuangan</span></div>
          <h1>Laporan Keuangan</h1>
          <p>Transparansi pengelolaan keuangan HKBP ARCO</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <!-- Summary Cards -->
          <div class="grid-3 reveal" style="margin-bottom:var(--space-2xl)">
            <div class="glass-card keuangan-summary-card">
              <div class="icon" style="background:rgba(16,185,129,0.1);color:var(--success)">↑</div>
              <div class="amount" style="color:var(--success)">${formatCurrency(fin.ringkasan.totalPemasukan)}</div>
              <div class="label">Total Pemasukan</div>
            </div>
            <div class="glass-card keuangan-summary-card">
              <div class="icon" style="background:rgba(239,68,68,0.1);color:var(--danger)">↓</div>
              <div class="amount" style="color:var(--danger)">${formatCurrency(fin.ringkasan.totalPengeluaran)}</div>
              <div class="label">Total Pengeluaran</div>
            </div>
            <div class="glass-card keuangan-summary-card">
              <div class="icon" style="background:rgba(30,59,179,0.1);color:var(--primary)">≡</div>
              <div class="amount">${formatCurrency(fin.ringkasan.saldo)}</div>
              <div class="label">Saldo Saat Ini</div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs reveal" style="margin-bottom:var(--space-xl)">
            <button class="tab-btn active" data-tab="keu-chart">Grafik</button>
            <button class="tab-btn" data-tab="keu-weekly">Laporan Mingguan</button>
            <button class="tab-btn" data-tab="keu-kategori">Per Kategori</button>
            <button class="tab-btn" data-tab="keu-riwayat">Riwayat</button>
          </div>

          <!-- Tab: Chart -->
          <div class="tab-content active" id="tab-keu-chart">
            <div class="chart-container reveal">
              <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-lg)">Grafik Pemasukan & Pengeluaran Bulanan</h3>
              <div style="display:flex;gap:var(--space-lg);margin-bottom:var(--space-lg)">
                <div style="display:flex;align-items:center;gap:var(--space-sm);font-size:var(--text-sm)">
                  <div style="width:12px;height:12px;border-radius:3px;background:linear-gradient(to top,var(--primary),var(--primary-light))"></div>
                  <span>Pemasukan</span>
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-sm);font-size:var(--text-sm)">
                  <div style="width:12px;height:12px;border-radius:3px;background:linear-gradient(to top,var(--accent-dark),var(--accent))"></div>
                  <span>Pengeluaran</span>
                </div>
              </div>
              <div class="chart-bar">
                ${fin.bulanan.filter(b => b.pemasukan > 0 || b.pengeluaran > 0).map(b => `
                  <div class="bar income" style="height:${maxVal > 0 ? (b.pemasukan / maxVal) * 100 : 0}%" title="Pemasukan ${b.bulan}: ${formatCurrency(b.pemasukan)}"></div>
                  <div class="bar expense" style="height:${maxVal > 0 ? (b.pengeluaran / maxVal) * 100 : 0}%" title="Pengeluaran ${b.bulan}: ${formatCurrency(b.pengeluaran)}"></div>
                `).join('')}
              </div>
              <div class="chart-labels">
                ${fin.bulanan.filter(b => b.pemasukan > 0 || b.pengeluaran > 0).map(b => `<span>${b.bulan}</span><span></span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Tab: Weekly Report -->
          <div class="tab-content" id="tab-keu-weekly">
            <div class="reveal">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-xl)">
                <h3 style="font-size:var(--text-xl);font-weight:700">Laporan Mingguan</h3>
                <button class="btn btn-sm btn-secondary" id="btn-print-weekly">📄 Export PDF</button>
              </div>
              ${weeklyGroups.length ? weeklyGroups.map(wk => `
                <div class="finance-week-card">
                  <div class="finance-week-header">
                    <span class="week-label">📅 ${wk.label}</span>
                    <div class="week-summary">
                      <span class="income">+${formatCurrency(wk.totalMasuk)}</span>
                      <span class="expense">-${formatCurrency(wk.totalKeluar)}</span>
                      <span class="balance">${formatCurrency(wk.totalMasuk - wk.totalKeluar)}</span>
                    </div>
                  </div>
                  <div class="table-wrapper">
                    <table class="table table-compact">
                      <thead><tr><th>Tanggal</th><th>No. Bukti</th><th>Keterangan</th><th>Kategori</th><th style="text-align:right">Debet</th><th style="text-align:right">Kredit</th></tr></thead>
                      <tbody>
                        ${wk.items.map(t => `
                          <tr>
                            <td>${formatDate(t.tanggal)}</td>
                            <td><code>${t.noBukti || '-'}</code></td>
                            <td>${t.keterangan}</td>
                            <td><span class="badge badge-primary">${t.kategori}</span></td>
                            <td style="text-align:right;color:var(--success)">${t.jenis === 'masuk' ? formatCurrency(t.jumlah) : '-'}</td>
                            <td style="text-align:right;color:var(--danger)">${t.jenis === 'keluar' ? formatCurrency(t.jumlah) : '-'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `).join('') : '<div class="empty-state"><div class="icon">📋</div><h3>Belum ada data transaksi</h3></div>'}
            </div>
          </div>

          <!-- Tab: Category -->
          <div class="tab-content" id="tab-keu-kategori">
            <div class="reveal">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-xl)">
                <h3 style="font-size:var(--text-xl);font-weight:700">Ringkasan Per Kategori</h3>
                <button class="btn btn-sm btn-secondary" id="btn-export-csv">📊 Export CSV</button>
              </div>
              <div class="grid-2" style="gap:var(--space-xl);margin-bottom:var(--space-xl)">
                <!-- Pemasukan by Category -->
                <div class="card" style="overflow:visible">
                  <div class="card-body">
                    <h4 style="font-weight:700;color:var(--success);margin-bottom:var(--space-lg)">↑ Pemasukan per Kategori</h4>
                    ${catSummary.masuk.map(c => `
                      <div class="category-bar-item">
                        <div class="cat-info"><span class="cat-name">${c.kategori}</span><span class="cat-amount">${formatCurrency(c.total)}</span></div>
                        <div class="cat-bar-bg"><div class="cat-bar income" style="width:${catSummary.maxMasuk > 0 ? (c.total / catSummary.maxMasuk) * 100 : 0}%"></div></div>
                        <span class="cat-count">${c.count} transaksi</span>
                      </div>
                    `).join('') || '<p style="color:var(--text-muted)">Tidak ada data</p>'}
                  </div>
                </div>
                <!-- Pengeluaran by Category -->
                <div class="card" style="overflow:visible">
                  <div class="card-body">
                    <h4 style="font-weight:700;color:var(--danger);margin-bottom:var(--space-lg)">↓ Pengeluaran per Kategori</h4>
                    ${catSummary.keluar.map(c => `
                      <div class="category-bar-item">
                        <div class="cat-info"><span class="cat-name">${c.kategori}</span><span class="cat-amount">${formatCurrency(c.total)}</span></div>
                        <div class="cat-bar-bg"><div class="cat-bar expense" style="width:${catSummary.maxKeluar > 0 ? (c.total / catSummary.maxKeluar) * 100 : 0}%"></div></div>
                        <span class="cat-count">${c.count} transaksi</span>
                      </div>
                    `).join('') || '<p style="color:var(--text-muted)">Tidak ada data</p>'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Transaction History -->
          <div class="tab-content" id="tab-keu-riwayat">
            <div class="reveal">
              <h3 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-lg)">Riwayat Transaksi</h3>
              <div class="table-wrapper">
                <table class="table">
                  <thead><tr><th>Tanggal</th><th>No. Bukti</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th style="text-align:right">Jumlah</th></tr></thead>
                  <tbody>
                    ${fin.transaksi.map(t => `
                      <tr>
                        <td>${formatDate(t.tanggal)}</td>
                        <td><code>${t.noBukti || '-'}</code></td>
                        <td><strong>${t.keterangan}</strong></td>
                        <td><span class="badge badge-primary">${t.kategori}</span></td>
                        <td><span class="badge ${t.jenis === 'masuk' ? 'badge-success' : 'badge-danger'}">${t.jenis === 'masuk' ? '↑ Masuk' : '↓ Keluar'}</span></td>
                        <td style="text-align:right;font-weight:700;color:${t.jenis === 'masuk' ? 'var(--success)' : 'var(--danger)'}">${t.jenis === 'masuk' ? '+' : '-'} ${formatCurrency(t.jumlah)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Tab switching
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        $(`#tab-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // Print Weekly PDF
    $('#btn-print-weekly')?.addEventListener('click', () => printWeeklyReport(weeklyGroups, fin));

    // Export CSV
    $('#btn-export-csv')?.addEventListener('click', () => {
      const headers = ['Tanggal', 'No Bukti', 'Keterangan', 'Kategori', 'Jenis', 'Jumlah'];
      const rows = fin.transaksi.map(t => [t.tanggal, t.noBukti || '', t.keterangan, t.kategori, t.jenis, t.jumlah]);
      DataStorage.exportCSV(headers, rows, `keuangan_hkbp_arco_${new Date().toISOString().slice(0,10)}.csv`);
      showToast('File CSV berhasil diunduh!', 'success');
    });
  }

  /* ---------- Financial Helpers ---------- */
  function buildWeeklyReport(transaksi) {
    if (!transaksi || transaksi.length === 0) return [];
    const sorted = [...transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const groups = {};
    sorted.forEach(t => {
      const d = new Date(t.tanggal + 'T00:00:00');
      const dayOfWeek = d.getDay();
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const key = startOfWeek.toISOString().slice(0, 10);
      if (!groups[key]) {
        groups[key] = {
          label: `${formatDate(startOfWeek.toISOString().slice(0,10))} — ${formatDate(endOfWeek.toISOString().slice(0,10))}`,
          items: [], totalMasuk: 0, totalKeluar: 0
        };
      }
      groups[key].items.push(t);
      if (t.jenis === 'masuk') groups[key].totalMasuk += t.jumlah;
      else groups[key].totalKeluar += t.jumlah;
    });
    return Object.values(groups);
  }

  function buildCategorySummary(transaksi) {
    const masukMap = {}, keluarMap = {};
    (transaksi || []).forEach(t => {
      const map = t.jenis === 'masuk' ? masukMap : keluarMap;
      if (!map[t.kategori]) map[t.kategori] = { kategori: t.kategori, total: 0, count: 0 };
      map[t.kategori].total += t.jumlah;
      map[t.kategori].count++;
    });
    const masuk = Object.values(masukMap).sort((a, b) => b.total - a.total);
    const keluar = Object.values(keluarMap).sort((a, b) => b.total - a.total);
    return {
      masuk, keluar,
      maxMasuk: masuk.length ? masuk[0].total : 0,
      maxKeluar: keluar.length ? keluar[0].total : 0
    };
  }

  function printWeeklyReport(weeklyGroups, fin) {
    const now = new Date();
    let html = `
      <div class="report-header">
        <h1>HKBP ARCO</h1>
        <h2>Laporan Keuangan Mingguan</h2>
        <p>Dicetak: ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="summary-grid">
        <div class="summary-box income-bg"><div class="label">Total Pemasukan</div><div class="value" style="color:#10b981">${formatCurrency(fin.ringkasan.totalPemasukan)}</div></div>
        <div class="summary-box expense-bg"><div class="label">Total Pengeluaran</div><div class="value" style="color:#ef4444">${formatCurrency(fin.ringkasan.totalPengeluaran)}</div></div>
        <div class="summary-box balance-bg"><div class="label">Saldo</div><div class="value" style="color:#1e3bb3">${formatCurrency(fin.ringkasan.saldo)}</div></div>
      </div>`;

    weeklyGroups.forEach(wk => {
      html += `
        <div class="section-title">📅 ${wk.label}</div>
        <div class="report-meta"><span>Pemasukan: ${formatCurrency(wk.totalMasuk)}</span><span>Pengeluaran: ${formatCurrency(wk.totalKeluar)}</span><span>Selisih: ${formatCurrency(wk.totalMasuk - wk.totalKeluar)}</span></div>
        <table><thead><tr><th>Tanggal</th><th>No. Bukti</th><th>Uraian</th><th>Kategori</th><th class="text-right">Debet</th><th class="text-right">Kredit</th></tr></thead>
        <tbody>${wk.items.map(t => `
          <tr>
            <td>${formatDate(t.tanggal)}</td>
            <td>${t.noBukti || '-'}</td>
            <td>${t.keterangan}</td>
            <td>${t.kategori}</td>
            <td class="text-right income">${t.jenis === 'masuk' ? formatCurrency(t.jumlah) : '-'}</td>
            <td class="text-right expense">${t.jenis === 'keluar' ? formatCurrency(t.jumlah) : '-'}</td>
          </tr>`).join('')}
          <tr class="total-row"><td colspan="4" class="text-right">Sub-Total</td><td class="text-right income">${formatCurrency(wk.totalMasuk)}</td><td class="text-right expense">${formatCurrency(wk.totalKeluar)}</td></tr>
        </tbody></table>`;
    });

    html += `
      <div class="signature-area">
        <div class="signature-box"><div class="line">Mengetahui,<br>Ketua Majelis</div></div>
        <div class="signature-box"><div class="line">Dibuat oleh,<br>Bendahara</div></div>
      </div>
      <div class="footer-print">Dokumen ini dicetak otomatis dari sistem HKBP ARCO — ${now.toISOString().slice(0,10)}</div>`;

    DataStorage.printReport(html, 'Laporan Keuangan Mingguan — HKBP ARCO');
  }

  /* ============================================
     PAGE: KONTAK
     ============================================ */
  function renderKontak() {
    const c = AppData.kontak;

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Hubungi Kami</span></div>
          <h1>Hubungi Kami</h1>
          <p>Kami senang mendengar dari Anda. Jangan ragu untuk menghubungi kami.</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <div class="grid-2" style="gap:var(--space-2xl)">
            <!-- Contact Info -->
            <div class="reveal">
              <h3 style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-xl)">Informasi Kontak</h3>
              <div style="display:flex;flex-direction:column;gap:var(--space-md)">
                <div class="glass-card contact-info-card">
                  <div class="icon">📍</div>
                  <div>
                    <h4>Alamat</h4>
                    <p>${c.alamat}</p>
                  </div>
                </div>
                <div class="glass-card contact-info-card">
                  <div class="icon">📞</div>
                  <div>
                    <h4>Telepon</h4>
                    <p>${c.telepon}</p>
                  </div>
                </div>
                <div class="glass-card contact-info-card">
                  <div class="icon">✉️</div>
                  <div>
                    <h4>Email</h4>
                    <p>${c.email}</p>
                  </div>
                </div>
                <div class="glass-card contact-info-card">
                  <div class="icon">📱</div>
                  <div>
                    <h4>Media Sosial</h4>
                    <p>Instagram: ${c.instagram}<br>Facebook: ${c.facebook}<br>YouTube: ${c.youtube}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="reveal">
              <h3 style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-xl)">Kirim Pesan</h3>
              <div class="card" style="padding:var(--space-xl)">
                <form id="contact-form">
                  <div class="form-group">
                    <label for="contact-name">Nama Lengkap</label>
                    <input type="text" id="contact-name" class="form-control" placeholder="Masukkan nama Anda" required>
                  </div>
                  <div class="form-group">
                    <label for="contact-email">Email</label>
                    <input type="email" id="contact-email" class="form-control" placeholder="email@contoh.com" required>
                  </div>
                  <div class="form-group">
                    <label for="contact-subject">Subjek</label>
                    <input type="text" id="contact-subject" class="form-control" placeholder="Perihal pesan Anda">
                  </div>
                  <div class="form-group">
                    <label for="contact-message">Pesan</label>
                    <textarea id="contact-message" class="form-control" placeholder="Tulis pesan Anda di sini..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Kirim Pesan</button>
                </form>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div style="margin-top:var(--space-2xl)" class="reveal">
            <h3 style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--space-xl)">Lokasi Gereja</h3>
            <div class="contact-map">
              <iframe src="${c.mapsEmbed}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Lokasi HKBP ARCO"></iframe>
            </div>
          </div>
        </div>
      </div>`;

    // Form submit
    $('#contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Pesan Anda telah terkirim! Kami akan segera merespons.', 'success');
      e.target.reset();
    });
  }

  /* ============================================
     SCROLL EFFECTS
     ============================================ */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  /* ============================================
     INITIALIZATION
     ============================================ */
  async function init() {
    // --- Load all data from separated files ---
    await DataStorage.initializeAll();

    // --- Nav scroll effect ---
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 50;
      navbar.classList.toggle('scrolled', scrolled);
      scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
    });

    // --- Mobile menu toggle ---
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('open');
    });

    // --- Scroll to top ---
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Nav link clicks ---
    $$('.nav-links a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const page = a.dataset.page;
        window.location.hash = '#' + page;
        navigateTo(page);
      });
    });

    // --- Footer link clicks ---
    $$('.footer a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const page = a.getAttribute('href').replace('#', '');
        window.location.hash = '#' + page;
        navigateTo(page);
      });
    });

    // --- Hash change ---
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'beranda';
      navigateTo(hash);
    });

    // --- Initial auth UI ---
    updateNavUI();

    // --- Initial route ---
    const hash = window.location.hash.replace('#', '') || 'beranda';
    navigateTo(hash);
  }

  /* ============================================
     PAGE: DASHBOARD (role-based)
     ============================================ */
  let dashPanel = 'overview';

  function renderDashboard() {
    const user = Auth.getCurrentUser();
    if (!user || !Auth.canAccessDashboard()) {
      mainContent.innerHTML = `
        <div class="page-header">
          <div class="container">
            <h1>Dashboard</h1>
            <p>Kelola konten gereja sesuai peran Anda</p>
          </div>
        </div>
        <div class="page-content">
          <div class="container">
            <div class="access-denied reveal">
              <div class="lock-icon">🔒</div>
              <h2>Akses Terbatas</h2>
              <p>Silakan login dengan akun yang memiliki akses dashboard.</p>
              <button class="btn btn-primary btn-lg" id="dash-login-btn">Masuk</button>
            </div>
          </div>
        </div>`;
      $('#dash-login-btn')?.addEventListener('click', showLoginModal);
      return;
    }

    const role = user.role;
    const roleName = Auth.getRoleName(role);

    // Build sidebar nav items based on role
    const navItems = [{ id: 'overview', icon: '📊', label: 'Ringkasan' }];
    if (role === 'admin' || role === 'bendahara') {
      navItems.push({ id: 'bendahara', icon: '💰', label: 'Keuangan' });
    }
    if (role === 'admin' || role === 'sekretaris') {
      navItems.push({ id: 'warta', icon: '📋', label: 'Warta Jemaat' });
      navItems.push({ id: 'liturgi', icon: '📖', label: 'Tata Ibadah' });
    }
    if (role === 'admin' || role === 'kontributor' || role === 'pendeta') {
      navItems.push({ id: 'blog-editor', icon: '✏️', label: 'Blog' });
    }
    if (role === 'admin') {
      navItems.push({ id: 'user-mgmt', icon: '👥', label: 'Kelola User' });
      navItems.push({ id: 'drive-mgmt', icon: '📁', label: 'Google Drive' });
    }

    mainContent.innerHTML = `
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb"><a href="#beranda">Beranda</a><span class="separator">›</span><span>Dashboard</span></div>
          <h1>Dashboard</h1>
          <p>Kelola konten gereja sesuai peran Anda</p>
        </div>
      </div>
      <div class="page-content">
        <div class="container">
          <div class="dashboard-layout">
            <!-- Sidebar -->
            <aside class="dash-sidebar">
              <div class="dash-sidebar-user">
                <div class="avatar">${user.initial}</div>
                <div class="user-info">
                  <h4>${user.name}</h4>
                  <span>${roleName}</span>
                </div>
              </div>
              <nav class="dash-nav" id="dash-nav">
                ${navItems.map(n => `
                  <button class="dash-nav-item ${n.id === dashPanel ? 'active' : ''}" data-panel="${n.id}">
                    <span class="nav-icon">${n.icon}</span> ${n.label}
                  </button>
                `).join('')}
              </nav>
            </aside>
            <!-- Main -->
            <div class="dash-main" id="dash-main"></div>
          </div>
        </div>
      </div>`;

    // Bind sidebar nav
    $$('#dash-nav .dash-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        dashPanel = btn.dataset.panel;
        $$('#dash-nav .dash-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDashPanel();
      });
    });

    renderDashPanel();
  }

  function renderDashPanel() {
    const container = $('#dash-main');
    if (!container) return;
    const user = Auth.getCurrentUser();
    const panels = {
      overview: renderOverviewPanel,
      bendahara: renderBendaharaPanel,
      warta: renderWartaPanel,
      liturgi: renderLiturgiPanel,
      'blog-editor': renderBlogEditorPanel,
      'user-mgmt': renderUserMgmtPanel,
      'drive-mgmt': renderDriveMgmtPanel,
    };
    const fn = panels[dashPanel] || renderOverviewPanel;
    fn(container, user);
  }

  /* --- Overview Panel --- */
  function renderOverviewPanel(container, user) {
    const role = user.role;
    const fin = AppData.keuangan;

    container.innerHTML = `
      <div class="dash-welcome">
        <h2>Selamat Datang, ${user.name.split(' ').pop()}! 👋</h2>
        <p>Anda login sebagai ${Auth.getRoleName(role)}. Gunakan menu di samping untuk mengelola konten gereja.</p>
      </div>

      <div class="dash-stats">
        <div class="dash-stat-card">
          <div class="stat-icon neutral">📝</div>
          <div><div class="stat-value">${AppData.blogs.length}</div><div class="stat-label">Artikel Blog</div></div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon balance">📋</div>
          <div><div class="stat-value">${AppData.warta.length}</div><div class="stat-label">Warta Jemaat</div></div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon income">↑</div>
          <div><div class="stat-value">${formatCurrency(fin.ringkasan.totalPemasukan)}</div><div class="stat-label">Pemasukan</div></div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon expense">↓</div>
          <div><div class="stat-value">${formatCurrency(fin.ringkasan.totalPengeluaran)}</div><div class="stat-label">Pengeluaran</div></div>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <h3>Transaksi Terakhir</h3>
        </div>
        <div class="dash-list">
          ${fin.transaksi.slice(0, 5).map(t => `
            <div class="dash-list-item">
              <div class="item-icon ${t.jenis}">${t.jenis === 'masuk' ? '↑' : '↓'}</div>
              <div class="item-info">
                <h4>${t.keterangan}</h4>
                <span>${formatDate(t.tanggal)} · ${t.kategori}</span>
              </div>
              <div class="item-amount ${t.jenis}">${t.jenis === 'masuk' ? '+' : '-'} ${formatCurrency(t.jumlah)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* --- Bendahara Panel --- */
  function renderBendaharaPanel(container) {
    const fin = AppData.keuangan;

    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>💰 Keuangan</h2><p>Input dan kelola transaksi keuangan gereja</p></div>
        <div style="display:flex;gap:var(--space-sm)">
          <button class="btn btn-sm btn-secondary" id="btn-batch-mode">📋 Batch Entry</button>
          <button class="btn btn-primary" id="btn-add-transaksi">+ Tambah Transaksi</button>
        </div>
      </div>

      <div class="dash-stats">
        <div class="dash-stat-card">
          <div class="stat-icon income">↑</div>
          <div><div class="stat-value">${formatCurrency(fin.ringkasan.totalPemasukan)}</div><div class="stat-label">Total Pemasukan</div></div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon expense">↓</div>
          <div><div class="stat-value">${formatCurrency(fin.ringkasan.totalPengeluaran)}</div><div class="stat-label">Total Pengeluaran</div></div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon balance">≡</div>
          <div><div class="stat-value">${formatCurrency(fin.ringkasan.saldo)}</div><div class="stat-label">Saldo</div></div>
        </div>
      </div>

      <!-- Single Entry Form -->
      <div class="dash-card" id="transaksi-form-card" style="display:none">
        <div class="dash-card-header"><h3 id="trx-form-title">Tambah Transaksi Baru</h3></div>
        <div class="dash-card-body">
          <form id="form-transaksi">
            <input type="hidden" id="trx-id">
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Tanggal</label>
                <input type="date" class="form-control" id="trx-tanggal" value="${new Date().toISOString().slice(0, 10)}" required>
              </div>
              <div class="dash-form-group">
                <label>Jenis</label>
                <select class="form-control" id="trx-jenis" required>
                  <option value="masuk">Pemasukan</option>
                  <option value="keluar">Pengeluaran</option>
                </select>
              </div>
              <div class="dash-form-group">
                <label>No. Bukti</label>
                <input type="text" class="form-control" id="trx-nobukti" placeholder="PM-2026-001">
              </div>
            </div>
            <div class="dash-form-group">
              <label>Keterangan</label>
              <input type="text" class="form-control" id="trx-keterangan" placeholder="Cth: Persembahan Ibadah Minggu" required>
            </div>
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Jumlah (Rp)</label>
                <input type="number" class="form-control" id="trx-jumlah" placeholder="0" min="0" required>
              </div>
              <div class="dash-form-group">
                <label>Kategori</label>
                <select class="form-control" id="trx-kategori" required>
                  <option value="Persembahan">Persembahan</option>
                  <option value="Kolekte">Kolekte</option>
                  <option value="Sumbangan">Sumbangan</option>
                  <option value="Perpuluhan">Perpuluhan</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Gaji">Gaji</option>
                  <option value="Diakonia">Diakonia</option>
                  <option value="Fasilitas">Fasilitas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div class="dash-form-group">
              <label>Catatan (opsional)</label>
              <input type="text" class="form-control" id="trx-catatan" placeholder="Catatan tambahan...">
            </div>
            <div class="dash-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-trx">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Batch Entry Form -->
      <div class="dash-card" id="batch-form-card" style="display:none">
        <div class="dash-card-header"><h3>📋 Batch Entry — Input Multi Baris</h3></div>
        <div class="dash-card-body">
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-lg)">Tambahkan beberapa transaksi sekaligus. Klik "+ Baris" untuk menambah baris baru.</p>
          <div id="batch-rows">
            <div class="batch-row">
              <input type="date" class="form-control batch-date" value="${new Date().toISOString().slice(0, 10)}">
              <select class="form-control batch-jenis"><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select>
              <input type="text" class="form-control batch-keterangan" placeholder="Keterangan">
              <input type="number" class="form-control batch-jumlah" placeholder="Jumlah" min="0">
              <select class="form-control batch-kategori">
                <option value="Persembahan">Persembahan</option><option value="Kolekte">Kolekte</option><option value="Sumbangan">Sumbangan</option><option value="Perpuluhan">Perpuluhan</option>
                <option value="Operasional">Operasional</option><option value="Gaji">Gaji</option><option value="Diakonia">Diakonia</option><option value="Fasilitas">Fasilitas</option><option value="Lainnya">Lainnya</option>
              </select>
              <button class="btn btn-sm btn-danger batch-remove" title="Hapus baris">✕</button>
            </div>
          </div>
          <div class="dash-form-actions" style="margin-top:var(--space-md)">
            <button type="button" class="btn btn-secondary" id="btn-add-batch-row">+ Baris</button>
            <button type="button" class="btn btn-secondary" id="btn-cancel-batch">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-save-batch">Simpan Semua</button>
          </div>
        </div>
      </div>

      <!-- Export/Import -->
      <div class="dash-card">
        <div class="dash-card-header"><h3>📦 Export / Import Data Keuangan</h3></div>
        <div class="dash-card-body" style="display:flex;gap:var(--space-md);flex-wrap:wrap;align-items:center">
          <button class="btn btn-sm btn-secondary" id="btn-export-keuangan-json">⬇ Export JSON</button>
          <label class="btn btn-sm btn-secondary" style="cursor:pointer; background:var(--success); color:white; border-color:var(--success)">
            ⬆ Import Excel/CSV
            <input type="file" accept=".xlsx, .xls, .csv" id="btn-import-keuangan-excel" style="display:none">
          </label>
          <span style="font-size:var(--text-xs);color:var(--text-muted)">Import transaksi dari Excel. Format kolom: Tanggal, Jenis(masuk/keluar), Keterangan, Jumlah, Kategori, No Bukti(opsional)</span>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header"><h3>Riwayat Transaksi (${fin.transaksi.length})</h3></div>
        <div class="dash-list" id="trx-list">
          ${fin.transaksi.map(t => renderTransaksiItem(t)).join('')}
        </div>
      </div>
    `;

    // Toggle single form
    $('#btn-add-transaksi').addEventListener('click', () => {
      $('#form-transaksi').reset();
      $('#trx-id').value = '';
      $('#trx-form-title').textContent = 'Tambah Transaksi Baru';
      $('#transaksi-form-card').style.display = $('#transaksi-form-card').style.display === 'none' ? '' : 'none';
      $('#batch-form-card').style.display = 'none';
    });
    $('#btn-cancel-trx')?.addEventListener('click', () => { $('#transaksi-form-card').style.display = 'none'; });

    // Toggle batch form
    $('#btn-batch-mode').addEventListener('click', () => {
      $('#batch-form-card').style.display = $('#batch-form-card').style.display === 'none' ? '' : 'none';
      $('#transaksi-form-card').style.display = 'none';
    });
    $('#btn-cancel-batch')?.addEventListener('click', () => { $('#batch-form-card').style.display = 'none'; });

    // Add batch row
    $('#btn-add-batch-row')?.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'batch-row';
      row.innerHTML = `
        <input type="date" class="form-control batch-date" value="${new Date().toISOString().slice(0, 10)}">
        <select class="form-control batch-jenis"><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select>
        <input type="text" class="form-control batch-keterangan" placeholder="Keterangan">
        <input type="number" class="form-control batch-jumlah" placeholder="Jumlah" min="0">
        <select class="form-control batch-kategori">
          <option value="Persembahan">Persembahan</option><option value="Kolekte">Kolekte</option><option value="Sumbangan">Sumbangan</option><option value="Perpuluhan">Perpuluhan</option>
          <option value="Operasional">Operasional</option><option value="Gaji">Gaji</option><option value="Diakonia">Diakonia</option><option value="Fasilitas">Fasilitas</option><option value="Lainnya">Lainnya</option>
        </select>
        <button class="btn btn-sm btn-danger batch-remove" title="Hapus baris">✕</button>`;
      $('#batch-rows').appendChild(row);
      row.querySelector('.batch-remove').addEventListener('click', () => row.remove());
    });

    // Remove batch row listeners
    $$('.batch-remove').forEach(btn => btn.addEventListener('click', () => btn.closest('.batch-row').remove()));

    // Save batch
    $('#btn-save-batch')?.addEventListener('click', () => {
      const rows = $$('.batch-row');
      let count = 0;
      rows.forEach(row => {
        const keterangan = row.querySelector('.batch-keterangan').value.trim();
        const jumlah = parseInt(row.querySelector('.batch-jumlah').value);
        if (!keterangan || !jumlah || jumlah <= 0) return;
        const newTrx = {
          id: Date.now() + count,
          tanggal: row.querySelector('.batch-date').value,
          keterangan,
          jenis: row.querySelector('.batch-jenis').value,
          jumlah,
          kategori: row.querySelector('.batch-kategori').value,
          noBukti: '', catatan: ''
        };
        AppData.keuangan.transaksi.unshift(newTrx);
        if (newTrx.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan += newTrx.jumlah;
        else AppData.keuangan.ringkasan.totalPengeluaran += newTrx.jumlah;
        count++;
      });
      if (count > 0) {
        AppData.keuangan.ringkasan.saldo = AppData.keuangan.ringkasan.totalPemasukan - AppData.keuangan.ringkasan.totalPengeluaran;
        DataStorage.persistKeuangan();
        showToast(`${count} transaksi berhasil ditambahkan!`, 'success');
        renderBendaharaPanel(container);
      } else {
        showToast('Tidak ada baris valid untuk disimpan.', 'warning');
      }
    });

    // Edit button clicks
    $$('.btn-edit-trx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const trx = AppData.keuangan.transaksi.find(t => t.id === id);
        if(!trx) return;
        
        $('#trx-id').value = trx.id;
        $('#trx-tanggal').value = trx.tanggal;
        $('#trx-jenis').value = trx.jenis;
        $('#trx-keterangan').value = trx.keterangan;
        $('#trx-jumlah').value = trx.jumlah;
        $('#trx-kategori').value = trx.kategori;
        $('#trx-nobukti').value = trx.noBukti || '';
        $('#trx-catatan').value = trx.catatan || '';
        
        $('#trx-form-title').textContent = 'Edit Transaksi';
        $('#transaksi-form-card').style.display = '';
        $('#batch-form-card').style.display = 'none';
        $('#transaksi-form-card').scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Single submit (Add & Edit)
    $('#form-transaksi').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#trx-id').value;
      const tNow = new Date().toISOString().slice(0, 16).replace('T', ' ');
      
      const trxData = {
        tanggal: $('#trx-tanggal').value,
        keterangan: $('#trx-keterangan').value,
        jenis: $('#trx-jenis').value,
        jumlah: parseInt($('#trx-jumlah').value),
        kategori: $('#trx-kategori').value,
        noBukti: $('#trx-nobukti').value.trim(),
        catatan: $('#trx-catatan').value.trim()
      };

      if (id) {
        // Mode Edit
        const oldTrxIndex = AppData.keuangan.transaksi.findIndex(t => t.id === parseInt(id));
        if (oldTrxIndex > -1) {
          const oldTrx = AppData.keuangan.transaksi[oldTrxIndex];
          // Kurangi saldo lama
          if (oldTrx.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan -= oldTrx.jumlah;
          else AppData.keuangan.ringkasan.totalPengeluaran -= oldTrx.jumlah;
          
          // Update data & tambah saldo baru
          AppData.keuangan.transaksi[oldTrxIndex] = { ...oldTrx, ...trxData, lastEdited: tNow };
          if (trxData.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan += trxData.jumlah;
          else AppData.keuangan.ringkasan.totalPengeluaran += trxData.jumlah;
          
          showToast('Transaksi berhasil diperbarui!', 'success');
        }
      } else {
        // Mode Tambah Baru
        const newTrx = { id: Date.now(), ...trxData };
        AppData.keuangan.transaksi.unshift(newTrx);
        if (newTrx.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan += newTrx.jumlah;
        else AppData.keuangan.ringkasan.totalPengeluaran += newTrx.jumlah;
        showToast('Transaksi berhasil ditambahkan!', 'success');
      }

      AppData.keuangan.ringkasan.saldo = AppData.keuangan.ringkasan.totalPemasukan - AppData.keuangan.ringkasan.totalPengeluaran;
      DataStorage.persistKeuangan();
      renderBendaharaPanel(container);
    });

    // Delete buttons
    $$('.btn-delete-trx').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
        const id = parseInt(btn.dataset.id);
        const trx = AppData.keuangan.transaksi.find(t => t.id === id);
        if (!trx) return;
        AppData.keuangan.transaksi = AppData.keuangan.transaksi.filter(t => t.id !== id);
        if (trx.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan -= trx.jumlah;
        else AppData.keuangan.ringkasan.totalPengeluaran -= trx.jumlah;
        AppData.keuangan.ringkasan.saldo = AppData.keuangan.ringkasan.totalPemasukan - AppData.keuangan.ringkasan.totalPengeluaran;
        DataStorage.persistKeuangan();
        showToast('Transaksi dihapus.', 'info');
        renderBendaharaPanel(container);
      });
    });

    // Export JSON
    $('#btn-export-keuangan-json')?.addEventListener('click', () => {
      DataStorage.exportJSON(AppData.keuangan, `keuangan_hkbp_arco_${new Date().toISOString().slice(0,10)}.json`);
      showToast('Data keuangan berhasil diunduh!', 'success');
    });

    // Import Excel/CSV using SheetJS
    $('#btn-import-keuangan-excel')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (typeof XLSX === 'undefined') {
        return showToast('Library SheetJS belum termuat. Silakan muat ulang halaman.', 'error');
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // read as array of arrays
          
          if (json.length < 2) throw new Error('File kosong atau format salah');
          
          let importedCount = 0;
          // Skip header row (index 0)
          for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length < 4) continue; // Skip empty rows
            
            // Format asumsi: 0:Tanggal, 1:Jenis, 2:Keterangan, 3:Jumlah, 4:Kategori, 5:No Bukti
            let tanggal = row[0];
            // Format date handling (Excel date to YYYY-MM-DD)
            if (typeof tanggal === 'number') {
              const d = new Date(Math.round((tanggal - 25569) * 86400 * 1000));
              tanggal = d.toISOString().slice(0, 10);
            } else if (typeof tanggal === 'string' && tanggal.includes('/')) {
              const p = tanggal.split('/');
              if (p.length === 3) tanggal = `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; // asumsi DD/MM/YYYY
            } else if (!tanggal) {
                tanggal = new Date().toISOString().slice(0,10);
            }
            
            const jenisRaw = (row[1] || '').toString().toLowerCase();
            const jenis = jenisRaw.includes('keluar') ? 'keluar' : 'masuk';
            const keterangan = row[2] || 'Import Excel';
            const jumlah = parseInt(row[3]) || 0;
            if (jumlah <= 0) continue;
            const kategori = row[4] || 'Lainnya';
            const noBukti = row[5] || '';
            
            const newTrx = {
              id: Date.now() + i, // prevent duplicate IDs
              tanggal: tanggal,
              keterangan: keterangan,
              jenis: jenis,
              jumlah: jumlah,
              kategori: kategori,
              noBukti: noBukti,
              catatan: 'Diimpor dari Excel'
            };
            
            AppData.keuangan.transaksi.unshift(newTrx);
            if (newTrx.jenis === 'masuk') AppData.keuangan.ringkasan.totalPemasukan += newTrx.jumlah;
            else AppData.keuangan.ringkasan.totalPengeluaran += newTrx.jumlah;
            importedCount++;
          }
          
          if (importedCount > 0) {
            AppData.keuangan.ringkasan.saldo = AppData.keuangan.ringkasan.totalPemasukan - AppData.keuangan.ringkasan.totalPengeluaran;
            DataStorage.persistKeuangan();
            showToast(`${importedCount} transaksi berhasil diimpor dari Excel!`, 'success');
            renderBendaharaPanel(container);
          } else {
            showToast('Tidak ada data valid yang bisa diimpor.', 'warning');
          }
        } catch (err) {
          showToast('Gagal memproses file Excel: ' + err.message, 'error');
        }
      };
      reader.onerror = () => showToast('Gagal membaca file.', 'error');
      reader.readAsBinaryString(file);
    });
  }

  function renderTransaksiItem(t) {
    return `
      <div class="dash-list-item">
        <div class="item-icon ${t.jenis}">${t.jenis === 'masuk' ? '↑' : '↓'}</div>
        <div class="item-info">
          <h4>${t.keterangan}</h4>
          <span>${formatDate(t.tanggal)} · ${t.kategori}${t.noBukti ? ' · ' + t.noBukti : ''}</span>
          ${t.lastEdited ? `<div style="font-size:10px;color:#888;margin-top:2px">Diedit: ${t.lastEdited}</div>` : ''}
        </div>
        <div class="item-amount ${t.jenis}">${t.jenis === 'masuk' ? '+' : '-'} ${formatCurrency(t.jumlah)}</div>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary btn-edit-trx" data-id="${t.id}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-delete-trx" data-id="${t.id}" title="Hapus">🗑</button>
        </div>
      </div>`;
  }

  /* --- Warta Panel --- */
  function renderWartaPanel(container) {
    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>📋 Warta Jemaat</h2><p>Kelola pengumuman mingguan untuk jemaat</p></div>
        <button class="btn btn-primary" id="btn-add-warta">+ Tambah Warta</button>
      </div>

      <div class="dash-card" id="warta-form-card" style="display:none">
        <div class="dash-card-header">
          <h3>Tulis Warta Baru</h3>
          <div class="tabs" style="margin-top:var(--space-md)">
            <button type="button" class="tab-btn warta-type-btn active" data-type="web">Buat di Web</button>
            <button type="button" class="tab-btn warta-type-btn" data-type="pdf">Upload PDF (Drive)</button>
          </div>
        </div>
        <div class="dash-card-body">
          <form id="form-warta">
            <input type="hidden" id="warta-tipe" value="web">
            
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Minggu (Tanggal)</label>
                <input type="date" class="form-control" id="warta-minggu" required>
              </div>
              <div class="dash-form-group">
                <label>Judul</label>
                <input type="text" class="form-control" id="warta-judul" placeholder="Cth: Warta Jemaat — Minggu Paskah" required>
              </div>
            </div>

            <!-- TAB: WEB -->
            <div id="warta-web-fields">
              <div class="dash-form-group">
                <label>Pengumuman Umum</label>
                <textarea class="form-control" id="warta-isi" placeholder="Tulis pengumuman di sini..." style="min-height:120px"></textarea>
              </div>
              <div class="dash-form-group">
                <label>Jadwal Pelayanan & Kegiatan</label>
                <textarea class="form-control" id="warta-jadwal" placeholder="Cth: Ibadah Minggu: 09.00 WIB, Pelayan: Pdt..." style="min-height:120px"></textarea>
              </div>
              <div class="dash-form-group" style="display:flex;align-items:center;gap:8px;background:var(--bg-light);padding:12px;border-radius:var(--radius-md)">
                <input type="checkbox" id="warta-lampirkan-keuangan" checked>
                <label for="warta-lampirkan-keuangan" style="margin:0;cursor:pointer">Otomatis lampirkan ringkasan saldo keuangan minggu ini</label>
              </div>
            </div>

            <!-- TAB: PDF -->
            <div id="warta-pdf-fields" style="display:none">
              <div class="dash-form-group">
                <label>Link Warta PDF (Google Drive)</label>
                <input type="url" class="form-control" id="warta-link-pdf" placeholder="https://drive.google.com/file/d/...">
                <span style="font-size:12px;color:var(--text-muted);display:block;margin-top:4px">Pastikan akses file di Google Drive diatur ke "Siapa saja yang memiliki link".</span>
              </div>
            </div>

            <div class="dash-form-actions" style="margin-top:var(--space-lg)">
              <button type="button" class="btn btn-secondary" id="btn-cancel-warta">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Warta</button>
            </div>
          </form>
        </div>
      </div>

      <div id="warta-list">
        ${AppData.warta.length ? AppData.warta.map(w => `
          <div class="warta-preview" data-id="${w.id}">
            <div class="warta-actions">
              <button class="btn btn-sm btn-secondary btn-delete-warta" data-id="${w.id}">🗑</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge ${w.tipe === 'pdf' ? 'badge-danger' : 'badge-primary'}">${w.tipe === 'pdf' ? 'PDF' : 'WEB'}</span>
              <h4 style="margin:0">${w.judul}</h4>
            </div>
            <div class="warta-date" style="margin-top:8px">📅 Minggu, ${formatDate(w.minggu)} · oleh ${w.dibuatOleh}</div>
            <div class="warta-body" style="font-size:12px;color:var(--text-secondary);margin-top:8px">
              ${w.tipe === 'pdf' ? `🔗 <a href="${w.linkPdf}" target="_blank">Lihat PDF</a>` : (w.isi ? w.isi.substring(0, 100) + '...' : 'Warta web...')}
            </div>
          </div>
        `).join('') : '<div class="empty-state"><div class="icon">📋</div><h3>Belum ada warta</h3><p>Klik tombol "+ Tambah Warta" untuk membuat yang baru.</p></div>'}
      </div>
    `;

    // Toggle form
    $('#btn-add-warta').addEventListener('click', () => {
      const card = $('#warta-form-card');
      card.style.display = card.style.display === 'none' ? '' : 'none';
    });
    $('#btn-cancel-warta')?.addEventListener('click', () => {
      $('#warta-form-card').style.display = 'none';
      $('#form-warta').reset();
    });

    // Tab Logic
    $$('.warta-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.warta-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        $('#warta-tipe').value = type;
        
        if (type === 'web') {
          $('#warta-web-fields').style.display = '';
          $('#warta-pdf-fields').style.display = 'none';
        } else {
          $('#warta-web-fields').style.display = 'none';
          $('#warta-pdf-fields').style.display = '';
        }
      });
    });

    // Submit
    $('#form-warta').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = Auth.getCurrentUser();
      const tipe = $('#warta-tipe').value;
      
      const newWarta = {
        id: Date.now(),
        tipe: tipe,
        minggu: $('#warta-minggu').value,
        judul: $('#warta-judul').value,
        dibuatOleh: user.name
      };

      if (tipe === 'web') {
        newWarta.isi = $('#warta-isi').value;
        newWarta.jadwal = $('#warta-jadwal').value;
        newWarta.lampirkanKeuangan = $('#warta-lampirkan-keuangan').checked;
      } else {
        const link = $('#warta-link-pdf').value;
        if (!link) return showToast('Link PDF wajib diisi untuk mode PDF', 'error');
        newWarta.linkPdf = link;
      }

      AppData.warta.unshift(newWarta);
      DataStorage.persistWarta();
      showToast('Warta berhasil ditambahkan!', 'success');
      renderWartaPanel(container);
    });

    // Delete
    $$('.btn-delete-warta').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Yakin ingin menghapus warta ini?')) return;
        AppData.warta = AppData.warta.filter(w => w.id !== parseInt(btn.dataset.id));
        DataStorage.persistWarta();
        showToast('Warta dihapus.', 'info');
        renderWartaPanel(container);
      });
    });
  }

  /* --- Liturgi Panel --- */
  function renderLiturgiPanel(container) {
    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>📖 Tata Ibadah</h2><p>Kelola susunan liturgi ibadah mingguan</p></div>
        <button class="btn btn-primary" id="btn-add-liturgi">+ Tambah Liturgi</button>
      </div>

      <div class="dash-card" id="liturgi-form-card" style="display:none">
        <div class="dash-card-header"><h3>Tulis Tata Ibadah Baru</h3></div>
        <div class="dash-card-body">
          <form id="form-liturgi">
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Minggu (Tanggal)</label>
                <input type="date" class="form-control" id="liturgi-minggu" required>
              </div>
              <div class="dash-form-group">
                <label>Judul</label>
                <input type="text" class="form-control" id="liturgi-judul" placeholder="Cth: Tata Ibadah Minggu Paskah" required>
              </div>
            </div>
            <div class="dash-form-group">
              <label>Susunan Liturgi</label>
              <textarea class="form-control" id="liturgi-isi" placeholder="• Nyanyian Pembuka&#10;• Votum & Salam&#10;• ..." style="min-height:200px" required></textarea>
            </div>
            <div class="dash-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-liturgi">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <div id="liturgi-list">
        ${AppData.tataIbadah.length ? AppData.tataIbadah.map(l => `
          <div class="warta-preview" data-id="${l.id}">
            <div class="warta-actions">
              <button class="btn btn-sm btn-secondary btn-delete-liturgi" data-id="${l.id}">🗑</button>
            </div>
            <h4>${l.judul}</h4>
            <div class="warta-date">📅 Minggu, ${formatDate(l.minggu)} · oleh ${l.dibuatOleh}</div>
            <div class="warta-body">${l.isi}</div>
          </div>
        `).join('') : '<div class="empty-state"><div class="icon">📖</div><h3>Belum ada tata ibadah</h3><p>Klik tombol "+ Tambah Liturgi" untuk membuat yang baru.</p></div>'}
      </div>
    `;

    // Toggle form
    $('#btn-add-liturgi').addEventListener('click', () => {
      const card = $('#liturgi-form-card');
      card.style.display = card.style.display === 'none' ? '' : 'none';
    });
    $('#btn-cancel-liturgi')?.addEventListener('click', () => {
      $('#liturgi-form-card').style.display = 'none';
    });

    // Submit
    $('#form-liturgi').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = Auth.getCurrentUser();
      const newLiturgi = {
        id: Date.now(),
        minggu: $('#liturgi-minggu').value,
        judul: $('#liturgi-judul').value,
        isi: $('#liturgi-isi').value,
        dibuatOleh: user.name
      };
      AppData.tataIbadah.unshift(newLiturgi);
      DataStorage.persistTataIbadah();
      showToast('Tata ibadah berhasil ditambahkan!', 'success');
      renderLiturgiPanel(container);
    });

    // Delete
    $$('.btn-delete-liturgi').forEach(btn => {
      btn.addEventListener('click', () => {
        AppData.tataIbadah = AppData.tataIbadah.filter(l => l.id !== parseInt(btn.dataset.id));
        DataStorage.persistTataIbadah();
        showToast('Tata ibadah dihapus.', 'info');
        renderLiturgiPanel(container);
      });
    });
  }

  /* --- Blog Editor Panel --- */
  function renderBlogEditorPanel(container) {
    const user = Auth.getCurrentUser();
    
    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>✏️ Blog & Artikel</h2><p>Tulis dan kelola artikel blog gereja</p></div>
        <button class="btn btn-primary" id="btn-add-blog">+ Tulis Artikel</button>
      </div>

      <div class="dash-card" id="blog-form-card" style="display:none">
        <div class="dash-card-header"><h3 id="blog-form-title">Tulis Artikel Baru</h3></div>
        <div class="dash-card-body">
          <form id="form-blog">
            <input type="hidden" id="blog-id">
            <div class="dash-form-group">
              <label>Judul Artikel</label>
              <input type="text" class="form-control" id="blog-judul" placeholder="Judul artikel yang menarik" required>
            </div>
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Kategori</label>
                <select class="form-control" id="blog-kategori" required>
                  <option value="Rohani">Rohani</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Budaya">Budaya</option>
                  <option value="Sejarah">Sejarah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="dash-form-group">
                <label>Tags (pisahkan koma)</label>
                <input type="text" class="form-control" id="blog-tags" placeholder="rohani, iman, doa">
              </div>
            </div>
            <div class="dash-form-group">
              <label>Ringkasan</label>
              <input type="text" class="form-control" id="blog-ringkasan" placeholder="Deskripsi singkat artikel" required>
            </div>
            <div class="dash-form-group">
              <label>Isi Artikel</label>
              <textarea class="form-control" id="blog-isi" placeholder="Tulis isi artikel di sini..." style="min-height:200px" required></textarea>
            </div>
            <div class="dash-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-blog">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Artikel</button>
            </div>
          </form>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header"><h3>Artikel Terpublikasi (${AppData.blogs.length})</h3></div>
        <div id="blog-editor-list">
          ${AppData.blogs.map((b, i) => {
            const canEdit = user.role === 'admin' || user.name === b.penulis;
            return `
            <div class="blog-editor-item">
              <div class="blog-thumb"><img src="${placeholderImg(b.kategori, 180 + i * 40)}" alt="${b.judul}"></div>
              <div class="blog-info">
                <h4>${b.judul}</h4>
                <span>${formatDate(b.tanggal)} · ${b.penulis} · <span class="badge badge-primary">${b.kategori}</span></span>
                ${b.lastEdited ? `<div style="font-size:10px;color:#888;margin-top:4px">Terakhir diperbarui: ${b.lastEdited}</div>` : ''}
              </div>
              <div class="item-actions">
                ${canEdit ? `
                  <button class="btn btn-sm btn-secondary btn-edit-blog" data-id="${b.id}" title="Edit">✏️</button>
                  <button class="btn btn-sm btn-danger btn-delete-blog" data-id="${b.id}" title="Hapus">🗑</button>
                ` : `<span style="font-size:10px;color:#888;font-style:italic">Hanya penulis asli</span>`}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `;

    const formCard = $('#blog-form-card');
    const formTitle = $('#blog-form-title');
    const form = $('#form-blog');

    // Toggle form
    $('#btn-add-blog').addEventListener('click', () => {
      form.reset();
      $('#blog-id').value = '';
      formTitle.textContent = 'Tulis Artikel Baru';
      formCard.style.display = formCard.style.display === 'none' ? '' : 'none';
    });

    $('#btn-cancel-blog')?.addEventListener('click', () => {
      formCard.style.display = 'none';
    });

    // Edit 
    $$('.btn-edit-blog').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const blog = AppData.blogs.find(b => b.id === id);
        if(!blog) return;
        
        $('#blog-id').value = blog.id;
        $('#blog-judul').value = blog.judul;
        $('#blog-kategori').value = blog.kategori;
        $('#blog-tags').value = (blog.tags || []).join(', ');
        $('#blog-ringkasan').value = blog.ringkasan;
        $('#blog-isi').value = blog.isi;
        
        formTitle.textContent = 'Edit Artikel';
        formCard.style.display = '';
        formCard.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#blog-id').value;
      const tNow = new Date().toISOString().slice(0, 16).replace('T', ' ');

      if (id) { // Edit existing
        const index = AppData.blogs.findIndex(b => b.id === parseInt(id));
        if (index > -1) {
          AppData.blogs[index] = {
            ...AppData.blogs[index],
            judul: $('#blog-judul').value,
            kategori: $('#blog-kategori').value,
            ringkasan: $('#blog-ringkasan').value,
            isi: $('#blog-isi').value,
            tags: $('#blog-tags').value.split(',').map(t => t.trim()).filter(Boolean),
            lastEdited: tNow
          };
          showToast('Artikel berhasil diperbarui!', 'success');
        }
      } else { // Create new
        const newBlog = {
          id: Date.now(),
          judul: $('#blog-judul').value,
          penulis: user.name,
          tanggal: new Date().toISOString().slice(0, 10),
          kategori: $('#blog-kategori').value,
          ringkasan: $('#blog-ringkasan').value,
          isi: $('#blog-isi').value,
          tags: $('#blog-tags').value.split(',').map(t => t.trim()).filter(Boolean)
        };
        AppData.blogs.unshift(newBlog);
        showToast('Artikel berhasil dipublikasikan!', 'success');
      }
      
      DataStorage.persistBlogs();
      renderBlogEditorPanel(container);
    });

    // Delete
    $$('.btn-delete-blog').forEach(btn => {
      btn.addEventListener('click', () => {
        if(confirm('Yakin ingin menghapus artikel ini?')) {
          AppData.blogs = AppData.blogs.filter(b => b.id !== parseInt(btn.dataset.id));
          DataStorage.persistBlogs();
          showToast('Artikel dihapus.', 'info');
          renderBlogEditorPanel(container);
        }
      });
    });
  }

  /* --- User Management Panel (Admin Only) --- */
  function renderUserMgmtPanel(container) {
    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>👥 Kelola User</h2><p>Manajemen hak akses dan akun pengguna</p></div>
        <button class="btn btn-primary" id="btn-add-user">+ Tambah User</button>
      </div>

      <div class="dash-card" id="user-form-card" style="display:none">
        <div class="dash-card-header"><h3 id="user-form-title">Tambah User Baru</h3></div>
        <div class="dash-card-body">
          <form id="form-user">
            <input type="hidden" id="u-id">
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Nama Lengkap</label>
                <input type="text" class="form-control" id="u-name" required>
              </div>
              <div class="dash-form-group">
                <label>Username</label>
                <input type="text" class="form-control" id="u-username" required>
              </div>
            </div>
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Role / Privilege</label>
                <select class="form-control" id="u-role" required>
                  <option value="admin">Admin</option>
                  <option value="pendeta">Pendeta</option>
                  <option value="bendahara">Bendahara</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="kontributor">Kontributor</option>
                  <option value="jemaat">Jemaat Biasa</option>
                </select>
              </div>
              <div class="dash-form-group">
                <label>Password (Kosongkan jika tidak diubah)</label>
                <input type="password" class="form-control" id="u-password">
              </div>
            </div>
            <div class="dash-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-user">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan User</button>
            </div>
          </form>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header"><h3>Daftar Pengguna Aktif</h3></div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Username</th>
                <th>Role</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${AppData.users.map(u => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:12px">
                      <div class="avatar" style="width:32px;height:32px;border-radius:50%;background:var(--primary-50);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary)">${u.initial}</div>
                      <strong>${u.name}</strong>
                    </div>
                  </td>
                  <td><code>${u.username}</code></td>
                  <td><span class="badge badge-primary">${Auth.getRoleName(u.role)}</span></td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-secondary btn-edit-user" data-id="${u.id}" title="Edit User">✏️</button>
                    ${u.username !== 'admin' ? `<button class="btn btn-sm btn-danger btn-delete-user" data-id="${u.id}" title="Hapus User">🗑</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const formCard = $('#user-form-card');
    const formTitle = $('#user-form-title');
    const form = $('#form-user');

    $('#btn-add-user').addEventListener('click', () => {
      form.reset();
      $('#u-id').value = '';
      $('#u-password').required = true;
      formTitle.textContent = 'Tambah User Baru';
      formCard.style.display = formCard.style.display === 'none' ? '' : 'none';
    });

    $('#btn-cancel-user').addEventListener('click', () => {
      formCard.style.display = 'none';
    });

    $$('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const u = AppData.users.find(x => x.id === id);
        if(!u) return;
        
        $('#u-id').value = u.id;
        $('#u-name').value = u.name;
        $('#u-username').value = u.username;
        $('#u-role').value = u.role;
        $('#u-password').required = false; // Optional on edit
        
        formTitle.textContent = 'Edit User';
        formCard.style.display = '';
        formCard.scrollIntoView({ behavior: 'smooth' });
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = $('#u-id').value;
      const pwd = $('#u-password').value;
      const name = $('#u-name').value;
      
      // Generate initials from name
      const parts = name.split(' ');
      const initial = parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0,2).toUpperCase();

      if (id) {
        // Edit
        const u = AppData.users.find(x => x.id === parseInt(id));
        if (u) {
          u.name = name;
          u.username = $('#u-username').value;
          u.role = $('#u-role').value;
          u.initial = initial.toUpperCase();
          if (pwd) {
            u.passwordHash = await DataStorage.hashPassword(pwd);
          }
          showToast('User diperbarui!', 'success');
        }
      } else {
        // Create
        if (!pwd) return showToast('Password wajib diisi untuk user baru', 'error');
        const newUser = {
          id: Date.now(),
          username: $('#u-username').value,
          name: name,
          role: $('#u-role').value,
          initial: initial.toUpperCase(),
          passwordHash: await DataStorage.hashPassword(pwd)
        };
        AppData.users.push(newUser);
        showToast('User berhasil ditambahkan!', 'success');
      }
      
      DataStorage.persistUsers();
      renderUserMgmtPanel(container);
    });

    $$('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => {
        if(confirm('Hapus user ini?')) {
          AppData.users = AppData.users.filter(u => u.id !== parseInt(btn.dataset.id));
          DataStorage.persistUsers();
          showToast('User dihapus.', 'info');
          renderUserMgmtPanel(container);
        }
      });
    });
  }

  /* --- Drive Management Panel (Admin Only) --- */
  function renderDriveMgmtPanel(container) {
    if (!AppData.dokumentasiDrive) AppData.dokumentasiDrive = { folders: [] };
    
    container.innerHTML = `
      <div class="dash-panel-header">
        <div><h2>📁 Google Drive</h2><p>Kelola tautan folder dokumentasi foto</p></div>
        <button class="btn btn-primary" id="btn-add-drive">+ Tambah Folder</button>
      </div>

      <div class="dash-card" id="drive-form-card" style="display:none">
        <div class="dash-card-header"><h3 id="drive-form-title">Tambah Folder Baru</h3></div>
        <div class="dash-card-body">
          <form id="form-drive">
            <input type="hidden" id="d-idx">
            <div class="dash-form-row">
              <div class="dash-form-group">
                <label>Nama/Judul Folder</label>
                <input type="text" class="form-control" id="d-name" placeholder="Cth: Ibadah Paskah 2026" required>
              </div>
              <div class="dash-form-group">
                <label>Kategori</label>
                <select class="form-control" id="d-kategori" required>
                  <option value="Ibadah">Ibadah</option>
                  <option value="Perayaan">Perayaan</option>
                  <option value="Kategorial">Kategorial</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div class="dash-form-group">
              <label>ID Folder Google Drive (Atau Link Folder)</label>
              <input type="text" class="form-control" id="d-folderId" placeholder="1A2b3C4d5E6f..." required>
            </div>
            <div class="dash-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-cancel-drive">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Folder</button>
            </div>
          </form>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header"><h3>Folder Tersambung</h3></div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Folder</th>
                <th>Kategori</th>
                <th>ID Folder</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${AppData.dokumentasiDrive.folders && AppData.dokumentasiDrive.folders.length > 0 
                ? AppData.dokumentasiDrive.folders.map((f, i) => `
                <tr>
                  <td><strong>${f.name}</strong></td>
                  <td><span class="badge badge-primary">${f.kategori || 'Ibadah'}</span></td>
                  <td><code>${f.folderId.substring(0, 15)}...</code></td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-secondary btn-edit-drive" data-idx="${i}" title="Edit">✏️</button>
                    <button class="btn btn-sm btn-danger btn-delete-drive" data-idx="${i}" title="Hapus">🗑</button>
                  </td>
                </tr>
              `).join('') 
              : '<tr><td colspan="4" class="text-center">Belum ada folder Google Drive yang disambungkan.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const formCard = $('#drive-form-card');
    const formTitle = $('#drive-form-title');
    const form = $('#form-drive');

    $('#btn-add-drive').addEventListener('click', () => {
      form.reset();
      $('#d-idx').value = '';
      formTitle.textContent = 'Tambah Folder Baru';
      formCard.style.display = formCard.style.display === 'none' ? '' : 'none';
    });

    $('#btn-cancel-drive').addEventListener('click', () => {
      formCard.style.display = 'none';
    });

    $$('.btn-edit-drive').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const f = AppData.dokumentasiDrive.folders[idx];
        if(!f) return;
        
        $('#d-idx').value = idx;
        $('#d-name').value = f.name;
        $('#d-kategori').value = f.kategori || 'Ibadah';
        $('#d-folderId').value = f.folderId;
        
        formTitle.textContent = 'Edit Folder';
        formCard.style.display = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = $('#d-idx').value;
      
      let folderId = $('#d-folderId').value;
      // Extract ID if user pasted full link
      if (folderId.includes('folders/')) {
        folderId = folderId.split('folders/')[1].split('?')[0];
      }

      const folderData = {
        name: $('#d-name').value,
        kategori: $('#d-kategori').value,
        folderId: folderId
      };

      if (!AppData.dokumentasiDrive.folders) AppData.dokumentasiDrive.folders = [];

      if (idx !== '') {
        AppData.dokumentasiDrive.folders[parseInt(idx)] = folderData;
        showToast('Folder diperbarui!', 'success');
      } else {
        AppData.dokumentasiDrive.folders.push(folderData);
        showToast('Folder berhasil ditambahkan!', 'success');
      }
      
      // Update in local data js (mocked here, should be saved properly in real DB)
      // Since data.js had this hardcoded, we will just persist it to localStorage as config
      DataStorage.saveLocal('hkbp_drive_cfg', AppData.dokumentasiDrive);
      renderDriveMgmtPanel(container);
    });

    $$('.btn-delete-drive').forEach(btn => {
      btn.addEventListener('click', () => {
        if(confirm('Hapus folder ini?')) {
          AppData.dokumentasiDrive.folders.splice(parseInt(btn.dataset.idx), 1);
          DataStorage.saveLocal('hkbp_drive_cfg', AppData.dokumentasiDrive);
          showToast('Folder dihapus.', 'info');
          renderDriveMgmtPanel(container);
        }
      });
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

