const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { AuthMiddleware } = require('../middleware/AuthMiddleware');

// Tạo sản phẩm mới
router.post('/create', AuthMiddleware, ProductController.createProduct);
// Cập nhật sản phẩm
router.put('/update/:id', AuthMiddleware, ProductController.updateProduct);
// Lấy chi tiết sản phẩm
router.get('/getId/:id', ProductController.getProductById);
// Xóa sản phẩm
router.delete('/delete/:id', AuthMiddleware, ProductController.deleteProduct);
// Lấy tất cả sản phẩm
router.get('/getAll', ProductController.getAllProducts);

module.exports = router;