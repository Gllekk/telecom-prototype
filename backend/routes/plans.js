// Plans management routes

const express = require('express');
const router = express.Router();
const { queryMany, queryOne, query } = require('../config/database');


// GET /api/plans - Get all plans
router.get('/', async (req, res) => {
    try {
        const plans = await queryMany(
            `SELECT plan_id, plan_name, monthly_fee, data_limit_gb, calls_min, sms_count,
                    data_limit_roaming_gb, international_calling_min, international_sms_count, status
             FROM PERS_PLANS
             WHERE status = 'active'
             ORDER BY monthly_fee ASC`
        );
        
        res.json({
            success: true,
            plans: plans
        });
        
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/plans/:planId - Get specific plan
router.get('/:planId', async (req, res) => {
    const { planId } = req.params;
    
    try {
        const plan = await queryOne(
            `SELECT plan_id, plan_name, monthly_fee, data_limit_gb, calls_min, sms_count,
                    data_limit_roaming_gb, international_calling_min, international_sms_count, status
             FROM PERS_PLANS
             WHERE plan_id = $1`,
            [planId]
        );
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }
        
        res.json({
            success: true,
            plan: plan
        });
        
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// GET /api/plans/check-subscription/:userId - Check if user has existing subscription
router.get('/check-subscription/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        // Get customer_id from user_id
        const customer = await queryOne(
            'SELECT customer_id FROM CUSTOMERS WHERE user_id = $1',
            [userId]
        );
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        // Check if customer has any active account with subscription
        const subscription = await queryOne(
            `SELECT s.subscription_id 
             FROM SERVICE_SUBSCRIPTIONS s
             JOIN ACCOUNTS a ON s.account_id = a.account_id
             WHERE a.customer_id = $1 AND s.status = 'active'
             LIMIT 1`,
            [customer.customer_id]
        );
        
        res.json({
            success: true,
            hasSubscription: subscription !== undefined
        });
        
    } catch (error) {
        console.error('Error checking subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/plans/subscribe - Create new subscription and generate first bill
router.post('/subscribe', async (req, res) => {
    const { userId, planName, planPrice } = req.body;
    
    // Validate input
    if (!userId || !planName || !planPrice) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    try {
        // Import utilities
        const { generateUniqueId, formatDate, getFirstDayOfMonth, getDueDateOfMonth } = require('../utils/utils');
        
        // Get customer_id
        const customer = await queryOne(
            'SELECT customer_id FROM CUSTOMERS WHERE user_id = $1',
            [userId]
        );
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        // Get plan details from database
        const plan = await queryOne(
            'SELECT plan_id, monthly_fee FROM PERS_PLANS WHERE plan_name = $1 AND status = $2',
            [planName, 'active']
        );
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found in database'
            });
        }
        
        // Check if user already has an active subscription
        const existingSubscription = await queryOne(
            `SELECT s.subscription_id 
             FROM SERVICE_SUBSCRIPTIONS s
             JOIN ACCOUNTS a ON s.account_id = a.account_id
             WHERE a.customer_id = $1 AND s.status = 'active'
             LIMIT 1`,
            [customer.customer_id]
        );
        
        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                message: 'User already has an active subscription'
            });
        }
        
        // Get current user's phone number
        const currentUser = await queryOne(
            'SELECT phone_number FROM USERS WHERE user_id = $1',
            [userId]
        );
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let phoneNumber = currentUser.phone_number;
        
        // Generate phone number only if user doesn't have one
        if (!phoneNumber) {
            let phoneExists = true;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (phoneExists && attempts < maxAttempts) {
                attempts++;
                const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
                phoneNumber = '+3712' + randomDigits;
                
                // Check if phone number already exists
                const existingPhone = await queryOne(
                    'SELECT user_id FROM USERS WHERE phone_number = $1',
                    [phoneNumber]
                );
                
                phoneExists = existingPhone !== undefined;
            }
            
            if (attempts >= maxAttempts) {
                return res.status(500).json({
                    success: false,
                    message: 'Unable to generate unique phone number'
                });
            }
            
            // Update user with phone number
            await query(
                'UPDATE USERS SET phone_number = $1, last_updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
                [phoneNumber, userId]
            );
        }
        
        // Check if account exists, if not create one
        let account = await queryOne(
            'SELECT account_id FROM ACCOUNTS WHERE customer_id = $1 AND status = $2',
            [customer.customer_id, 'active']
        );
        
        if (!account) {
            const accountId = await generateUniqueId('ACC', 'ACCOUNTS', 'account_id');
            await query(
                `INSERT INTO ACCOUNTS (account_id, customer_id, account_type, debit, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)`,
                [accountId, customer.customer_id, 'personal', 0.00, 'active']
            );
            account = { account_id: accountId };
        }
        
        // Create subscription
        const subscriptionId = await generateUniqueId('SUB', 'SERVICE_SUBSCRIPTIONS', 'subscription_id');
        await query(
            `INSERT INTO SERVICE_SUBSCRIPTIONS (subscription_id, account_id, plan_id, status)
             VALUES ($1, $2, $3, $4)`,
            [subscriptionId, account.account_id, plan.plan_id, 'active']
        );
        
        // Generate first bill
        const billId = await generateUniqueId('BIL', 'BILLS', 'bill_id');
        const issueDate = formatDate(getFirstDayOfMonth());
        const dueDate = formatDate(getDueDateOfMonth());
        
        await query(
            `INSERT INTO BILLS (bill_id, account_id, issue_date, due_date, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [billId, account.account_id, issueDate, dueDate, plan.monthly_fee, 'pending']
        );
        
        res.json({
            success: true,
            message: 'Subscription created successfully',
            phoneNumber: phoneNumber,
            subscription: {
                subscription_id: subscriptionId,
                plan_name: planName,
                monthly_fee: parseFloat(plan.monthly_fee)
            },
            bill: {
                bill_id: billId,
                amount: parseFloat(plan.monthly_fee),
                due_date: dueDate
            }
        });
        
    } catch (error) {
        console.error('Error creating subscription:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error creating subscription',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;