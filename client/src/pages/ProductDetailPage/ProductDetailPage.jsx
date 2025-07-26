import React, { useState, useEffect, useCallback } from 'react';
import eventBus from '../../utils/eventBus';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Button, Skeleton, InputNumber } from 'antd';
import * as ProductService from '../../services/ProductService';
import ProductDetailComponent from '../../components/ProductDetailComponent/ProductDetailComponent';
import ReviewSection from '../../components/ProductDetailComponent/ReviewSection';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ avg: 0, starCount: [0, 0, 0, 0, 0], total: 0 });

  const fetchProductDetail = useCallback(async () => {
    try {
      const res = await ProductService.getProductById(productId);
      if (res && res.data) {
        if (res.data.image && !res.data.image.startsWith('http')) {
          res.data.image = `${BASE_URL}${res.data.image}`;
        }
        setProduct(res.data);
      } else {
        message.error('Không tìm thấy sản phẩm');
        navigate('/');
      }
    } catch (error) {
      message.error('Không thể lấy thông tin sản phẩm');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [productId, navigate]);

  useEffect(() => {
    fetchProductDetail();
    // Lắng nghe reloadProducts để tự động reload lại chi tiết sản phẩm
    const reloadHandler = () => {
      fetchProductDetail();
    };
    eventBus.on('reloadProducts', reloadHandler);
    return () => {
      eventBus.off('reloadProducts', reloadHandler);
    };
  }, [fetchProductDetail]);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  // Hàm nhận dữ liệu đánh giá từ ReviewSection
  const handleReviewStats = (avg, starCount, total) => {
    setReviewData({ avg, starCount, total });
  };




  if (loading) {
    return <Skeleton active />;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Không tìm thấy sản phẩm</h1>
        <Button type="primary" onClick={() => navigate('/')}>Quay lại Trang Chủ</Button>
      </div>
    );
  }

  // Thêm vào giỏ hàng (localStorage)
  const handleAddToCart = (product) => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Nếu đã có sản phẩm cùng id và màu thì tăng số lượng, ngược lại thêm mới
    const idx = cart.findIndex(
      (item) => item._id === product._id && item.color === product.color
    );
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image,
        color: product.color,
        quantity: 1,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    message.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', padding: '0 0 40px 0' }}>
      <Button type="default" onClick={() => navigate('/')} style={{ margin: '24px 0 0 40px' }}>
        Quay lại
      </Button>
      <ProductDetailComponent
        product={product}
        avgRating={Number(reviewData.avg) || 0}
        starCount={reviewData.starCount}
        totalReviews={reviewData.total}
      />
      <div style={{ textAlign: 'center', margin: '32px 0 0 0' }}>
        <Button
          type="primary"
          size="large"
          style={{ fontWeight: 600, fontSize: 18, minWidth: 180, height: 48, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}
          onClick={() => handleAddToCart(product)}
        >
          Thêm vào giỏ hàng
        </Button>
      </div>
      <div style={{ maxWidth: 900, margin: '32px auto 0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
        <ReviewSection
          productId={product._id}
          user={user}
          isAdmin={isAdmin}
          onStats={handleReviewStats}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
