document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.nav__mobile-toggle');
    const navList = document.querySelector('.nav__list');
    
    mobileToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    navList.classList.toggle('active');
    
    // Toggle background when mobile menu is open
    if (navList.classList.contains('active')) {
        header.classList.remove('transparent');
    } else if (window.scrollY < 100) {
        header.classList.add('transparent');
    }
});
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navList.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navList.classList.remove('active');
                
                // Remove background if not scrolled
                if (window.scrollY < 100) {
                    document.querySelector('.header').style.backgroundColor = 'transparent';
                }
            }
        });
    });
    

    // Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        header.classList.remove('transparent');
    } else {
        header.classList.remove('scrolled');
        // Only make transparent if mobile menu is closed
        if (!navList.classList.contains('active')) {
            header.classList.add('transparent');
        } else {
            header.classList.remove('transparent');
        }
    }
});

// Add this to initialize the header state
if (window.scrollY === 0) {
    header.classList.add('transparent');
} else {
    header.classList.add('scrolled');
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
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize animations
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.fade-in');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
});