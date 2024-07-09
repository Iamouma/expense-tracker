require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const registerRouter = require('./routes/register');
const authRouter = require('./routes/auth');
const expensesRouter = require('./routes/expenses');


// Serve static files for the public directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api/register', registerRouter); // Register route
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});