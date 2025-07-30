const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { AuthMiddleware, AuthUserMiddleware } = require('../middleware/AuthMiddleware');

// Tạo review mới cho sản phẩm (user phải đăng nhập)
router.post('/', AuthUserMiddleware, ReviewController.createReview);
// Lấy tất cả review của 1 sản phẩm
router.get('/product/:productId', ReviewController.getReviewsByProduct);
// Lấy tất cả review của mọi sản phẩm
router.get('/all', ReviewController.getAllReviews);
// Xóa review (admin hoặc chủ review)
router.delete('/:id', AuthUserMiddleware, ReviewController.deleteReview);

module.exports = router;
