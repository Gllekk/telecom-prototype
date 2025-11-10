// Promotions Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Handle placeholder clicks for interesting cards
    const placeholders = document.querySelectorAll('.interesting-card.placeholder');
    
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('This feature is under construction');
        });
    });
    
    // Add click handler to hero image placeholder
    const heroImage = document.querySelector('.promo-hero-image');
    if (heroImage) {
        heroImage.addEventListener('click', () => {
            showMessage('Promotional content coming soon');
        });
        heroImage.style.cursor = 'pointer';
    }
    
    // Add click handler to number promo image placeholder
    const promoImage = document.querySelector('.number-promo-image');
    if (promoImage) {
        promoImage.addEventListener('click', () => {
            showMessage('Promotional content coming soon');
        });
        promoImage.style.cursor = 'pointer';
    }
});