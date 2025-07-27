import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, Collapse, Skeleton, Button, Tag } from 'antd';
import * as ProductService from '../../services/ProductService';
const { Panel } = Collapse;


const ProductDetailPage = () => {
  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemKey = `${product._id}-${selectedColor.color}`;
    const idx = cart.findIndex(item => item.key === itemKey);
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        key: itemKey,
        productId: product._id,
        _id: product._id,
        name: product.name,
        color: selectedColor.color,
        images: selectedColor.images,
        price: selectedColor.price,
        description: selectedColor.description,
        quantity: 1
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    // Hiển thị thông báo
    alert('Đã thêm vào giỏ hàng!');
  };

  // Đặt hàng: chuyển sang trang nhập thông tin khách hàng với sản phẩm đã chọn
  const handleOrderNow = () => {
    const orderItem = {
      key: `${product._id}-${selectedColor.color}`,
      productId: product._id,
      _id: product._id,
      name: product.name,
      color: selectedColor.color,
      images: selectedColor.images,
      price: selectedColor.price,
      description: selectedColor.description,
      quantity: 1
    };
    navigate('/order-info', { state: { cart: [orderItem] } });
  };
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await ProductService.getProductById(productId);
        setProduct(res?.data || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (!product) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Không tìm thấy sản phẩm</h1>
      <Button type="primary" onClick={() => navigate('/')}>Quay lại Trang Chủ</Button>
    </div>
  );

  // Xử lý dữ liệu màu sắc (theo schema mới: array object)
  let colors = [];
  if (Array.isArray(product?.colors) && product.colors.length > 0) {
    colors = product.colors.map(c => ({
      color: typeof c.color === 'string' ? c.color : 'Mặc định',
      images: Array.isArray(c.images) && c.images.length > 0 ? c.images : product.images,
      price: typeof c.price === 'number' ? c.price : product.price,
      description: typeof c.description === 'string' ? c.description : product.description,
      quantity: typeof c.quantity === 'number' ? c.quantity : product.quantity,
      status: typeof c.status === 'string' ? c.status : 'Available',
      discount: typeof c.discount === 'number' ? c.discount : 0,
      rating: typeof c.rating === 'number' ? c.rating : 0
    }));
  } else {
    colors = [{ color: product?.color || 'Mặc định', images: product?.images, price: product?.price, description: product?.description, quantity: product?.quantity, status: product?.status || 'Available', discount: product?.discount || 0, rating: product?.rating || 0 }];
  }
  const selectedColor = colors[selectedColorIdx] || colors[0];
  const images = Array.isArray(selectedColor.images) && selectedColor.images.length > 0
    ? selectedColor.images.filter(img => typeof img === 'string' && img.trim() !== '')
    : ['/default-product.jpg'];
  const specs = product.specs || {};
  const features = product.features || [];

  // Hiển thị số lượng và trạng thái cho từng màu nếu có, nếu không thì lấy product.quantity và product.status
  const colorQuantity = typeof selectedColor.quantity === 'number' ? selectedColor.quantity : product.quantity;
  const colorStatus = typeof selectedColor.status === 'string' ? selectedColor.status : (product.status || 'Available');
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12 }}>
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        {/* Ảnh sản phẩm lớn + slider */}
        <div style={{ flex: '1 1 400px', minWidth: 320 }}>
          <Carousel dots autoplay style={{ width: 400 }}>
            {images.map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={product.name}
                  style={{ width: 400, height: 400, objectFit: 'contain', borderRadius: 12, background: '#f9f9f9' }}
                  onError={e => {
                    if (!e.target.src.includes('default-product.jpg')) {
                      e.target.onerror = null;
                      e.target.src = '/default-product.jpg';
                    }
                  }}
                />
              </div>
            ))}
          </Carousel>
          {/* Slider chọn màu */}
          <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            {colors.map((c, idx) => (
              <Button
                key={idx}
                type={selectedColorIdx === idx ? 'primary' : 'default'}
                style={{ minWidth: 60, fontWeight: 600, borderRadius: 8, background: selectedColorIdx === idx ? '#007bff' : '#fff', color: selectedColorIdx === idx ? '#fff' : '#222', border: '1px solid #eee' }}
                onClick={() => setSelectedColorIdx(idx)}
              >
                {typeof c.color === 'string' ? c.color : 'Mặc định'}
              </Button>
            ))}
          </div>
        </div>
        {/* Thông tin sản phẩm */}
        <div style={{ flex: '2 1 500px', minWidth: 320 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{product.name} {selectedColor.color && `- ${selectedColor.color}`}</h1>
          <div style={{ fontSize: 18, color: '#555', marginBottom: 8 }}>{product.brand}</div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Mã sản phẩm: {product.productCode || product._id}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#d0021b', marginBottom: 18 }}>
            {selectedColor.price ? Number(selectedColor.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Liên hệ'}
          </div>
          <div style={{ marginBottom: 18 }}>{selectedColor.description || product.description}</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <Button type="primary" onClick={handleOrderNow}>
              Đặt hàng
            </Button>
            <Button type="default" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>
          </div>
          {/* Trạng thái sản phẩm */}
          <div style={{ marginBottom: 18 }}>
            <Tag color={colorQuantity > 0 && colorStatus === 'Available' ? 'green' : 'red'}>
              {colorQuantity > 0 && colorStatus === 'Available' ? 'Còn hàng' : (colorStatus === 'Out of Stock' ? 'Hết hàng' : colorStatus)}
            </Tag>
          </div>
          {/* Hiển thị thêm discount và rating nếu có */}
          {selectedColor.discount > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Tag color="orange">Giảm giá: {selectedColor.discount}%</Tag>
            </div>
          )}
          {selectedColor.rating > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Tag color="blue">Đánh giá: {selectedColor.rating}★</Tag>
            </div>
          )}
        </div>
      </div>
      {/* Accordion thông số kỹ thuật và tính năng */}
      <div style={{ marginTop: 48 }}>
        <Collapse defaultActiveKey={['1']} style={{ background: '#fafafa', borderRadius: 8 }}>
          <Panel header="Thông số kỹ thuật" key="1">
            {Object.entries(specs).length > 0 ? (
              <div style={{ whiteSpace: 'pre-line', fontSize: 16 }}>
                {Object.entries(specs).map(([key, value], idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <b>{key}:</b> {value}
                  </div>
                ))}
              </div>
            ) : 'Không có thông số kỹ thuật.'}
          </Panel>
          <Panel header="Tính năng sản phẩm" key="2">
            {Array.isArray(features) && features.length > 0 ? (
              <ul style={{ fontSize: 16 }}>
                {features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
            ) : 'Không có thông tin tính năng.'}
          </Panel>
        </Collapse>
      </div>
      <Button type="default" onClick={() => navigate('/')} style={{ margin: '32px 0 0 0' }}>
        Quay lại
      </Button>
    </div>
  );
};

export default ProductDetailPage;
