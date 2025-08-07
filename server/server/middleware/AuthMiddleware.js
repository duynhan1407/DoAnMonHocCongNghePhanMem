const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const AuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization; // Using 'Authorization' header

    if (!token) {
        return res.status(401).json({
            message: 'Token is missing',
            status: 'ERROR',
        });
    }

    const tokenWithoutBearer = token.split(' ')[1];  // Assuming the token follows the 'Bearer <token>' format
    if (!tokenWithoutBearer) {
        return res.status(401).json({
            message: 'Token is missing or malformed',
            status: 'ERROR',
        });
    }

    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, function (err, user) {
        if (err) {
            return res.status(401).json({
                message: 'Authentication failed: Invalid token',
                status: 'ERROR',
            });
        }

        if (user?.isAdmin) {
            req.user = user;  // Attach user to the request object if needed later
            return next();
        } else {
            return res.status(403).json({
                message: 'Permission denied: Admin only',
                status: 'ERROR',
            });
        }
    });
};

const AuthUserMiddleware = (req, res, next) => {
    const token = req.headers.authorization; // Using 'Authorization' header

    if (!token) {
        return res.status(401).json({
            message: 'Token is missing',
            status: 'ERROR',
        });
    }

    const tokenWithoutBearer = token.split(' ')[1];  // Assuming the token follows the 'Bearer <token>' format
    if (!tokenWithoutBearer) {
        return res.status(401).json({
            message: 'Token is missing or malformed',
            status: 'ERROR',
        });
    }

    const userId = req.params.id;

    jwt.verify(tokenWithoutBearer, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(401).json({
                message: 'Authentication failed: Invalid token',
                status: 'ERROR',
            });
        }

        // Check if the user is an admin or if the user id matches
        if (user?.isAdmin || user?.id === userId) {
            req.user = user;  // Attach user to the request object if needed later
            return next();
        } else {
            return res.status(403).json({
                message: 'Permission denied: Access to this resource is not allowed',
                status: 'ERROR',
            });
        }
    });
};

module.exports = {
    AuthMiddleware,
    AuthUserMiddleware,
};
