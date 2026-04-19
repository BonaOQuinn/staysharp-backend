// ==================== SERVICE CARD BACKGROUNDS ====================
// Loads background photos for the homepage service cards from Supabase.
// Bucket: staysharp_rotation  |  Folder: index_services

(function () {
    'use strict';

    const SUPABASE_URL = 'https://txioesoxmxprlhnivcle.supabase.co';
    const BUCKET       = 'staysharp_rotation';
    const FOLDER       = 'index_services';

    // Map data-service slug → filename in index_services folder
    const SERVICE_PHOTOS = {
        fades:  'cross.png',
        design: 'fendi.png',
        braids: 'braids.png',
        beard:  'beard.png',
        facial: 'facial.png'
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

            // Hide bg gracefully if image fails to load
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