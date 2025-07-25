const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// Utility function for generating tokens
const generateToken = (payload, secretKey, expiresIn) => {
    return jwt.sign(payload, secretKey, { expiresIn });
};

// Create Access Token
const generalAccessToken = (payload) => {
    return generateToken(payload, process.env.ACCESS_TOKEN, '3h');
};

// Create Refresh Token
const generalRefreshToken = (payload) => {
    return generateToken(payload, process.env.REFRESH_TOKEN, '365d');
};

// Dịch vụ làm mới Token
const refreshTokenService = async (token) => {
    try {
        // Verify refresh_token using the promise-based approach
        const user = await jwt.verify(token, process.env.REFRESH_TOKEN);

        // Create a new access token
        const access_token = generalAccessToken({
            id: user.id,
            isAdmin: user.isAdmin
        });

        return {
            status: 'OK',
            message: 'SUCCESS',
            access_token
        };
    } catch (err) {
        // Handle errors related to token verification
        return {
            status: 'ERROR',
            message: 'The authentication failed. Please log in again.'
        };
    }
};

module.exports = {
    generalAccessToken,
    generalRefreshToken,
    refreshTokenService
};
