const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error registering user', err });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// User login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    });
});

// Middleware to verify JWT
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

// Retrieve all expenses for a user
app.get('/api/expenses', verifyToken, (req, res) => {
    const userId = req.userId;
    db.query('SELECT * FROM expenses WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving expenses', err });
        }
        res.status(200).json(results);
    });
});

// Add a new expense
app.post('/api/expenses', verifyToken, (req, res) => {
    const { description, amount, date } = req.body;
    const userId = req.userId;
    if (!description || !amount || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    db.query('INSERT INTO expenses (userId, description, amount, date) VALUES (?, ?, ?, ?)', [userId, description, amount, date], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding expense', err });
        }
        res.status(201).json({ id: results.insertId, userId, description, amount, date });
    });
});

// Update an existing expense
app.put('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { description, amount, date } = req.body;
    db.query('SELECT * FROM expenses WHERE id = ?', [expenseId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        const updateFields = [];
        const updateValues = [];
        if (description) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (amount) {
            updateFields.push('amount = ?');
            updateValues.push(amount);
        }
        if (date) {
            updateFields.push('date = ?');
            updateValues.push(date);
        }
        updateValues.push(expenseId);
        db.query(`UPDATE expenses SET ${updateFields.join(', ')} WHERE id = ?`, updateValues, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating expense', err });
            }
            res.status(200).json({ message: 'Expense updated successfully' });
        });
    });
});

// Delete an existing expense
app.delete('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = parseInt(req.params.id);
    db.query('SELECT * FROM expenses WHERE id = ?', [expenseId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        db.query('DELETE FROM expenses WHERE id = ?', [expenseId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting expense', err });
            }
            res.status(200).json({ message: 'Expense deleted successfully' });
        });
    });
});

// Calculate total expense for a user
app.get('/api/expense', verifyToken, (req, res) => {
    const userId = req.userId;
    db.query('SELECT SUM(amount) as totalExpense FROM expenses WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error calculating total expense', err });
        }
        res.status(200).json({ totalExpense: results[0].totalExpense });
    });
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