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

// --- SUBSCRIPTION PLANS ROUTES ---

// GET All Plans
app.get('/api/plans', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subscription_plans');
        // Map database columns (snake_case) to frontend (camelCase)
        const plans = rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            durationDays: row.duration_days,
            description: row.description
        }));
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// POST Create Plan
app.post('/api/plans', async (req, res) => {
    const { name, price, durationDays, description } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO subscription_plans (name, price, duration_days, description) VALUES (?, ?, ?, ?)',
            [name, price, durationDays || 30, description]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// DELETE Plan
app.delete('/api/plans/:id', async (req, res) => {
    try {
        // Prevent deleting default plan (id 1)
        if (req.params.id == 1) {
            return res.status(400).json({ error: 'Cannot delete default plan' });
        }
        await pool.query('DELETE FROM subscription_plans WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// --- USER ROUTES ---

// GET All Users (For Admin)
app.get('/api/users', async (req, res) => {
    try {
        // Fetch users with their plan name
        const [rows] = await pool.query(`
            SELECT u.*, sp.name as plan_name 
            FROM users u
            LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
            ORDER BY u.created_at DESC
        `);
        
        const users = rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            profileImage: row.profile_image,
            // Explicit Fields
            gender: row.gender,
            ageRange: row.age_range,
            workplace: row.workplace,
            role: row.profession_role,
            dailyScreenTime: row.daily_screen_time,
            reductionGoal: row.reduction_goal,
            // System
            systemRole: row.role,
            subscriptionPlanId: row.subscription_plan_id,
            subscriptionPlanName: row.plan_name,
            joinDate: row.created_at,
            // Progress placeholder (would usually need a join or separate fetch)
            progress: {
                currentDay: 1, // Calculate logic could be added here
                completedDays: [],
                streak: 0
            }
        }));
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST: Create or Update User (Onboarding)
app.post('/api/users', async (req, res) => {
    // Destructure all specific fields from the form
    const { 
        name, email, phone, profileImage,
        gender, ageRange, workplace, role, dailyScreenTime, reductionGoal,
        ...otherProfileData 
    } = req.body;
    
    // Default fallback values
    const cleanPhone = phone || '';
    
    try {
        // Check if user exists by phone
        const [existing] = await pool.query('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
        
        let userId;
        if (existing.length > 0) {
            userId = existing[0].id;
            // Update existing user with new profile data
            await pool.query(`
                UPDATE users SET 
                    name = ?, email = ?, profile_image = ?,
                    gender = ?, age_range = ?, workplace = ?, profession_role = ?,
                    daily_screen_time = ?, reduction_goal = ?,
                    profile_json = ?
                WHERE id = ?`,
                [
                    name, email, profileImage,
                    gender, ageRange, workplace, role, 
                    dailyScreenTime, reductionGoal,
                    JSON.stringify(otherProfileData), userId
                ]
            );
        } else {
            // Create new user (Role defaults to 'user', plan defaults to 1 via DB default)
            const [result] = await pool.query(`
                INSERT INTO users (
                    name, email, phone, profile_image,
                    gender, age_range, workplace, profession_role,
                    daily_screen_time, reduction_goal,
                    profile_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, email, cleanPhone, profileImage,
                    gender, ageRange, workplace, role,
                    dailyScreenTime, reductionGoal,
                    JSON.stringify(otherProfileData)
                ]
            );
            userId = result.insertId;
        }
        
        // Fetch back the full user object to return correct IDs and roles
        const [userRows] = await pool.query(`
             SELECT u.*, sp.name as plan_name 
             FROM users u
             LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
             WHERE u.id = ?`, [userId]);
             
        const row = userRows[0];
        
        // Return formatted UserProfile
        const userProfile = {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            profileImage: row.profile_image,
            gender: row.gender,
            ageRange: row.age_range,
            workplace: row.workplace,
            role: row.profession_role,
            dailyScreenTime: row.daily_screen_time,
            reductionGoal: row.reduction_goal,
            systemRole: row.role,
            subscriptionPlanId: row.subscription_plan_id,
            subscriptionPlanName: row.plan_name,
            joinDate: row.created_at,
            progress: { currentDay: 1, completedDays: [], streak: 0 },
            goals: [] // Placeholder
        };
        
        res.json({ success: true, userId, user: userProfile });
    } catch (error) {
        console.error('User save error:', error);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// PUT: Admin Update User (Role/Plan)
app.put('/api/users/:id/role', async (req, res) => {
    const { systemRole, subscriptionPlanId } = req.body;
    try {
        await pool.query(
            'UPDATE users SET role = ?, subscription_plan_id = ? WHERE id = ?',
            [systemRole, subscriptionPlanId, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// --- CONTENT ROUTES ---

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
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    testConnection();
});