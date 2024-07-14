// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const db = require('../db'); // Your database connection

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || user.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // User authenticated, generate JWT token
        const payload = {
            user: {
                id: user[0].id,
                email: user[0].email
                // Add more data if needed
            }
        };

        jwt.sign(payload, 'JWT_SECRET', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token }); // Send the JWT token as response
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;