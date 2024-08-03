require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const PDFDocument = require('pdfkit');
const path = require('path');
const verifyToken = require('./verifyToken');


const app = express();
const port = 3000;

// Middleware to verify the token
app.use('/api/expenses', verifyToken);

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


// Login JS
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


// Configure Nodemailer with OAuth2 or App Passwords (example uses App Passwords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Password Reset Request Endpoint
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const user = results[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 3600000; // 1 hour

        const resetTokenSql = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?';
        db.query(resetTokenSql, [token, expiration, email], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }

            const resetUrl = `http://localhost:3000/reset_password.html?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ message: 'Failed to send email' });
                }
                res.status(200).json({ message: 'Password reset email sent' });
            });
        });
    });
});

// Password Reset Endpoint
app.post('/api/auth/reset-password', (req, res) => {
    const { token, password } = req.body;

    const sql = 'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?';
    db.query(sql, [token, Date.now()], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatePasswordSql = 'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';
        db.query(updatePasswordSql, [hashedPassword, user.id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.status(200).json({ message: 'Password reset successful' });
        });
    });
});


// Add a new expense
app.post('/api/expenses', (req, res) => {
    const { expenseDate, category, amount, description } = req.body;
    const userId = req.userId; // This comes from the verifyToken middleware

    const sql = 'INSERT INTO expenses (user_id, expenseDate, category, amount, description) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, expenseDate, category, amount, description], (err, result) => {
        if (err) {
            return res.status(500).send('Error adding expense');
        }
        res.status(200).send('Expense added successfully');
    });
});

// Get all expenses for the logged-in user
app.get('/api/expenses', (req, res) => {
    const userId = req.userId; // This comes from the verifyToken middleware

    const sql = 'SELECT * FROM expenses WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching expenses');
        }
        res.status(200).json(results);
    });
});

// Update expense by ID
app.put('/api/expenses/:id', verifyToken, (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId;
    const { expenseDate, category, amount, description } = req.body;

    const sql = 'UPDATE expenses SET expenseDate = ?, category = ?, amount = ?, description = ?, updated_at = NOW() WHERE expense_id = ? AND user_id = ?';
    db.query(sql, [expenseDate, category, amount, description, expenseId, userId], (err, result) => {
        if (err) {
            return res.status(500).send('Error updating expense');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Expense not found or unauthorized');
        }

        res.status(200).send('Expense updated successfully');
    });
});

// Delete Expense
app.delete('/api/expenses/:id', (req, res) => {
    const expenseId = req.params.id;
    const userId = req.userId; // Get the userId from the verified token

    if (!expenseId || !userId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const deleteQuery = `
        DELETE FROM expenses
        WHERE expense_id = ? AND user_id = ?
    `;

    db.query(deleteQuery, [expenseId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).json({ error: 'Failed to delete expense' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        res.json({ message: 'Expense deleted successfully' });
    });
});

// Add this route in your backend routes file (e.g., expenses.js)
app.get('/api/expenses/month/:year/:month', verifyToken, (req, res) => {
    const { year, month } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

    const offset = (page - 1) * limit;

    // Get the total number of expenses for pagination
    const countSql = 'SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND YEAR(expenseDate) = ? AND MONTH(expenseDate) = ?';
    db.query(countSql, [userId, year, month], (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch expense count' });
        }

        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        // Fetch paginated expenses
        const sql = 'SELECT * FROM expenses WHERE user_id = ? AND YEAR(expenseDate) = ? AND MONTH(expenseDate) = ? LIMIT ? OFFSET ?';
        db.query(sql, [userId, year, month, parseInt(limit), parseInt(offset)], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch expenses' });
            }

            res.status(200).json({
                expenses: results,
                total,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit)
            });
        });
    });
});

// Endpoint to download monthly report as PDF
app.get('/api/expenses/report', verifyToken, async (req, res) => {
    const userId = req.userId;
    const month = req.query.month; // Expect month as a query parameter (e.g., '2023-07')

    const sql = `
        SELECT * FROM expenses 
        WHERE user_id = ? AND DATE_FORMAT(expenseDate, '%Y-%m') = ?
    `;
    
    db.query(sql, [userId, month], (err, results) => {
        if (err) {
            return res.status(500).send('Error generating report');
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        let filename = `Monthly_Report_${month}.pdf`;
        filename = encodeURIComponent(filename);

        // Set response headers
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text(`Monthly Report for ${month}`, {
            align: 'center'
            
        });

        doc.moveDown();

        results.forEach(expense => {
            doc.fontSize(12).text(`Date: ${expense.expenseDate}`);
            doc.text(`Category: ${expense.category}`);
            doc.text(`Amount: ${expense.amount}`);
            doc.text(`Description: ${expense.description}`);
            doc.moveDown();
        });

        doc.end();
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});