import axios from 'axios';
export const createVNPayQRCode = async (amount) => {
  try {
    const res = await axios.post(`${API_URL}/payment/create-vnpay-qr`, { amount });
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Không thể tạo mã QR VNPay');
  }
};



const API_URL = process.env.REACT_APP_API_URL;

export const createVNPayUrl = async (amount) => {
  try {
    const res = await axios.post(`${API_URL}/payment/create-vnpay-url`, { amount });
    return res.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Không thể tạo link thanh toán VNPay');
  }
};
