import React from 'react';
import { Row, Col, Image, Tag, Button, Rate, Divider, Descriptions, Progress, Typography, Card } from 'antd';
import { StarFilled, LikeFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

// Nhận props product (object), avgRating (number), starCount (array), totalReviews (number), children (review section)
const ProductDetailComponent = ({ product, avgRating = 0, starCount = [0,0,0,0,0], totalReviews = 0, children }) => {
  if (!product) return <div>Không tìm thấy sản phẩm</div>;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', padding: '0 0 40px 0' }}>
      {/* PHẦN 1: ẢNH & THÔNG TIN SẢN PHẨM */}
      <Card style={{ maxWidth: 1100, margin: '32px auto 0 auto', borderRadius: 16, boxShadow: '0 2px 12px #eee', padding: 0 }} bodyStyle={{ padding: 0 }}>
        <Row gutter={[32, 24]} align="stretch" justify="center" wrap style={{ padding: 32 }}>
          <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src={images[0] || '/assets/images/no-image.png'}
              alt={product.name}
              style={{ width: '100%', maxWidth: 350, maxHeight: 350, objectFit: 'cover', borderRadius: 14, border: '1px solid #eee', marginBottom: 12 }}
              fallback='/assets/images/no-image.png'
            />
            <Row gutter={8} style={{ width: '100%', justifyContent: 'center' }}>
              {images.slice(1, 5).map((img, idx) => (
                <Col key={idx} span={6} style={{ minWidth: 60 }}>
                  <Image
                    src={img}
                    alt={`Sản phẩm ${product.name} - ${idx+2}`}
                    style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                    fallback='/assets/images/no-image.png'
                    preview={true}
                  />
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} md={14} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 24 }}>
            <Title level={2} style={{ marginBottom: 8, textAlign: 'left' }}>{product.name} ({product.brand})</Title>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Rate disabled value={product.rating || avgRating || 0} allowHalf style={{ fontSize: 22, color: '#fadb14' }} />
              <Text strong style={{ fontSize: 18 }}>{(product.rating || avgRating || 0).toFixed(1)} / 5</Text>
              {product.status === 'OutOfStock' && <Tag color='red'>Hết hàng</Tag>}
              {product.status === 'Available' && <Tag color='green'>Còn hàng</Tag>}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#2b46bd', margin: '8px 0' }}>
              {product.price ? product.price.toLocaleString('vi-VN') + ' ₫' : 'Liên hệ để biết giá'}
              {product.discount ? <Tag color='blue' style={{ marginLeft: 12 }}>Giảm {product.discount}%</Tag> : null}
            </div>
            <Divider orientation='left'>Thông tin sản phẩm</Divider>
            <Descriptions column={1} size='middle'>
              <Descriptions.Item label='Danh mục'>{product.category}</Descriptions.Item>
              <Descriptions.Item label='Thương hiệu'>{product.brand}</Descriptions.Item>
              <Descriptions.Item label='Mô tả'>{product.description || 'Không có mô tả'}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* PHẦN 2: ĐÁNH GIÁ TỔNG QUAN */}
      <div style={{ maxWidth: 900, margin: '32px auto 0 auto' }}>
        <Card style={{ borderRadius: 14, boxShadow: '0 1px 8px #f0f0f0', background: 'linear-gradient(90deg, #fafdff 60%, #e6f0ff 100%)', padding: 0 }} bodyStyle={{ padding: 0 }}>
          <Row gutter={[32, 16]} align="middle" justify="center" wrap style={{ padding: '32px 12px' }}>
            <Col xs={24} md={6} style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Title level={1} style={{ margin: 0, color: '#2b46bd', fontSize: 56 }}>{avgRating.toFixed(1)}</Title>
                <Rate disabled value={avgRating} style={{ fontSize: 28, color: '#fadb14' }} />
                <div style={{ color: '#888', fontSize: 18 }}>{totalReviews} đánh giá</div>
                <LikeFilled style={{ color: '#1890ff', fontSize: 28, marginTop: 8 }} />
              </div>
            </Col>
            <Col xs={24} md={12}>
              {[5,4,3,2,1].map(star => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ width: 38, fontWeight: 500, fontSize: 16 }}>{star} <StarFilled style={{ color: '#fadb14' }} /></span>
                  <Progress percent={totalReviews ? Math.round(starCount[star-1]*100/totalReviews) : 0} showInfo={false} style={{ flex: 1, margin: '0 12px' }} strokeColor={star >= 4 ? '#52c41a' : star === 3 ? '#faad14' : '#ff4d4f'} />
                  <span style={{ width: 32, textAlign: 'right', fontSize: 15 }}>{starCount[star-1]}</span>
                </div>
              ))}
            </Col>
          </Row>
        </Card>
      </div>

      {/* PHẦN 3: REVIEW CHI TIẾT */}
      <div style={{ maxWidth: 1100, margin: '32px auto 0 auto', background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px #eee', padding: 24 }}>
        {children}
      </div>
    </div>
  );
};

export default ProductDetailComponent;