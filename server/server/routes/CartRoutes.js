const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { AuthUserMiddleware } = require('../middleware/AuthMiddleware');

router.get('/', AuthUserMiddleware, CartController.getCart);
router.post('/', AuthUserMiddleware, CartController.updateCart);
router.delete('/', AuthUserMiddleware, CartController.clearCart);

module.exports = router;
