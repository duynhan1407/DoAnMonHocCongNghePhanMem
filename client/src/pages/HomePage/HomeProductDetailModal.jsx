import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Card, Row, Col, Image, Tag, Typography, Divider, Spin } from "antd";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";

const { Title, Text, Paragraph } = Typography;

const HomeProductDetailModal = ({ productId, open, onClose, onAddToCart }) => {
  const [categoryName, setCategoryName] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId || !open) return;
    setLoading(true);
    ProductService.getProductById(productId)
      .then((data) => {
        setProduct(data);
        // Lấy tên danh mục từ backend
        if (data?.category) {
          CategoryService.getAllCategories()
            .then(res => {
              const found = res?.data?.find(c => c.name === data.category);
              setCategoryName(found ? found.name : data.category);
            })
            .catch(() => setCategoryName(data.category));
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    setQuantity(1);
  }, [productId, open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={product ? `Chi tiết sản phẩm: ${product.name}` : "Đang tải..."}
    >
      {loading ? (
        <Spin />
      ) : product ? (
        <Row gutter={24}>
          <Col span={10}>
            <Image
              src={product.images?.[0] || product.image || "/assets/images/no-image.png"}
              alt={product.name}
              style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
              fallback="/assets/images/no-image.png"
            />
            <Row gutter={8}>
              {product.images?.slice(1, 5).map((img, idx) => (
                <Col key={idx} span={6}>
                  <Image
                    src={img}
                    alt={`Ảnh sản phẩm ${product.name} - ${idx + 2}`}
                    style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                    fallback="/assets/images/no-image.png"
                  />
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={14}>
            <Title level={4}>{product.name} ({product.brand})</Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Danh mục">{categoryName}</Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{product.brand}</Descriptions.Item>
              <Descriptions.Item label="Giá">{product.price?.toLocaleString("vi-VN")} ₫</Descriptions.Item>
              {product.discount ? <Descriptions.Item label="Giảm giá"><Tag color="blue">{product.discount}%</Tag></Descriptions.Item> : null}
              <Descriptions.Item label="Tình trạng">
                <Tag color={product.status === "Available" ? "green" : product.status === "OutOfStock" ? "red" : "orange"}>
                  {product.status === "Available" ? "Còn hàng" : product.status === "OutOfStock" ? "Hết hàng" : "Đang xử lý"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng trong kho">
                <Text strong>{product.quantity || 0}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}>{product.description}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <span style={{ marginRight: 12 }}>Số lượng:</span>
              <input
                type="number"
                min={1}
                max={product.quantity || 1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(product.quantity || 1, Number(e.target.value))))}
                style={{ width: 60, marginRight: 16, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                disabled={product.status !== 'Available'}
              />
              <button
                style={{
                  background: '#00bfae',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #e0e7ff',
                  marginTop: 8
                }}
                onClick={() => onAddToCart && onAddToCart({ ...product, quantity })}
                disabled={product.status !== 'Available' || quantity > (product.quantity || 1)}
              >
                Thêm vào giỏ
              </button>
            </div>
          </Col>
        </Row>
      ) : (
        <Text type="danger">Không tìm thấy thông tin sản phẩm.</Text>
      )}
    </Modal>
  );
};

export default HomeProductDetailModal;
