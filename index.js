const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');

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

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


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


// Login endpoint
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


// Add new expense endpoint
app.post('/api/expenses', authenticateToken, (req, res) => {
    const { name, amount, date } = req.body;

    const query = 'INSERT INTO expenses (name, amount, date, user_id) VALUES (?, ?, ?, ?)';
    db.query(query, [name, amount, date, req.user.id], (err, results) => {
        if (err) {
            console.error('Error inserting expense into the database:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Expense added successfully' });
        }
    });
});


// Fetching an expense
app.get('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
  
    const query = 'SELECT * FROM expenses WHERE id = ? AND user_id = ?';
    db.query(query, [id, req.user.id], (err, results) => {
      if (err) {
        console.error('Error fetching expense from the database:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Expense not found' });
      } else {
        res.json(results[0]);
      }
    });
  });


app.put('/api/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, amount, date } = req.body;

  const query = 'UPDATE expenses SET name = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?';
  db.query(query, [name, amount, date, id, req.user.id], (err, result) => {
    if (err) {
      console.error('Error updating expense in the database:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Expense not found' });
    } else {
      res.json({ message: 'Expense updated successfully' });
    }
  });
});

app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
  db.query(query, [id, req.user.id], (err, result) => {
    if (err) {
      console.error('Error deleting expense from the database:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Expense not found' });
    } else {
      res.json({ message: 'Expense deleted successfully' });
    }
  });
});

app.get('/api/expense', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT SUM(amount) AS total_expense FROM expenses WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error calculating total expense:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      const totalExpense = results[0].total_expense || 0;
      res.json({ total_expense: totalExpense });
    }
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



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});