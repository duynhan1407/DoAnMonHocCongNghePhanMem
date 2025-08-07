
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import { Card, Radio, Button, Input, message, Modal } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import * as OrderService from '../../services/OrderService';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = location.state?.cart || [];
  const userInfo = location.state?.userInfo || {};
  const user = useSelector((state) => state.user);
  const [shipping, setShipping] = useState('local');
  const [discount, setDiscount] = useState('');
  // ...existing code...
  const [loading, setLoading] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);

  const shippingFee = shipping === 'local' ? 40000 : 100000;
  // Tính giá sau giảm cho từng item
  const getSalePrice = (item) => {
    let discount = 0;
    if (item.color && Array.isArray(item.colors)) {
      const colorObj = item.colors.find(c => c.color === item.color);
      discount = colorObj && typeof colorObj.discount === 'number' ? colorObj.discount : 0;
    } else {
      discount = typeof item.discount === 'number' ? item.discount : 0;
    }
    if (typeof item.price === 'number' && discount > 0) {
      return item.price * (1 - discount / 100);
    }
    return item.price;
  };
  const subtotal = cart.reduce((sum, item) => sum + getSalePrice(item) * (item.quantity || 1), 0);
  const total = subtotal + shippingFee;

  const handleOrder = async () => {
    setLoading(true);
    try {
      // Ensure every item has productId and color (nếu có) before sending to backend
      const cartWithProductId = cart.map(item => {
        const result = { ...item, productId: item.productId || item._id };
        // Nếu sản phẩm có màu, truyền color
        if (item.color) result.color = item.color;
        return result;
      });
      // Luôn lấy userId từ redux
      if (!user || !user._id) {
        message.info('Bạn cần đăng nhập để đặt hàng!');
        setLoading(false);
        return;
      }
      await OrderService.createOrder({
        orderItems: cartWithProductId,
        user: user._id,
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        shippingAddress: userInfo.address,
        notes: userInfo.notes,
        shippingFee,
        totalPrice: total,
        status: 'pending',
      }, user?.access_token);
      message.success('Đặt hàng thành công!');
      setOrderSuccessModal(true);
      // Xóa toàn bộ giỏ hàng khi đặt hàng thành công
      dispatch(clearCart());
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      // Phát sự kiện cập nhật sản phẩm cho HomePage
      window.dispatchEvent(new Event('order-success'));
      // Phát sự kiện reload kho cho AdminStockManager
      try {
        // Nếu đã có eventBus thì emit, nếu không thì dùng localStorage
        const eventBus = require('../../utils/eventBus');
        if (eventBus && typeof eventBus.emit === 'function') {
          eventBus.emit('reloadProducts');
        }
      } catch {
        // fallback: cập nhật localStorage để trigger reload
        localStorage.setItem('reloadProducts', Date.now());
      }
    } catch (err) {
      message.error('Đặt hàng thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={orderSuccessModal}
        onCancel={() => {
          setOrderSuccessModal(false);
          navigate('/');
        }}
        footer={[
          <Button key="ok" type="primary" onClick={() => {
            setOrderSuccessModal(false);
            navigate('/');
          }}>
            Đóng
          </Button>
        ]}
        centered
        title="Đặt hàng thành công!"
      >
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, color: '#52c41a', margin: 16 }}>
          Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất.
        </div>
      </Modal>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12, display: 'flex', gap: 32 }}>
      {/* Left: User & Shipping Info */}
      <div style={{ flex: 2 }}>
        <Card title={<b>Thông tin mua hàng</b>} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}><b>{userInfo.name}</b></div>
          <div>Địa chỉ: {userInfo.address}</div>
          <div>Điện thoại: {userInfo.phone}</div>
          <div>Email: {userInfo.email}</div>
        </Card>
        <Card title={<b>Vận chuyển</b>}>
          <Radio.Group value={shipping} onChange={e => setShipping(e.target.value)}>
            <Radio value="local">Giao hàng tận nơi <span style={{ color: '#d0021b' }}>40.000₫</span></Radio>
            <Radio value="hanoi">Hà Nội <span style={{ color: '#d0021b' }}>100.000₫</span></Radio>
          </Radio.Group>
        </Card>
        <div style={{ marginTop: 24 }}>
          <Button type="primary" style={{ background: '#b4005a', borderColor: '#b4005a' }} loading={loading} onClick={handleOrder}>Xác nhận đặt hàng</Button>
        </div>
      </div>
      {/* Right: Order Summary */}
      <div style={{ flex: 1 }}>
        <Card title={<b>Đơn hàng ({cart.length} sản phẩm)</b>}>
          {cart.map((item, idx) => {
            let discount = 0;
            if (item.color && Array.isArray(item.colors)) {
              const colorObj = item.colors.find(c => c.color === item.color);
              discount = colorObj && typeof colorObj.discount === 'number' ? colorObj.discount : 0;
            } else {
              discount = typeof item.discount === 'number' ? item.discount : 0;
            }
            let salePrice = item.price;
            if (typeof item.price === 'number' && discount > 0) {
              salePrice = item.price * (1 - discount / 100);
            }
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <img src={item.images?.[0] || item.image || '/assets/images/no-image.png'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 16, borderRadius: 8, border: '1px solid #eee' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  {item.color && <div style={{ fontSize: 13, color: '#888' }}>Màu: {item.color}</div>}
                  {item.quantity && <div style={{ fontSize: 13, color: '#888' }}>Số lượng: {item.quantity}</div>}
                </div>
                <div style={{ minWidth: 90, textAlign: 'right' }}>
                  {discount > 0 ? (
                    <span style={{ color: '#d0021b', fontWeight: 700 }}>{salePrice.toLocaleString('vi-VN')}₫</span>
                  ) : (
                    <span style={{ color: '#d0021b', fontWeight: 600 }}>{item.price?.toLocaleString('vi-VN')}₫</span>
                  )}
                </div>
              </div>
            );
          })}
          <Input.Group compact style={{ marginBottom: 16 }}>
            <Input style={{ width: '70%' }} placeholder="Nhập mã giảm giá" value={discount} onChange={e => setDiscount(e.target.value)} />
            <Button type="primary" style={{ background: '#b4005a', borderColor: '#b4005a' }} onClick={() => {/* Áp dụng giảm giá */}}>Áp dụng</Button>
          </Input.Group>
          <div style={{ marginBottom: 8 }}>Tạm tính: <span style={{ float: 'right' }}>{subtotal.toLocaleString('vi-VN')}₫</span></div>
          <div style={{ marginBottom: 8 }}>Phí vận chuyển: <span style={{ float: 'right' }}>{shippingFee.toLocaleString('vi-VN')}₫</span></div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#d0021b', marginBottom: 8 }}>Tổng cộng: <span style={{ float: 'right' }}>{total.toLocaleString('vi-VN')}₫</span></div>
        </Card>
      </div>
    </div>
    </>
  );
}
export default PaymentPage
