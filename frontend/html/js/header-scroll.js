(function () {
    'use strict';

    function initHeaderScroll() {
        var header = document.getElementById('mainHeader');
        if (!header) return;

        function update() {
            if (window.pageYOffset > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', update, { passive: true });
        update(); // set correct state immediately on load
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderScroll);
    } else {
        initHeaderScroll();
    }
})();