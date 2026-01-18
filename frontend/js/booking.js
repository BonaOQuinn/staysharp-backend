// Booking System Configuration
const API_BASE_URL = 'http://localhost:3000/api';

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

// Current step in booking process
let currentStep = 1;

// Calendar variables
let currentDate = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// Initialize the booking system
document.addEventListener('DOMContentLoaded', function() {
    initializeBookingSystem();
});

async function initializeBookingSystem() {
    try {
        // Hide calendar and time sections initially
        const calendarSection = document.getElementById('calendarSection');
        const timeSection = document.getElementById('timeSection');
        if (calendarSection) calendarSection.style.display = 'none';
        if (timeSection) timeSection.style.display = 'none';
        document.getElementById('timeSection').style.display = 'none';
        
        // Create and show location selection
        await createLocationStep();
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing booking system:', error);
        showError('Failed to load booking system. Please refresh the page.');
    }
}

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('confirmButton').addEventListener('click', confirmAppointment);
}

// STEP 1: Location Selection
async function createLocationStep() {
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) throw new Error('Failed to fetch locations');
        
        const locations = await response.json();
        
        const bookingContent = document.querySelector('.booking-content');
        bookingContent.innerHTML = `
            <div class="step-container" id="locationStep">
                <h2 class="step-title">Step 1: Select Location</h2>
                <div class="selection-grid">
                    ${locations.map(location => `
                        <div class="selection-card" data-id="${location.id}">
                            <h3>${location.name}</h3>
                            <p class="address">${location.address1}</p>
                            <p class="city">${location.city}, CA</p>
                            <button class="select-button" onclick="selectLocation(${location.id}, '${location.name}')">
                                Select Location
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading locations:', error);
        showError('Failed to load locations');
    }
}

window.selectLocation = async function(locationId, locationName) {
    bookingState.location = { id: locationId, name: locationName };
    await createServiceStep();
}

// STEP 2: Service Selection
async function createServiceStep() {
    try {
        const response = await fetch(`${API_BASE_URL}/services`);
        if (!response.ok) throw new Error('Failed to fetch services');
        
        const services = await response.json();
        
        const bookingContent = document.querySelector('.booking-content');
        bookingContent.innerHTML = `
            <div class="step-container" id="serviceStep">
                <div class="step-header">
                    <button class="back-button" onclick="createLocationStep()">← Back</button>
                    <h2 class="step-title">Step 2: Select Service</h2>
                </div>
                <p class="step-subtitle">Location: ${bookingState.location.name}</p>
                <div class="selection-grid">
                    ${services.map(service => `
                        <div class="selection-card" data-id="${service.id}">
                            <h3>${service.name}</h3>
                            <p class="duration">${service.duration_minutes} minutes</p>
                            <p class="price">$${(service.price_cents / 100).toFixed(2)}</p>
                            <button class="select-button" onclick="selectService(${service.id}, '${service.name}', ${service.duration_minutes}, ${service.price_cents})">
                                Select Service
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Failed to load services');
    }
}

window.selectService = async function(serviceId, serviceName, duration, price) {
    bookingState.service = { id: serviceId, name: serviceName, duration, price };
    await createBarberStep();
}

// STEP 3: Barber Selection
async function createBarberStep() {
    try {
        const response = await fetch(`${API_BASE_URL}/barbers?locationId=${bookingState.location.id}`);
        if (!response.ok) throw new Error('Failed to fetch barbers');
        
        const barbers = await response.json();
        
        const bookingContent = document.querySelector('.booking-content');
        bookingContent.innerHTML = `
            <div class="step-container" id="barberStep">
                <div class="step-header">
                    <button class="back-button" onclick="createServiceStep()">← Back</button>
                    <h2 class="step-title">Step 3: Select Barber</h2>
                </div>
                <p class="step-subtitle">Location: ${bookingState.location.name} | Service: ${bookingState.service.name}</p>
                <div class="selection-grid">
                    ${barbers.map((barber, index) => `
                        <div class="selection-card" data-id="${index + 1}">
                            <h3>${barber.name}</h3>
                            <button class="select-button" onclick="selectBarber(${index + 1}, '${barber.name}')">
                                Select Barber
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading barbers:', error);
        showError('Failed to load barbers');
    }
}

window.selectBarber = function(barberId, barberName) {
    bookingState.barber = { id: barberId, name: barberName };
    showCalendarStep();
}

// STEP 4: Date Selection (Calendar)
function showCalendarStep() {
    const bookingContent = document.querySelector('.booking-content');
    bookingContent.innerHTML = `
        <div class="booking-summary">
            <button class="back-button" onclick="createBarberStep()">← Back</button>
            <div class="summary-content">
                <p><strong>Location:</strong> ${bookingState.location.name}</p>
                <p><strong>Service:</strong> ${bookingState.service.name} (${bookingState.service.duration} min)</p>
                <p><strong>Barber:</strong> ${bookingState.barber.name}</p>
                <p><strong>Price:</strong> $${(bookingState.service.price / 100).toFixed(2)}</p>
            </div>
        </div>
        <div class="calendar-section" id="calendarSection">
            <div class="calendar-header pinyon-script-regular">
                <h3 id="monthYear"></h3>
                <div class="calendar-nav">
                    <button id="prevMonth">←</button>
                    <button id="nextMonth">→</button>
                </div>
            </div>
            <div class="calendar-weekdays">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
            </div>
            <div class="calendar-days" id="calendarDays"></div>
        </div>
        <div class="time-section" id="timeSection">
            <div class="time-header">
                <h3>Select Time</h3>
                <p class="selected-date" id="selectedDateDisplay">Choose a date first</p>
            </div>
            <div class="time-slots" id="timeSlots">
                <p class="loading-message">Select a date to view available times</p>
            </div>
            <button class="confirm-button" id="confirmButton" disabled>
                Continue to Confirmation
            </button>
        </div>
    `;
    
    document.getElementById('calendarSection').style.display = 'block';
    
    // Re-setup event listeners for calendar
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('confirmButton').addEventListener('click', showCustomerInfoStep);
    
    renderCalendar();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, true);
        calendarDays.appendChild(dayElement);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        const isPast = date < today;
        const dayElement = createDayElement(day, false, isPast, date);
        calendarDays.appendChild(dayElement);
    }

    // Next month days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, true);
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, isDisabled, date = null) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    if (isDisabled) {
        dayElement.classList.add('disabled');
    } else if (date) {
        dayElement.addEventListener('click', () => selectDate(date, dayElement));
    }

    return dayElement;
}

async function selectDate(date, element) {
    bookingState.date = date;

    // Update selected day styling
    document.querySelectorAll('.calendar-day').forEach(el => {
        el.classList.remove('selected');
    });
    element.classList.add('selected');

    // Show time section
    const timeSection = document.getElementById('timeSection');
    timeSection.style.display = 'block';

    // Update selected date display
    const dateDisplay = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('selectedDateDisplay').textContent = dateDisplay;

    // Load available time slots
    await loadAvailableTimeSlots(date);

    // Reset selected time
    bookingState.time = null;
    updateConfirmButton();
}

async function loadAvailableTimeSlots(date) {
    try {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '<p class="loading-message">Loading available times...</p>';

        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const response = await fetch(
            `${API_BASE_URL}/availability?locationId=${bookingState.location.id}&barberId=${bookingState.barber.id}&serviceId=${bookingState.service.id}&date=${dateStr}`
        );

        if (!response.ok) throw new Error('Failed to fetch availability');

        const data = await response.json();
        
        if (!data.slots || data.slots.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="no-slots-message">No available times for this date</p>';
            return;
        }

        timeSlotsContainer.innerHTML = '';
        data.slots.forEach(slot => {
            const slotTime = new Date(slot);
            const timeString = slotTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });

            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = timeString;
            slotElement.addEventListener('click', () => selectTime(slot, slotElement));
            timeSlotsContainer.appendChild(slotElement);
        });
    } catch (error) {
        console.error('Error loading time slots:', error);
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '<p class="error-message">Failed to load available times</p>';
    }
}

function selectTime(time, element) {
    bookingState.time = time;

    // Update selected time styling
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.remove('selected');
    });
    element.classList.add('selected');

    updateConfirmButton();
}

function updateConfirmButton() {
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.disabled = !(bookingState.date && bookingState.time);
}

// STEP 5: Customer Information
function showCustomerInfoStep() {
    const selectedTime = new Date(bookingState.time);
    const timeString = selectedTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const dateString = bookingState.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const bookingContent = document.querySelector('.booking-content');
    bookingContent.innerHTML = `
        <div class="step-container" id="customerInfoStep">
            <div class="step-header">
                <button class="back-button" onclick="showCalendarStep()">← Back</button>
                <h2 class="step-title">Confirm Your Appointment</h2>
            </div>
            
            <div class="booking-summary-full">
                <h3>Appointment Details</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <strong>Location:</strong>
                        <span>${bookingState.location.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Service:</strong>
                        <span>${bookingState.service.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Barber:</strong>
                        <span>${bookingState.barber.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Date:</strong>
                        <span>${dateString}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Time:</strong>
                        <span>${timeString}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Duration:</strong>
                        <span>${bookingState.service.duration} minutes</span>
                    </div>
                    <div class="summary-item price-item">
                        <strong>Total:</strong>
                        <span>$${(bookingState.service.price / 100).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="customer-form">
                <h3>Your Information</h3>
                <form id="customerForm">
                    <div class="form-group">
                        <label for="customerName">Full Name *</label>
                        <input type="text" id="customerName" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label for="customerPhone">Phone Number *</label>
                        <input type="tel" id="customerPhone" required placeholder="(555) 123-4567">
                    </div>
                    <div class="form-group">
                        <label for="customerEmail">Email (optional)</label>
                        <input type="email" id="customerEmail" placeholder="john@example.com">
                    </div>
                    <button type="submit" class="confirm-button">
                        Book Appointment
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('customerForm').addEventListener('submit', handleFinalConfirmation);
}

async function handleFinalConfirmation(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();

    if (!name || !phone) {
        showError('Please fill in all required fields');
        return;
    }

    bookingState.customerInfo = { name, phone, email };

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Booking...';

    try {
        await confirmAppointment();
    } catch (error) {
        submitButton.disabled = false;
        submitButton.textContent = 'Book Appointment';
    }
}

async function confirmAppointment() {
    try {
        const appointmentData = {
            locationId: bookingState.location.id,
            barberId: bookingState.barber.id,
            serviceId: bookingState.service.id,
            startTs: bookingState.time,
            customerName: bookingState.customerInfo.name,
            customerPhone: bookingState.customerInfo.phone,
            customerEmail: bookingState.customerInfo.email
        };

        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to book appointment');
        }

        const result = await response.json();
        showSuccessMessage(result);
    } catch (error) {
        console.error('Error booking appointment:', error);
        showError(error.message || 'Failed to book appointment. Please try again.');
    }
}

function showSuccessMessage(appointment) {
    const selectedTime = new Date(appointment.start_ts);
    const timeString = selectedTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const dateString = selectedTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const bookingContent = document.querySelector('.booking-content');
    bookingContent.innerHTML = `
        <div class="success-container">
            <div class="success-icon">✓</div>
            <h2 class="success-title">Appointment Confirmed!</h2>
            <p class="success-message">Your appointment has been successfully booked.</p>
            
            <div class="booking-summary-full">
                <h3>Appointment Details</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <strong>Confirmation #:</strong>
                        <span>${appointment.id}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Location:</strong>
                        <span>${bookingState.location.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Service:</strong>
                        <span>${bookingState.service.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Barber:</strong>
                        <span>${bookingState.barber.name}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Date:</strong>
                        <span>${dateString}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Time:</strong>
                        <span>${timeString}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Customer:</strong>
                        <span>${bookingState.customerInfo.name}</span>
                    </div>
                </div>
            </div>

            <div class="success-actions">
                <button class="primary-button" onclick="window.location.href='index.html'">
                    Return to Home
                </button>
                <button class="secondary-button" onclick="location.reload()">
                    Book Another Appointment
                </button>
            </div>
        </div>
    `;
}

function showError(message) {
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
    }, 3000);
}