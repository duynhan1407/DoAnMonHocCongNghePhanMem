
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Empty, Popconfirm, message, Spin } from 'antd';
import { removeFromFavorite, clearFavorite } from '../../redux/favoriteSlice';
import { useNavigate } from 'react-router-dom';
import * as ProductService from '../../services/ProductService';


const FavoritePage = () => {
  const favorite = useSelector(state => state.favorite.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!favorite.length) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        // Lấy tất cả sản phẩm từ server, lọc theo _id trong favorite
        const res = await ProductService.getAllProducts();
        const allProducts = res?.data || [];
        const favoriteIds = favorite.map(item => item._id);
        const filtered = allProducts.filter(p => favoriteIds.includes(p._id));
        setProducts(filtered);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [favorite]);

  const handleRemove = (id) => {
    dispatch(removeFromFavorite(id));
    message.info('Đã xóa khỏi mục yêu thích!');
  };

  if (!favorite.length) {
    return <Empty description="Chưa có sản phẩm yêu thích" style={{ marginTop: 80 }} />;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, color: '#ff4d4f', margin: 0 }}>Sản phẩm yêu thích</h2>
        <Popconfirm title="Xóa tất cả mục yêu thích?" onConfirm={() => dispatch(clearFavorite())} okText="Xóa" cancelText="Hủy">
          <Button danger>Xóa tất cả</Button>
        </Popconfirm>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 60 }}><Spin size="large" /></div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {products.map(product => (
            <Card
              key={product._id}
              hoverable
              style={{ width: 260, borderRadius: 16, boxShadow: '0 2px 12px #e0e7ff', background: '#fff' }}
              cover={
                <img
                  alt={product.name}
                  src={
                    Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim() !== ''
                      ? product.images[0]
                      : (Array.isArray(product.colors) && product.colors.length > 0 && Array.isArray(product.colors[0].images) && product.colors[0].images.length > 0 && typeof product.colors[0].images[0] === 'string' && product.colors[0].images[0].trim() !== ''
                        ? product.colors[0].images[0]
                        : '/default-product.jpg')
                  }
                  style={{ height: 170, objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                  onClick={() => navigate(`/product-detail/${product._id}`)}
                  onError={e => {
                    if (!e.target.src.includes('default-product.jpg')) {
                      e.target.onerror = null;
                      e.target.src = '/default-product.jpg';
                    }
                  }}
                />
              }
              actions={[
                <Button type="link" danger onClick={() => handleRemove(product._id)}>Xóa</Button>,
                <Button type="link" onClick={() => navigate(`/product-detail/${product._id}`)}>Xem chi tiết</Button>
              ]}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 4 }}>{product.name || 'Không có tên'}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
