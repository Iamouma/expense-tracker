const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock user data
const users = [
    { username: 'user1', password: '$2b$10$abc123' } // password: "password1" (hashed)
];

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});


const { check, validationResult } = require('express-validator');

router.post('/login', [
    check('username').isString(),
    check('password').isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
});
module.exports = router;