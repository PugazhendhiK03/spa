document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
        this.querySelector('i').classList.toggle('fa-bars');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    let currentTestimonial = 0;

    function showTestimonial(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
        currentTestimonial = index;
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showTestimonial(index));
    });

    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
            
            // Close other open items
            faqQuestions.forEach(q => {
                if (q !== question && q.parentElement.classList.contains('active')) {
                    q.parentElement.classList.remove('active');
                }
            });
        });
    });

    // Service Filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            // Filter services
            serviceCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Booking Form Steps
    const bookingSteps = document.querySelectorAll('.booking-form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    const bookingSuccess = document.querySelector('.booking-success');
    
    // Initialize calendar
    if (document.querySelector('.calendar-grid')) {
        initCalendar();
    }
    
    // Next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const currentStep = button.closest('.booking-form-step');
            const nextStepNum = parseInt(button.dataset.next);
            
            // Validate current step before proceeding
            if (validateStep(currentStep.dataset.step)) {
                // Update step indicators
                stepIndicators.forEach(step => {
                    if (parseInt(step.dataset.step) === nextStepNum) {
                        step.classList.add('active');
                    }
                });
                
                // Hide current step and show next
                currentStep.classList.remove('active');
                document.querySelector(`.booking-form-step[data-step="${nextStepNum}"]`).classList.add('active');
                
                // Update confirmation details if going to step 5
                if (nextStepNum === 5) {
                    updateConfirmationDetails();
                }
            }
        });
    });
    
    // Previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const currentStep = button.closest('.booking-form-step');
            const prevStepNum = parseInt(button.dataset.prev);
            
            // Update step indicators
            stepIndicators.forEach(step => {
                if (parseInt(step.dataset.step) > prevStepNum) {
                    step.classList.remove('active');
                }
            });
            
            // Hide current step and show previous
            currentStep.classList.remove('active');
            document.querySelector(`.booking-form-step[data-step="${prevStepNum}"]`).classList.add('active');
        });
    });
    
    // Confirm booking button
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // In a real app, you would send this data to your server
            // Here we'll just show the success message
            document.querySelector('.booking-form-step[data-step="5"]').classList.remove('active');
            bookingSuccess.classList.add('active');
            
            // Scroll to top of success message
            bookingSuccess.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Calendar functionality
    function initCalendar() {
        const calendarGrid = document.querySelector('.calendar-grid:not(.day-name)');
        const monthYear = document.querySelector('.month-year');
        const prevMonthBtn = document.querySelector('.prev-month');
        const nextMonthBtn = document.querySelector('.next-month');
        const timeSlots = document.querySelector('.time-slots');
        
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Render calendar
        renderCalendar(currentMonth, currentYear);
        
        // Previous month button
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });
        
        // Next month button
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
        
        function renderCalendar(month, year) {
            // Update month/year display
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            monthYear.textContent = `${monthNames[month]} ${year}`;
            
            // Clear previous days
            calendarGrid.innerHTML = '';
            
            // Get first day of month and total days in month
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Get days from previous month
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            // Add days from previous month
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day', 'disabled');
                dayElement.textContent = daysInPrevMonth - i;
                calendarGrid.appendChild(dayElement);
            }
            
            // Add days from current month
            const today = new Date();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day');
                dayElement.textContent = i;
                
                // Highlight today
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Disable past days
                if (year < today.getFullYear() || 
                    (year === today.getFullYear() && month < today.getMonth()) || 
                    (year === today.getFullYear() && month === today.getMonth() && i < today.getDate())) {
                    dayElement.classList.add('disabled');
                }
                
                dayElement.addEventListener('click', () => selectDay(dayElement, i, month, year));
                calendarGrid.appendChild(dayElement);
            }
            
            // Add days from next month to fill grid
            const totalCells = firstDay + daysInMonth;
            const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
            
            for (let i = 1; i <= remainingCells; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day', 'disabled');
                dayElement.textContent = i;
                calendarGrid.appendChild(dayElement);
            }
        }
        
        function selectDay(dayElement, day, month, year) {
            if (dayElement.classList.contains('disabled')) return;
            
            // Remove selected class from all days
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            
            // Add selected class to clicked day
            dayElement.classList.add('selected');
            
            // Generate random available times
            const selectedDate = new Date(year, month, day);
            const dayOfWeek = selectedDate.getDay();
            
            // Spa is closed on Sundays (dayOfWeek === 0)
            if (dayOfWeek === 0) {
                timeSlots.innerHTML = '<p>We are closed on Sundays. Please select another day.</p>';
                return;
            }
            
            // Generate time slots (every 30 minutes from 9am to 8pm on weekdays, 9am-6pm on Saturdays)
            const startHour = dayOfWeek === 6 ? 9 : 9; // Saturday is 6
            const endHour = dayOfWeek === 6 ? 18 : 20;
            
            timeSlots.innerHTML = '';
            
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const timeSlot = document.createElement('div');
                    timeSlot.classList.add('time-slot');
                    
                    // Format time (9:00 AM, 1:30 PM, etc.)
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                    const displayMinute = minute < 10 ? `0${minute}` : minute;
                    
                    timeSlot.textContent = `${displayHour}:${displayMinute} ${period}`;
                    timeSlot.dataset.time = `${hour}:${minute}`;
                    
                    timeSlot.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                        timeSlot.classList.add('selected');
                    });
                    
                    timeSlots.appendChild(timeSlot);
                }
            }
        }
    }
    
    // Validate current step before proceeding
    function validateStep(step) {
        switch(step) {
            case '1':
                // Service selection - always valid since there's a default selection
                return true;
            case '2':
                // Therapist selection - always valid
                return true;
            case '3':
                // Date and time selection
                const selectedDay = document.querySelector('.day.selected');
                const selectedTime = document.querySelector('.time-slot.selected');
                
                if (!selectedDay) {
                    alert('Please select a date');
                    return false;
                }
                
                if (!selectedTime) {
                    alert('Please select a time');
                    return false;
                }
                
                return true;
            case '4':
                // Client information
                const form = document.getElementById('clientInfoForm');
                const inputs = form.querySelectorAll('input[required], textarea[required]');
                
                for (let input of inputs) {
                    if (!input.value.trim()) {
                        alert(`Please fill in the ${input.previousElementSibling.textContent} field`);
                        input.focus();
                        return false;
                    }
                }
                
                // Validate email format
                const email = document.getElementById('email');
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    alert('Please enter a valid email address');
                    email.focus();
                    return false;
                }
                
                return true;
            default:
                return true;
        }
    }
    
    // Update confirmation details
    function updateConfirmationDetails() {
        // Service
        const selectedService = document.querySelector('input[name="service"]:checked');
        document.getElementById('confirm-service').textContent = selectedService.value;
        
        // Therapist
        const selectedTherapist = document.querySelector('input[name="therapist"]:checked');
        document.getElementById('confirm-therapist').textContent = selectedTherapist.value;
        
        // Date
        const selectedDay = document.querySelector('.day.selected');
        if (selectedDay) {
            const monthYear = document.querySelector('.month-year').textContent;
            document.getElementById('confirm-date').textContent = `${monthYear.split(' ')[0]} ${selectedDay.textContent}, ${monthYear.split(' ')[1]}`;
        }
        
        // Time
        const selectedTime = document.querySelector('.time-slot.selected');
        if (selectedTime) {
            document.getElementById('confirm-time').textContent = selectedTime.textContent;
        }
        
        // Duration and price based on service
        let duration, price;
        switch(selectedService.value) {
            case 'Swedish Massage':
                duration = '60 minutes';
                price = '$85';
                break;
            case 'Deep Tissue Massage':
                duration = '60 minutes';
                price = '$95';
                break;
            case 'Hot Stone Therapy':
                duration = '60 minutes';
                price = '$110';
                break;
            case 'Signature Facial':
                duration = '50 minutes';
                price = '$75';
                break;
            case 'Detox Body Wrap':
                duration = '75 minutes';
                price = '$120';
                break;
            default:
                duration = '60 minutes';
                price = '$85';
        }
        
        document.getElementById('confirm-duration').textContent = duration;
        document.getElementById('confirm-price').textContent = price;
        
        // Client info
        document.getElementById('confirm-name').textContent = document.getElementById('fullName').value;
        document.getElementById('confirm-email').textContent = document.getElementById('email').value;
        document.getElementById('confirm-phone').textContent = document.getElementById('phone').value;
        
        // Set success email
        document.getElementById('success-email').textContent = document.getElementById('email').value;
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, you would send the form data to your server
            // Here we'll just show an alert
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
});

// Form validation for contact page
function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (name === '' || email === '' || message === '') {
        alert('Please fill in all required fields');
        return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    return true;
}