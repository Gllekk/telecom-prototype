// Data Plans Page - Tab Switching Functionality

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const planSections = document.querySelectorAll('.plan-section');
    
    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const planType = button.getAttribute('data-plan');
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all plan sections
            planSections.forEach(section => section.classList.remove('active'));
            
            // Show selected plan section
            const selectedSection = document.getElementById(`${planType}-plans`);
            if (selectedSection) {
                selectedSection.classList.add('active');
            }
            
            // Update page title based on selected tab
            const pageTitle = document.querySelector('.plans-container h1');
            if (pageTitle) {
                if (planType === 'mobile') {
                    pageTitle.textContent = 'Mobile Data Plans';
                } else if (planType === 'residential') {
                    pageTitle.textContent = 'Residential Data Plans';
                } else if (planType === 'business') {
                    pageTitle.textContent = 'Business Data Plans';
                }
            }
        });
    });
    
    // Handle hash navigation (for direct links like data_plans.html#mobile)
    function handleHashNavigation() {
        const hash = window.location.hash.substring(1); // Remove the '#'
        
        if (hash && ['mobile', 'residential', 'business'].includes(hash)) {
            // Find and click the corresponding tab
            const targetTab = document.querySelector(`.tab-btn[data-plan="${hash}"]`);
            if (targetTab) {
                targetTab.click();
            }
        }
    }
    
    // Check hash on page load
    handleHashNavigation();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Handle placeholder clicks
    const placeholders = document.querySelectorAll('.interesting-card.placeholder');
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('This feature is under construction');
        });
    });
});