// ==================== HERO SLIDESHOW ====================

const SLIDES = [
  {
    img: 'https://txioesoxmxprlhnivcle.supabase.co/storage/v1/object/public/staysharp_rotation/index_services/collage.png',
    tagline: 'Premium Experience',
    sub: 'Where style meets sharp'
  }
];

let current = 0;
let isAnimating = false;

// ── Build DOM ──────────────────────────────────────────
function buildSlideshow() {
  const slidesEl  = document.getElementById('heroSlides');
  const dotsEl    = document.getElementById('heroDots');
  const taglineEl = document.getElementById('heroTagline');
  const subEl     = document.getElementById('heroSub');

  if (!slidesEl || !dotsEl) return;

  SLIDES.forEach((s, i) => {
    // Outer div — carries the background-image so ::before can inherit it for the blurred fill
    const outer = document.createElement('div');
    outer.className = 'hero-slide' + (i === 0 ? ' active' : '');
    outer.style.backgroundImage = `url('${s.img}')`;

    // Inner div — shows the full image contained/sharp in the centre
    const inner = document.createElement('div');
    inner.className = 'hero-slide-img';
    inner.style.backgroundImage = `url('${s.img}')`;

    outer.appendChild(inner);
    slidesEl.appendChild(outer);
  });

  // Only show dots/arrows if there are multiple slides
  if (SLIDES.length > 1) {
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
  }

  if (taglineEl) taglineEl.textContent = SLIDES[0].tagline;
  if (subEl)     subEl.textContent     = SLIDES[0].sub;
}

// ── Transition ─────────────────────────────────────────
function goTo(index) {
  if (isAnimating) return;

  const total = SLIDES.length;
  const next  = ((index % total) + total) % total;
  if (next === current) return;

  isAnimating = true;

  const slideEls  = document.querySelectorAll('.hero-slide');
  const dotEls    = document.querySelectorAll('.hero-dot');
  const taglineEl = document.getElementById('heroTagline');
  const subEl     = document.getElementById('heroSub');

  slideEls[current].classList.remove('active');
  slideEls[current].classList.add('leaving');
  slideEls[next].classList.add('active');

  dotEls[current].classList.remove('active');
  dotEls[next].classList.add('active');

  current = next;

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

  setTimeout(() => {
    slideEls.forEach(s => s.classList.remove('leaving'));
    isAnimating = false;
  }, 900);
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', buildSlideshow);