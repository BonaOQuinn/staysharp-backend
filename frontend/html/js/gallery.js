// ==================== HOME PAGE GALLERY ====================
// Populates the 7-image gallery grid on index.html

const GALLERY_IMAGES = [
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-001.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMS5wbmciLCJpYXQiOjE3NzI1NjYxNjEsImV4cCI6MjA4NzkyNjE2MX0.cW_E9t4c5eJR-5VPybh7By6c5gcN2Q_JDW659yBPm7A',
    alt: 'Stay Sharp signature cut'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-002.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMi5wbmciLCJpYXQiOjE3NzI1NjYxNzcsImV4cCI6MjA4NzkyNjE3N30.Cmhtp_eYHASmJQK7AIqUyGEXl4dnxM5ypdUfLgvpK48',
    alt: 'Precision fade cut'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-003.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMy5wbmciLCJpYXQiOjE3NzI1NjYxODgsImV4cCI6MjA4NzkyNjE4OH0.C_ACdWx5r5Z4budmHLY8-ng80P-Qrj62HohlHiwfIFo',
    alt: 'Master barber at work'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-004.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNC5wbmciLCJpYXQiOjE3NzI1NjYyMDEsImV4cCI6MjA4NzkyNjIwMX0.vhyTtUAKJGOPMJBw-ABKSWZH-fow8tt8hmWBPxzJXpo',
    alt: 'Celebrity style cut'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-005.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNS5wbmciLCJpYXQiOjE3NzI1NjYyMTEsImV4cCI6MjA4NzkyNjIxMX0.Pq-w68sPdjxwoJR4K-EFLDHJAlj6dq86kTsXhVVXq7I',
    alt: 'Braiding artistry'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-006.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNi5wbmciLCJpYXQiOjE3NzI1NjYyMjMsImV4cCI6MjA4NzkyNjIyM30.LmXx7VDhf7BT7BdgTrrCn7c2GXkd-RAbNCfGixE0EHM',
    alt: 'Premium barbershop experience'
  },
  {
    src: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-001.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMS5wbmciLCJpYXQiOjE3NzI1NjYxNjEsImV4cCI6MjA4NzkyNjE2MX0.cW_E9t4c5eJR-5VPybh7By6c5gcN2Q_JDW659yBPm7A',
    alt: 'Hair design detail'
  }
];

(function () {
  'use strict';

  function buildGallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    // Clear loading placeholder
    grid.innerHTML = '';

    GALLERY_IMAGES.forEach(function (img) {
      var item = document.createElement('div');
      item.className = 'gallery-item';
      item.onclick = function () { openLightbox(img.src); };

      var image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt;
      image.loading = 'lazy';

      var overlay = document.createElement('div');
      overlay.className = 'gallery-item-overlay';
      overlay.innerHTML = '<svg class="gallery-expand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

      item.appendChild(image);
      item.appendChild(overlay);
      grid.appendChild(item);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGallery);
  } else {
    buildGallery();
  }
})();