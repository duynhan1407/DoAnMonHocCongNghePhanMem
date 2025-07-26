import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Tag, Empty, Popconfirm, message } from 'antd';
import { removeFromFavorite, clearFavorite } from '../../redux/favoriteSlice';
import { useNavigate } from 'react-router-dom';

const FavoritePage = () => {
  const favorite = useSelector(state => state.favorite.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {favorite.map(product => (
          <Card
            key={product._id}
            hoverable
            style={{ width: 260, borderRadius: 16, boxShadow: '0 2px 12px #e0e7ff', background: '#fff' }}
            cover={
              <img
                alt={product.name}
                src={product.images?.[0] || product.image || '/default-product.jpg'}
                style={{ height: 170, objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                onClick={() => navigate(`/product-detail/${product._id}`)}
              />
            }
            actions={[
              <Button type="link" danger onClick={() => handleRemove(product._id)}>Xóa</Button>,
              <Button type="link" onClick={() => navigate(`/product-detail/${product._id}`)}>Xem chi tiết</Button>
            ]}
          >
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 4 }}>{product.name}</div>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{product.brand}</div>
            <div style={{ fontSize: 16, color: '#00bfae', fontWeight: 700, marginBottom: 4 }}>{product.price?.toLocaleString('vi-VN')} ₫</div>
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                {product.colors.map((color, idx) => <Tag color="blue" key={idx}>{color}</Tag>)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoritePage;
