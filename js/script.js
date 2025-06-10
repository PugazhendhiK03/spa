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
    
    // Booking Form Multi-step
    const bookingForm = document.getElementById('bookingForm');
    const formSteps = document.querySelectorAll('.form-step');
    const steps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
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
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.form-step');
                const prevStepNum = parseInt(this.getAttribute('data-prev'));
                const prevStep = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);
                
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
                
                // Update step indicators
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
                    // Hide form and show success message
                    bookingForm.style.display = 'none';
                    const bookingSuccess = document.getElementById('bookingSuccess');
                    bookingSuccess.style.display = 'block';
                    
                    // Populate success details
                    document.getElementById('success-service').textContent = `Service: ${formData.get('service')}`;
                    document.getElementById('success-date').textContent = `Date & Time: ${formData.get('date')} at ${formData.get('time')}`;
                    document.getElementById('success-name').textContent = `Name: ${formData.get('name')}`;
                    
                    // Send WhatsApp message
                    sendWhatsAppBooking(formData);
                    
                    // Reset form
                    bookingForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                alert('There was a problem submitting your booking. Please try again later.');
                console.error(error);
            });
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
    
    // Send WhatsApp booking confirmation
    function sendWhatsAppBooking(formData) {
        const whatsappNumber = formData.get('whatsapp') || formData.get('phone');
        const service = formData.get('service');
        const date = formData.get('date');
        const time = formData.get('time');
        const name = formData.get('name');
        
        if (whatsappNumber) {
            const message = `Hi ${name}, your booking for ${service} on ${date} at ${time} has been confirmed. Thank you for choosing Serenity Spa!`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in a new tab (actual sending would require WhatsApp Business API)
            window.open(whatsappUrl, '_blank');
        }
        
        // Also send to business WhatsApp
        const businessMessage = `New booking:\nName: ${name}\nService: ${service}\nDate: ${date}\nTime: ${time}\nPhone: ${formData.get('phone')}\nEmail: ${formData.get('email')}`;
        const encodedBusinessMessage = encodeURIComponent(businessMessage);
        const businessWhatsappUrl = `https://wa.me/11234567890?text=${encodedBusinessMessage}`;
        
        // Open in new tab (in a real scenario, this would be an API call)
        window.open(businessWhatsappUrl, '_blank');
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
