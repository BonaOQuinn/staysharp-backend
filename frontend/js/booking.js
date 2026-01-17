// Calendar functionality
    
        let currentDate = new Date();
        let selectedDate = null;
        let selectedTime = null;

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const timeSlots = [
            "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
            "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
            "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
            "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
        ];

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
                const dayElement = createDayElement(day, false, isPast);
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

        function createDayElement(day, isOtherMonth, isDisabled) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            if (isOtherMonth) {
                dayElement.classList.add('other-month');
            }

            if (isDisabled) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => selectDate(day));
            }

            return dayElement;
        }

        function selectDate(day) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            selectedDate = new Date(year, month, day);

            // Update selected day styling
            document.querySelectorAll('.calendar-day').forEach(el => {
                el.classList.remove('selected');
            });
            event.target.classList.add('selected');

            // Show time section
            const timeSection = document.getElementById('timeSection');
            timeSection.classList.add('active');

            // Update selected date display
            const dateDisplay = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('selectedDateDisplay').textContent = dateDisplay;

            // Render time slots
            renderTimeSlots();

            // Reset selected time
            selectedTime = null;
            updateConfirmButton();
        }

        function renderTimeSlots() {
            const timeSlotsContainer = document.getElementById('timeSlots');
            timeSlotsContainer.innerHTML = '';

            timeSlots.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = time;
                slot.addEventListener('click', () => selectTime(time, slot));
                timeSlotsContainer.appendChild(slot);
            });
        }

        function selectTime(time, element) {
            selectedTime = time;

            // Update selected time styling
            document.querySelectorAll('.time-slot').forEach(el => {
                el.classList.remove('selected');
            });
            element.classList.add('selected');

            updateConfirmButton();
        }

        function updateConfirmButton() {
            const confirmButton = document.getElementById('confirmButton');
            confirmButton.disabled = !(selectedDate && selectedTime);
        }

        // Event listeners
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        document.getElementById('confirmButton').addEventListener('click', () => {
            if (selectedDate && selectedTime) {
                const dateStr = selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                alert(`Appointment confirmed for ${dateStr} at ${selectedTime}!\n\nYou will receive a confirmation email shortly.`);
            }
        });

        // Initialize calendar
        renderCalendar();