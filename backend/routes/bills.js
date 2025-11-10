// backend/routes/bills.js
const express = require('express');
const router = express.Router();
const { queryMany, queryOne } = require('../config/database');

// GET /api/bills/user/:userId - Get all bills for a user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
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
        
        const accounts = await queryMany(
            'SELECT account_id FROM ACCOUNTS WHERE customer_id = $1',
            [customer.customer_id]
        );
        
        if (accounts.length === 0) {
            return res.json({
                success: true,
                bills: []
            });
        }
        
        const accountIds = accounts.map(acc => acc.account_id);
        
        const query1 = `SELECT b.bill_id, b.account_id, b.issue_date, b.due_date, b.total_amount, b.status, p.plan_name
             FROM BILLS b
             JOIN ACCOUNTS a ON b.account_id = a.account_id
             LEFT JOIN SERVICE_SUBSCRIPTIONS s ON a.account_id = s.account_id
             LEFT JOIN PERS_PLANS p ON s.plan_id = p.plan_id
             WHERE b.account_id = ANY($1)
             ORDER BY b.issue_date DESC`;
        
        const bills = await queryMany(query1, [accountIds]);
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        const formattedBills = bills.map(bill => {
            const issueDate = new Date(bill.issue_date);
            const monthName = months[issueDate.getMonth()];
            
            return {
                bill_id: bill.bill_id,
                month: monthName,
                planName: bill.plan_name || 'Unknown Plan',
                status: bill.status,
                amount: parseFloat(bill.total_amount)
            };
        });
        
        res.json({
            success: true,
            bills: formattedBills
        });
        
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;