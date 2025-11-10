
// Authentication state management
// Uses sessionStorage for persistence across pages

let currentUser = null;

// Initialize from sessionStorage on load
function initializeAuth() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch (e) {
            console.error('Error parsing stored user:', e);
            sessionStorage.removeItem('currentUser');
        }
    }
}

// Check if user is logged in on page load
function checkAuthStatus() {
    const loginBtn = document.getElementById('loginBtn');
    
    // If login button doesn't exist on this page, skip
    if (!loginBtn) {
        return;
    }
    
    if (currentUser) {
        // User is logged in
        loginBtn.textContent = currentUser.firstName || 'User';
        loginBtn.classList.add('logged-in');
        loginBtn.onclick = showLogoutMenu;
    } else {
        // User is not logged in
        loginBtn.textContent = 'Login';
        loginBtn.classList.remove('logged-in');
        loginBtn.onclick = handleLoginClick;
    }
}


async function bill_btn(planName, planPrice) {
    if (!currentUser) {
        window.location.href = 'log_in.html';
        return;
    }
    
    try {
        // Check if user has an existing subscription
        const response = await fetch(`http://localhost:3000/api/plans/check-subscription/${currentUser.userId}`);
        const data = await response.json();
        
        if (data.hasSubscription) {
            showMessage('You already have a subscription plan. Please contact technical support if you want to switch your plans');
        } else {
            // Create new subscription and bill
            const subscribeResponse = await fetch('http://localhost:3000/api/plans/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.userId,
                    planName: planName,
                    planPrice: planPrice
                })
            });
            
            const subscribeData = await subscribeResponse.json();
            
            if (subscribeResponse.ok && subscribeData.success) {
                showMessage(`Subscription created successfully! Your phone number is ${subscribeData.phoneNumber}. Your first bill has been generated.`);
                // Redirect to account page to see the bill
                setTimeout(() => {
                    window.location.href = 'personal_account.html';
                }, 3000); // Increased to 3 seconds to read the phone number
            } else {
                showMessage(subscribeData.message || 'Failed to create subscription');
                console.error('Subscription error:', subscribeData); // Added for debugging
            }
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showMessage('Unable to connect to server. Please try again later.');
    }
}


// Handle login button click
function handleLoginClick() {
    window.location.href = 'log_in.html';
}

// Show logout menu when clicking username
function showLogoutMenu(event) {
    event.stopPropagation();
    
    // Remove existing menu if any
    const existingMenu = document.querySelector('.logout-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Create logout menu
    const menu = document.createElement('div');
    menu.className = 'logout-menu';
    menu.innerHTML = `
        <div class="logout-option" onclick="goToAccount(event)">My Account</div>
        <div class="logout-option" onclick="handleLogout(event)">Log Out</div>
    `;
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.parentElement.style.position = 'relative';
    loginBtn.parentElement.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeLogoutMenu);
    }, 0);
}

// Close logout menu
function closeLogoutMenu() {
    const menu = document.querySelector('.logout-menu');
    if (menu) {
        menu.remove();
    }
    document.removeEventListener('click', closeLogoutMenu);
}

// Navigate to account page
function goToAccount(event) {
    event.stopPropagation();
    window.location.href = 'personal_account.html';
}

// Handle logout
function handleLogout(event) {
    event.stopPropagation();
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    checkAuthStatus();
    closeLogoutMenu();
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Set current user (called after successful login)
function setCurrentUser(userData) {
    currentUser = userData;
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    checkAuthStatus();
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Initialize auth state and check status on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    checkAuthStatus();
});

// Handle "My Account" link clicks throughout the site
document.addEventListener('DOMContentLoaded', () => {
    const accountLinks = document.querySelectorAll('a[href="personal_account.html"]');
    accountLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                window.location.href = 'log_in.html';
            }
        });
    });
});