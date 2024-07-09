const express = require('express');
const router = express.Router();
const db = require('../db');


// Example endpoint to retrieve all expenses
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM expenses');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Example endpoint to add a new expense
router.post('/', async (req, res) => {
    const { user, amount, description } = req.body;
    try {
        const [result] = await db.query('INSERT INTO expenses (user, amount, description) VALUES (?, ?, ?)', [user, amount, description]);
        res.status(201).json({ id: result.insertId, user, amount, description });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Mock data for expenses
let expenses = [
    { id: 1, user: 'user1', amount: 100, description: 'Groceries' },
    { id: 2, user: 'user1', amount: 50, description: 'Transport' }
];

// Retrieve all expenses for a user
router.get('/', (req, res) => {
    const userExpenses = expenses.filter(exp => exp.user === req.query.user);
    res.json(userExpenses);
});

// Add a new expense for a user
router.post('/', (req, res) => {
    const { user, amount, description } = req.body;
    const newExpense = { id: expenses.length + 1, user, amount, description };
    expenses.push(newExpense);
    res.status(201).json(newExpense);
});

// Update an existing expense
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { date, amount, description } = req.body;
    const expense = expenses.find(exp => exp.id === parseInt(id));
    if (expense) {
        expense.date = date;
        expense.amount = amount;
        expense.description = description;
        res.json(expense);
    } else {
        res.status(404).json({ message: 'Expense not found' });
    }
});

// Delete an existing expense
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = expenses.findIndex(exp => exp.id === parseInt(id));
    if (index !== -1) {
        expenses.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Expense not found' });
    }
});

// Calculate the total expense for a user
router.get('/total', (req, res) => {
    const userExpenses = expenses.filter(exp => exp.user === req.query.user);
    const totalAmount = userExpenses.reduce((total, exp) => total + exp.amount, 0);
    res.json({ totalAmount });
});

module.exports = router;