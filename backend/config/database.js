// backend/config/database.js
// PostgreSQL database connection configuration

const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test the connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Helper function to get a single row
const queryOne = async (text, params) => {
    const result = await query(text, params);
    return result.rows[0];
};

// Helper function to get multiple rows
const queryMany = async (text, params) => {
    const result = await query(text, params);
    return result.rows;
};

module.exports = {
    pool,
    query,
    queryOne,
    queryMany
};