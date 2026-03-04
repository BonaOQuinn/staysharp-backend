// ==================== REVIEWS CAROUSEL ====================

const REVIEWS = [
  {
    stars: 5,
    text: 'Best barbershop in San Diego, hands down. Bebos and his team are incredibly talented. The attention to detail is unmatched.',
    author: 'Marcus T.',
    date: '2 weeks ago'
  },
  {
    stars: 5,
    text: 'I\'ve been coming here for over 3 years now. Every single cut is clean, precise, and exactly what I ask for. The vibe in the shop is always great.',
    author: 'David R.',
    date: '1 month ago'
  },
  {
    stars: 5,
    text: 'Drove 45 minutes to get here and it was absolutely worth it. These guys are true artists. My fade has never looked this good.',
    author: 'Jason L.',
    date: '3 weeks ago'
  },
  {
    stars: 5,
    text: 'The VIP experience is next level. Hot towel shave, perfect lineup, and the whole team treats you like family. 10/10 every time.',
    author: 'Anthony M.',
    date: '1 week ago'
  },
  {
    stars: 5,
    text: 'Saw their work on Instagram and had to come check it out. The designs they can do are insane. Will definitely be a regular now.',
    author: 'Carlos G.',
    date: '2 months ago'
  }
];

(function () {
  'use strict';

  var currentReview = 0;
  var autoReviewTimer = null;

  function buildReviews() {
    var track = document.getElementById('reviewsTrack');
    var dots = document.getElementById('reviewsDots');
    var prevBtn = document.getElementById('reviewPrev');
    var nextBtn = document.getElementById('reviewNext');

    if (!track || !dots) return;

    // Build review cards
    REVIEWS.forEach(function (r, i) {
      var card = document.createElement('div');
      card.className = 'review-card' + (i === 0 ? ' active' : '');

      var starsHtml = '<div class="review-stars">';
      for (var s = 0; s < r.stars; s++) starsHtml += '★';
      starsHtml += '</div>';

      card.innerHTML =
        starsHtml +
        '<p class="review-text">"' + r.text + '"</p>' +
        '<div class="review-footer">' +
        '  <span class="review-author">' + r.author + '</span>' +
        '  <span class="review-date">' + r.date + '</span>' +
        '</div>';

      track.appendChild(card);
    });

    // Build dots
    REVIEWS.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'reviews-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      dot.addEventListener('click', function () { goToReview(i); });
      dots.appendChild(dot);
    });

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', function () { goToReview(currentReview - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToReview(currentReview + 1); });

    // Auto-advance
    startReviewTimer();
  }

  function goToReview(index) {
    var cards = document.querySelectorAll('.review-card');
    var dotEls = document.querySelectorAll('.reviews-dot');
    if (!cards.length) return;

    var total = REVIEWS.length;
    var next = ((index % total) + total) % total;

    cards[currentReview].classList.remove('active');
    dotEls[currentReview].classList.remove('active');

    cards[next].classList.add('active');
    dotEls[next].classList.add('active');

    currentReview = next;
    resetReviewTimer();
  }

  function startReviewTimer() {
    autoReviewTimer = setInterval(function () { goToReview(currentReview + 1); }, 6000);
  }

  function resetReviewTimer() {
    clearInterval(autoReviewTimer);
    startReviewTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildReviews);
  } else {
    buildReviews();
  }
})();