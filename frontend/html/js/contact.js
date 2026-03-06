// ==================== CONTACT PAGE SCRIPTS ====================

// ── Header scroll effect ──
(function () {
    var h = document.getElementById('mainHeader');
    if (!h) return;
    function update() {
        h.classList[window.pageYOffset > 10 ? 'add' : 'remove']('scrolled');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();


var FORMSPREE_ID = 'xgonwdoo';

document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var form   = this;
    var btn    = document.getElementById('submitBtn');
    var status = document.getElementById('formStatus');
    var name   = document.getElementById('fname').value.trim();
    var email  = document.getElementById('femail').value.trim();
    var msg    = document.getElementById('fmsg').value.trim();

    // Reset status
    status.className = 'form-status';
    status.textContent = '';

    // ── Client-side validation ──
    if (!name || !email || !msg) {
        status.className = 'form-status err';
        status.textContent = 'Please fill in your name, email, and message.';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.className = 'form-status err';
        status.textContent = 'Please enter a valid email address.';
        return;
    }

    // ── Submitting state ──
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';

    // ── POST to Formspree ──
    fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
    })
    .then(function (res) {
        if (res.ok) {
            // Success
            status.className = 'form-status ok';
            status.textContent = '\u2713 Message sent! We\u2019ll be in touch soon.';
            form.reset();
        } else {
            // Server-side error — surface Formspree's error message if available
            return res.json().then(function (data) {
                var errMsg = (data.errors && data.errors.map(function (err) {
                    return err.message;
                }).join(', ')) || 'Something went wrong. Please try again.';
                status.className = 'form-status err';
                status.textContent = errMsg;
            });
        }
    })
    .catch(function () {
        // Network / fetch error
        status.className = 'form-status err';
        status.textContent = 'Network error. Please check your connection and try again.';
    })
    .finally(function () {
        btn.disabled = false;
        btn.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px">' +
            '<line x1="22" y1="2" x2="11" y2="13"/>' +
            '<polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
    });
});