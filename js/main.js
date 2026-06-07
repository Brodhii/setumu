/* ============================================================
   SETUMU DOMPAK — Main JS
   Component Loader + Scroll Effects + Animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Load Components ──
    const loadNavbar = fetch('navbar.html')
        .then(res => res.text())
        .then(html => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
                initializeNavbarEffects();
            }
        })
        .catch(err => console.error('Error loading navbar:', err));

    const loadFooter = fetch('footer.html')
        .then(res => res.text())
        .then(html => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
            }
        })
        .catch(err => console.error('Error loading footer:', err));

    // Wait for components to load before handling layout adjustments if needed
    Promise.all([loadNavbar, loadFooter]).then(() => {
        initializeScrollObserver();
    });
});

/* ── Navbar scroll shadow & active state highlighting ── */
function initializeNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // Active page highlighting
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href') || '';
        
        if (currentPage === 'menu.html') {
            if (href === 'menu.html') {
                link.classList.add('active');
            }
        }
    });

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
