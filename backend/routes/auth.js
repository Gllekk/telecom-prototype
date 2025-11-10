// Authentication routes for registration and login

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { query, queryOne } = require('../config/database');
const { generateUniqueId } = require('../utils/utils');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // Validate email format - simple check
    if (!email.includes('@') || !email.includes('.')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    
    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }
    
    try {
        // Check if the email already exists
        const existingUser = await queryOne(
            'SELECT user_id FROM USERS WHERE email = $1',
            [email]
        );
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Generate unique user_id and customer_id
        const userId = await generateUniqueId('USR', 'USERS', 'user_id');
        const customerId = await generateUniqueId('CUS', 'CUSTOMERS', 'customer_id');
        
        // Insert user into USERS table
        await query(
            'INSERT INTO USERS (user_id, email, password_hash, first_name, last_name, gender, role_type, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [userId, email, passwordHash, firstName, lastName, 'not_specified', 'customer', 'active']
        );
        
        // Insert customer into CUSTOMERS table
        await query(
            'INSERT INTO CUSTOMERS (customer_id, user_id, customer_type, preferred_contact_method) VALUES ($1, $2, $3, $4)',
            [customerId, userId, 'individual', 'email']
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: userId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    try {
        // Find user by email
        const user = await queryOne(
            'SELECT user_id, email, password_hash, first_name, last_name, gender, role_type, status FROM USERS WHERE email = $1',
            [email]
        );
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Update last login timestamp
        await query(
            'UPDATE USERS SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
            [user.user_id]
        );
        
        // Return user data (without password hash)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: user.gender,
                role_type: user.role_type
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

module.exports = router;