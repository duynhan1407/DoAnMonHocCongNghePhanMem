import { baseGet, basePost, baseDelete } from './baseService';

// Lấy tất cả review của 1 sản phẩm
export const getReviewsByProduct = (productId) => baseGet(`/review/product/${productId}`);

// Tạo review mới cho sản phẩm
export const createReview = (productId, rating, comment) =>
  basePost('/review', { product: productId, rating, comment });

// Xóa review
export const deleteReview = (reviewId) => baseDelete(`/review/${reviewId}`);
