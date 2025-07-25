const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { AuthMiddleware, AuthUserMiddleware } = require('../middleware/AuthMiddleware')

router.post('/sign-up', UserController.createUser)
router.post('/sign-in', UserController.loginUser)
router.post('/log-out', UserController.logoutUser)
router.put('/update-user/:id', UserController.updateUser)
router.delete('/delete-user/:id', AuthMiddleware ,UserController.deleteUser)
router.get('/getAll',AuthMiddleware,  UserController.getAllUsers)
router.get('/all', UserController.getAllUsers); // Public route for admin to get all users
router.get('/get-detail/:id',AuthUserMiddleware,  UserController.getDetailUser)
router.post('/refresh-token',UserController.refreshToken)

module.exports = router