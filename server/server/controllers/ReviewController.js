const Review = require('../models/Review');

// Tạo review mới cho sản phẩm
const createReview = async (req, res) => {
  try {
    const { product, rating, comment, user } = req.body;
    const reviewUser = user && typeof user === 'string' && user.trim() ? user.trim() : 'Không xác định';
    const review = await Review.create({ user: reviewUser, product, rating, comment });
    res.status(201).json({ status: 'OK', message: 'Đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};
// Lấy tất cả review của mọi sản phẩm
const getAllReviews = async (req, res) => {
  try {
    // Populate tên sản phẩm
    const reviews = await Review.find({}).populate({ path: 'product', select: 'name' });
    // Định dạng lại dữ liệu trả về cho frontend
    const mapped = reviews.map(r => ({
      _id: r._id,
      productName: r.product?.name || '',
      user: r.user,
      rating: r.rating,
      content: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '',
    }));
    res.status(200).json({ status: 'OK', data: mapped });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Lấy tất cả review của 1 sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId });
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
    // Chỉ admin được xóa review
    if (!req.user.isAdmin) {
      return res.status(403).json({ status: 'ERR', message: 'Chỉ admin mới được xóa review' });
    }
    await review.deleteOne();
    res.status(200).json({ status: 'OK', message: 'Đã xóa review' });
  } catch (error) {
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

module.exports = { createReview, getReviewsByProduct, deleteReview, getAllReviews };
