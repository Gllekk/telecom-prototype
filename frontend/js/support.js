// Support Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Handle FAQ category button clicks
    const categoryButtons = document.querySelectorAll('.faq-category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('This feature is under construction');
        });
    });
    
    // Handle FAQ link clicks
    const faqLinks = document.querySelectorAll('.faq-category');
    
    faqLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('This feature is under construction');
        });
    });

});
