import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/Slide/userSlide';

const NavbarComponent = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/sign-in');
  };

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.user-dropdown')) setShowDropdown(false);
    };
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <nav style={{
      width: '100%',
      background: '#00bfae',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px #e0f7fa',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexWrap: 'wrap',
    }}>
      <div style={{ fontWeight: 700, fontSize: 24, color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="watch">⌚</span>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>MyWatch</Link>
      </div>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          cursor: 'pointer',
        }}
        className="navbar-toggle"
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div
        className="navbar-links"
        style={{
          display: showMenu ? 'flex' : 'flex',
          flexDirection: showMenu ? 'column' : 'row',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Link to="/" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span role="img" aria-label="home">🏠</span> Trang chủ
        </Link>
        <Link to="/cart" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span role="img" aria-label="cart">🛒</span> Giỏ hàng
        </Link>
        {user?.access_token ? (
          <div style={{ position: 'relative' }} className="user-dropdown">
            <span
              style={{ color: '#fff', fontWeight: 500, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowDropdown((v) => !v)}
            >
              <span role="img" aria-label="user">👤</span>
              {user.name || user.email || 'User'}
              <span style={{ fontSize: 12, marginLeft: 4 }}>▼</span>
            </span>
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 36,
                  right: 0,
                  background: '#fff',
                  color: '#222',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px #e0f7fa',
                  minWidth: 180,
                  zIndex: 1001,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <Link to="/profile" style={{ color: '#00bfae', textDecoration: 'none', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="profile">📝</span> Thông tin cá nhân
                </Link>
                <Link to="/orders" style={{ color: '#00bfae', textDecoration: 'none', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="history">�</span> Lịch sử đơn hàng
                </Link>
                <Link to="/change-password" style={{ color: '#00bfae', textDecoration: 'none', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="password">🔒</span> Đổi mật khẩu
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span role="img" aria-label="logout">🚪</span> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/sign-in" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span role="img" aria-label="login">🔑</span> Đăng nhập
            </Link>
            <Link to="/sign-up" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span role="img" aria-label="register">📝</span> Đăng ký
            </Link>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            align-items: flex-start;
            padding: 12px 10px;
          }
          .navbar-links {
            width: 100%;
            flex-direction: column !important;
            gap: 12px !important;
            margin-top: 8px;
          }
          .navbar-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavbarComponent;