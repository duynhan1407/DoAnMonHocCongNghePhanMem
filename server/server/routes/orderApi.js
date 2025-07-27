const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Tạo đơn hàng mới
router.post('/', OrderController.createOrder);
// Lấy tất cả đơn hàng
router.get('/', OrderController.getAllOrders);

module.exports = router;
