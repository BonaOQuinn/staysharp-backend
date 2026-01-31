// Booking System Configuration
const API_BASE_URL = 'https://4hsxwekzik.us-west-2.awsapprunner.com/api';

// State Management
const bookingState = {
    location: null,
    service: null,
    barber: null,
    date: null,
    time: null,
    customerInfo: {
        name: '',
        phone: '',
        email: ''
    }
};

// Initialize the booking system
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Booking system initializing...');
    initializeBookingSystem();
});

async function initializeBookingSystem() {
    try {
        console.log('📍 Starting initialization...');
        
        // Create and show location selection
        await createLocationStep();
        
        console.log('✅ Initialization complete');
    } catch (error) {
        console.error('❌ Error initializing booking system:', error);
        showError('Failed to load booking system. Please refresh the page.');
    }
}

// STEP 1: Location Selection
async function createLocationStep() {
    try {
        console.log('📍 Fetching locations from:', `${API_BASE_URL}/locations`);
        
        const response = await fetch(`${API_BASE_URL}/locations`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch locations: ${response.status}`);
        }
        
        const locations = await response.json();
        console.log('✅ Locations loaded:', locations);
        
        const bookingContent = document.querySelector('.booking-content');
        
        if (!bookingContent) {
            console.error('❌ .booking-content element not found!');
            return;
        }
        
        bookingContent.innerHTML = `
            <div class="step-container" id="locationStep">
                <h2 class="step-title">Step 1: Select Location</h2>
                <div class="selection-grid">
                    ${locations.map(location => `
                        <div class="selection-card" data-id="${location.id}">
                            <h3>${location.name}</h3>
                            <p class="address">${location.address1 || ''}</p>
                            <p class="city">${location.city || ''}, CA</p>
                            <button type="button" class="select-button" data-location-id="${location.id}" data-location-name="${escapeAttribute(location.name)}">
                                Select Location
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const buttons = bookingContent.querySelectorAll('.select-button');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const locationId = parseInt(this.getAttribute('data-location-id'));
                const locationName = this.getAttribute('data-location-name');
                selectLocation(locationId, locationName);
            });
        });
        
        console.log('✅ Location selection rendered');
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

// STEP 2: Barber Selection
async function createBarberStep() {
    try {
        console.log('👨‍💼 Fetching barbers for location:', bookingState.location.id);
        
        const response = await fetch(`${API_BASE_URL}/barbers?locationId=${bookingState.location.id}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch barbers: ${response.status}`);
        }
        
        const barbers = await response.json();
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
                        console.log('Rendering barber:', barber);
                        return `
                        <div class="barber-card" data-id="${barber.id}">
                            <div class="barber-image-container">
                                <img src="${barber.photo_url || '/images/barbers/default.jpg'}" 
                                     alt="${barber.name}" 
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
                                ${barber.specialties && barber.specialties.length > 0 ? `
                                    <div class="barber-specialties">
                                        <p class="specialties-label">Specialties:</p>
                                        <div class="specialty-tags">
                                            ${barber.specialties.map(specialty => `
                                                <span class="specialty-tag">${escapeHtml(specialty)}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <button type="button" class="select-barber-button" data-barber-id="${barber.id}" data-barber-name="${escapeAttribute(barber.name)}">
                                Book with ${escapeHtml(barber.name)}
                            </button>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
        
        // Add event listener for back button
        const backButton = document.getElementById('backToLocations');
        if (backButton) {
            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                createLocationStep();
            });
        }
        
        // Add event listeners to barber buttons
        const barberButtons = bookingContent.querySelectorAll('.select-barber-button');
        barberButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const barberId = parseInt(this.getAttribute('data-barber-id'));
                const barberName = this.getAttribute('data-barber-name');
                selectBarber(barberId, barberName);
            });
        });
        
        console.log('✅ Barber selection rendered');
    } catch (error) {
        console.error('❌ Error loading barbers:', error);
        showError('Failed to load barbers: ' + error.message);
    }
}

function selectBarber(barberId, barberName) {
    console.log('👨‍💼 Barber selected:', barberId, barberName);
    bookingState.barber = { id: barberId, name: barberName };
    
    // Show success message since booking is external
    showSuccess(`You've selected ${barberName}. Booking is handled externally through our booking platform.`);
}

// Utility Functions
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

// Toast Notification Functions
function showError(message) {
    console.error('🔴 Error:', message);
    
    // Create error toast notification
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    document.body.appendChild(errorToast);

    setTimeout(() => {
        errorToast.classList.add('show');
    }, 100);

    setTimeout(() => {
        errorToast.classList.remove('show');
        setTimeout(() => errorToast.remove(), 300);
    }, 5000);
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    
    // Create success toast notification
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.textContent = message;
    document.body.appendChild(successToast);

    setTimeout(() => {
        successToast.classList.add('show');
    }, 100);

    setTimeout(() => {
        successToast.classList.remove('show');
        setTimeout(() => successToast.remove(), 300);
    }, 5000);
}

// Debug: Log when script loads
console.log('📜 booking-new.js loaded successfully');
console.log('🔗 API URL:', API_BASE_URL);