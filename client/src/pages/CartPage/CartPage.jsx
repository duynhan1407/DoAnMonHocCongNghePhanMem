import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CartComponent from '../../components/CartComponent/CartComponent';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// ...existing code...
// import * as PaymentService from '../../services/PaymentService';
import { Modal } from 'antd';
import { setUser } from '../../redux/Slide/userSlide';
import { jwtDecode } from 'jwt-decode';
import * as UserServices from '../../services/UserServices';

// Extend dayjs plugin after all imports
dayjs.extend(isSameOrBefore);

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    let initialCart = [];
    if (stored) {
      initialCart = JSON.parse(stored);
    } else if (location.state?.cart) {
      initialCart = location.state.cart;
    }
    // Ensure every item has productId
    return initialCart.map(item => ({ ...item, productId: item.productId || item._id }));
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading] = useState(false);

  // Luôn đồng bộ localStorage với state cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Nếu đã có token nhưng Redux user chưa có access_token, đồng bộ lại user
    if (token && !user?.access_token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.id) {
          UserServices.getDetailUser(decoded.id, token).then((res) => {
            dispatch(setUser({ ...res?.data, access_token: token }));
          });
        }
      } catch (e) {
        localStorage.removeItem('access_token');
      }
    }
    // Kiểm tra điều kiện show modal
    if (!user?.access_token && !token) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
    // eslint-disable-next-line
  }, [user]);

  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter((item) => item._id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };


  // Thay đổi số lượng sản phẩm trong giỏ hàng
  const handleChangeQuantity = (productId, newQty) => {
    if (!productId || !newQty || newQty < 1) return;
    const newCart = cart.map(item =>
      (item._id === productId || item.id === productId)
        ? { ...item, quantity: newQty }
        : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Đặt hàng và chuyển sang trang thanh toán cho toàn bộ sản phẩm trong giỏ hàng
  const handleDirectOrder = async () => {
    if (cart.length === 0) return;
    // Ensure every item has productId before passing to payment
    const cartWithProductId = cart.map(item => ({ ...item, productId: item.productId || item._id }));
    navigate('/order-info', { state: { cart: cartWithProductId } });
  };

  // Đã bỏ chức năng thanh toán VNPay

  return (
    <>
      <Modal
        open={showLoginModal}
        title={<span style={{ color: '#e53935', fontWeight: 700 }}><span style={{marginRight:8}}>⚠️</span>Thông báo</span>}
        closable={false}
        footer={[
          <button
            key="ok"
            style={{ padding: '6px 18px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #ffcdd2' }}
            onClick={() => {
              setShowLoginModal(false);
              navigate('/sign-in', { replace: true });
            }}
          >
            Đăng nhập ngay
          </button>
        ]}
        bodyStyle={{ background: '#fff3e0', color: '#d84315', fontSize: 18, fontWeight: 500, textAlign: 'center', borderRadius: 8 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, color: '#e53935' }}>🚫</span>
          <span>Bạn cần đăng nhập để sử dụng giỏ hàng!</span>
        </div>
      </Modal>
      <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 30 }}>
        <h1 style={{ textAlign: 'center' }}>Giỏ hàng của bạn</h1>
        <CartComponent 
          cart={cart.map(item => ({
            ...item,
            price: Math.round(Number(item.price)),
          }))}
          onRemove={handleRemoveFromCart}
          loading={loading}
          onCheckout={handleDirectOrder}
          onChangeQuantity={handleChangeQuantity}
        />
        <button style={{ marginTop: 20, width: '100%' }} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
      </div>
    </>
  );
};

export default CartPage;
