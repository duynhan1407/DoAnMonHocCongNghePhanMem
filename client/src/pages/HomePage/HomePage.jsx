
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  const user = useSelector((state) => state.user);
  const userId = user?.id || user?._id;
  const favorite = useSelector((state) => state.favorite.items);
  const dispatch = useDispatch();

  // Điều hướng sang trang chi tiết sản phẩm
  const handleProductClick = (productId) => navigate(`/product-detail/${productId}`);

  // Kiểm tra sản phẩm có trong mục yêu thích không
  const isFavorite = React.useCallback(
    (productId) => favorite.some(item => item._id === productId),
    [favorite]
  );

  // Thêm/xóa mục yêu thích
  const handleToggleFavorite = (product) => {
    if (isFavorite(product._id)) {
      dispatch({ type: 'favorite/removeFromFavorite', payload: product._id });
      message.info('Đã xóa khỏi mục yêu thích!');
    } else {
      dispatch({ type: 'favorite/addToFavorite', payload: product });
      message.success('Đã thêm vào mục yêu thích!');
    }
  };

  // Khởi tạo giỏ hàng từ localStorage, đảm bảo có productId
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    let initialCart = stored ? JSON.parse(stored) : [];
    return initialCart.map(item => ({ ...item, productId: item.productId || item._id }));
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const {
    data: products = [],
    isLoading,
    error,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await ProductService.getAllProducts();
      return res?.data || [];
    },
  });

  // Lắng nghe sự kiện đặt hàng thành công và reload kho từ localStorage
  React.useEffect(() => {
    const handleOrderSuccess = () => {
      refetchProducts();
    };
    window.addEventListener('order-success', handleOrderSuccess);
    // Lắng nghe thay đổi localStorage để reload sản phẩm
    const handleStorage = (e) => {
      if (e.key === 'reloadProducts') {
        refetchProducts();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('order-success', handleOrderSuccess);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refetchProducts]);

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
        productId: product._id,
        quantity: 1,
      },
    ]);
    message.success('Đã thêm vào giỏ hàng!');
  };

  const handleGoToCart = () => {
    if (!user?.access_token || !userId) {
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
        userId: userId,
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
        {/* Đã loại bỏ tiêu đề và ô tìm kiếm */}
        <WrapperProducts>
          {filteredProducts.map((product) => (
            <HomeResponsiveCard key={product._id} style={{
              position: 'relative',
              minWidth: 270,
              maxWidth: 320,
              flex: '1 1 300px',
              margin: '24px 12px',
              background: '#fff',
              borderRadius: 10,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 0 18px 0',
              border: '1px solid #eee',
              transition: 'box-shadow 0.2s',
            }}>
              {/* Label MỚI góc trên trái */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'transparent',
                color: '#222',
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 0,
                padding: 0,
                zIndex: 2,
                letterSpacing: 0.5,
              }}>MỚI</div>
              {/* Icon yêu thích góc trên phải */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'transparent',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleToggleFavorite(product)}
                title={isFavorite(product._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
              >
                <span style={{ color: isFavorite(product._id) ? '#222' : '#bbb', fontSize: 22, fontWeight: 700 }}>
                  {isFavorite(product._id) ? '\u2665' : '\u2661'}
                </span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginTop: 18 }} onClick={() => handleProductClick(product._id)}>
                <img
                  src={
                    Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                      ? product.images[0]
                      : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                        ? product.colors[0].images[0]
                        : '/default-product.jpg')
                  }
                  alt={product.name}
                  style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 18, background: '#fff', borderRadius: 0, boxShadow: 'none' }}
                  onError={e => {
                    if (!e.target.src.includes('default-product.jpg')) {
                      e.target.onerror = null;
                      e.target.src = '/default-product.jpg';
                    }
                  }}
                />
                {/* Brand */}
                <div style={{ color: '#222', fontSize: 13, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</div>
                {/* Name */}
                <div style={{ color: '#111', fontWeight: 700, fontSize: 19, marginBottom: 0, textAlign: 'left', width: '100%', minHeight: 24 }}>{product.name}</div>
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
