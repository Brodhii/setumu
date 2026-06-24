/* ============================================================
   SETUMU DOMPAK — Main JS
   Pemuat Komponen + Efek Gulir + Animasi
   ============================================================ */

const init = () => {
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
        <li><a href="galeri.html">Galeri</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="index.html#kontak">Kontak</a></li>
    </ul>
</nav>
    `;

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
                <a href="#" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                </a>
                <a href="#" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                </a>
                <a href="#" aria-label="Tiktok">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                    </svg>
                </a>
                <a href="#" aria-label="Youtube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</footer>
    `;

    // Tentukan base path secara dinamis untuk menangani hosting di subdirektori
    const getBasePath = () => {
        const path = window.location.pathname;
        const segments = path.split('/');
        if (segments[segments.length - 1].includes('.')) {
            segments.pop();
        }
        let basePath = segments.join('/');
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        return basePath;
    };

    // ── Muat Komponen ──
    const loadNavbar = Promise.resolve()
        .then(() => {
            if (window.location.protocol === 'file:') {
                throw new Error('CORS limitation on file:// protocol');
            }
            const basePath = getBasePath();
            return fetch(basePath + 'navbar.html?v=1.9');
        })
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load navbar.html (HTTP ${res.status})`);
            return res.text();
        })
        .then(html => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
                initializeNavbarEffects();
            }
        })
        .catch(err => {
            console.warn('Navbar fetch failed (possibly due to CORS on file://). Using fallback.', err.message);
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = fallbackNavbar;
                initializeNavbarEffects();
            }
        });

    const loadFooter = Promise.resolve()
        .then(() => {
            if (window.location.protocol === 'file:') {
                throw new Error('CORS limitation on file:// protocol');
            }
            const basePath = getBasePath();
            return fetch(basePath + 'footer.html?v=1.9');
        })
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load footer.html (HTTP ${res.status})`);
            return res.text();
        })
        .then(html => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            }
        })
        .catch(err => {
            console.warn('Footer fetch failed (possibly due to CORS on file://). Using fallback.', err.message);
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = fallbackFooter;
            }
        });

    // Tunggu komponen dimuat sebelum menangani penyesuaian tata letak dan animasi
    Promise.all([loadNavbar, loadFooter]).then(() => {
        initializeScrollObserver();
        
        // Tangani pengguliran ke hash setelah konten dinamis dimuat sepenuhnya
        if (window.location.hash) {
            try {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                }
            } catch (e) {
                console.warn('Invalid hash selector:', window.location.hash);
            }
        }
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* ── Bayangan gulir navbar & penyorotan status aktif ── */
function initializeNavbarEffects() {
    try {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 40);
            }, { passive: true });
        }
    } catch (e) {
        console.error('Error initializing navbar scroll effect:', e);
    }

    try {
        // Penyorotan halaman aktif
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        
        const highlightActiveLink = () => {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href') || '';
                
                if (currentPage === 'menu.html' && href === 'menu.html') {
                    link.classList.add('active');
                } else if (currentPage === 'faq.html' && href === 'faq.html') {
                    link.classList.add('active');
                } else if (currentPage === 'galeri.html' && href === 'galeri.html') {
                    link.classList.add('active');
                } else if (currentPage === 'index.html' || currentPage === '' || currentPage === 'index.php') {
                    const hash = window.location.hash || '#beranda';
                    if (href === 'index.html' + hash || href === hash) {
                        link.classList.add('active');
                    }
                }
            });
        };

        highlightActiveLink();
        window.addEventListener('hashchange', highlightActiveLink);
    } catch (e) {
        console.error('Error initializing active page highlighting:', e);
    }

    try {
        // Interaktivitas Menu Hamburger Seluler
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (navToggle && navLinks) {
            const hamburgerSVG = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;

            const closeSVG = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;

            const setMenuState = (isActive) => {
                if (isActive) {
                    navLinks.classList.add('active');
                    navToggle.innerHTML = closeSVG;
                } else {
                    navLinks.classList.remove('active');
                    navToggle.innerHTML = hamburgerSVG;
                }
            };

            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = !navLinks.classList.contains('active');
                setMenuState(isActive);
            });

            // Tutup menu saat mengklik tautan navigasi apa pun
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    setMenuState(false);
                });
            });

            // Tutup menu saat mengklik di luar
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    setMenuState(false);
                }
            });
        }
    } catch (e) {
        console.error('Error initializing mobile menu:', e);
    }
}


/* ── Tampilkan saat digulir (IntersectionObserver) ── */
function initializeScrollObserver() {
    const revealEls = document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, ' +
        '.card-highlight, .card-layanan, .card-menu, .gallery-item, .accordion-item'
    );

    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealEls.forEach((el, i) => {
            /* Penundaan bertahap per item grid */
            el.style.transitionDelay = (i % 8) * 0.07 + 's';
            io.observe(el);
        });
    }
}
