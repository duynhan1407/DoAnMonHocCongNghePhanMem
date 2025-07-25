
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/Slide/userSlide';
import { UserOutlined, ShoppingCartOutlined, HomeOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import * as ProductService from '../../services/ProductService';

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for product categories
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch all products and extract unique categories
    ProductService.getAllProducts().then(res => {
      if (res?.data) {
        const cats = Array.from(new Set(res.data.map(r => r.category).filter(Boolean)));
        setCategories(cats);
      }
    });
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/sign-in');
  };

  // Handler for selecting a category
  const handleCategorySelect = (cat) => {
    navigate(`/?category=${encodeURIComponent(cat)}`);
  };

  return (
    <nav
      style={{
        width: '100%',
        left: 0,
        right: 0,
        background: 'linear-gradient(90deg, #00bfae 0%, #2563eb 100%)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 18px #b2f5ea44',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        minHeight: 64,
        borderRadius: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 30 }}>570</span>
          <span style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>MyWatch</span>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link to="/" style={{
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          transition: 'background 0.18s',
        }}
          onMouseOver={e => e.currentTarget.style.background = '#00bfae44'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <HomeOutlined /> Trang chủ
        </Link>
        <Dropdown
          overlay={
            <Menu>
              {categories.length === 0 ? (
                <Menu.Item disabled>Đang tải...</Menu.Item>
              ) : (
                categories.map(cat => (
                  <Menu.Item key={cat} onClick={() => handleCategorySelect(cat)}>
                    {cat}
                  </Menu.Item>
                ))
              )}
            </Menu>
          }
        >
          <span style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: 18,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
            onMouseOver={e => e.currentTarget.style.background = '#00bfae44'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <DownOutlined /> Danh mục
          </span>
        </Dropdown>
        <Link to="/cart" style={{
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          transition: 'background 0.18s',
        }}
          onMouseOver={e => e.currentTarget.style.background = '#00bfae44'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <ShoppingCartOutlined /> Giỏ hàng
        </Link>
        {user?.access_token ? (
          <>
            {user.avatar && (
              <img src={user.avatar} alt="avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #00bfae44', marginRight: 8 }} />
            )}
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserOutlined /> {user.name || user.email || 'User'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(90deg, #e53935 0%, #ff9800 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '7px 18px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                marginLeft: 8,
                boxShadow: '0 2px 8px #e0e7ff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.18s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#e53935'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e53935 0%, #ff9800 100%)'}
            >
              <LogoutOutlined /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/sign-in" style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              transition: 'background 0.18s',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#00bfae44'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <LoginOutlined /> Đăng nhập
            </Link>
            <Link to="/sign-up" style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              transition: 'background 0.18s',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#00bfae44'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <UserAddOutlined /> Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
