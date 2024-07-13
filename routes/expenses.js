const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection

// Add a new expense
router.post('/', async (req, res) => {
    const { user_id, amount, category, description, date } = req.body;
    console.log('Received data:', req.body); // Log received data

    if (!user_id || !amount || !category || !description || !date) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
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

router.get('/api/expenses', (req, res) => {
    // Fetch expenses from the database (assuming you have a function to do this)
    fetchExpenses()
        .then(expenses => res.json({ expenses }))
        .catch(err => res.status(500).json({ message: err.message }));
});

function fetchExpenses() {
    // Database fetching logic here (e.g., using MySQL)
    return new Promise((resolve, reject) => {
        const expenses = [
            // Replace with your database code
            { expenseDate: '2024-07-01', category: 'Food', amount: 20, description: 'Lunch' },
            { expenseDate: '2024-07-02', category: 'Transport', amount: 15, description: 'Taxi' }
        ];
        resolve(expenses);
    });
}

module.exports = router;