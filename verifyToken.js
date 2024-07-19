const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

module.exports = function (req, res, next) {
    const token = req.header('Authorization').split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, secretKey);
        req.userId = verified.id;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};


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