const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { AuthMiddleware, AuthUserMiddleware } = require('../middleware/AuthMiddleware');

// Tạo đơn hàng mới
router.post('/create', AuthUserMiddleware, OrderController.createOrder);
// Cập nhật đơn hàng
router.put('/update/:id', AuthUserMiddleware, OrderController.updateOrder);
// Lấy chi tiết đơn hàng
router.get('/getId/:id', AuthUserMiddleware, OrderController.getOrderDetail);
// Lấy tất cả đơn hàng
router.get('/getAll', AuthMiddleware, OrderController.getAllOrders);

// Lấy thống kê đơn hàng (dashboard)
router.get('/stats', AuthMiddleware, OrderController.getOrderStats);
// Xóa đơn hàng
router.delete('/delete/:id', AuthMiddleware, OrderController.deleteOrder);

// Nhập kho sản phẩm
router.post('/restock', AuthMiddleware, OrderController.restockProduct);
// Thanh toán đơn hàng
router.post('/:id/pay', AuthUserMiddleware, OrderController.payOrder);
// Lấy thông tin kho hàng (admin)
router.get('/stock/info', AuthMiddleware, OrderController.getStockInfo);
// Xuất kho sản phẩm (admin)
router.post('/export', AuthMiddleware, OrderController.exportProduct);

module.exports = router;
