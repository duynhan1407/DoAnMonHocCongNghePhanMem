import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
// import CardComponent from '../../components/CardComponent/CardComponent';
import Slider from "react-slick";
import Navbar from '../../components/NavbarComponent/Navbar';
import { WrapperProducts, HomeResponsiveButton, HomeResponsiveCard } from './style';
import * as ProductService from '../../services/ProductService';
// import { fetchProducts } from './fetchProducts';
// import HomeProductDetailModal from './HomeProductDetailModal';

const HomePage = () => {
  // Lấy danh mục từ localStorage (do AdminCategory quản lý) và tự động cập nhật khi reload/tab khác
  const [categories, setCategories] = useState([]);
  // Hàm cập nhật danh mục từ localStorage
  const updateCategories = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('categories');
      setCategories(stored ? JSON.parse(stored) : []);
    } catch {
      setCategories([]);
    }
  }, []);
  // Lấy danh mục khi mount
  useEffect(() => {
    updateCategories();
  }, [updateCategories]);
  // Theo dõi sự kiện storage để cập nhật khi thay đổi ở tab khác
  useEffect(() => {
    window.addEventListener('storage', updateCategories);
    return () => window.removeEventListener('storage', updateCategories);
  }, [updateCategories]);
  // State for search text
  const [searchText] = useState('');
  const location = useLocation();
  // Lọc theo category nếu có query
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get('category');

  // Fetch products using react-query (TanStack Query v5+ object form)
  const { data: productsRaw } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts
  });
  // Defensive: always use array, support both array, { products: [...] }, or { data: [...] }
  console.log('productsRaw', productsRaw);
  const products = Array.isArray(productsRaw?.data)
    ? productsRaw.data
    : (Array.isArray(productsRaw?.products)
      ? productsRaw.products
      : (Array.isArray(productsRaw) ? productsRaw : []));


  const navigate = useNavigate();
  // Handler for go to cart
  const handleGoToCart = () => {
    navigate('/cart');
  };

  // Filter new products (created within last 24h)
  const now = new Date();
  // Helper: get discount (ưu tiên màu đầu tiên nếu có)
  const getDiscount = (product) => {
    if (Array.isArray(product.colors) && product.colors.length > 0 && typeof product.colors[0].discount === 'number') {
      return product.colors[0].discount;
    }
    return product.discount || 0;
  };
  // Helper: get salePercent (ưu tiên màu đầu tiên nếu có)
  const getSalePercent = (product) => {
    if (Array.isArray(product.colors) && product.colors.length > 0 && typeof product.colors[0].salePercent === 'number') {
      return product.colors[0].salePercent;
    }
    return product.salePercent || 0;
  };
  const newProducts = products.filter(product => {
    if (!product.createdAt) return false;
    const created = new Date(product.createdAt);
    return (now - created) <= 24 * 60 * 60 * 1000;
  });
  // (removed duplicate navigate)
  // const user = useSelector((state) => state.user);
  const favorite = useSelector((state) => state.favorite.items);
  const dispatch = useDispatch();

  // Điều hướng sang trang chi tiết sản phẩm
  const handleProductClick = (productId) => navigate(`/product-detail/${productId}`);

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
  const [cart] = useState(() => {
    const stored = localStorage.getItem('cart');
    const initialCart = stored ? JSON.parse(stored) : [];
    return initialCart.map(item => ({ ...item, productId: item.productId || item._id }));
  });
  // ...existing code...
  const filteredProducts = products
    .filter(product => {
      // Nếu có query category thì chỉ lấy sản phẩm đúng category
      if (categoryQuery && product.category !== categoryQuery) return false;
      // Chỉ hiển thị sản phẩm thuộc các danh mục đã được quản lý
      if (categories.length > 0 && !categories.includes(product.category)) return false;
      const search = searchText.trim().toLowerCase();
      if (!search) return true;
      return (
        (product.name && product.name.toLowerCase().includes(search)) ||
        (product.brand && product.brand.toLowerCase().includes(search)) ||
        (product.category && product.category.toLowerCase().includes(search))
      );
    })
    .filter(product => !newProducts.some(np => np._id === product._id))
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
        // ...existing code...
      }}>
        {/* SẢN PHẨM MỚI */}
        {newProducts.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: 26, color: '#00bfae', marginBottom: 18, letterSpacing: 1 }}>Sản phẩm mới</h2>
            <div style={{ maxWidth: 1300, margin: '0 auto' }}>
              {newProducts.length === 1 ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <HomeResponsiveCard style={{
                    position: 'relative',
                    minWidth: 220,
                    maxWidth: 260,
                    margin: '0 auto',
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 2px 12px #b2f5ea',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '18px 0 12px 0',
                    border: '1.5px solid #00bfae',
                    transition: 'box-shadow 0.2s',
                  }}>
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                      <div style={{ background: '#00bfae', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 10px', letterSpacing: 0.5 }}>MỚI</div>
                      {((getSalePercent(newProducts[0]) > 0) || (getDiscount(newProducts[0]) > 0)) && (
                        <div style={{ background: '#ff1744', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 10px', letterSpacing: 0.5 }}>
                          -{getSalePercent(newProducts[0]) || getDiscount(newProducts[0])}%
                        </div>
                      )}
                    </div>
                    <div
                      style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                      onClick={() => handleToggleFavorite(newProducts[0])}
                      title={isFavorite(newProducts[0]._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                    >
                      <span style={{ color: isFavorite(newProducts[0]._id) ? '#222' : '#bbb', fontSize: 18, fontWeight: 700 }}>
                        {isFavorite(newProducts[0]._id) ? '\u2665' : '\u2661'}
                      </span>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginTop: 10 }} onClick={() => handleProductClick(newProducts[0]._id)}>
                      <img
                        src={
                          Array.isArray(newProducts[0].images) && newProducts[0].images.length > 0 && typeof newProducts[0].images[0] === 'string' && newProducts[0].images[0].trim() !== ''
                            ? newProducts[0].images[0]
                            : (Array.isArray(newProducts[0].colors) && newProducts[0].colors.length > 0 && Array.isArray(newProducts[0].colors[0].images) && newProducts[0].colors[0].images.length > 0 && typeof newProducts[0].colors[0].images[0] === 'string' && newProducts[0].colors[0].images[0].trim() !== ''
                              ? newProducts[0].colors[0].images[0]
                              : '/default-product.jpg')
                        }
                        alt={newProducts[0].name}
                        style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 10, background: '#fff', borderRadius: 0, boxShadow: 'none' }}
                        onError={e => {
                          if (!e.target.src.includes('default-product.jpg')) {
                            e.target.onerror = null;
                            e.target.src = '/default-product.jpg';
                          }
                        }}
                      />
                      <div style={{ color: '#222', fontSize: 12, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {typeof newProducts[0].brand === 'string' ? newProducts[0].brand : (newProducts[0].brand && newProducts[0].brand.name ? newProducts[0].brand.name : '')}
                      </div>
                        <div style={{ color: '#111', fontWeight: 700, fontSize: 15, marginBottom: 2, textAlign: 'center', width: '100%', minHeight: 20 }}>{newProducts[0].name}</div>
                        <div style={{ color: '#888', fontSize: 12, fontWeight: 500 }}>{newProducts[0].code || newProducts[0]._id}</div>
                        {/* Giá và giảm giá */}
                        {typeof newProducts[0].price === 'number' && (
                          <div style={{ marginTop: 4 }}>
                            {((getSalePercent(newProducts[0]) > 0) || (getDiscount(newProducts[0]) > 0)) ? (
                              <>
                                <span style={{ color: '#ff1744', fontWeight: 800, fontSize: 16 }}>
                                  {(newProducts[0].price * (1 - ((getSalePercent(newProducts[0]) || getDiscount(newProducts[0])) / 100))).toLocaleString('vi-VN')}₫
                                </span>
                                <span style={{ color: '#888', textDecoration: 'line-through', marginLeft: 8, fontSize: 13 }}>
                                  {newProducts[0].price.toLocaleString('vi-VN')}₫
                                </span>
                              </>
                            ) : (
                              <span style={{ color: '#222', fontWeight: 700, fontSize: 15 }}>{newProducts[0].price.toLocaleString('vi-VN')}₫</span>
                            )}
                          </div>
                        )}
                    </div>
                  </HomeResponsiveCard>
                </div>
              ) : (
                <Slider
                  dots={true}
                  infinite={true}
                  speed={500}
                  slidesToShow={Math.min(4, newProducts.length)}
                  slidesToScroll={Math.min(4, newProducts.length)}
                  autoplay={true}
                  autoplaySpeed={3500}
                  arrows={true}
                  responsive={[
                    { breakpoint: 900, settings: { slidesToShow: Math.min(2, newProducts.length), slidesToScroll: Math.min(2, newProducts.length) } },
                    { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } }
                  ]}
                >
                  {newProducts.map((product) => (
                    <div key={product._id} style={{ padding: 8, display: 'flex', justifyContent: 'center' }}>
                      <HomeResponsiveCard style={{
                        position: 'relative',
                        minWidth: 220,
                        maxWidth: 260,
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: 10,
                        boxShadow: '0 2px 12px #b2f5ea',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '18px 0 12px 0',
                        border: '1.5px solid #00bfae',
                        transition: 'box-shadow 0.2s',
                      }}>
                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                          <div style={{ background: '#00bfae', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 10px', letterSpacing: 0.5 }}>MỚI</div>
                          {((getSalePercent(product) > 0) || (getDiscount(product) > 0)) && (
                            <div style={{ background: '#ff1744', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 10px', letterSpacing: 0.5 }}>
                              -{getSalePercent(product) || getDiscount(product)}%
                            </div>
                          )}
                        </div>
                        <div
                          style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                          onClick={() => handleToggleFavorite(product)}
                          title={isFavorite(product._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                        >
                          <span style={{ color: isFavorite(product._id) ? '#222' : '#bbb', fontSize: 18, fontWeight: 700 }}>
                            {isFavorite(product._id) ? '\u2665' : '\u2661'}
                          </span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginTop: 10 }} onClick={() => handleProductClick(product._id)}>
                          <img
                            src={
                              Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                                ? product.images[0]
                                : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                                  ? product.colors[0].images[0]
                                  : '/default-product.jpg')
                            }
                            alt={product.name}
                            style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 10, background: '#fff', borderRadius: 0, boxShadow: 'none' }}
                            onError={e => {
                              if (!e.target.src.includes('default-product.jpg')) {
                                e.target.onerror = null;
                                e.target.src = '/default-product.jpg';
                              }
                            }}
                          />
                          <div style={{ color: '#222', fontSize: 12, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {typeof product.brand === 'string' ? product.brand : (product.brand && product.brand.name ? product.brand.name : '')}
                          </div>
                          <div style={{ color: '#111', fontWeight: 700, fontSize: 15, marginBottom: 2, textAlign: 'center', width: '100%', minHeight: 20 }}>{product.name}</div>
                          <div style={{ color: '#888', fontSize: 12, fontWeight: 500 }}>{product.code || product._id}</div>
                          {/* Giá và giảm giá */}
                          {typeof product.price === 'number' && (
                            <div style={{ marginTop: 4 }}>
                              {((getSalePercent(product) > 0) || (getDiscount(product) > 0)) ? (
                                <>
                                  <span style={{ color: '#ff1744', fontWeight: 800, fontSize: 16 }}>
                                    {(product.price * (1 - ((getSalePercent(product) || getDiscount(product)) / 100))).toLocaleString('vi-VN')}₫
                                  </span>
                                  <span style={{ color: '#888', textDecoration: 'line-through', marginLeft: 8, fontSize: 13 }}>
                                    {product.price.toLocaleString('vi-VN')}₫
                                  </span>
                                </>
                              ) : (
                                <span style={{ color: '#222', fontWeight: 700, fontSize: 15 }}>{product.price.toLocaleString('vi-VN')}₫</span>
                              )}
                            </div>
                          )}
                        </div>
                      </HomeResponsiveCard>
                    </div>
                  ))}
                </Slider>
              )}
            </div>
          </div>
        )}
        {/* TƯ VẤN CHO BẠN */}
        {filteredProducts.length > 0 && (
          <div style={{ margin: '40px 0 32px 0' }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: '#2563eb', marginBottom: 18, letterSpacing: 1 }}>Tư vấn cho bạn</h2>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 18 }}>
                {filteredProducts.slice(0, 10).map((product) => (
                  <HomeResponsiveCard key={product._id} style={{
                    position: 'relative',
                    minWidth: 180,
                    maxWidth: 220,
                    margin: '0',
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 2px 12px #b2f5ea',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '14px 0 10px 0',
                    border: '1px solid #eee',
                    transition: 'box-shadow 0.2s',
                  }}>
                    <div
                      style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                      onClick={() => handleToggleFavorite(product)}
                      title={isFavorite(product._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                    >
                      <span style={{ color: isFavorite(product._id) ? '#222' : '#bbb', fontSize: 16, fontWeight: 700 }}>
                        {isFavorite(product._id) ? '\u2665' : '\u2661'}
                      </span>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginTop: 8 }} onClick={() => handleProductClick(product._id)}>
                      <img
                        src={
                          Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                            ? product.images[0]
                            : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                              ? product.colors[0].images[0]
                              : '/default-product.jpg')
                        }
                        alt={product.name}
                        style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 8, background: '#fff', borderRadius: 0, boxShadow: 'none' }}
                        onError={e => {
                          if (!e.target.src.includes('default-product.jpg')) {
                            e.target.onerror = null;
                            e.target.src = '/default-product.jpg';
                          }
                        }}
                      />
                      <div style={{ color: '#222', fontSize: 11, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {typeof product.brand === 'string' ? product.brand : (product.brand && product.brand.name ? product.brand.name : '')}
                      </div>
                      <div style={{ color: '#111', fontWeight: 700, fontSize: 13, marginBottom: 2, textAlign: 'center', width: '100%', minHeight: 18 }}>{product.name}</div>
                      <div style={{ color: '#888', fontSize: 11, fontWeight: 500 }}>{product.code || product._id}</div>
                    </div>
                  </HomeResponsiveCard>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* DANH SÁCH SẢN PHẨM (lọc tìm kiếm, loại sản phẩm mới) */}
        {/* ĐÃ XÓA PHẦN KHOẢNG TRẮNG GIỮA */}

        {/* TẤT CẢ SẢN PHẨM */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontWeight: 800, fontSize: 26, color: '#2563eb', marginBottom: 18, letterSpacing: 1 }}>Tất cả sản phẩm</h2>
          <WrapperProducts>
            {products.map((product) => (
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
                {/* Icon yêu thích góc trên phải */}
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                  {((getSalePercent(product) > 0) || (getDiscount(product) > 0)) && (
                    <div style={{ background: '#ff1744', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 10px', letterSpacing: 0.5 }}>
                      -{getSalePercent(product) || getDiscount(product)}%
                    </div>
                  )}
                </div>
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
                  <div style={{ color: '#222', fontSize: 13, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {typeof product.brand === 'string' ? product.brand : (product.brand && product.brand.name ? product.brand.name : '')}
                  </div>
                  {/* Name */}
                  <div style={{ color: '#111', fontWeight: 700, fontSize: 19, marginBottom: 0, textAlign: 'left', width: '100%', minHeight: 24 }}>{product.name}</div>
                  {/* Giá và giảm giá */}
                  {typeof product.price === 'number' && (
                    <div style={{ marginTop: 4 }}>
                      {((getSalePercent(product) > 0) || (getDiscount(product) > 0)) ? (
                        <>
                          <span style={{ color: '#ff1744', fontWeight: 800, fontSize: 16 }}>
                            {(product.price * (1 - ((getSalePercent(product) || getDiscount(product)) / 100))).toLocaleString('vi-VN')}₫
                          </span>
                          <span style={{ color: '#888', textDecoration: 'line-through', marginLeft: 8, fontSize: 13 }}>
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#222', fontWeight: 700, fontSize: 15 }}>{product.price.toLocaleString('vi-VN')}₫</span>
                      )}
                    </div>
                  )}
                </div>
              </HomeResponsiveCard>
            ))}
          </WrapperProducts>
        </div>
      </div>
      {/* Đã chuyển sang trang chi tiết sản phẩm, không còn modal chi tiết sản phẩm */}

    </div>
  );
}
export default HomePage;
