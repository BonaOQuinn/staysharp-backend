// ==================== SERVICE CARD BACKGROUNDS ====================
// Loads background photos for the homepage service cards from Supabase.
// Bucket: staysharp_rotation  |  Folder: Services
//
// Maps each card's data-service attribute to the correct filename:
//   fades   → fades.png
//   design  → design.png
//   braids  → braids.png
//   beard   → Beard.png
//   facial  → facial.jpeg

(function () {
    'use strict';

    const SUPABASE_URL = 'https://txioesoxmxprlhnivcle.supabase.co';
    const BUCKET       = 'staysharp_rotation';
    const FOLDER       = 'Services';

    // Map data-service slug → exact filename in the bucket
    const SERVICE_PHOTOS = {
        fades:  'fades.png',
        design: 'design.png',
        braids: 'braids.png',
        beard:  'Beard.png',
        facial: 'facial.jpeg'
    };

    function publicUrl(filename) {
        return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${filename}`;
    }

    function applyBackgrounds() {
        document.querySelectorAll('.service-card--photo[data-service]').forEach(function (card) {
            var key      = card.dataset.service;
            var filename = SERVICE_PHOTOS[key];
            if (!filename) return;

            var bg = card.querySelector('.service-card__bg');
            if (!bg) return;

            var url = publicUrl(filename);
            bg.style.backgroundImage = 'url("' + url + '")';

            // Hide card gracefully if image fails to load
            var probe = new Image();
            probe.onerror = function () {
                bg.style.display = 'none';
                console.warn('Service photo not found:', url);
            };
            probe.src = url;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBackgrounds);
    } else {
        applyBackgrounds();
    }
})();