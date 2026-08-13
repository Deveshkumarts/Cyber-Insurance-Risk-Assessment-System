const jwt = require('jsonwebtoken');

// This is a placeholder auth middleware prepared for future modules.
// Module 1 does not require user authentication for taking assessments.
const authenticateToken = (req, res, next) => {
    // Example logic for future implementation:
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    // if (token == null) return res.sendStatus(401);
    // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //     if (err) return res.sendStatus(403);
    //     req.user = user;
    //     next();
    // });
    next();
};

module.exports = authenticateToken;
