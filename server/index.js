import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase payload size limit for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Routes ---

// Health Check
app.get('/api/health', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({ 
        status: 'ok', 
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date() 
    });
});

// GET: Fetch all days content
app.get('/api/days', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM daily_content ORDER BY day_id ASC');
        const days = {};
        rows.forEach(row => {
            days[row.day_id] = {
                ...row,
                resources: row.resources_json ? row.resources_json : [],
                id: row.day_id,
                guidedImageryAudioUrl: row.guided_imagery_audio_url,
                videoUrl: row.video_url,
                writingPrompt: row.writing_prompt,
                htmlContent: row.html_content
            };
        });
        res.json(days);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch days' });
    }
});

// POST: Create or Update User
app.post('/api/users', async (req, res) => {
    const { name, email, phone, ...profileData } = req.body;
    
    try {
        // Check if user exists
        const [existing] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        
        let userId;
        if (existing.length > 0) {
            userId = existing[0].id;
            await pool.query(
                'UPDATE users SET name = ?, email = ?, profile_json = ? WHERE id = ?',
                [name, email, JSON.stringify(profileData), userId]
            );
        } else {
            const [result] = await pool.query(
                'INSERT INTO users (name, email, phone, profile_json) VALUES (?, ?, ?, ?)',
                [name, email, phone, JSON.stringify(profileData)]
            );
            userId = result.insertId;
        }
        
        res.json({ success: true, userId, message: 'User saved successfully' });
    } catch (error) {
        console.error('User save error:', error);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// POST: Update User Progress
app.post('/api/progress', async (req, res) => {
    const { userId, dayId, submission } = req.body;
    try {
        await pool.query(
            `INSERT INTO user_progress (user_id, day_id, writing_submission) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP, writing_submission = ?`,
            [userId, dayId, submission || '', submission || '' ]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Serve Frontend in Production (Hostinger)
// Assuming 'dist' is in the parent directory of 'server'
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    testConnection();
});