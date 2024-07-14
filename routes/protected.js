const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.get('/protected-route', authenticateToken, (req, res) => {
    // Your protected route logic here
    res.send('This is a protected route');
});

module.exports = router;