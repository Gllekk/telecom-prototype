// Personal Account Page JavaScript

let allBills = [];
let showingAllBills = false;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // User is not logged in, redirect to login page
        window.location.href = 'log_in.html';
        return;
    }
    
    // Load user data into form
    await loadUserData(currentUser);
    
    // Load user's bills
    await loadBills(currentUser.userId);
});

// Load user data into the form fields
async function loadUserData(user) {
    // First, try to get fresh data from the server
    try {
        const response = await fetch(`/api/users/${user.userId}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            // Update form with server data
            document.getElementById('firstNameField').value = data.user.first_name || '';
            document.getElementById('lastNameField').value = data.user.last_name || '';
            document.getElementById('emailField').value = data.user.email || '';
            
            // Set gender radio button
            if (data.user.gender) {
                const genderRadio = document.querySelector(`input[name="gender"][value="${data.user.gender}"]`);
                if (genderRadio) {
                    genderRadio.checked = true;
                }
            }
            
            // Update currentUser in memory with fresh data
            user.firstName = data.user.first_name;
            user.lastName = data.user.last_name;
            user.email = data.user.email;
            user.gender = data.user.gender;
            setCurrentUser(user);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to stored user data
        document.getElementById('firstNameField').value = user.firstName || '';
        document.getElementById('lastNameField').value = user.lastName || '';
        document.getElementById('emailField').value = user.email || '';
        
        if (user.gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
        }
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    const firstName = document.getElementById('firstNameField').value.trim();
    const lastName = document.getElementById('lastNameField').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    const submitBtn = event.target.querySelector('.save-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/${currentUser.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                gender
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Update user in memory
            currentUser.firstName = firstName;
            currentUser.lastName = lastName;
            currentUser.gender = gender;
            setCurrentUser(currentUser);
            
            showMessage('Profile updated successfully!');
        } else {
            showMessage(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showMessage('Unable to connect to server');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// Toggle sidebar sections
function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const section = content.parentElement;
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        section.classList.add('collapsed');
    } else {
        content.classList.add('active');
        section.classList.remove('collapsed');
    }
}

// Show specific content section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Load bills for the user
async function loadBills(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/bills/user/${userId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            allBills = data.bills || [];
            displayBills(false); // Show only first 4 bills initially
        } else {
            // No bills found
            displayNoBills();
        }
    } catch (error) {
        console.error('Error loading bills:', error);
        displayNoBills();
    }
}

// Display bills in the UI
function displayBills(showAll) {
    const container = document.getElementById('billsContainer');
    const viewAllBtn = document.getElementById('viewAllBtn');
    
    if (allBills.length === 0) {
        displayNoBills();
        return;
    }
    
    // Determine how many bills to show
    const billsToShow = showAll ? allBills : allBills.slice(0, 4);
    
    // Generate HTML for bills
    container.innerHTML = billsToShow.map(bill => {
        const isPaid = bill.status === 'paid';
        const isComingSoon = bill.status === 'pending';
        
        const iconClass = isPaid ? 'paid' : 'coming-soon';
        const iconSymbol = isPaid ? '✓' : '⏲';
        const statusText = isPaid ? 'Paid' : 'Coming Soon.';
        
        return `
            <div class="bill-item">
                <div class="bill-icon ${iconClass}">${iconSymbol}</div>
                <div class="bill-details">
                    <div class="bill-month">
                        Month: <span>${bill.month}</span>
                        &nbsp;&nbsp;&nbsp;
                        Plan: <span>${bill.planName}</span>
                    </div>
                    <div class="bill-status">${statusText}</div>
                </div>
                <div class="bill-amount">${bill.amount.toFixed(2)} €</div>
            </div>
        `;
    }).join('');
    
    // Show/hide "View All" button
    if (allBills.length > 4) {
        viewAllBtn.style.display = 'block';
        viewAllBtn.textContent = showAll ? 'Show Less' : 'View All';
    } else {
        viewAllBtn.style.display = 'none';
    }
    
    showingAllBills = showAll;
}

// Display "No bills yet" message
function displayNoBills() {
    const container = document.getElementById('billsContainer');
    container.innerHTML = `
        <div class="no-bills-message">
            <p>No bills yet</p>
        </div>
    `;
    document.getElementById('viewAllBtn').style.display = 'none';
}

// Load all bills or collapse
function loadAllBills() {
    displayBills(!showingAllBills);
}