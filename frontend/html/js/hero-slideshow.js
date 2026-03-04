// ==================== HERO SLIDESHOW ====================

const SLIDES = [
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-001.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMS5wbmciLCJpYXQiOjE3NzI1NjYxNjEsImV4cCI6MjA4NzkyNjE2MX0.cW_E9t4c5eJR-5VPybh7By6c5gcN2Q_JDW659yBPm7A',
    tagline: 'Premium Experience',
    sub: 'Where style meets sharp'
  },
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-002.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMi5wbmciLCJpYXQiOjE3NzI1NjYxNzcsImV4cCI6MjA4NzkyNjE3N30.Cmhtp_eYHASmJQK7AIqUyGEXl4dnxM5ypdUfLgvpK48',
    tagline: 'Precision Cuts',
    sub: 'Crafted for the modern gentleman'
  },
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-003.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwMy5wbmciLCJpYXQiOjE3NzI1NjYxODgsImV4cCI6MjA4NzkyNjE4OH0.C_ACdWx5r5Z4budmHLY8-ng80P-Qrj62HohlHiwfIFo',
    tagline: 'Master Barbers',
    sub: 'Experience meets artistry'
  },
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-004.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNC5wbmciLCJpYXQiOjE3NzI1NjYyMDEsImV4cCI6MjA4NzkyNjIwMX0.vhyTtUAKJGOPMJBw-ABKSWZH-fow8tt8hmWBPxzJXpo',
    tagline: 'Celebrity Cuts',
    sub: 'The sharpest cuts in San Diego'
  },
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-005.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNS5wbmciLCJpYXQiOjE3NzI1NjYyMTEsImV4cCI6MjA4NzkyNjIxMX0.Pq-w68sPdjxwoJR4K-EFLDHJAlj6dq86kTsXhVVXq7I',
    tagline: 'Master Braiders',
    sub: 'Art in every braid'
  },
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/sign/staysharp_rotation/sssimg-006.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWRjYzc1Yi0wMzJmLTQ3YzYtYTdkZC05OWM1ZjE5MGZhMmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdGF5c2hhcnBfcm90YXRpb24vc3NzaW1nLTAwNi5wbmciLCJpYXQiOjE3NzI1NjYyMjMsImV4cCI6MjA4NzkyNjIyM30.LmXx7VDhf7BT7BdgTrrCn7c2GXkd-RAbNCfGixE0EHM',
    tagline: 'Premium Experience',
    sub: 'Where style meets sharp'
  }
];

let current = 0;
let autoTimer = null;
let isAnimating = false;

// ── Build DOM ──────────────────────────────────────────
function buildSlideshow() {
  const slidesEl  = document.getElementById('heroSlides');
  const dotsEl    = document.getElementById('heroDots');
  const taglineEl = document.getElementById('heroTagline');
  const subEl     = document.getElementById('heroSub');

  if (!slidesEl || !dotsEl) return;

  // Create one <div> per slide (all stacked, only active is visible)
  SLIDES.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'hero-slide' + (i === 0 ? ' active' : '');
    div.style.backgroundImage = `url('${s.img}')`;
    slidesEl.appendChild(div);
  });

  // Arrow left
  const arrowLeft = document.createElement('button');
  arrowLeft.className = 'hero-arrow hero-arrow--left';
  arrowLeft.innerHTML = '&#8249;';
  arrowLeft.setAttribute('aria-label', 'Previous slide');
  arrowLeft.addEventListener('click', () => goTo(current - 1));
  dotsEl.appendChild(arrowLeft);

  // Dots
  SLIDES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  // Arrow right
  const arrowRight = document.createElement('button');
  arrowRight.className = 'hero-arrow hero-arrow--right';
  arrowRight.innerHTML = '&#8250;';
  arrowRight.setAttribute('aria-label', 'Next slide');
  arrowRight.addEventListener('click', () => goTo(current + 1));
  dotsEl.appendChild(arrowRight);

  // Start auto-advance
  startTimer();
}

// ── Transition ─────────────────────────────────────────
function goTo(index) {
  if (isAnimating) return;

  const total = SLIDES.length;
  const next  = ((index % total) + total) % total;
  if (next === current) return;

  isAnimating = true;
  resetTimer();

  const slideEls = document.querySelectorAll('.hero-slide');
  const dotEls   = document.querySelectorAll('.hero-dot');
  const taglineEl = document.getElementById('heroTagline');
  const subEl     = document.getElementById('heroSub');

  // Fade out current slide
  slideEls[current].classList.remove('active');
  slideEls[current].classList.add('leaving');

  // Fade in next slide
  slideEls[next].classList.add('active');

  // Update dots
  dotEls[current].classList.remove('active');
  dotEls[next].classList.add('active');

  current = next;

  // Animate text out then in
  if (taglineEl && subEl) {
    taglineEl.classList.add('text-fade');
    subEl.classList.add('text-fade');

    setTimeout(() => {
      taglineEl.textContent = SLIDES[current].tagline;
      subEl.textContent     = SLIDES[current].sub;
      taglineEl.classList.remove('text-fade');
      subEl.classList.remove('text-fade');
    }, 300);
  }

  // Clean up after transition
  setTimeout(() => {
    slideEls.forEach(s => s.classList.remove('leaving'));
    isAnimating = false;
  }, 900);
}

function startTimer() {
  autoTimer = setInterval(() => goTo(current + 1), 5000);
}

function resetTimer() {
  clearInterval(autoTimer);
  startTimer();
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', buildSlideshow);