/* ============================================================
   SETUMU DOMPAK — Main JS
   Component Loader + Scroll Effects + Animations
   ============================================================ */

const init = () => {
    const fallbackNavbar = `
<nav class="navbar">
    <div class="logo">SETUMU DOMPAK</div>
    <button class="nav-toggle" id="navToggle" aria-label="Menu">
        <i class="fas fa-bars"></i>
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
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-tiktok"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
    </div>
</footer>
    `;

    // Determine the base path dynamically to handle hosting in subdirectories
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

    // ── Load Components ──
    const loadNavbar = Promise.resolve()
        .then(() => {
            if (window.location.protocol === 'file:') {
                throw new Error('CORS limitation on file:// protocol');
            }
            const basePath = getBasePath();
            return fetch(basePath + 'navbar.html');
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
            return fetch(basePath + 'footer.html');
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

    // Wait for components to load before handling layout adjustments and animations
    Promise.all([loadNavbar, loadFooter]).then(() => {
        initializeScrollObserver();
        
        // Handle scrolling to hash after dynamic content is fully loaded
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

/* ── Navbar scroll shadow & active state highlighting ── */
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
        // Active page highlighting
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
        // Mobile Hamburger Menu Interactivity
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
                
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });

            // Close menu when clicking any nav link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error initializing mobile menu:', e);
    }
}


/* ── Reveal on scroll (IntersectionObserver) ── */
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
            /* Stagger per grid-item */
            el.style.transitionDelay = (i % 8) * 0.07 + 's';
            io.observe(el);
        });
    }
}
