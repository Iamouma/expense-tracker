const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection

// Retrieve all expenses for a user
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM expense');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Add a new expense
router.post('/', async (req, res) => {
    const { user_id, amount, description, date } = req.body;
    console.log('Received data:', req.body); // Log received data

    if (!user_id || !amount || !description || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO expense (user_id, amount, description, date) VALUES (?, ?, ?, ?)',
            [user_id, amount, description, date]
        );
        console.log('Database result:', result); // Log database result
        res.status(201).json({ id: result.insertId, user_id, amount, description, date });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update an existing expense
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;
    try {
        const [result] = await db.query('UPDATE expense SET amount = ?, description = ? WHERE id = ?', [amount, description, id]);
        res.json({ message: 'Expense updated successfully' });
    } catch (err) {
        console.error('Error updating expense:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete an existing expense
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM expense WHERE id = ?', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;