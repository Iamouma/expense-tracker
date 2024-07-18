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