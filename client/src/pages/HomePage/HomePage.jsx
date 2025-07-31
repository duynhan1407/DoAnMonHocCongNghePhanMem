import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WrapperProducts, HomeResponsiveCard } from './style';

import * as ProductService from '../../services/ProductService';
import { getAllCategories } from '../../services/CategoryService';

const HomePage = () => {
  // Dropdown state
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Fetch brands (placeholder, replace with your real API)
  const { data: brandsRaw } = useQuery({
    queryKey: ['brands'],
    queryFn: ProductService.getAllBrands ? ProductService.getAllBrands : async () => [
      { _id: 'brand1', name: 'Brand 1' },
      { _id: 'brand2', name: 'Brand 2' }
    ]
  });
  const brands = Array.isArray(brandsRaw?.data)
    ? brandsRaw.data
    : (Array.isArray(brandsRaw?.brands)
      ? brandsRaw.brands
      : (Array.isArray(brandsRaw) ? brandsRaw : []));
  // Navbar click handlers
  const handleBrandClick = () => {
    setShowBrandDropdown((prev) => !prev);
    setShowCategoryDropdown(false);
  };
  const handleCategoryClick = () => {
    setShowCategoryDropdown((prev) => !prev);
    setShowBrandDropdown(false);
  };
  const navigate = useNavigate();
  const handleFavoriteClick = () => {
    navigate('/favorite');
  };

  // Handle click outside dropdowns to close
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    if (showBrandDropdown || showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBrandDropdown, showCategoryDropdown]);
  // Fetch categories (placeholder, replace with your real API)
  // Fetch categories from backend
  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });
  const categories = Array.isArray(categoriesRaw?.data)
    ? categoriesRaw.data
    : (Array.isArray(categoriesRaw?.categories)
      ? categoriesRaw.categories
      : (Array.isArray(categoriesRaw) ? categoriesRaw : []));
  // Fetch products using react-query
  const { data: productsRaw } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts
  });
  // Defensive: always use array, support both array, { products: [...] }, or { data: [...] }
  const products = Array.isArray(productsRaw?.data)
    ? productsRaw.data
    : (Array.isArray(productsRaw?.products)
      ? productsRaw.products
      : (Array.isArray(productsRaw) ? productsRaw : []));

  // Filter products by selected brand and category
  let filteredProducts = products;
  if (selectedBrand) {
    filteredProducts = filteredProducts.filter(p => {
      if (typeof p.brand === 'string') return p.brand === selectedBrand;
      if (p.brand && p.brand.name) return p.brand.name === selectedBrand;
      return false;
    });
  }
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => {
      if (typeof p.category === 'string') return p.category === selectedCategory;
      if (p.category && p.category.name) return p.category.name === selectedCategory;
      return false;
    });
  }

  // Placeholder: handle favorite toggle
  const handleToggleFavorite = (product) => {
    // Implement your favorite logic here
    // e.g., update state or call API
    alert('Toggled favorite for ' + product.name);
  };

  // Placeholder: check if product is favorite
  const isFavorite = (productId) => {
    // Implement your favorite check logic here
    return false;
  };

  // Placeholder: handle product click
  const handleProductClick = (productId) => {
    // Implement your navigation logic here
    alert('Clicked product ' + productId);
  };

  // Placeholder: get sale percent
  const getSalePercent = (product) => {
    // Implement your sale percent logic here
    return 0;
  };

  // Placeholder: get discount
  const getDiscount = (product) => {
    // Implement your discount logic here
    return 0;
  };

  return (
    <>
      {/* NAVBAR */}
      <nav style={{
        width: '100%',
        background: '#2563eb',
        padding: '12px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
        marginBottom: 32,
        boxShadow: '0 2px 8px #e0e7ff44',
        borderRadius: 12,
        position: 'relative'
      }}>
        {/* Brand Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button onClick={handleBrandClick} style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            letterSpacing: 1
          }}>Thương hiệu ▾</button>
          {showBrandDropdown && (
            <div style={{
              position: 'absolute',
              top: 40,
              left: 0,
              background: '#fff',
              color: '#222',
              borderRadius: 8,
              boxShadow: '0 2px 8px #e0e7ff44',
              minWidth: 180,
              zIndex: 10,
              padding: 0
            }}>
              {brands.map((brand) => (
                <div
                  key={brand._id || brand.name}
                  onClick={() => {
                    setSelectedBrand(brand.name);
                    setShowBrandDropdown(false);
                  }}
                  style={{
                    padding: '10px 18px',
                    cursor: 'pointer',
                    fontWeight: selectedBrand === brand.name ? 700 : 500,
                    background: selectedBrand === brand.name ? '#e3f0ff' : 'transparent',
                    borderBottom: '1px solid #eee',
                    fontSize: 16
                  }}
                >
                  {brand.name}
                </div>
              ))}
              <div
                onClick={() => {
                  setSelectedBrand(null);
                  setShowBrandDropdown(false);
                }}
                style={{
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontWeight: !selectedBrand ? 700 : 500,
                  background: !selectedBrand ? '#e3f0ff' : 'transparent',
                  fontSize: 16
                }}
              >
                Tất cả thương hiệu
              </div>
            </div>
          )}
        </div>
        {/* Category Dropdown */}
        <div style={{ position: 'relative' }} ref={categoryDropdownRef}>
          <button onClick={handleCategoryClick} style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            letterSpacing: 1
          }}>Danh mục ▾</button>
          {showCategoryDropdown && (
            <div style={{
              position: 'absolute',
              top: 40,
              left: 0,
              background: '#fff',
              color: '#222',
              borderRadius: 8,
              boxShadow: '0 2px 8px #e0e7ff44',
              minWidth: 180,
              zIndex: 10,
              padding: 0
            }}>
              {categories.map((cat) => (
                <div
                  key={cat._id || cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setShowCategoryDropdown(false);
                  }}
                  style={{
                    padding: '10px 18px',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === cat.name ? 700 : 500,
                    background: selectedCategory === cat.name ? '#e3f0ff' : 'transparent',
                    borderBottom: '1px solid #eee',
                    fontSize: 16
                  }}
                >
                  {cat.name}
                </div>
              ))}
              <div
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryDropdown(false);
                }}
                style={{
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontWeight: !selectedCategory ? 700 : 500,
                  background: !selectedCategory ? '#e3f0ff' : 'transparent',
                  fontSize: 16
                }}
              >
                Tất cả danh mục
              </div>
            </div>
          )}
        </div>
        <button onClick={handleFavoriteClick} style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          letterSpacing: 1
        }}>Mục yêu thích</button>
      </nav>

      {/* Only show product sections if filteredProducts is not empty */}
      {(filteredProducts.length > 0) ? (
        <>
          {/* TƯ VẤN CHO BẠN */}
          <div style={{ margin: '40px 0 32px 0' }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: '#2563eb', marginBottom: 18, letterSpacing: 1 }}>Tư vấn cho bạn</h2>
            <div style={{ width: '100%', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 16 }}>
              {filteredProducts.slice(0, 10).map((product) => (
                <HomeResponsiveCard key={product._id} style={{
                  position: 'relative',
                  minWidth: 300,
                  maxWidth: 340,
                  flex: '1 1 320px',
                  margin: '24px 12px',
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px #e0e7ff22',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '32px 32px 24px 32px',
                  border: 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  <div
                    style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                    onClick={() => handleToggleFavorite(product)}
                    title={isFavorite(product._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                  >
                    <span style={{ color: isFavorite(product._id) ? '#222' : '#bbb', fontSize: 22, fontWeight: 700 }}>
                      {isFavorite(product._id) ? '♡' : '♥'}
                    </span>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', marginTop: 0, flex: 1, justifyContent: 'flex-start' }} onClick={() => handleProductClick(product._id)}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18, minHeight: 160 }}>
                      <img
                        src={
                          Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                            ? product.images[0]
                            : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                              ? product.colors[0].images[0]
                              : '/default-product.jpg')
                        }
                        alt={product.name}
                        style={{ width: 140, height: 140, objectFit: 'contain', background: '#fff', borderRadius: 0, boxShadow: 'none', flexShrink: 0 }}
                        onError={e => {
                          if (!e.target.src.includes('default-product.jpg')) {
                            e.target.onerror = null;
                            e.target.src = '/default-product.jpg';
                          }
                        }}
                      />
                    </div>
                    <div style={{ color: '#222', fontSize: 13, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, minHeight: 18, maxHeight: 18, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>
                      {typeof product.brand === 'string' ? product.brand : (product.brand && product.brand.name ? product.brand.name : '')}
                    </div>
                    <div style={{ color: '#111', fontWeight: 700, fontSize: 18, marginBottom: 2, textAlign: 'left', width: '100%', minHeight: 24, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</div>
                    {/* Removed product code/id for cleaner card */}
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
            </div>
          </div>
          {/* DANH SÁCH SẢN PHẨM (lọc tìm kiếm, loại sản phẩm mới) */}
          {/* ĐÃ XÓA PHẦN KHOẢNG TRẮNG GIỮA */}
          {/* TẤT CẢ SẢN PHẨM */}
          <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #e3f0ff 0%, #f8fbff 100%)', borderRadius: 18, boxShadow: '0 2px 12px #e0e7ff44', padding: '24px 0' }}>
            <h2 style={{ fontWeight: 800, fontSize: 28, color: '#2563eb', marginBottom: 24, letterSpacing: 1, textAlign: 'center', textShadow: '0 2px 8px #e0e7ff44' }}>Tất cả sản phẩm</h2>
            <WrapperProducts>
              {products.map((product) => (
                <HomeResponsiveCard key={product._id} style={{
                  position: 'relative',
                  minWidth: 300,
                  maxWidth: 340,
                  flex: '1 1 320px',
                  margin: '24px 12px',
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px #e0e7ff22',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '32px 32px 24px 32px',
                  border: 'none',
                  transition: 'box-shadow 0.2s',
                }}>
                  <div
                    style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
                    onClick={() => handleToggleFavorite(product)}
                    title={isFavorite(product._id) ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                  >
                    <span style={{ color: isFavorite(product._id) ? '#222' : '#bbb', fontSize: 22, fontWeight: 700 }}>
                      {isFavorite(product._id) ? '♡' : '♥'}
                    </span>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', marginTop: 0, flex: 1, justifyContent: 'flex-start' }} onClick={() => handleProductClick(product._id)}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18, minHeight: 160 }}>
                      <img
                        src={
                          Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                            ? product.images[0]
                            : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                              ? product.colors[0].images[0]
                              : '/default-product.jpg')
                        }
                        alt={product.name}
                        style={{ width: 140, height: 140, objectFit: 'contain', background: '#fff', borderRadius: 0, boxShadow: 'none', flexShrink: 0 }}
                        onError={e => {
                          if (!e.target.src.includes('default-product.jpg')) {
                            e.target.onerror = null;
                            e.target.src = '/default-product.jpg';
                          }
                        }}
                      />
                    </div>
                    <div style={{ color: '#222', fontSize: 13, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, minHeight: 18, maxHeight: 18, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>
                      {typeof product.brand === 'string' ? product.brand : (product.brand && product.brand.name ? product.brand.name : '')}
                    </div>
                    <div style={{ color: '#111', fontWeight: 700, fontSize: 18, marginBottom: 2, textAlign: 'left', width: '100%', minHeight: 24, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</div>
                    {/* Removed product code/id for cleaner card */}
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
          {/* Đã chuyển sang trang chi tiết sản phẩm, không còn modal chi tiết sản phẩm */}
        </>
      ) : null}
    </>
  );
}
export default HomePage;

