require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const path = require('path');
const verifyToken = require('./verifyToken');


const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

const secretKey = process.env.SECRET_KEY;


// Register JS
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(201).json({ message: 'User registered successfully' });
    });
});



app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
                const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        });
    });
});

// Add Expense endpoint
app.post('/api/expenses', verifyToken, (req, res) => {
    const { expenseDate, category, amount, description } = req.body;
    const userId = req.userId;

    const sql = 'INSERT INTO expenses (user_id, expenseDate, category, amount, description) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, expenseDate, category, amount, description], (err, result) => {
        if (err) {
            console.error('Error adding expense:', err);
            return res.status(500).json({ message: 'Failed to add expense' });
        }

        res.status(201).json({ message: 'Expense added successfully' });
    });
});

// Fetch all expenses for the logged-in user
app.get('/api/expenses', verifyToken, (req, res) => {
    const userId = req.userId;

    const sql = 'SELECT * FROM expenses WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({ message: 'Failed to fetch expenses' });
        }
        res.status(200).json(results);
    });
});

// Fetch a single expense by ID
app.get('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId;

    const sql = 'SELECT * FROM expenses WHERE expense_id = ? AND user_id = ?';
    db.query(sql, [expenseId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching expense:', err);
            return res.status(500).json({ message: 'Failed to fetch expense' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(results[0]);
    });
});

// Update an existing expense by ID
app.put('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const { expenseDate, category, amount, description } = req.body;
    const userId = req.userId;

    const sql = 'UPDATE expenses SET expenseDate = ?, category = ?, amount = ?, description = ? WHERE expense_id = ? AND user_id = ?';
    db.query(sql, [expenseDate, category, amount, description, expenseId, userId], (err, result) => {
        if (err) {
            console.error('Error updating expense:', err);
            return res.status(500).json({ message: 'Failed to update expense' });
        }
        res.status(200).json({ message: 'Expense updated successfully' });
    });
});

// Delete an expense by ID
app.delete('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId;

    const sql = 'DELETE FROM expenses WHERE expense_id = ? AND user_id = ?';
    db.query(sql, [expenseId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).json({ message: 'Failed to delete expense' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});