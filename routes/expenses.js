const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection

// Add a new expense
router.post('/', async (req, res) => {
    const { user_id, amount, category, description, date } = req.body;
    console.log('Received data:', req.body); // Log received data

    if (!user_id || !amount || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO expense (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
            [user_id, amount, category, description, date]
        );
        console.log('Database result:', result); // Log database result
        res.status(201).json({ id: result.insertId, user_id, amount, category, description, date });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;