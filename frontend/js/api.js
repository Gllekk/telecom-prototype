// API Helper Functions
// This file centralizes all backend API calls

// Base API URL - uses relative paths for deployment
const API_BASE_URL = '/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Authentication API calls
const authAPI = {
    // Register new user
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    // Login user
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    // Logout user
    logout: async () => {
        return apiRequest('/auth/logout', {
            method: 'POST'
        });
    },
    
    // Get current user
    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    }
};

// User/Customer API calls
const userAPI = {
    // Get user profile
    getProfile: async (userId) => {
        return apiRequest(`/users/${userId}`);
    },
    
    // Update user profile
    updateProfile: async (userId, updates) => {
        return apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
};

// Plans API calls
const plansAPI = {
    // Get all plans
    getAll: async () => {
        return apiRequest('/plans');
    },
    
    // Get plan by ID
    getById: async (planId) => {
        return apiRequest(`/plans/${planId}`);
    },
    
    // Get plans by type
    getByType: async (type) => {
        return apiRequest(`/plans?type=${type}`);
    }
};

// Accounts API calls
const accountsAPI = {
    // Get customer accounts
    getCustomerAccounts: async (customerId) => {
        return apiRequest(`/accounts?customerId=${customerId}`);
    },
    
    // Get account details
    getAccountDetails: async (accountId) => {
        return apiRequest(`/accounts/${accountId}`);
    },
    
    // Create new account
    createAccount: async (accountData) => {
        return apiRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify(accountData)
        });
    }
};

// Subscriptions API calls
const subscriptionsAPI = {
    // Subscribe to a plan
    subscribe: async (subscriptionData) => {
        return apiRequest('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(subscriptionData)
        });
    },
    
    // Get subscriptions for an account
    getByAccount: async (accountId) => {
        return apiRequest(`/subscriptions?accountId=${accountId}`);
    },
    
    // Cancel subscription
    cancel: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}`, {
            method: 'DELETE'
        });
    }
};

// Bills API calls
const billsAPI = {
    // Get bills for an account
    getByAccount: async (accountId) => {
        return apiRequest(`/bills?accountId=${accountId}`);
    },
    
    // Get bill by ID
    getById: async (billId) => {
        return apiRequest(`/bills/${billId}`);
    }
};

// Payments API calls
const paymentsAPI = {
    // Make a payment
    makePayment: async (paymentData) => {
        return apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },
    
    // Get payment history
    getHistory: async (accountId) => {
        return apiRequest(`/payments?accountId=${accountId}`);
    }
};

// Export API modules
const API = {
    auth: authAPI,
    users: userAPI,
    plans: plansAPI,
    accounts: accountsAPI,
    subscriptions: subscriptionsAPI,
    bills: billsAPI,
    payments: paymentsAPI
};