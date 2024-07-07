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

// Register endpoint
app.post('/api/auth/register', (req, res) => {
    const { username, email, phone, password } = req.body;

    // Check if the user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing the password:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }

            // Insert the new user into the database
            const user = { username, email, phone, password: hashedPassword };
            db.query('INSERT INTO users SET ?', user, (err, result) => {
                if (err) {
                    console.error('Error inserting user into the database:', err);
                    return res.status(500).json({ success: false, message: 'Server error' });
                }

                res.json({ success: true, message: 'User registered successfully' });
            });
        });
    });
});


// Login route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare passwords
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Generate JWT
            const token = jwt.sign({ id: user.id, email: user.email }, 'your_secret_key', {
                expiresIn: '1h'
            });

            res.json({ success: true, token });
        });
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