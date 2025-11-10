// Registration Page JavaScript

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate all fields are filled
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showMessage('Please fill in all required fields.');
        return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match. Please try again.');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.');
        return;
    }
    
    // Disable submit button during request
    const submitBtn = document.querySelector('.auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    
    try {
        // Send registration request to backend
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Registration successful
            showMessage('Account created successfully! Redirecting to login...');
            
            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = 'log_in.html';
            }, 1500);
        } else {
            // Registration failed
            const errorMessage = data.message || 'Registration failed. Please try again.';
            showMessage(errorMessage);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Unable to connect to server. Please try again later.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue';
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // User is already logged in, redirect to account page
        window.location.href = 'personal_account.html';
    }
});