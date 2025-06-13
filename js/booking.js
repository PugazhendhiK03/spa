document.addEventListener('DOMContentLoaded', function() {
    // 1. INITIALIZATION AND VARIABLE DECLARATIONS
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const bookingSteps = document.querySelectorAll('.booking-step');
    const stepContents = document.querySelectorAll('.booking-step__content');
    const confirmBookingBtn = document.querySelector('.confirm-booking');
    const successModal = document.getElementById('success-modal');
    const downloadReceiptBtn = document.getElementById('download-receipt');
    
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
    let generatedReceiptUrl = null;
    
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
                    showAlert('Please select at least one service');
                    return false;
                }
                return true;
                
            case '2':
                if (!bookingDate.selectedDates[0]) {
                    showAlert('Please select a date');
                    return false;
                }
                if (!selectedTimeSlot) {
                    showAlert('Please select a time slot');
                    return false;
                }
                return true;
                
            case '3':
                const name = document.getElementById('customer-name').value.trim();
                const email = document.getElementById('customer-email').value.trim();
                const phone = document.getElementById('customer-phone').value.trim();
                const whatsapp = document.getElementById('customer-whatsapp').value.trim();
                
                if (!name) {
                    showAlert('Please enter your name');
                    return false;
                }
                if (!email || !validateEmail(email)) {
                    showAlert('Please enter a valid email address');
                    return false;
                }
                if (!phone || !validatePhone(phone)) {
                    showAlert('Please enter a valid phone number');
                    return false;
                }
                if (!whatsapp || !validatePhone(whatsapp)) {
                    showAlert('Please enter a valid WhatsApp number');
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
    
    function showAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.className = 'alert-box';
        alertBox.innerHTML = `
            <div class="alert-content">
                <p>${message}</p>
                <button class="alert-close">&times;</button>
            </div>
        `;
        document.body.appendChild(alertBox);
        
        setTimeout(() => {
            alertBox.classList.add('show');
        }, 10);
        
        alertBox.querySelector('.alert-close').addEventListener('click', () => {
            alertBox.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertBox);
            }, 300);
        });
        
        setTimeout(() => {
            if (document.body.contains(alertBox)) {
                alertBox.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(alertBox);
                }, 300);
            }
        }, 5000);
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
        const customerWhatsApp = document.getElementById('customer-whatsapp').value;
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
                <p><strong>WhatsApp:</strong> ${customerWhatsApp}</p>
                ${customerNotes ? `<p><strong>Special Requests:</strong> ${customerNotes}</p>` : ''}
            </div>
            <div class="summary-notes">
                <p>Please arrive 15 minutes before your scheduled time. Late arrivals may result in reduced treatment time.</p>
                <p>Cancellations require 24 hours notice to avoid charges.</p>
            </div>
        `;
    }
    
    // 6. FINAL BOOKING CONFIRMATION
    confirmBookingBtn.addEventListener('click', async function() {
        if (!validateStep('3')) return;
        
        // Set processing state
        this.classList.add('btn--processing');
        this.disabled = true;
        this.innerHTML = '<span>Processing Booking</span>';
        
        try {
            // Generate a unique booking reference
            bookingReference = 'LB' + Date.now().toString().slice(-6);
            document.getElementById('booking-reference').textContent = bookingReference;
            
            // Submit to Formspree first
            const formSubmitted = await submitToFormspree();
            
            if (!formSubmitted) {
                throw new Error('Form submission failed');
            }
            
            // Generate and download receipt
            generatedReceiptUrl = await generateReceipt();
            downloadReceipt(generatedReceiptUrl);
            
            // Send WhatsApp notifications
            sendWhatsAppNotificationToOwner();
            sendWhatsAppNotificationToCustomer();
            
            // Show success modal
            successModal.style.display = 'flex';
        } catch (error) {
            console.error('Booking Error:', error);
            handleBookingError(error);
        } finally {
            // Reset button state
            this.classList.remove('btn--processing');
            this.disabled = false;
            this.textContent = 'Confirm Booking';
        }
    });
    
    async function submitToFormspree() {
        const form = document.getElementById('customer-form');
        form.action = 'FORM-SPREE-LINK';
        form.method = 'POST';
        
        // Create a hidden input for the booking reference
        const refInput = document.createElement('input');
        refInput.type = 'hidden';
        refInput.name = 'booking_reference';
        refInput.value = bookingReference;
        form.appendChild(refInput);
        
        // Create a hidden input for the services details
        const servicesInput = document.createElement('input');
        servicesInput.type = 'hidden';
        servicesInput.name = 'services_details';
        servicesInput.value = JSON.stringify(selectedServices);
        form.appendChild(servicesInput);
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Formspree submission error:', error);
            throw error;
        }
    }
    
    async function generateReceipt() {
        try {
            // Check if html2canvas is available
            if (typeof html2canvas !== 'function') {
                throw new Error('html2canvas not loaded');
            }

            const receiptContent = document.createElement('div');
            receiptContent.className = 'receipt';
            
            // Use simpler styling for the receipt to avoid rendering issues
            receiptContent.style.fontFamily = 'Arial, sans-serif';
            receiptContent.style.padding = '20px';
            receiptContent.style.maxWidth = '500px';
            receiptContent.style.margin = '0 auto';
            receiptContent.style.backgroundColor = '#fff';

            const servicesList = selectedServices.map(service => 
                `<li style="margin-bottom: 8px;">${service.name} - ₹${service.price} (${service.duration} mins)</li>`
            ).join('');

            const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            receiptContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                    <h2 style="color: #1a3e4c; margin-bottom: 5px;">Luxe Bali Spa</h2>
                    <p style="margin: 5px 0; font-size: 14px;">123 Spa Street, Mumbai, India</p>
                    <p style="margin: 5px 0; font-size: 14px;">+91 98765 43210 | info@luxebalispa.com</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1a3e4c; text-align: center; margin-bottom: 15px;">Booking Confirmation</h3>
                    <p><strong>Reference:</strong> ${bookingReference}</p>
                    <p><strong>Date:</strong> ${selectedDate}</p>
                    <p><strong>Time:</strong> ${selectedTimeSlot}</p>
                    <p><strong>Customer:</strong> ${document.getElementById('customer-name').value}</p>
                    
                    <h4 style="color: #1a3e4c; margin: 15px 0 5px;">Services Booked:</h4>
                    <ul style="margin-left: 20px; padding-left: 0;">${servicesList}</ul>
                    
                    <p style="font-weight: bold; font-size: 18px; text-align: right; margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px;">
                        <strong>Total Amount:</strong> ₹${totalPrice}
                    </p>
                </div>
                <div style="text-align: center; font-size: 12px; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
                    <p style="font-weight: bold; color: #1a3e4c; font-style: italic; margin-bottom: 10px;">
                        *Please present this receipt at the spa to receive your services*
                    </p>
                    <p>Thank you for your booking!</p>
                    <p>Cancellation policy: 24 hours notice required</p>
                </div>
            `;

            // Append to body but keep it invisible
            receiptContent.style.position = 'fixed';
            receiptContent.style.left = '-9999px';
            document.body.appendChild(receiptContent);

            // Give it a moment to render
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(receiptContent, {
                scale: 2, // Higher quality
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            // Remove the temporary element
            document.body.removeChild(receiptContent);
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Receipt generation failed:', error);
            
            // Fallback: Create a simple text-based receipt
            const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            const fallbackReceipt = `
                Luxe Bali Spa
                123 Spa Street, Mumbai, India
                +91 98765 43210 | info@luxebalispa.com
                
                BOOKING CONFIRMATION
                Reference: ${bookingReference}
                Date: ${selectedDate}
                Time: ${selectedTimeSlot}
                Customer: ${document.getElementById('customer-name').value}
                
                SERVICES:
                ${selectedServices.map(s => `- ${s.name} (${s.duration} mins) - ₹${s.price}`).join('\n')}
                
                TOTAL AMOUNT: ₹${totalPrice}
                
                *Please present this reference at the spa*
                Cancellation policy: 24 hours notice required
            `;
            
            // Return a data URL for a simple text receipt
            return `data:text/plain;charset=utf-8,${encodeURIComponent(fallbackReceipt)}`;
        }
    }
    
    function downloadReceipt(dataUrl) {
        try {
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            
            // Determine file extension based on content type
            const isImage = dataUrl.startsWith('data:image');
            const extension = isImage ? 'png' : 'txt';
            
            downloadLink.download = `LuxeBaliSpa-${bookingReference}.${extension}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error('Download failed:', error);
            throw new Error('Failed to download receipt');
        }
    }
    
    function handleBookingError(error) {
        let errorMessage = 'There was an error processing your booking. ';
        let showReference = true;
        
        if (error.message.includes('NetworkError')) {
            errorMessage += 'It appears you are offline. Please check your internet connection and try again.';
            showReference = false;
        } else if (error.message.includes('Form submission failed') || error.message.includes('HTTP error')) {
            errorMessage += 'Our booking system is temporarily unavailable. ';
            errorMessage += 'Please try again in a few minutes or contact us directly at +91 98765 43210.';
        } else if (error.message.includes('receipt') || error.message.includes('html2canvas')) {
            errorMessage = 'Your booking was successful! ';
            errorMessage += 'We encountered a minor issue generating your receipt, but your booking is confirmed. ';
            errorMessage += 'Please save your reference number below.';
        } else {
            errorMessage += 'Please try again or contact us directly at +91 98765 43210.';
        }
        
        showErrorModal(errorMessage, showReference ? bookingReference : '');
    }
    
    function showErrorModal(message, reference = '') {
        const errorModal = document.createElement('div');
        errorModal.className = 'modal';
        errorModal.id = 'error-modal';
        errorModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h2 class="modal__title">Booking Error</h2>
                <p class="modal__text">${message}</p>
                ${reference ? `<p class="modal__ref">Reference: ${reference}</p>` : ''}
                <div class="modal__actions">
                    <button class="btn btn--primary" id="retry-booking">Try Again</button>
                    <a href="tel:+919876543210" class="btn btn--secondary">
                        <i class="fas fa-phone"></i> Call Us
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        errorModal.style.display = 'flex';
        
        document.getElementById('retry-booking').addEventListener('click', function() {
            document.body.removeChild(errorModal);
        });
        
        errorModal.addEventListener('click', function(e) {
            if (e.target === errorModal) {
                document.body.removeChild(errorModal);
            }
        });
    }
    
    function sendWhatsAppNotificationToOwner() {
        try {
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerWhatsApp = document.getElementById('customer-whatsapp').value;
            const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            const servicesList = selectedServices.map(s => 
                `${s.name} (₹${s.price})`
            ).join('%0A- ');
            
            const message = `*NEW BOOKING - Luxe Bali Spa*%0A%0A` +
                           `*Reference:* ${bookingReference}%0A` +
                           `*Customer:* ${customerName}%0A` +
                           `*Phone:* ${customerPhone}%0A` +
                           `*WhatsApp:* ${customerWhatsApp}%0A` +
                           `*Date:* ${selectedDate}%0A` +
                           `*Time:* ${selectedTimeSlot}%0A%0A` +
                           `*Services:*%0A- ${servicesList}%0A%0A` +
                           `*Total Amount:* ₹${totalPrice}`;
            
            window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
        } catch (error) {
            console.error('Failed to send owner notification:', error);
        }
    }
    
    function sendWhatsAppNotificationToCustomer() {
        try {
            const customerName = document.getElementById('customer-name').value;
            const customerWhatsApp = document.getElementById('customer-whatsapp').value;
            const selectedDate = bookingDate.selectedDates[0].toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            const servicesList = selectedServices.map(s => 
                `${s.name} (${s.duration} mins) - ₹${s.price}`
            ).join('%0A- ');
            
            const message = `*Luxe Bali Spa - Booking Confirmation*%0A%0A` +
                           `Dear ${customerName},%0A%0A` +
                           `Your appointment has been successfully booked!%0A%0A` +
                           `*Booking Reference:* ${bookingReference}%0A` +
                           `*Date:* ${selectedDate}%0A` +
                           `*Time:* ${selectedTimeSlot}%0A%0A` +
                           `*Services Booked:*%0A- ${servicesList}%0A%0A` +
                           `*Total Amount:* ₹${totalPrice}%0A%0A` +
                           `*Spa Address:*%0A123 Spa Street, Mumbai, India%0A%0A` +
                           `*Contact:* +91 98765 43210%0A%0A` +
                           `*Important Notes:*%0A` +
                           `- Please arrive 15 minutes before your appointment%0A` +
                           `- Present your receipt at the spa to receive services%0A` +
                           `- Cancellation policy: 24 hours notice required%0A%0A` +
                           `We look forward to serving you!%0A%0A` +
                           `*Luxe Bali Spa Team*`;
            
            window.open(`https://wa.me/${customerWhatsApp}?text=${message}`, '_blank');
        } catch (error) {
            console.error('Failed to send customer notification:', error);
        }
    }
    
    // Download receipt functionality
    downloadReceiptBtn.addEventListener('click', function() {
        if (generatedReceiptUrl) {
            downloadReceipt(generatedReceiptUrl);
        } else {
            generateReceipt()
                .then(url => {
                    generatedReceiptUrl = url;
                    downloadReceipt(url);
                })
                .catch(error => {
                    showErrorModal('Failed to generate receipt. Please contact us with your booking reference.');
                });
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
        
        const errorModal = document.getElementById('error-modal');
        if (errorModal && event.target === errorModal) {
            document.body.removeChild(errorModal);
        }
    });
});