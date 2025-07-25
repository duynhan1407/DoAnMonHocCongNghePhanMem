const Review = require('../models/Review');

// Tạo review mới cho sản phẩm
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user._id;
    const review = await Review.create({ user, product, rating, comment });
    res.status(201).json({ status: 'OK', message: 'Đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy tất cả review của 1 sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    res.status(200).json({ status: 'OK', data: reviews });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Xóa review (admin hoặc chủ review)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy review' });
    // Chỉ admin hoặc chủ review được xóa
    if (req.user.role !== 'admin' && !review.user.equals(req.user._id)) {
      return res.status(403).json({ status: 'ERR', message: 'Không có quyền xóa review này' });
    }
    await review.deleteOne();
    res.status(200).json({ status: 'OK', message: 'Đã xóa review' });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

module.exports = { createReview, getReviewsByProduct, deleteReview };
