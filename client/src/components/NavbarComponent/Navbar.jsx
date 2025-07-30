
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { DownOutlined, HeartFilled } from '@ant-design/icons';
// ...existing code...
import * as BrandService from '../../services/BrandService';

const Navbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Lấy danh mục từ backend
    import('../../services/CategoryService').then(({ getAllCategories }) => {
      getAllCategories().then(res => {
        setCategories(res?.data?.map(c => c.name) || []);
      });
    });
    // Fetch all brands
    BrandService.getAllBrands().then(res => {
      if (res?.data) {
        setBrands(res.data.map(b => b.name));
      }
    });
  }, []);

  // Handler for selecting a category
  const handleCategorySelect = (cat) => {
    // Nếu chọn đồng hồ nam thì chuyển về HomePage với category=nam
    if (cat === 'nam') {
      navigate(`/?category=nam`);
    } else {
      navigate(`/?category=${encodeURIComponent(cat)}`);
    }
  };
  // Handler for selecting a brand
  const handleBrandSelect = (brand) => {
    navigate(`/?brand=${encodeURIComponent(brand)}`);
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
          <span style={{ fontSize: 30 }}>570</span>
          <span style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>MyWatch</span>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Mục yêu thích */}
        <span
          style={{
            color: '#ff4d4f',
            fontWeight: 600,
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
          onClick={() => navigate('/favorite')}
          onMouseOver={e => e.currentTarget.style.background = '#ff4d4f22'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          title="Mục yêu thích"
        >
          <HeartFilled style={{ color: '#ff4d4f', fontSize: 22 }} />
          <span style={{ fontSize: 17, color: '#fff', fontWeight: 600 }}>Yêu thích</span>
        </span>
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
        <Dropdown
          overlay={
            <Menu>
              {brands.length === 0 ? (
                <Menu.Item disabled>Đang tải...</Menu.Item>
              ) : (
                brands.map(brand => (
                  <Menu.Item key={brand} onClick={() => handleBrandSelect(brand)}>
                    {brand}
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
            <DownOutlined /> Thương hiệu
          </span>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
