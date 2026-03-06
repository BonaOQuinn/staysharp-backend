// ==================== INDEX PAGE GALLERY ====================
// Fetches images from Supabase and renders a 7-item preview grid
// Targets #galleryGrid with .gallery-item children (matching Home.css layout)

(function () {
    'use strict';

    const SUPABASE_URL    = 'https://txioesoxmxprlhnivcle.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aW9lc294bXhwcmxobml2Y2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjcyMjUsImV4cCI6MjA4NjQwMzIyNX0._tmjg6n9BlAjrMZVvPwjg3hsmCZIOvJifo_slurLQd8';
    const BUCKET          = 'staysharp_rotation';
    const FOLDER          = 'Gallery';
    const PREVIEW_COUNT   = 7;

    function publicUrl(filename) {
        return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${filename}`;
    }

    // Build a gallery-item DOM node
    function makeItem(src, alt) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = 'lazy';
        img.onerror = function () { item.style.display = 'none'; };

        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        overlay.innerHTML = `
            <svg class="gallery-expand-icon" width="28" height="28" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>`;

        item.appendChild(img);
        item.appendChild(overlay);

        item.addEventListener('click', function () {
            var lb  = document.getElementById('lightbox');
            var lbi = document.getElementById('lightboxImg');
            if (!lb || !lbi) return;
            lbi.src = src;
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        return item;
    }

    // Render 7 fallback items using known filename pattern
    function renderFallback(grid) {
        grid.innerHTML = '';
        for (var i = 1; i <= PREVIEW_COUNT; i++) {
            var padded = String(i).padStart(3, '0');
            var src    = publicUrl('sssimg-' + padded + '.png');
            grid.appendChild(makeItem(src, 'Stay Sharp San Diego — ' + padded));
        }
    }

    async function init() {
        var grid = document.getElementById('galleryGrid');
        if (!grid) return;

        try {
            // Use Supabase Storage list API (POST endpoint)
            var res = await fetch(
                SUPABASE_URL + '/storage/v1/object/list/' + BUCKET,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prefix: FOLDER + '/',
                        limit: 100,
                        offset: 0,
                        sortBy: { column: 'name', order: 'asc' }
                    })
                }
            );

            if (!res.ok) throw new Error('list failed ' + res.status);

            var files = await res.json();

            // Images only, no videos
            var images = files.filter(function (f) {
                return f.name && /\.(png|jpg|jpeg|webp)$/i.test(f.name);
            });

            if (!images.length) throw new Error('no images');

            // Pick PREVIEW_COUNT evenly-spaced images for visual variety
            var step    = Math.max(1, Math.floor(images.length / PREVIEW_COUNT));
            var picked  = [];
            for (var i = 0; i < PREVIEW_COUNT; i++) {
                var idx = Math.min(i * step, images.length - 1);
                picked.push(images[idx]);
            }

            grid.innerHTML = '';
            picked.forEach(function (file, i) {
                var src = publicUrl(file.name);
                var item = makeItem(src, 'Stay Sharp San Diego gallery');
                // First 3 images load eagerly
                if (i < 3) item.querySelector('img').loading = 'eager';
                grid.appendChild(item);
            });

        } catch (err) {
            console.warn('Index gallery Supabase fetch failed, using fallback:', err);
            renderFallback(grid);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();