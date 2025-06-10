document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('show');
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
        let nextTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(nextTestimonial);
    }, 5000);
    
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
    
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validation
            if (!validateContactForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const action = this.getAttribute('action');
            
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                alert('There was a problem submitting your form. Please try again later.');
                console.error(error);
            });
        });
    }
    
    function validateContactForm() {
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        let isValid = true;
        
        // Reset error states
        name.style.borderColor = '#ddd';
        email.style.borderColor = '#ddd';
        message.style.borderColor = '#ddd';
        
        // Validate name
        if (!name.value.trim()) {
            name.style.borderColor = 'red';
            isValid = false;
        }
        
        // Validate email
        if (!email.value.trim() || !isValidEmail(email.value)) {
            email.style.borderColor = 'red';
            isValid = false;
        }
        
        // Validate message
        if (!message.value.trim()) {
            message.style.borderColor = 'red';
            isValid = false;
        }
        
        if (!isValid) {
            alert('Please fill in all required fields correctly.');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Booking Form Multi-step
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Initialize date picker
        flatpickr("#booking-date", {
            minDate: "today",
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Disable Sundays
                    return (date.getDay() === 0);
                }
            ]
        });
        
        // Next button functionality
        const nextButtons = document.querySelectorAll('.next-step');
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.form-step');
                const nextStepNum = parseInt(this.getAttribute('data-next'));
                const nextStep = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);
                
                // Validate current step before proceeding
                if (validateStep(currentStep)) {
                    currentStep.classList.remove('active');
                    nextStep.classList.add('active');
                    
                    // Update step indicators
                    const steps = document.querySelectorAll('.step');
                    steps.forEach(step => {
                        if (parseInt(step.getAttribute('data-step')) <= nextStepNum) {
                            step.classList.add('active');
                        } else {
                            step.classList.remove('active');
                        }
                    });
                    
                    // If moving to review step, populate summary
                    if (nextStepNum === 4) {
                        populateSummary();
                    }
                    
                    // Scroll to top of form
                    window.scrollTo({
                        top: bookingForm.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Previous button functionality
        const prevButtons = document.querySelectorAll('.prev-step');
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.form-step');
                const prevStepNum = parseInt(this.getAttribute('data-prev'));
                const prevStep = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);
                
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                
                // Update step indicators
                const steps = document.querySelectorAll('.step');
                steps.forEach(step => {
                    if (parseInt(step.getAttribute('data-step')) <= prevStepNum) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
                
                // Scroll to top of form
                window.scrollTo({
                    top: bookingForm.offsetTop - 100,
                    behavior: 'smooth'
                });
            });
        });
        
        // Form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            // 1. Send to Formspree (company email)
            sendToFormspree(formData);
            
            // 2. Send WhatsApp notifications
            sendWhatsAppNotifications(formData);
            
            // 3. Show success message
            showBookingSuccess(formData);
            
            // 4. Reset form
            bookingForm.reset();
        });
        
        // Terms and Policy modal links
        const termsLink = document.getElementById('terms-link');
        const policyLink = document.getElementById('policy-link');
        const termsModal = document.getElementById('termsModal');
        const policyModal = document.getElementById('policyModal');
        const closeModals = document.querySelectorAll('.close-modal');
        
        if (termsLink) {
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                termsModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (policyLink) {
            policyLink.addEventListener('click', function(e) {
                e.preventDefault();
                policyModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }
        
        closeModals.forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Validate form step
    function validateStep(step) {
        let isValid = true;
        const requiredFields = step.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
                
                // Remove error highlight when user starts typing
                field.addEventListener('input', function() {
                    this.style.borderColor = '#ddd';
                });
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields before proceeding.');
        }
        
        return isValid;
    }
    
    // Populate booking summary
    function populateSummary() {
        const formData = new FormData(bookingForm);
        
        document.getElementById('summary-service').textContent = formData.get('service');
        document.getElementById('summary-date').textContent = `${formData.get('date')} at ${formData.get('time')}`;
        document.getElementById('summary-therapist').textContent = formData.get('therapist') || 'No preference';
        document.getElementById('summary-name').textContent = formData.get('name');
        document.getElementById('summary-email').textContent = formData.get('email');
        document.getElementById('summary-phone').textContent = formData.get('phone');
    }
    
    // Send booking data to Formspree
    function sendToFormspree(formData) {
        const formspreeUrl = 'https://formspree.io/f/manjegll';
        const bookingData = {
            _subject: 'New Booking - Serenity Spa',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp') || 'Not provided',
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time'),
            therapist: formData.get('therapist') || 'No preference',
            notes: formData.get('notes') || 'None'
        };
        
        fetch(formspreeUrl, {
            method: 'POST',
            body: JSON.stringify(bookingData),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                console.error('Formspree submission failed');
            }
        })
        .catch(error => {
            console.error('Error submitting to Formspree:', error);
        });
    }
    
    // Send WhatsApp notifications
    function sendWhatsAppNotifications(formData) {
        const customerNumber = formData.get('whatsapp') || formData.get('phone');
        const service = formData.get('service');
        const date = formData.get('date');
        const time = formData.get('time');
        const name = formData.get('name');
        
        // 1. Send to customer
        if (customerNumber) {
            const cleanNumber = customerNumber.replace(/\D/g, '');
            const message = `Hi ${name}, your booking for ${service} on ${date} at ${time} has been confirmed. Thank you for choosing Serenity Spa!`;
            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
        
        // 2. Send to business
        const businessNumber = '917339541974';
        const businessMessage = `*NEW BOOKING*\n\n*Name:* ${name}\n*Service:* ${service}\n*Date:* ${date}\n*Time:* ${time}\n*Phone:* ${formData.get('phone')}\n*Email:* ${formData.get('email')}\n*WhatsApp:* ${formData.get('whatsapp') || 'Not provided'}\n*Therapist Preference:* ${formData.get('therapist') || 'None'}\n*Notes:* ${formData.get('notes') || 'None'}`;
        const businessWhatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(businessMessage)}`;
        window.open(businessWhatsappUrl, '_blank');
    }
    
    // Show booking success message
    function showBookingSuccess(formData) {
        // Hide form and show success message
        bookingForm.style.display = 'none';
        const bookingSuccess = document.getElementById('bookingSuccess');
        bookingSuccess.style.display = 'block';
        
        // Populate success details
        document.getElementById('success-service').textContent = `Service: ${formData.get('service')}`;
        document.getElementById('success-date').textContent = `Date & Time: ${formData.get('date')} at ${formData.get('time')}`;
        document.getElementById('success-name').textContent = `Name: ${formData.get('name')}`;
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('show');
                }
            }
        });
    });
});
