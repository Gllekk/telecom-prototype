// Login Page JavaScript

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Basic validation
    if (!email || !password) {
        showMessage('Please enter both email and password.');
        return;
    }
    
    // Disable submit button during request
    const submitBtn = document.querySelector('.auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        // Send login request to backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        console.log('Login response:', data); // Debug log
        
        if (response.ok && data.success) {
            // Login successful
            setCurrentUser({
                userId: data.user.user_id,
                email: data.user.email,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                gender: data.user.gender,
                roleType: data.user.role_type
            });
            
            showMessage('Login successful! Redirecting...');
            
            // Redirect to personal account page
            setTimeout(() => {
                window.location.href = 'personal_account.html';
            }, 1000);
        } else {
            // Login failed - incorrect credentials
            showMessage(data.message || 'Invalid email or password. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
        }
    } catch (error) {
        console.error('Login error:', error);
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