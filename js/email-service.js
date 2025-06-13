// EmailJS configuration
const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_USER_ID);
})();

// Function to send email using EmailJS
function sendEmail(templateParams) {
    return new Promise((resolve, reject) => {
        if (!EMAILJS_USER_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_SERVICE_ID) {
            reject(new Error('EmailJS configuration is missing. Please check your configuration.'));
            return;
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('Email sent successfully:', response);
                resolve(response);
            }, function(error) {
                console.error('Failed to send email:', error);
                reject(error);
            });
    });
}

// Function to format booking details for email
function formatBookingEmail(bookingDetails) {
    return {
        to_email: 'info@luxebalispa.com', // Business owner's email
        booking_reference: bookingDetails.reference,
        customer_name: bookingDetails.customerName,
        customer_email: bookingDetails.customerEmail,
        customer_phone: bookingDetails.customerPhone,
        customer_whatsapp: bookingDetails.customerWhatsApp,
        booking_date: bookingDetails.date,
        booking_time: bookingDetails.time,
        services: bookingDetails.services.map(service => 
            `${service.name} - ₹${service.price} (${service.duration} mins)`
        ).join('\n'),
        total_amount: `₹${bookingDetails.totalPrice}`,
        special_requests: bookingDetails.notes || 'None'
    };
} 