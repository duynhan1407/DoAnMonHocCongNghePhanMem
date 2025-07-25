import { baseGet, basePost, basePut, baseDelete } from './baseService';

// Lấy tất cả sản phẩm
export const getAllProducts = (params) => baseGet('/product/getAll', params);

// Lấy chi tiết sản phẩm
export const getProductById = (id) => baseGet(`/product/getId/${id}`);

// Tạo sản phẩm mới (admin)
export const createProduct = (data) => basePost('/product/create', data);

// Cập nhật sản phẩm (admin)
export const updateProduct = (id, data) => basePut(`/product/update/${id}`, data);

// Xóa sản phẩm (admin)
export const deleteProduct = (id) => baseDelete(`/product/delete/${id}`);

// Lấy tất cả thương hiệu
export const getAllBrands = (params) => baseGet('/brand/getAll', params);
