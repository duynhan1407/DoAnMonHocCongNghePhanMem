import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Input, Button, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const user = useSelector((state) => state.user);
  const handleConfirm = () => {
    if (!form.name || !form.phone || !form.address || form.address.trim() === '') {
      message.warning('Địa chỉ nhận hàng là bắt buộc!');
      return;
    }
    // Ensure every item has productId before passing to payment
    const cartWithProductId = cart.map(item => ({ ...item, productId: item.productId || item._id }));
    // Kiểm tra cả user.id và user._id
    const userId = user?.id || user?._id;
    if (!user || !userId) {
      message.info('Bạn cần đăng nhập để đặt hàng!');
      return;
    }
    // Truyền userId vào userInfo
    navigate('/payment', { state: { cart: cartWithProductId, userInfo: { ...form, _id: userId } } });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, alignContent:'center' }}>Xác nhận thông tin khách hàng</h1>
      <Card title="Thông tin người nhận" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}><b>Họ tên <span style={{ color: 'red' }}>*</span></b></div>
        <Input name="name" value={form.name} onChange={handleChange} style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 8 }}><b>Số điện thoại <span style={{ color: 'red' }}>*</span></b></div>
        <Input name="phone" value={form.phone} onChange={handleChange} style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 8 }}><b>Email</b></div>
        <Input name="email" value={form.email} onChange={handleChange} style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 8 }}><b>Địa chỉ nhận hàng <span style={{ color: 'red' }}>*</span></b></div>
        <Input name="address" value={form.address} onChange={handleChange} style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 8 }}><b>Ghi chú (tuỳ chọn)</b></div>
        <Input name="notes" value={form.notes} onChange={handleChange} style={{ marginBottom: 16 }} />
      </Card>
      <Card title={`Sản phẩm (${cart.length} sản phẩm)`} style={{ marginBottom: 24 }}>
        {cart.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <img src={item.images?.[0] || '/assets/images/no-image.png'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', marginRight: 12 }} />
            <span style={{ fontWeight: 600 }}>{item.name}</span>
            <span style={{ marginLeft: 'auto', color: '#d0021b', fontWeight: 600 }}>{item.price?.toLocaleString('vi-VN')}₫</span>
          </div>
        ))}
      </Card>
      <Button type="primary" style={{ background: '#b4005a', borderColor: '#b4005a', fontWeight: 600, fontSize: 18, width: '100%' }} onClick={handleConfirm}>
        Xác nhận thông tin của khách hàng
      </Button>
    </div>
  );
};

export default OrderInfoPage;
