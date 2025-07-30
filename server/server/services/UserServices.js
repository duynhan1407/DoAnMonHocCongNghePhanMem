const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generalAccessToken, generalRefreshToken } = require('./JwtService');

// Helper function for email validation
const validateEmail = (email) => {
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return reg.test(email);
};

const createUser = async (newUser) => {
    const { name, email, password, confirmPassword, phone } = newUser;

    try {
        // Check if email is valid
        if (!validateEmail(email)) {
            return {
                status: 'ERR',
                message: 'Invalid email format'
            };
        }

        // Check if user already exists
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return {
                status: 'ERR',
                message: 'The email is already in use'
            };
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return {
                status: 'ERR',
                message: 'Passwords do not match'
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone
        });

        return {
            status: 'OK',
            message: 'User created successfully',
            data: createdUser
        };
    } catch (e) {
        throw new Error('Error creating user: ' + e.message);
    }
};

const loginUser = async (userLogin) => {
    const { email, password } = userLogin;

    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return {
                status: 'ERR',
                message: 'User not found'
            };
        }

        const isPasswordValid = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordValid) {
            return {
                status: 'ERR',
                message: 'Incorrect password'
            };
        }

        // Đảm bảo luôn trả về isAdmin rõ ràng (nếu chưa có thì là false)
        const isAdmin = !!checkUser.isAdmin;
        console.log('Tạo token với:', { id: checkUser._id, isAdmin, email: checkUser.email });
        const access_token = await generalAccessToken({
            id: checkUser._id,
            isAdmin: isAdmin,
            email: checkUser.email
        });

        const refresh_token = await generalRefreshToken({
            id: checkUser._id,
            isAdmin: isAdmin,
            email: checkUser.email
        });

        return {
            status: 'OK',
            message: 'Login successful',
            access_token,
            refresh_token,
            user: {
                id: checkUser.id,
                name: checkUser.name || checkUser.username || checkUser.fullName || checkUser.email || 'Không xác định',
                username: checkUser.username || '',
                fullName: checkUser.fullName || '',
                email: checkUser.email,
                isAdmin: isAdmin
            }
        };
    } catch (e) {
        throw new Error('Error logging in: ' + e.message);
    }
};

const updateUser = async (id, data) => {
    try {
        const checkUser = await User.findById(id);
        if (!checkUser) {
            return {
                status: 'ERR',
                message: 'User not found'
            };
        }

        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
        return {
            status: 'OK',
            message: 'User updated successfully',
            data: updatedUser
        };
    } catch (e) {
        throw new Error('Error updating user: ' + e.message);
    }
};

const deleteUser = async (id) => {
    try {
        const checkUser = await User.findById(id);
        if (!checkUser) {
            return {
                status: 'ERR',
                message: 'User not found'
            };
        }

        await User.findByIdAndDelete(id);
        return {
            status: 'OK',
            message: 'User deleted successfully'
        };
    } catch (e) {
        throw new Error('Error deleting user: ' + e.message);
    }
};

const getAllUsers = async () => {
    try {
        const allUsers = await User.find();
        return {
            status: 'OK',
            message: 'Fetched all users successfully',
            data: allUsers
        };
    } catch (e) {
        throw new Error('Error fetching users: ' + e.message);
    }
};

const getDetailUser = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return {
                status: 'ERR',
                message: 'User not found'
            };
        }

        return {
            status: 'OK',
            message: 'Fetched user details successfully',
            data: user
        };
    } catch (e) {
        throw new Error('Error fetching user details: ' + e.message);
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getDetailUser
};
