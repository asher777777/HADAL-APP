import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// טען משתני סביבה מקובץ .env
dotenv.config();

// יצירת חיבור (Connection Pool) לניהול יעיל של חיבורים
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'metamorphosis_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// פונקציית עזר לבדיקת החיבור
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to Hostinger MySQL Database successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

export default pool;
