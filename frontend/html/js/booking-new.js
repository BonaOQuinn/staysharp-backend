// Booking System Configuration
// ── Queries Supabase directly via PostgREST ──
const SUPABASE_URL = 'https://txioesoxmxprlhnivcle.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aW9lc294bXhwcmxobml2Y2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjcyMjUsImV4cCI6MjA4NjQwMzIyNX0._tmjg6n9BlAjrMZVvPwjg3hsmCZIOvJifo_slurLQd8';

const SUPABASE_HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

// State Management
const bookingState = {
    location: null,
    barber: null
};

// Initialize the booking system
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Booking system initializing (Supabase direct)...');
    createLocationStep();
});

// ── Supabase fetch helper ──
async function sbFetch(table, params = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
        headers: SUPABASE_HEADERS
    });
    if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
    return res.json();
}

// STEP 1: Location Selection
async function createLocationStep() {
    try {
        console.log('🔍 Fetching locations from Supabase...');

        const locations = await sbFetch('locations', '?is_active=eq.true&order=id.asc');
        console.log('✅ Locations loaded:', locations);

        const bookingContent = document.querySelector('.booking-content');
        if (!bookingContent) return;

        // Extract short display name (e.g. "StaySharp - La Mesa" → "La Mesa")
        const shortName = (loc) => {
            const parts = loc.name.split(' - ');
            return parts.length > 1 ? parts[1] : loc.name;
        };

        bookingContent.innerHTML = `
            <div class="step-container" id="locationStep">
                <h2 class="step-title">Choose Your Location</h2>
                <p class="location-step-subtitle">Select a shop near you to get started</p>
                <div class="selection-grid">
                    ${locations.map(location => `
                        <div class="selection-card" data-id="${location.id}">
                            <div class="location-card-body">
                                <h3 class="location-card-name">
                                    <span class="location-pin">📍</span>${shortName(location)}
                                </h3>
                                <p class="location-card-address">${location.city || ''}, San Diego, CA</p>
                                <p class="location-card-city">${location.city || ''}, CA</p>
                            </div>
                            <div class="location-card-divider"></div>
                            <button type="button" class="select-button"
                                data-location-id="${location.id}"
                                data-location-name="${escapeAttribute(location.name)}">
                                SELECT LOCATION
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        bookingContent.querySelectorAll('.select-button').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectLocation(
                    parseInt(this.getAttribute('data-location-id')),
                    this.getAttribute('data-location-name')
                );
            });
        });

        console.log('✅ Location step rendered');
    } catch (error) {
        console.error('❌ Error loading locations:', error);
        showError('Failed to load locations: ' + error.message);
    }
}

function selectLocation(locationId, locationName) {
    console.log('📍 Location selected:', locationId, locationName);
    bookingState.location = { id: locationId, name: locationName };
    createBarberStep();
}

// STEP 2: Barber Selection — loads ALL barbers for selected location from Supabase
async function createBarberStep() {
    try {
        console.log('👨‍💼 Fetching barbers from Supabase for location:', bookingState.location.id);

        const barbers = await sbFetch(
            'barbers',
            `?location_id=eq.${bookingState.location.id}&is_active=eq.true&order=display_order.asc,name.asc`
        );
        console.log('✅ Barbers loaded:', barbers);

        if (!barbers || barbers.length === 0) {
            showError('No barbers available at this location.');
            return;
        }

        const bookingContent = document.querySelector('.booking-content');

        bookingContent.innerHTML = `
            <div class="step-container" id="barberStep">
                <div class="step-header">
                    <button type="button" class="back-button" id="backToLocations">← Back</button>
                    <h2 class="step-title">Meet Our Barbers</h2>
                </div>
                <p class="step-subtitle">📍 ${bookingState.location.name}</p>
                <div class="barber-grid">
                    ${barbers.map(barber => {
                        const specialties = Array.isArray(barber.specialties) ? barber.specialties : [];
                        return `
                        <div class="barber-card" data-id="${barber.id}">
                            <div class="barber-image-container">
                                <img src="${barber.photo_url || '/images/barbers/default.jpg'}"
                                     alt="${escapeAttribute(barber.name)}"
                                     class="barber-photo"
                                     onerror="this.onerror=null; this.src='/images/barbers/default.jpg';">
                            </div>
                            <div class="barber-info">
                                <h3 class="barber-name">${escapeHtml(barber.name)}</h3>
                                ${barber.years_experience ? `
                                    <p class="barber-experience">
                                        <span class="experience-icon">⭐</span>
                                        ${barber.years_experience} ${barber.years_experience === 1 ? 'year' : 'years'} of experience
                                    </p>
                                ` : ''}
                                ${barber.bio ? `
                                    <p class="barber-bio">${escapeHtml(barber.bio)}</p>
                                ` : ''}
                                ${specialties.length > 0 ? `
                                    <div class="barber-specialties">
                                        <p class="specialties-label">Specialties:</p>
                                        <div class="specialty-tags">
                                            ${specialties.map(s => `
                                                <span class="specialty-tag">${escapeHtml(s)}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <button type="button" class="select-barber-button"
                                data-barber-id="${barber.id}"
                                data-barber-name="${escapeAttribute(barber.name)}"
                                data-booking-url="${escapeAttribute(barber.booking_url || '')}">
                                <span>📅 Book with ${escapeHtml(barber.name)}</span>
                            </button>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;

        document.getElementById('backToLocations')?.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            createLocationStep();
        });

        bookingContent.querySelectorAll('.select-barber-button').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectBarber(
                    parseInt(this.getAttribute('data-barber-id')),
                    this.getAttribute('data-barber-name'),
                    this.getAttribute('data-booking-url')
                );
            });
        });

        console.log('✅ Barber step rendered with', barbers.length, 'barbers');
    } catch (error) {
        console.error('❌ Error loading barbers:', error);
        showError('Failed to load barbers: ' + error.message);
    }
}

function selectBarber(barberId, barberName, bookingUrl) {
    console.log('👨‍💼 Barber selected:', barberId, barberName, bookingUrl);
    bookingState.barber = { id: barberId, name: barberName };

    if (bookingUrl) {
        window.open(bookingUrl, '_blank');
    } else {
        showSuccess(`You've selected ${barberName}. Booking is handled externally through our booking platform.`);
    }
}

// ── Utility Functions ──
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttribute(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showError(message) {
    console.error('🔴 Error:', message);
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
}

console.log('📜 booking-new.js loaded (Supabase direct mode)');