import { baseGet, basePost, baseDelete } from './baseService';

// Lấy tất cả review của 1 sản phẩm
export const getReviewsByProduct = (productId) => baseGet(`/review/product/${productId}`);

// Lấy tất cả review của mọi sản phẩm
export const getAllReviews = () => baseGet('/review/all');

// Tạo review mới cho sản phẩm
// Nhận payload object và truyền trực tiếp vào basePost
export const createReview = (payload) =>
  basePost('/review', payload);

// Xóa review
export const deleteReview = (reviewId) => baseDelete(`/review/${reviewId}`);
