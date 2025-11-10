// backend/utils/utils.js
// Utility functions for the backend

const { queryOne } = require('../config/database');

// Generate unique ID with prefix
async function generateUniqueId(prefix, table, column) {
    let id;
    let exists = true;
    
    while (exists) {
        // Generate random 7-digit number
        const randomNum = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        id = prefix + randomNum;
        
        // Check if ID already exists
        const checkQuery = 'SELECT ' + column + ' FROM ' + table + ' WHERE ' + column + ' = $1';
        const result = await queryOne(checkQuery, [id]);
        
        exists = result !== undefined;
    }
    
    return id;
}

// Get current month name
function getCurrentMonthName() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
}

// Get month name by number (0-11)
function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// Get first day of current month
function getFirstDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Get 15th day of current month (due date)
function getDueDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 15);
}

module.exports = {
    generateUniqueId,
    getCurrentMonthName,
    getMonthName,
    formatDate,
    getFirstDayOfMonth,
    getDueDateOfMonth
};