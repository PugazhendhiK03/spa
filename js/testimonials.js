document.addEventListener('DOMContentLoaded', function() {
    const testimonialSlides = document.querySelectorAll('.testimonial__slide');
    const testimonialDots = document.querySelectorAll('.testimonial__dot');
    let currentSlide = 0;
    
    // Show initial slide
    showSlide(currentSlide);
    
    // Dot click event
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto slide change
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }, 5000);
    
    function showSlide(index) {
        // Hide all slides
        testimonialSlides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        testimonialDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide
        testimonialSlides[index].classList.add('active');
        testimonialDots[index].classList.add('active');
    }
});