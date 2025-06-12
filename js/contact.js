document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        
        question.addEventListener('click', function() {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq__answer').style.maxHeight = null;
                    otherItem.querySelector('.faq__question i').classList.remove('fa-chevron-up');
                    otherItem.querySelector('.faq__question i').classList.add('fa-chevron-down');
                }
            });
            
            // Toggle current item
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                question.querySelector('i').classList.remove('fa-chevron-up');
                question.querySelector('i').classList.add('fa-chevron-down');
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.querySelector('i').classList.remove('fa-chevron-down');
                question.querySelector('i').classList.add('fa-chevron-up');
            }
        });
    });
    
    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // In a real implementation, you would send the form data to a server
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});