/* ============================================================
   SETUMU DOMPAK — Main JS
   Modular Loader + Mobile Menu + Smooth Scroll + IO Observer
   ============================================================ */

(() => {
  'use strict';

  // ── Fallback HTML (dipakai saat file:// atau fetch gagal) ──
  const fallbackNavbar = `
<nav class="navbar">
    <div class="logo">SETUMU DOMPAK</div>
    <button class="nav-toggle" id="navToggle" aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>
    <ul class="nav-links" id="navLinks">
        <li><a href="index.html#beranda">Beranda</a></li>
        <li><a href="index.html#tentang">Tentang Kami</a></li>
        <li><a href="index.html#layanan">Layanan</a></li>
        <li><a href="menu.html">Menu</a></li>
        <li><a href="index.html#lokasi">Lokasi</a></li>
        <li><a href="index.html#galeri">Galeri</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="index.html#kontak">Kontak</a></li>
    </ul>
</nav>`;

  const fallbackFooter = `
<footer id="kontak">
    <div class="container footer-grid">
        <div class="footer-brand">
            <h3>SETUMU DOMPAK</h3>
            <p>Meningkatkan aksesibilitas informasi pariwisata daerah melalui digitalisasi yang modern dan interaktif.</p>
        </div>
        <div class="footer-links">
            <h4>Tautan Cepat</h4>
            <ul>
                <li><a href="index.html#beranda">Beranda</a></li>
                <li><a href="index.html#tentang">Tentang Kami</a></li>
                <li><a href="index.html#layanan">Layanan</a></li>
                <li><a href="menu.html">Menu Kuliner</a></li>
            </ul>
        </div>
        <div class="footer-links">
            <h4>Informasi</h4>
            <ul>
                <li><a href="index.html#lokasi">Lokasi Peta</a></li>
                <li><a href="galeri.html">Galeri Foto</a></li>
                <li><a href="faq.html">FAQ</a></li>
            </ul>
        </div>
        <div class="footer-social">
            <h4>Ikuti Kami</h4>
            <div class="social-icons">
                <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                <a href="#" aria-label="Tiktok"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg></a>
                <a href="#" aria-label="Youtube"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
            </div>
        </div>
    </div>
</footer>`;

  /* ============================================================
     1. MODULAR COMPONENT LOADER (Fetch API)
     ============================================================ */

  // Deteksi base path agar kompatibel hosting di subdirektori
  const getBasePath = () => {
    const segments = window.location.pathname.split('/');
    if (segments[segments.length - 1].includes('.')) segments.pop();
    let base = segments.join('/');
    if (!base.endsWith('/')) base += '/';
    return base;
  };

  /**
   * Muat komponen HTML ke placeholder.
   * Jika fetch gagal (misal file://), gunakan fallback string.
   */
  const loadComponent = (placeholderId, fileName, fallbackHTML) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return Promise.resolve();

    // file:// tidak bisa fetch → langsung fallback
    if (window.location.protocol === 'file:') {
      placeholder.innerHTML = fallbackHTML;
      return Promise.resolve();
    }

    return fetch(getBasePath() + fileName + '?v=2.0')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => { placeholder.innerHTML = html; })
      .catch(err => {
        console.warn(`Gagal memuat ${fileName}, menggunakan fallback.`, err.message);
        placeholder.innerHTML = fallbackHTML;
      });
  };

  /* ============================================================
     2. MOBILE MENU TOGGLE
     ============================================================ */
  const initMobileMenu = () => {
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');
    if (!navToggle || !navLinks) return;

    // Ikon SVG untuk hamburger dan close
    const hamburgerSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`;

    const closeSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6"  x2="6"  y2="18"></line>
        <line x1="6"  y1="6"  x2="18" y2="18"></line>
      </svg>`;

    // Fungsi utilitas untuk buka/tutup menu
    const setMenu = (open) => {
      navLinks.classList.toggle('active', open);
      navToggle.innerHTML = open ? closeSVG : hamburgerSVG;
    };

    // Toggle saat tombol hamburger diklik
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenu(!navLinks.classList.contains('active'));
    });

    // Tutup menu saat salah satu link diklik
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Tutup menu saat klik di luar area navigasi
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        setMenu(false);
      }
    });
  };

  /* ============================================================
     3a. SMOOTH SCROLLING untuk tautan anchor (#)
     ============================================================ */
  const initSmoothScroll = () => {
    // Hanya tangkap klik pada link yang href-nya mengandung #
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return; // bukan anchor link

        const hash = href.substring(hashIndex);
        const target = document.querySelector(hash);
        if (!target) return; // section tidak ada di halaman ini

        // Cegah navigasi default & scroll manual
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });

        // Update URL hash tanpa lompat
        history.pushState(null, '', hash);
      });
    });
  };

  /* ============================================================
     3b. INTERSECTION OBSERVER — Active Nav Highlighting
         Mendeteksi section mana yang tampil di viewport
     ============================================================ */
  const initSectionObserver = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinksAll.length) return;

    // Fungsi untuk menyorot link yang cocok dengan section ID
    const highlightLink = (sectionId) => {
      navLinksAll.forEach(link => {
        const href = link.getAttribute('href') || '';
        // Cocokkan hash, baik "index.html#xxx" maupun "#xxx"
        const isMatch = href.endsWith('#' + sectionId);
        link.classList.toggle('active', isMatch);
      });
    };

    // Observer: threshold 0.5 = section dianggap aktif saat 50% terlihat
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlightLink(entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  };

  /* ============================================================
     4. NAVBAR SCROLL SHADOW
        Tambah class .scrolled saat halaman digulir ke bawah
     ============================================================ */
  const initNavbarShadow = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  };

  /* ============================================================
     5. REVEAL ON SCROLL (Animasi masuk elemen)
        Menggunakan IntersectionObserver, bukan event scroll
     ============================================================ */
  const initRevealObserver = () => {
    const targets = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, ' +
      '.card-highlight, .card-layanan, .card-menu, .gallery-item, .accordion-item'
    );
    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target); // hanya animasi sekali
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((el, i) => {
      // Stagger delay agar elemen grid muncul berurutan
      el.style.transitionDelay = (i % 8) * 0.07 + 's';
      io.observe(el);
    });
  };

  /* ============================================================
     6. ACTIVE PAGE HIGHLIGHTING (untuk halaman non-index)
        Menandai link menu/faq/galeri jika sedang di halaman tsb
     ============================================================ */
  const initPageHighlight = () => {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const standalonePages = ['menu.html', 'faq.html', 'galeri.html'];

    // Hanya aktifkan untuk halaman non-index (index pakai IO)
    if (!standalonePages.includes(currentPage)) return;

    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === currentPage) link.classList.add('active');
    });
  };

  /* ============================================================
     BOOTSTRAP — Urutan eksekusi utama
     ============================================================ */
  const bootstrap = () => {
    // 1. Muat navbar & footer secara paralel
    const navbarReady = loadComponent('navbar-placeholder', 'navbar.html', fallbackNavbar);
    const footerReady = loadComponent('footer-placeholder', 'footer.html', fallbackFooter);

    // 2. Setelah navbar berhasil dimuat → inisialisasi fitur navbar
    navbarReady.then(() => {
      initMobileMenu();
      initSmoothScroll();
      initNavbarShadow();
      initPageHighlight();
    });

    // 3. Setelah semua komponen dimuat → inisialisasi observer
    Promise.all([navbarReady, footerReady]).then(() => {
      initSectionObserver();
      initRevealObserver();

      // Scroll ke hash jika ada (misal dari halaman lain)
      if (window.location.hash) {
        try {
          const target = document.querySelector(window.location.hash);
          if (target) {
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 150);
          }
        } catch (_) { /* hash tidak valid, abaikan */ }
      }
    });
  };

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
