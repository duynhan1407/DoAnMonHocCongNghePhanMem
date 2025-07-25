const UserService = require('../services/UserServices');
const JwtService = require('../services/JwtService');

// Helper function for email validation
const validateEmail = (email) => {
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return reg.test(email);
};

// Password validation helper
const validatePassword = (password) => {
    return password.length >= 6; // Example check, can be made more complex
};

const createUser = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        
        // Input validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'All fields are required.'
            });
        } else if (!validateEmail(email)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid email format.'
            });
        } else if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Passwords do not match.'
            });
        } else if (!validatePassword(password)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Password must be at least 6 characters.'
            });
        }
        
        // Create user
        const response = await UserService.createUser(req.body);
        return res.status(201).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email and password are required.'
            });
        } else if (!validateEmail(email)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid email format.'
            });
        }

        // Login user
        const response = await UserService.loginUser(req.body);
        const { refresh_token, ...newResponse } = response;
        
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: 'strict',
        });

        return res.status(200).json(newResponse);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        
        if (!userId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'User ID is required.'
            });
        }

        const response = await UserService.updateUser(userId, data);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'User ID is required.'
            });
        }

        const response = await UserService.deleteUser(userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const response = await UserService.getAllUsers();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const getDetailUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'User ID is required.'
            });
        }

        const response = await UserService.getDetailUser(userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refresh_token;
        
        if (!token) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Refresh token is required.'
            });
        }

        const response = await JwtService.refreshTokenService(token);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token');
        return res.status(200).json({
            status: 'OK',
            message: 'Logout successful.'
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred.'
        });
    }
};



module.exports = {
    createUser, 
    loginUser, 
    updateUser, 
    deleteUser,
    getAllUsers, 
    getDetailUser, 
    refreshToken,
    logoutUser
};
