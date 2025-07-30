import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, Collapse, Skeleton, Button, Tag } from 'antd';
import { Modal, Rate, Input, List, Avatar, message } from 'antd';
import * as ProductService from '../../services/ProductService';
import * as ReviewService from '../../services/ReviewService';
const { Panel } = Collapse;


const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  // State cho đánh giá
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviews, setReviews] = useState([]);
  const [colorReviews, setColorReviews] = useState([]);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Xử lý dữ liệu màu sắc (theo schema mới: array object)
  const colors = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.map(c => ({
        color: typeof c.color === 'string' ? c.color : 'Mặc định',
        images: Array.isArray(c.images) && c.images.length > 0 ? c.images : product.images,
        price: typeof c.price === 'number' ? c.price : product.price,
        description: typeof c.description === 'string' ? c.description : product.description,
        quantity: typeof c.quantity === 'number' ? c.quantity : product.quantity,
        status: typeof c.status === 'string' ? c.status : 'Available',
        discount: typeof c.discount === 'number' ? c.discount : 0,
        rating: typeof c.rating === 'number' ? c.rating : 0
      }));
    }
    return [{ color: product.color || 'Mặc định', images: product.images, price: product.price, description: product.description, quantity: product.quantity, status: product.status || 'Available', discount: product.discount || 0, rating: product.rating || 0 }];
  }, [product]);

  const selectedColor = React.useMemo(() => {
    if (!product || colors.length === 0) return {};
    return colors[selectedColorIdx] || colors[0] || {};
  }, [colors, selectedColorIdx, product]);

  // Đảm bảo product đã khởi tạo trước khi dùng trong useEffect
  useEffect(() => {
    const fetchReviews = async () => {
      if (product) {
        // Lấy đánh giá cho toàn bộ sản phẩm
        try {
          const res = await ReviewService.getReviewsByProduct(product._id);
          setReviews(res?.data || []);
        } catch {
          setReviews([]);
        }
      }
    };
    fetchReviews();
  }, [product]);

  useEffect(() => {
    const fetchColorReviews = async () => {
      if (!product) {
        setColorReviews([]);
        return;
      }
      // selectedColor luôn có giá trị, nhưng kiểm tra lại để chắc chắn
      const color = (selectedColor && selectedColor.color) ? selectedColor.color : '';
      try {
        const res = color
          ? await ReviewService.getReviewsByProduct(product._id, { color })
          : await ReviewService.getReviewsByProduct(product._id);
        setColorReviews(res?.data || []);
      } catch {
        setColorReviews([]);
      }
    };
    fetchColorReviews();
  }, [product, selectedColor]);

  // Gửi đánh giá
  const handleSubmitReview = async () => {
    if (!reviewRating) {
      message.warning('Vui lòng chọn số sao!');
      return;
    }
    if (!reviewContent.trim()) {
      message.warning('Vui lòng nhập nhận xét!');
      return;
    }
    try {
      // Gửi đánh giá lên backend, truyền đúng schema
      // Nếu có thông tin user đăng nhập, hãy lấy từ context, nếu không thì dùng 'Ẩn danh'
      let user = window.localStorage.getItem('userName');
      console.log('Tên user lấy từ localStorage:', user);
      if (!user || typeof user !== 'string' || user.trim() === '') user = 'Không xác định';
      console.log('Tên user gửi lên backend:', user);
      const payload = {
        product: typeof product._id === 'string' ? product._id : String(product._id),
        user: user,
        rating: Number(reviewRating),
        comment: typeof reviewContent === 'string' ? reviewContent.trim() : '',
        color: selectedColor.color || undefined
      };
      if (!payload.product || !payload.user || !payload.comment || isNaN(payload.rating)) {
        message.error('Thiếu thông tin bắt buộc!');
        return;
      }
      await ReviewService.createReview(payload);
      message.success('Đã gửi đánh giá!');
      setReviewModalOpen(false);
      setReviewRating(0);
      setReviewContent('');
      // Reload reviews
      if (selectedColor && selectedColor.color) {
        const resColor = await ReviewService.getReviewsByProduct(product._id, { color: selectedColor.color });
        setColorReviews(resColor?.data || []);
      } else {
        setColorReviews([]);
      }
      const resAll = await ReviewService.getReviewsByProduct(product._id);
      setReviews(resAll?.data || []);
    } catch {
      message.error('Gửi đánh giá thất bại!');
    }
  };
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
        quantity: 1,
        discount: typeof selectedColor.discount === 'number' ? selectedColor.discount : 0,
        colors: Array.isArray(product.colors) ? product.colors : undefined
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
      quantity: 1,
      discount: typeof selectedColor.discount === 'number' ? selectedColor.discount : 0,
      colors: Array.isArray(product.colors) ? product.colors : undefined
    };
    // Xóa toàn bộ giỏ hàng khi đặt hàng thành công
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    navigate('/order-info', { state: { cart: [orderItem] } });
  };
  const { productId } = useParams();
  const navigate = useNavigate();
  // ...existing code...
  const [loading, setLoading] = useState(true);


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

  // Hiển thị số lượng và trạng thái cho từng màu nếu có, nếu không thì lấy product.quantity và product.status
  const colorQuantity = typeof selectedColor?.quantity === 'number' ? selectedColor.quantity : product?.quantity;
  const colorStatus = typeof selectedColor?.status === 'string' ? selectedColor.status : (product?.status || 'Available');
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12 }}>
      {/* Modal đánh giá sản phẩm */}
      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <b>Chọn số sao:</b>
          <Rate value={reviewRating} onChange={setReviewRating} style={{ marginLeft: 12 }} />
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Nhận xét về sản phẩm..."
          value={reviewContent}
          onChange={e => setReviewContent(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => setReviewModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
          <Button type="primary" onClick={handleSubmitReview}>Hoàn thành</Button>
        </div>
      </Modal>
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        {/* Ảnh sản phẩm lớn + slider */}
        <div style={{ flex: '1 1 400px', minWidth: 320 }}>
          <Carousel dots autoplay style={{ width: 400 }}>
            {(selectedColor.images || []).map((img, idx) => (
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
        {/* Thông tin sản phẩm + Thông số kỹ thuật */}
        <div style={{ flex: '2 1 500px', minWidth: 320 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{product.name} {selectedColor.color && `- ${selectedColor.color}`}</h1>
          <div style={{ fontSize: 18, color: '#555', marginBottom: 8 }}>{product.brand}</div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Mã sản phẩm: {product.productCode || product._id}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#d0021b', marginBottom: 18 }}>
            {selectedColor.discount > 0 ? (
              <>
                <span style={{ color: '#ff1744', fontWeight: 700 }}>
                  {(selectedColor.price * (1 - selectedColor.discount / 100)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
                <span style={{ color: '#888', textDecoration: 'line-through', marginLeft: 8 }}>
                  {Number(selectedColor.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </>
            ) : (
              selectedColor.price ? Number(selectedColor.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Liên hệ'
            )}
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 18 }}>
            {/* Số lượng kho và trạng thái */}
            <div>
              <div style={{ marginBottom: 8 }}>
                <Tag color={colorQuantity > 0 && colorStatus === 'Available' ? 'green' : 'red'}>
                  {colorQuantity > 0 && colorStatus === 'Available' ? 'Còn hàng' : (colorStatus === 'Out of Stock' ? 'Hết hàng' : colorStatus)}
                </Tag>
              </div>
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
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <Button type="primary" onClick={handleOrderNow}>
              Đặt hàng
            </Button>
            <Button type="default" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>
            <Button type="dashed" onClick={() => setReviewModalOpen(true)}>
              Đánh giá sản phẩm
            </Button>
          </div>
        </div>
      </div>
      {/* Accordion thông số kỹ thuật và tính năng */}
      <div style={{ marginTop: 48 }}>
        <Collapse defaultActiveKey={['1', '2']} style={{ background: '#fafafa', borderRadius: 8 }}>
          <Panel header="Thông số kỹ thuật" key="1">
            {/* Hiển thị tất cả mô tả sản phẩm dạng danh sách dòng */}
            {(selectedColor.description || product.description) ? (
              <ul style={{ fontSize: 16, paddingLeft: 24, margin: 0 }}>
                {(selectedColor.description || product.description)
                  .split(/\n|\r|<br\s*\/??>/)
                  .map(line => line.trim())
                  .filter(line => line)
                  .map((line, idx) => (
                    <li key={idx} style={{ marginBottom: 8, listStyle: 'disc', textAlign: 'left' }}>{line}</li>
                  ))}
              </ul>
            ) : <span style={{ color: '#888' }}>Không có thông số kỹ thuật cho sản phẩm này.</span>}
          </Panel>
          <Panel header={`Đánh giá sản phẩm (${reviews.length})`} key="2">
            <div>
              <b>Đánh giá theo màu ({selectedColor.color}):</b>
              {colorReviews.length === 0 ? (
                <span style={{ color: '#888', marginLeft: 8 }}>Chưa có đánh giá cho màu này.</span>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={colorReviews}
                  renderItem={(item, idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#2b46bd' }}>{(item.user && typeof item.user === 'string') ? item.user[0] : 'U'}</Avatar>}
                        title={<span><Rate disabled value={item.rating} /> <span style={{ marginLeft: 8, fontWeight: 600 }}>{item.user || 'Không xác định'}</span> <span style={{ color: '#888', marginLeft: 12 }}>{item.date}</span></span>}
                        description={item.comment}
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
            <div style={{ marginTop: 24 }}>
              <b>Tất cả đánh giá sản phẩm:</b>
              {reviews.length === 0 ? (
                <span style={{ color: '#888', marginLeft: 8 }}>Chưa có đánh giá nào cho sản phẩm này.</span>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={reviews}
                  renderItem={(item, idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#2b46bd' }}>{(item.user && typeof item.user === 'string') ? item.user[0] : 'U'}</Avatar>}
                        title={<span><Rate disabled value={item.rating} /> <span style={{ marginLeft: 8, fontWeight: 600 }}>{item.user || 'Không xác định'}</span> <span style={{ color: '#888', marginLeft: 12 }}>{item.date}</span></span>}
                        description={item.comment}
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
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
