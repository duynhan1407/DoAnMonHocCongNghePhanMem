import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Button, Skeleton } from 'antd';
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
      >
        <ReviewSection
          productId={product._id}
          user={user}
          isAdmin={isAdmin}
          onStats={handleReviewStats}
        />
      </ProductDetailComponent>
    </div>
  );
};

export default ProductDetailPage;
