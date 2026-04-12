/**
 * header-scroll.js
 * ─────────────────────────────────────────────────────────────
 * Behaviour:
 *  • Header starts hidden (slid off-screen upward).
 *  • A gold pull-tab appears at the top of the page.
 *  • Click OR swipe-down on the tab → header slides in.
 *  • Swipe-up on the header itself → header hides again.
 *  • Auto-hides after AUTO_HIDE_MS ms if the pointer leaves the header.
 *  • "scrolled" class is applied when page scroll > 10 px (background effect).
 * ─────────────────────────────────────────────────────────────
 */
(function () {
    'use strict';

    var AUTO_HIDE_MS = 4000;   // ms before header auto-hides after reveal
    var SWIPE_THRESHOLD = 30;  // px of vertical movement counted as a swipe

    var header, tab, autoHideTimer;
    var touchStartY = 0;
    var headerVisible = false;

    /* ── 1. Create the pull-tab DOM element ── */
    function createPullTab() {
        var el = document.createElement('div');
        el.className = 'header-pull-tab';
        el.setAttribute('aria-label', 'Show navigation');
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');

        el.innerHTML =
            '<div class="pull-tab__bar"></div>' +
            '<svg class="pull-tab__chevron" viewBox="0 0 24 24" fill="none" ' +
            '     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '  <polyline points="6 9 12 15 18 9" stroke="#FFD700" stroke-width="2.5" ' +
            '            stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
            '<span class="pull-tab__label">Menu</span>';

        document.body.appendChild(el);
        return el;
    }

    /* ── 2. Show / Hide header ── */
    function showHeader() {
        if (headerVisible) return;
        headerVisible = true;
        header.classList.add('header--visible');
        tab.classList.add('tab--hidden');
        scheduleAutoHide();
    }

    function hideHeader() {
        if (!headerVisible) return;
        headerVisible = false;
        header.classList.remove('header--visible');
        tab.classList.remove('tab--hidden');
        clearAutoHide();
    }

    /* ── 3. Auto-hide timer ── */
    function scheduleAutoHide() {
        clearAutoHide();
        autoHideTimer = setTimeout(hideHeader, AUTO_HIDE_MS);
    }

    function clearAutoHide() {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }
    }

    /* ── 4. Keep header alive while hovered ── */
    function onHeaderMouseEnter() {
        clearAutoHide();
    }

    function onHeaderMouseLeave() {
        scheduleAutoHide();
    }

    /* ── 5. Scroll → update "scrolled" background class ── */
    function updateScrolledClass() {
        if (window.pageYOffset > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    /* ── 6. Touch: swipe-down on pull-tab to reveal, swipe-up on header to hide ── */
    function onTabTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function onTabTouchEnd(e) {
        var delta = e.changedTouches[0].clientY - touchStartY;
        if (delta > SWIPE_THRESHOLD) {
            // swiped down on tab → show
            showHeader();
        }
    }

    function onHeaderTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function onHeaderTouchEnd(e) {
        var delta = e.changedTouches[0].clientY - touchStartY;
        if (delta < -SWIPE_THRESHOLD) {
            // swiped up on header → hide
            hideHeader();
        } else if (delta > 5) {
            // any downward touch resets auto-hide timer
            clearAutoHide();
            scheduleAutoHide();
        }
    }

    /* ── 7. Keyboard accessibility on pull-tab ── */
    function onTabKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showHeader();
        }
    }

    /* ── 8. Boot ── */
    function init() {
        header = document.getElementById('mainHeader');
        if (!header) return;

        tab = createPullTab();

        /* Initial state — header hidden */
        header.classList.remove('header--visible');
        updateScrolledClass();

        /* Pull-tab events */
        tab.addEventListener('click', showHeader);
        tab.addEventListener('keydown', onTabKeyDown);
        tab.addEventListener('touchstart', onTabTouchStart, { passive: true });
        tab.addEventListener('touchend', onTabTouchEnd, { passive: true });

        /* Header hover keeps it alive */
        header.addEventListener('mouseenter', onHeaderMouseEnter);
        header.addEventListener('mouseleave', onHeaderMouseLeave);

        /* Header touch swipe-up to hide */
        header.addEventListener('touchstart', onHeaderTouchStart, { passive: true });
        header.addEventListener('touchend', onHeaderTouchEnd, { passive: true });

        /* Scroll → background class */
        window.addEventListener('scroll', updateScrolledClass, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();