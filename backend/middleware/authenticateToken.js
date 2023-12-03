const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: 'Access token is missing'});
        }

        const user = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;

        console.log('Authenticated user:', req.user);
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({message: 'Invalid token'});
        } else {
            return res
                .status(500)
                .json({message: 'Error verifying token', error: err.message});
        }
    }
}

module.exports = authenticateToken;
