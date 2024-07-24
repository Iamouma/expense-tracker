const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

module.exports = function(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.id; // Save user ID in request
        next();
    });
};