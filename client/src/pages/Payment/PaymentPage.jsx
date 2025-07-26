import React, { useEffect, useState, useCallback } from 'react';
import eventBus from '../../utils/eventBus';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message, Skeleton, Card, Button } from 'antd';
import * as OrderService from '../../services/OrderService';

const PaymentPage = () => {
  const user = useSelector(state => state.user);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId); // chỉ loading khi có orderId
  const [paying, setPaying] = useState(false);
  // Thông tin nhập khi chưa có orderId
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: '',
    notes: '',
  });
  const [cart, setCart] = useState([]);
  useEffect(() => {
    if (!orderId) {
      // Lấy cart từ location.state hoặc localStorage
      if (location.state?.cart) {
        setCart(location.state.cart);
      } else {
        const stored = localStorage.getItem('cart');
        if (stored) setCart(JSON.parse(stored));
      }
      // Tự động điền thông tin cá nhân nếu có
      setForm(f => ({
        ...f,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        shippingAddress: user?.address || '',
      }));
    }
  }, [orderId, location.state]);

  // Nếu có orderId: lấy chi tiết đơn hàng
  const fetchOrderDetail = useCallback(async () => {
    try {
      const access_token = localStorage.getItem('access_token');
      const res = await OrderService.getOrderById(orderId, access_token);
      console.log('Order API response:', res);
      if (res?.data) {
        setOrder(res.data);
      } else {
        message.error('Không tìm thấy đơn hàng hoặc dữ liệu trả về bị thiếu.');
        navigate('/');
      }
    } catch (error) {
      message.error('Không thể lấy thông tin đơn hàng.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [fetchOrderDetail, orderId]);

  // Xác nhận thanh toán đơn hàng (nếu đã có order)
  const handleConfirmPayment = async () => {
    if (!orderId) {
      message.error('Không tìm thấy đơn hàng để thanh toán.');
      return;
    }
    setPaying(true);
    try {
      const access_token = localStorage.getItem('access_token');
      // Gọi đúng API payOrder để backend trừ số lượng sản phẩm
      const res = await OrderService.payOrder(orderId, { paymentMethod: 'COD' }, access_token);
      if (res?.data?.isPaid || res?.data?.status === 'OK') {
        message.success({
          content: 'Thanh toán thành công! Cảm ơn bạn đã mua hàng.',
          duration: 3,
        });
        eventBus.emit('reloadProducts');
        localStorage.setItem('reloadProducts', Date.now().toString());
        fetchOrderDetail();
      } else {
        message.error('Thanh toán thất bại hoặc trạng thái đơn hàng không hợp lệ!');
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || 'Thanh toán thất bại!';
      message.error(`Thanh toán thất bại! ${errMsg}`);
    } finally {
      setPaying(false);
    }
  };

  // Xác nhận đặt hàng mới (nếu chưa có orderId)
  const handleCreateOrder = async () => {
    if (String(form.name).trim() === '' || String(form.phone).trim() === '' || String(form.shippingAddress).trim() === '') {
      message.warning('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!');
      return;
    }
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }
    setPaying(true);
    try {
      const access_token = localStorage.getItem('access_token');
      const userId = user._id || user.id;
      if (!userId) {
        message.error('Không xác định được người dùng. Vui lòng đăng nhập lại!');
        setPaying(false);
        return;
      }
      const payload = {
        user: String(userId),
        orderItems: cart.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1
        })),
        phone: String(form.phone || ''),
        shippingAddress: String(form.shippingAddress || ''),
        email: String(form.email || ''),
        status: 'pending',
        notes: String(form.notes || ''),
        name: String(form.name || ''),
      };
      const res = await OrderService.createOrder(payload, access_token);
      if (res?.data?._id) {
        localStorage.removeItem('cart');
        message.success('Đặt hàng thành công!');
        navigate(`/payment/${res.data._id}`);
      } else {
        message.error('Không thể tạo đơn hàng!');
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message;
      message.error(`Lỗi: ${errMsg}`);
    }
    setPaying(false);
  };

  if (!orderId) {
    // Form nhập thông tin và xác nhận đặt hàng
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 30 }}>
        <h1 style={{ textAlign: 'center' }}>Xác nhận đặt hàng</h1>
        <div style={{ marginBottom: 18 }}>
          <label>Họ tên:</label>
          <input style={{ width: '100%', padding: 8, marginBottom: 8 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label>Email:</label>
          <input style={{ width: '100%', padding: 8, marginBottom: 8 }} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <label>Số điện thoại:</label>
          <input style={{ width: '100%', padding: 8, marginBottom: 8 }} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <label>Địa chỉ nhận hàng:</label>
          <input style={{ width: '100%', padding: 8, marginBottom: 8 }} value={form.shippingAddress} onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))} />
          <label>Ghi chú:</label>
          <input style={{ width: '100%', padding: 8, marginBottom: 8 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <b>Giỏ hàng:</b>
          <ul>
            {cart.map((item, idx) => (
              <li key={item._id || item.id || idx}>
                {item.name} x {item.quantity || 1} - {Number(item.price).toLocaleString('vi-VN')}đ
              </li>
            ))}
          </ul>
        </div>
        <Button type="primary" loading={paying} onClick={handleCreateOrder} style={{ width: '100%', fontWeight: 600, fontSize: 18 }}>
          Xác nhận đặt hàng
        </Button>
      </div>
    );
  }

  const styles = {
    paymentPage: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      minHeight: '100vh',
    },
    header: {
      textAlign: 'center',
      padding: '20px 0',
      backgroundColor: '#ffffff',
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    },
    headerText: {
      margin: 0,
      fontSize: '24px',
      color: '#333333',
    },
    column: {
      backgroundColor: '#ffffff',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    },
    confirmButton: {
      display: 'block',
      width: '100%',
      padding: '15px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
      transition: 'background-color 0.3s ease',
    },
    confirmButtonHover: {
      backgroundColor: '#0056b3',
    },
    vnpayButton: {
      display: 'block',
      width: '100%',
      padding: '15px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: '#00bfae',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginTop: 10,
    },
  };

  return (
    <div style={styles.paymentPage}>
      <header style={styles.header}>
        <h1 style={styles.headerText}>Chi tiết Thanh toán</h1>
      </header>

      <Card style={styles.column} title="Thông tin Đơn hàng">
        <p><strong>Mã đơn hàng:</strong> {order?.orderCode || order?.code || order?.maDon || 'N/A'}</p>
        <p><strong>Khách hàng:</strong> {order?.user?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {order?.user?.email || 'N/A'}</p>
        <p><strong>Số điện thoại:</strong> {order?.user?.phone || order?.phone || 'N/A'}</p>
        <p><strong>Sản phẩm:</strong> {order?.orderItems?.map(i => i.name).join(', ') || 'N/A'}</p>
        <p><strong>Số lượng:</strong> {order?.orderItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 'N/A'}</p>
        <p><strong>Tổng tiền:</strong> {order?.totalPrice ? Number(order.totalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}</p>
        {/* Hiển thị hình ảnh sản phẩm dưới cùng */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24, justifyContent: 'flex-start' }}>
          {order?.orderItems?.map((item, idx) => {
            let img = item?.productId?.images?.[0];
            // Nếu không có ảnh thì dùng ảnh mặc định
            if (!img) img = '/default-product.jpg';
            return (
              <img
                key={idx}
                src={img}
                alt={item.name}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                onError={e => { e.target.onerror = null; e.target.src = '/default-product.jpg'; }}
              />
            );
          })}
        </div>
      </Card>

      <Card style={styles.column} title="Thanh toán">
        <p><strong>Trạng thái thanh toán:</strong> {order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
        <p><strong>Phương thức thanh toán:</strong> {order?.paymentMethod || 'Không có'}</p>
        {/* Nút xác nhận thanh toán đã bị xóa bỏ theo yêu cầu */}
      </Card>
    </div>
  );
};

export default PaymentPage;
