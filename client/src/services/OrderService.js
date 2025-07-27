import { baseGet, basePost, basePut, baseDelete } from './baseService';
import axios from 'axios';

const API_URL = '/api/orders';

// Lấy tất cả đơn hàng (admin hoặc user)
export const getAllOrders = (token, status) => baseGet('/order/getAll', { token, status });

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = (id) => baseGet(`/order/getId/${id}`);

// Tạo đơn hàng mới
// export const createOrder = (data, token) => basePost('/order/create', data, token);

// Cập nhật đơn hàng
export const updateOrder = (id, data, token) => basePut(`/order/update/${id}`, data, token);

// Xóa đơn hàng
export const deleteOrder = (id, token) => baseDelete(`/order/delete/${id}`, token);

// Thanh toán đơn hàng
export const payOrder = (id, data, token) => basePost(`/order/${id}/pay`, data, token);

// Nhập kho sản phẩm
export const restockProduct = (data, token) => basePost('/order/restock', data, token);

// Xuất kho sản phẩm
export const exportProduct = (data, token) => basePost('/order/export', data, token);

export const createOrder = async (orderData) => {
  // orderData: { products, customer, shipping, discount, total }
  const response = await axios.post(API_URL, orderData);
  return response.data;
};
