// Main JavaScript file for general functionality

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Handle placeholder clicks (show "under construction" message)
document.addEventListener('DOMContentLoaded', () => {
    const placeholders = document.querySelectorAll('.placeholder');
    
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('This feature is under construction');
        });
    });
});

// Simple message display function
function showMessage(message) {
    // Remove existing message if any
    const existing = document.querySelector('.message-popup');
    if (existing) {
        existing.remove();
    }
    
    // Create message popup
    const popup = document.createElement('div');
    popup.className = 'message-popup';
    popup.textContent = message;
    document.body.appendChild(popup);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Add message popup styles dynamically
const style = document.createElement('style');
style.textContent = `
    .message-popup {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #e67e50;
        color: white;
        padding: 15px 30px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.3s;
        font-size: 16px;
    }
`;
document.head.appendChild(style);