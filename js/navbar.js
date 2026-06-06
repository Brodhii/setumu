/* ============================================================
   SETUMU DOMPAK — Global JS
   Scroll animation + Navbar effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Navbar scroll shadow ── */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    /* ── Reveal on scroll (IntersectionObserver) ── */
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

    /* ── Active nav link highlight ── */
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.style.color = 'var(--hijau-mangrove)';
        }
    });

});
