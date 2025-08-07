import { baseGet, basePost, basePut, baseDelete } from './baseService';

// Lấy tất cả sản phẩm
export const getAllProducts = (params) => baseGet('/api/product/getAll', params);

// Lấy chi tiết sản phẩm
export const getProductById = (id) => baseGet(`/api/product/getId/${id}`);

// Tạo sản phẩm mới (admin)
export const createProduct = (data) => basePost('/api/product/create', data);

// Cập nhật sản phẩm (admin)
export const updateProduct = (id, data) => basePut(`/api/product/update/${id}`, data);

// Xóa sản phẩm (admin)
export const deleteProduct = (id) => baseDelete(`/api/product/delete/${id}`);

// Lấy tất cả thương hiệu
export const getAllBrands = (params) => baseGet('/api/brand/getAll', params);

// Cập nhật số lượng sản phẩm (admin)
export const updateProductQuantity = (id, data) => basePut(`/api/product/updateQuantity/${id}`, data);
