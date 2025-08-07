import { baseGet, basePost, basePut, baseDelete } from './baseService';
import axios from 'axios';

const API_URL = '/api/orders';

// Lấy tất cả đơn hàng (admin hoặc user)
export const getAllOrders = (token, status) => baseGet('/api/order/getAll', { token, status });

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = (id) => baseGet(`/api/order/getId/${id}`);

// Tạo đơn hàng mới
// export const createOrder = (data, token) => basePost('/api/order/create', data, token);

// Cập nhật đơn hàng
export const updateOrder = (id, data, token) => basePut(`/api/order/update/${id}`, data, token);

// Xóa đơn hàng
export const deleteOrder = (id, token) => baseDelete(`/api/order/delete/${id}`, token);

// Thanh toán đơn hàng
export const payOrder = (id, data, token) => basePost(`/api/order/${id}/pay`, data, token);

// Nhập kho sản phẩm
export const restockProduct = (data, token) => basePost('/api/order/restock', data, token);

// Xuất kho sản phẩm
export const exportProduct = (data, token) => basePost('/api/order/export', data, token);

export const createOrder = async (orderData, token) => {
  // orderData: { products, customer, shipping, discount, total }
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/order/create`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(apiUrl, orderData, { headers });
  return response.data;
};
