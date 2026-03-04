//booking system configuration for admin page
const API_BASE_URL = 'https://4hsxwekzik.us-west-2.awsapprunner.com/api/admin/all'


let all = document.getElementById('all-appointments-button');
all.addEventListener("click", () => {
    let image = document.querySelector('.hero-logo');
    let button = document.getElementById('all-appointments-button');
    button.remove()
    image.remove()

    /* hero container */
    let container = document.querySelector('.hero-section');
    let stepContainer = document.createElement('div');

    /* step container*/
    stepContainer.className = 'booking-content';
    stepContainer.classList.add('step-container');
    container.appendChild(stepContainer);

    let title = document.createElement('h2');
    title.className = 'step-title';
    title.textContent = 'All Appointments:';
    stepContainer.appendChild(title);

    /* view: 
        -status 
        -date/time
        -name/phone/email
        -location
        -service
        -barber
    */
    fetch(API_BASE_URL)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data); // Debug log
            data.forEach(appointment => {
                let appointmentDiv = document.createElement('div');
                appointmentDiv.className = 'appointment-entry';     
                appointmentDiv.innerHTML = `
                    <h2>Appointment ID: ${appointment.id}</h2>
                    <ul class="appointment-list">
                    <li><strong>Status:</strong> ${appointment.status}</li>
                    <li><strong>Date/Time:</strong> ${new Date(appointment.start_ts).toLocaleString()}</li>
                    <li><strong>Name:</strong> ${appointment.customer_name}</li>
                    <li><strong>Phone:</strong> ${appointment.customer_phone}</li>
                    <li><strong>Email:</strong> ${appointment.customer_email}</li>
                    <li><strong>Location:</strong> ${appointment.location_name}</li>
                    <li><strong>Service:</strong> ${appointment.service_name}</li>
                    <li><strong>Barber:</strong> ${appointment.barber_name}</li>
                    </ul>
                    <hr>
                `;
                stepContainer.appendChild(appointmentDiv);
            }); 
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });

})