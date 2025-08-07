import { baseGet, basePost, baseDelete } from './baseService';

// Lấy tất cả review của 1 sản phẩm
export const getReviewsByProduct = (productId) => baseGet(`/api/review/product/${productId}`);

// Lấy tất cả review của mọi sản phẩm
export const getAllReviews = () => baseGet('/api/review/all');

// Tạo review mới cho sản phẩm
// Nhận payload object và truyền trực tiếp vào basePost
export const createReview = (payload) =>
  basePost('/api/review', payload);

// Xóa review
export const deleteReview = (reviewId) => baseDelete(`/api/review/${reviewId}`);
