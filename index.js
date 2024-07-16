require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 3000;
const registerRouter = require('./routes/register');
const authRouter = require('./routes/auth');
const expensesRouter = require('./routes/expenses');
const protectedRouter = require('./routes/protected');


// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files for the public directory
app.use(express.static('public'));

// API routes
app.use('/api/register', registerRouter);
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('api', protectedRouter);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});