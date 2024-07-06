const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock user data
const users = [
    {
        id: 1,
        username: 'user1',
        password: '$2b$10$7QwksdKkYhYh97QwksdKkYhYh97QwksdKkYhYh97QwksdKkYhYh97' // 'password1' hashed
    },
    {
        id: 2,
        username: 'user2',
        password: '$2b$10$8Ropnl8Ropnl8Ropnl8Ropnl8Ropnl8Ropnl8Ropnl8Ropnl8Ropnl' // 'password2' hashed
    }
];

// Mock expense data
let expenses = [
    { id: 1, userId: 1, description: 'Groceries', amount: 50, date: '2024-07-01' },
    { id: 2, userId: 1, description: 'Gas', amount: 30, date: '2024-07-02' },
    { id: 3, userId: 2, description: 'Utilities', amount: 100, date: '2024-07-01' }
];

// POST /api/auth/login endpoint for user authentication
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// GET /api/expenses: Retrieve all expenses for a user
app.get('/api/expenses', verifyToken, (req, res) => {
    const userId = req.userId;

    const userExpenses = expenses.filter(expense => expense.userId === userId);
    res.status(200).json(userExpenses);
});

// POST /api/expenses: Add a new expense for a user
app.post('/api/expenses', verifyToken, (req, res) => {
    const { userId, description, amount, date } = req.body;
    if (!userId || !description || !amount || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newExpense = {
        id: expenses.length + 1,
        userId,
        description,
        amount,
        date
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
});

// PUT /api/expenses/:id: Update an existing expense
app.put('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { userId, description, amount, date } = req.body;

    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    if (userId) expense.userId = userId;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;

    res.status(200).json(expense);
});

// DELETE /api/expenses/:id: Delete an existing expense
app.delete('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = parseInt(req.params.id);
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex === -1) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    const deletedExpense = expenses.splice(expenseIndex, 1);
    res.status(200).json(deletedExpense);
});

// GET /api/expense: Calculate total expense for a user
app.get('/api/expense', verifyToken, (req, res) => {
    const userId = req.userId;

    const userExpenses = expenses.filter(expense => expense.userId === userId);
    const totalExpense = userExpenses.reduce((total, expense) => total + expense.amount, 0);

    res.status(200).json({ totalExpense });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});