/**
 * Stay Sharp San Diego — Mobile Navigation
 * Injects a hamburger button + slide-in drawer for mobile screens.
 * Works on every page that uses the shared header structure.
 */
(function () {
    'use strict';

    function initMobileNav() {
        var header = document.getElementById('mainHeader');
        if (!header) return;

        // Grab the existing desktop nav links to mirror them
        var desktopNav = header.querySelector('nav');
        var desktopLinks = desktopNav ? Array.from(desktopNav.querySelectorAll('a')) : [];

        // ── Create hamburger button ──────────────────────────────
        var hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML =
            '<span></span><span></span><span></span>';

        // ── Create full-screen mobile drawer ────────────────────
        var drawer = document.createElement('div');
        drawer.className = 'mobile-nav-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', 'Navigation menu');

        // Close button inside drawer
        var closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-nav-close';
        closeBtn.setAttribute('aria-label', 'Close navigation menu');
        closeBtn.innerHTML = '&times;';
        drawer.appendChild(closeBtn);

        // Mirror nav links
        var drawerNav = document.createElement('nav');
        desktopLinks.forEach(function (link) {
            var a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.textContent.trim();
            if (link.classList.contains('active')) a.classList.add('active');
            a.addEventListener('click', closeDrawer);
            drawerNav.appendChild(a);
        });
        drawer.appendChild(drawerNav);

        // Book Now button inside drawer
        var bookBtn = document.createElement('a');
        bookBtn.href = 'booking.html';
        bookBtn.className = 'mobile-book-btn';
        bookBtn.textContent = 'Book Now';
        bookBtn.addEventListener('click', closeDrawer);
        drawer.appendChild(bookBtn);

        document.body.appendChild(drawer);

        // ── Insert hamburger into header ─────────────────────────
        // Place it at the end of .header-right if it exists, else append to header
        var headerRight = header.querySelector('.header-right');
        if (headerRight) {
            headerRight.appendChild(hamburger);
        } else {
            header.appendChild(hamburger);
        }

        // ── Toggle logic ─────────────────────────────────────────
        function openDrawer() {
            drawer.classList.add('open');
            hamburger.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', function () {
            if (drawer.classList.contains('open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        closeBtn.addEventListener('click', closeDrawer);

        // Close on backdrop click
        drawer.addEventListener('click', function (e) {
            if (e.target === drawer) closeDrawer();
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                closeDrawer();
            }
        });

        // Close drawer when resizing to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && drawer.classList.contains('open')) {
                closeDrawer();
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();