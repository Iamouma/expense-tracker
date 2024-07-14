// routes/register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const db = require('../db'); // Import your database connection

// Register a new user
router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate request body
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    try {
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const newUser = {
            id: result.insertId,
            username,
            email
        };

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;