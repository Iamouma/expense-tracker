const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from headers

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Failed to authenticate token:', err);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id; // Attach user ID to request object
        next(); // Move to next middleware or route handler
    });
}

module.exports = verifyToken;