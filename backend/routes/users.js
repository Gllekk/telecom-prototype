// User management routes

const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET /api/users/:userId - Get user profile
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const user = await queryOne(
            `SELECT user_id, email, first_name, last_name, gender, phone_number, status, created_at
             FROM USERS
             WHERE user_id = $1`,
            [userId]
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: user.gender,
                phone_number: user.phone_number,
                status: user.status,
                created_at: user.created_at
            }
        });
        
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, gender, phoneNumber } = req.body;
    
    try {
        // Check if user exists
        const existingUser = await queryOne(
            'SELECT user_id FROM USERS WHERE user_id = $1',
            [userId]
        );
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        if (firstName) {
            updates.push(`first_name = $${paramIndex++}`);
            values.push(firstName);
        }
        
        if (lastName) {
            updates.push(`last_name = $${paramIndex++}`);
            values.push(lastName);
        }
        
        if (gender) {
            updates.push(`gender = $${paramIndex++}`);
            values.push(gender);
        }
        
        if (phoneNumber !== undefined) {
            updates.push(`phone_number = $${paramIndex++}`);
            values.push(phoneNumber);
        }
        
        // Always update last_updated_at
        updates.push(`last_updated_at = CURRENT_TIMESTAMP`);
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        // Add userId to values for WHERE clause
        values.push(userId);
        
        // Execute update
        await query(
            `UPDATE USERS SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
            values
        );
        
        // Fetch updated user
        const updatedUser = await queryOne(
            `SELECT user_id, email, first_name, last_name, gender, phone_number
             FROM USERS
             WHERE user_id = $1`,
            [userId]
        );
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;