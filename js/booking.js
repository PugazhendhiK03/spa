document.addEventListener('DOMContentLoaded', function() {
    // 1. INITIALIZATION AND VARIABLE DECLARATIONS
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const bookingSteps = document.querySelectorAll('.booking-step');
    const stepContents = document.querySelectorAll('.booking-step__content');
    const confirmBookingBtn = document.querySelector('.confirm-booking');
    const successModal = document.getElementById('success-modal');
    const printReceiptBtn = document.getElementById('print-receipt');
    
    // Initialize Flatpickr for date selection
    const bookingDate = flatpickr("#booking-date", {
        minDate: "today",
        maxDate: new Date().fp_incr(30), // 30 days from now
        disable: [
            function(date) {
                // Disable Sundays (day 0)
                return (date.getDay() === 0);
            }
        ],
        dateFormat: "Y-m-d",
        locale: {
            firstDayOfWeek: 1 // Start week on Monday
        },
        onChange: function() {
            generateTimeSlots();
        }
    });
    
    // Variables to store booking information
    let selectedServices = [];
    let totalPrice = 0;
    let totalDuration = 0;
    let selectedTimeSlot = null;
    let bookingReference = '';
    
    // 2. SERVICE SELECTION LOGIC
    const serviceCheckboxes = document.querySelectorAll('.service-selection__checkbox');
    
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const service = {
                name: this.parentElement.querySelector('.service-selection__title').textContent,
                price: parseInt(this.dataset.price),
                duration: parseInt(this.dataset.duration),
                id: this.id
            };
            
            if (this.checked) {
                selectedServices.push(service);
                totalPrice += service.price;
                totalDuration += service.duration;
            } else {
                selectedServices = selectedServices.filter(s => s.id !== service.id);
                totalPrice -= service.price;
                totalDuration -= service.duration;
            }
            
            // Enable/disable the "Next" button
            document.querySelector('.next-step[data-next="2"]').disabled = selectedServices.length === 0;
        });
    });
    
    // 3. STEP NAVIGATION LOGIC
    nextStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.booking-step__content').dataset.stepContent;
            const nextStep = this.dataset.next;
            
            if (validateStep(currentStep)) {
                navigateToStep(nextStep);
                
                // Update hidden form fields when moving to step 3
                if (nextStep === '3') {
                    document.getElementById('booking-services').value = selectedServices.map(s => s.name).join(', ');
                    document.getElementById('booking-date-value').value = bookingDate.selectedDates[0].toISOString().split('T')[0];
                    document.getElementById('booking-time').value = selectedTimeSlot;
                    document.getElementById('booking-total').value = totalPrice;
                    document.getElementById('booking-duration').value = totalDuration;
                }
            }
        });
    });
    
    prevStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.dataset.prev;
            navigateToStep(prevStep);
        });
    });
    
    function navigateToStep(step) {
        // Hide all step contents
        stepContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the current step content
        document.querySelector(`.booking-step__content[data-step-content="${step}"]`).classList.add('active');
        
        // Update the step indicators
        bookingSteps.forEach(stepEl => {
            stepEl.classList.remove('active');
            if (parseInt(stepEl.dataset.step) <= parseInt(step)) {
                stepEl.classList.add('active');
            }
        });
        
        // Special actions for specific steps
        if (step === '2') {
            generateTimeSlots();
        } else if (step === '4') {
            updateBookingSummary();
        }
        
        // Scroll to top of the booking section
        document.querySelector('.booking-process').scrollIntoView({ behavior: 'smooth' });
    }
    
    function validateStep(step) {
        switch(step) {
            case '1':
                if (selectedServices.length === 0) {
                    alert('Please select at least one service');
                    return false;
                }
                return true;
                
            case '2':
                if (!bookingDate.selectedDates[0]) {
                    alert('Please select a date');
                    return false;
                }
                if (!selectedTimeSlot) {
                    alert('Please select a time slot');
                    return false;
                }
                return true;
                
            case '3':
                const name = document.getElementById('customer-name').value.trim();
                const email = document.getElementById('customer-email').value.trim();
                const phone = document.getElementById('customer-phone').value.trim();
                
                if (!name) {
                    alert('Please enter your name');
                    return false;
                }
                if (!email || !validateEmail(email)) {
                    alert('Please enter a valid email address');
                    return false;
                }
                if (!phone || !validatePhone(phone)) {
                    alert('Please enter a valid phone number');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        return phone.length >= 10 && !isNaN(phone);
    }
    
    // 4. DATE/TIME SELECTION LOGIC
    function generateTimeSlots() {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';
        selectedTimeSlot = null;
        const nextButton = document.querySelector('.next-step[data-next="3"]');
        nextButton.disabled = true;
        
        if (!bookingDate.selectedDates[0]) {
            timeSlotsContainer.innerHTML = '<p>Please select a date first</p>';
            return;
        }
        
        const selectedDate = bookingDate.selectedDates[0];
        const dayOfWeek = selectedDate.getDay();
        const isSaturday = dayOfWeek === 6;
        
        // Set opening hours (weekdays 10am-8pm, Saturday 9am-9pm)
        const openingHour = isSaturday ? 9 : 10;
        const closingHour = isSaturday ? 21 : 20;
        
        // Generate time slots every 30 minutes
        for (let hour = openingHour; hour < closingHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // Calculate if this time slot allows for the full service duration
                const slotEndTime = hour + (minute + totalDuration) / 60;
                if (slotEndTime > closingHour) continue;
                
                // Format time as HH:MM
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Create time slot element
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = timeString;
                timeSlot.dataset.time = timeString;
                
                // Add click handler for time slot selection
                timeSlot.addEventListener('click', function() {
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        slot.classList.remove('selected');
                    });
                    
                    this.classList.add('selected');
                    selectedTimeSlot = this.dataset.time;
                    nextButton.disabled = false;
                });
                
                timeSlotsContainer.appendChild(timeSlot);
            }
        }
        
        if (timeSlotsContainer.children.length === 0) {
            timeSlotsContainer.innerHTML = `<p>No available time slots for ${totalDuration} minute service on this date. Please choose a different date or adjust your services.</p>`;
        }
    }
    
    // 5. BOOKING SUMMARY AND CONFIRMATION
    function updateBookingSummary() {
        const summaryContainer = document.querySelector('.booking-summary');
        const selectedDate = bookingDate.selectedDates[0];
        
        const formattedDate = selectedDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerNotes = document.getElementById('customer-notes').value;
        
        summaryContainer.innerHTML = `
            <div class="summary-section">
                <h3>Booking Details</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${selectedTimeSlot}</p>
                <p><strong>Duration:</strong> ${totalDuration} minutes</p>
            </div>
            <div class="summary-section">
                <h3>Services</h3>
                <ul class="summary-services">
                    ${selectedServices.map(service => 
                        `<li>${service.name} - ₹${service.price} (${service.duration} mins)</li>`
                    ).join('')}
                </ul>
                <p class="summary-total"><strong>Total:</strong> ₹${totalPrice}</p>
            </div>
            <div class="summary-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Phone:</strong> ${customerPhone}</p>
                ${customerNotes ? `<p><strong>Special Requests:</strong> ${customerNotes}</p>` : ''}
            </div>
            <div class="summary-notes">
                <p>Please arrive 15 minutes before your scheduled time. Late arrivals may result in reduced treatment time.</p>
                <p>Cancellations require 24 hours notice to avoid charges.</p>
            </div>
        `;
    }
    
    // 6. FINAL BOOKING CONFIRMATION
    confirmBookingBtn.addEventListener('click', function() {
        if (!validateStep('3')) return;
        
        // Generate a unique booking reference
        bookingReference = 'LB' + Date.now().toString().slice(-6);
        document.getElementById('booking-reference').textContent = bookingReference;
        
        // Create receipt
        generateReceipt();
        
        // Submit form to Formspree
        submitBookingForm();
        
        // Send WhatsApp notification
        sendWhatsAppNotification();
        
        // Show success modal
        successModal.style.display = 'flex';
    });
    
    function generateReceipt() {
        const receiptContent = document.createElement('div');
        receiptContent.className = 'receipt';
        
        const servicesList = selectedServices.map(service => 
            `<li>${service.name} - ₹${service.price}</li>`
        ).join('');
        
        const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        receiptContent.innerHTML = `
            <div class="receipt-header">
                <h2>Luxe Bali Spa</h2>
                <p>123 Spa Street, Mumbai, India</p>
                <p>+91 98765 43210 | info@luxebalispa.com</p>
            </div>
            <div class="receipt-body">
                <h3>Booking Confirmation</h3>
                <p><strong>Reference:</strong> ${bookingReference}</p>
                <p><strong>Date:</strong> ${selectedDate}</p>
                <p><strong>Time:</strong> ${selectedTimeSlot}</p>
                <p><strong>Customer:</strong> ${document.getElementById('customer-name').value}</p>
                
                <h4>Services Booked:</h4>
                <ul>${servicesList}</ul>
                
                <p class="receipt-total"><strong>Total Amount:</strong> ₹${totalPrice}</p>
            </div>
            <div class="receipt-footer">
                <p>Thank you for your booking!</p>
                <p>Please present this confirmation upon arrival.</p>
                <p>Cancellation policy: 24 hours notice required</p>
            </div>
        `;
        
        // Generate receipt as image and store in localStorage
        html2canvas(receiptContent).then(canvas => {
            const receiptImage = canvas.toDataURL('image/png');
            localStorage.setItem('bookingReceipt', receiptImage);
        });
    }
    
    function submitBookingForm() {
        const form = document.getElementById('customer-form');
        form.action = 'https://formspree.io/f/YOUR_FORMSPREE_ID'; // Replace with your Formspree ID
        form.method = 'POST';
        
        // Create a hidden input for the booking reference
        const refInput = document.createElement('input');
        refInput.type = 'hidden';
        refInput.name = 'booking_reference';
        refInput.value = bookingReference;
        form.appendChild(refInput);
        
        // Submit the form
        form.submit();
    }
    
    function sendWhatsAppNotification() {
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const servicesList = selectedServices.map(s => 
            `${s.name} (₹${s.price})`
        ).join(', ');
        
        const message = `New Booking - ${bookingReference}%0A%0A` +
                       `Customer: ${customerName}%0A` +
                       `Phone: ${customerPhone}%0A` +
                       `Date: ${selectedDate}%0A` +
                       `Time: ${selectedTimeSlot}%0A` +
                       `Services: ${servicesList}%0A` +
                       `Total: ₹${totalPrice}`;
        
        window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
    }
    
    // Print receipt functionality
    printReceiptBtn.addEventListener('click', function() {
        const receiptImage = localStorage.getItem('bookingReceipt');
        if (receiptImage) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Luxe Bali Spa Booking ${bookingReference}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            img { max-width: 100%; height: auto; }
                        </style>
                    </head>
                    <body>
                        <img src="${receiptImage}" alt="Booking Receipt">
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.close();
                                }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});