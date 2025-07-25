
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { message, Modal, Input } from 'antd';
import CardComponent from '../../components/CardComponent/CardComponent';
import Navbar from '../../components/NavbarComponent/Navbar';
import { WrapperProducts, HomeResponsiveButton, HomeResponsiveCard } from './style';
import * as ProductService from '../../services/ProductService';
// import { fetchProducts } from './fetchProducts';
// import HomeProductDetailModal from './HomeProductDetailModal';

const HomePage = () => {
  const navigate = useNavigate();
  // Điều hướng sang trang chi tiết sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };
  const user = useSelector((state) => state.user);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await ProductService.getAllProducts();
      return res?.data || [];
    },
  });

  // Điều hướng sang trang chi tiết sản phẩm
  const handleAddToCart = (product) => {
    if (cart.find((item) => item._id === product._id)) {
      message.info('Sản phẩm đã có trong giỏ hàng!');
      return;
    }
    setCart([
      ...cart,
      {
        ...product,
        quantity: 1,
      },
    ]);
    message.success('Đã thêm vào giỏ hàng!');
  };

  const handleGoToCart = () => {
    if (!user?.access_token) {
      Modal.info({
        title: 'Thông báo',
        content: 'Bạn cần đăng nhập để sử dụng giỏ hàng!',
        okText: 'Đăng nhập',
        onOk: () => navigate('/sign-in'),
      });
      return;
    }
    navigate('/cart', {
      state: {
        cart,
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  // Lọc và sắp xếp danh sách sản phẩm theo searchText và tên sản phẩm
  const filteredProducts = products
    .filter(product => {
      const search = searchText.trim().toLowerCase();
      if (!search) return true;
      return (
        (product.name && product.name.toLowerCase().includes(search)) ||
        (product.brand && product.brand.toLowerCase().includes(search)) ||
        (product.category && product.category.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f8ff 100%)',
      padding: 0,
      position: 'relative',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      <Navbar />
      <HomeResponsiveButton
        styleButton={{
          position: 'fixed',
          top: 32,
          right: 32,
          zIndex: 1000,
          background: '#00bfae',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 28px',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 2px 12px #b2f5ea',
        }}
        onClick={handleGoToCart}
        textButton={`🛒 Giỏ hàng (${cart.length})`}
      />
      <div style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '32px 12px 48px 12px',
        borderRadius: 18,
        background: '#fff',
        boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        marginTop: 40,
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          color: '#2563eb',
          textAlign: 'center',
          marginBottom: 32,
          letterSpacing: 1,
        }}>Khám phá bộ sưu tập đồng hồ</h1>
        <div style={{ maxWidth: 400, margin: '0 auto 24px auto' }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên, thương hiệu, danh mục..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', borderRadius: 8, fontSize: 16 }}
          />
        </div>
        <WrapperProducts>
          {filteredProducts.map((product) => (
            <HomeResponsiveCard key={product._id} style={{
              position: 'relative',
              minWidth: 270,
              maxWidth: 320,
              flex: '1 1 300px',
              margin: '12px 8px',
              background: '#f8fafc',
              borderRadius: 16,
              boxShadow: '0 2px 12px #e0e7ff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'box-shadow 0.2s',
            }}>
              <CardComponent
                name={product.name}
                price={`${product.price.toLocaleString('vi-VN')} đ`}
                rating={product.rating || 0}
                image={product.images?.[0] || product.image}
                brand={product.brand}
                condition={product.status || 'Available'}
                discount={product.discount}
              />
              <div className="product-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '90%',
                margin: '0 auto 12px auto',
                gap: 10,
              }}>
                <button
                  style={{
                    flex: '1 1 0',
                    background: '#00bfae',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginTop: 8,
                    cursor: 'pointer',
                    transition: 'background 0.18s, box-shadow 0.18s',
                    boxShadow: '0 1px 6px #e0e7ff',
                  }}
                  onClick={() => handleAddToCart(product)}
                >
                  Thêm vào giỏ
                </button>
                <button
                  style={{
                    flex: '1 1 0',
                    background: '#ff9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginTop: 8,
                    cursor: 'pointer',
                    transition: 'background 0.18s, box-shadow 0.18s',
                    boxShadow: '0 1px 6px #e0e7ff',
                  }}
                  onClick={() => handleProductClick(product._id)}
                >
                  Xem chi tiết
                </button>
              </div>
            </HomeResponsiveCard>
          ))}
        </WrapperProducts>
      </div>
      {/* Đã chuyển sang trang chi tiết sản phẩm, không còn modal chi tiết sản phẩm */}

    </div>
  );
}
export default HomePage;
