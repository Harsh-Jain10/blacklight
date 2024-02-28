const mysql = require("mysql2/promise");
require("dotenv").config()


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    
    // connectTimeout: 30000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export a function to get a connection from the pool
module.exports.getConnection = async function() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        throw new Error('Error getting connection from pool: ' + error.message);
    }
};