import React, { useState, useEffect } from "react";
import { Card, Row, Col, Input, Select, Pagination, Button, Modal, Rate, message, Spin, DatePicker, Space } from "antd";
import * as CategoryService from "../services/CategoryService";
import dayjs from "dayjs";
import * as ProductService from "../services/ProductService";
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await ProductService.getAllProducts({
        page: (pagination.current - 1),
        limit: pagination.pageSize,
        ...params,
      });
      if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setPagination((prev) => ({ ...prev, total: response.total || response.data.length }));
      } else {
        setProducts([]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Lấy danh mục từ backend
    CategoryService.getAllCategories().then(res => setCategories(res?.data?.map(c => c.name) || []));
    fetchProducts(filters);
    // eslint-disable-next-line
  }, [pagination.current, pagination.pageSize, filters]);

  // Sắp xếp sản phẩm theo tên
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const navigate = useNavigate();
  const showProductDetail = (product) => {
    navigate(`/product-detail/${product._id}`);
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cartProducts') || '[]');
    if (cart.some(item => item._id === product._id)) {
      message.info('Sản phẩm đã có trong giỏ hàng!');
      return;
    }
    cart.push({ ...product, productId: product._id, quantity: 1 });
    localStorage.setItem('cartProducts', JSON.stringify(cart));
    message.success('Đã thêm vào giỏ hàng!');
  };
  // ...existing code...
  // Chuyển sang trang nhập thông tin khách hàng với sản phẩm đã chọn
  const handleOrderNow = (product) => {
    // Chỉ chuyển sang trang nhập thông tin, không chuyển sang thanh toán
    navigate('/order-info', { state: { cart: [{ ...product, productId: product._id, quantity: 1 }] } });
  };
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input.Search
            placeholder="Tìm kiếm sản phẩm đồng hồ, thương hiệu, danh mục..."
            allowClear
            onChange={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder="Chọn danh mục sản phẩm"
            allowClear
            onChange={handleCategoryChange}
            style={{ width: '100%' }}
          >
            <Option value="">Tất cả</Option>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="Chọn trạng thái sản phẩm"
            allowClear
            onChange={handleStatusChange}
            style={{ width: '100%' }}
          >
            <Option value="">Tất cả</Option>
            <Option value="Available">Còn hàng</Option>
            <Option value="OutOfStock">Hết hàng</Option>
          </Select>
        </Col>
      </Row>
      <Spin spinning={loading} tip="Đang tải...">
        <Row gutter={[24, 24]}>
          {sortedProducts.map((product) => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={<img alt={product.name} src={product.images?.[0] || product.image || '/assets/images/no-image.png'} style={{ height: 180, objectFit: 'cover' }} />}
                actions={[
                  <Button type="primary" onClick={() => showProductDetail(product)}>Xem chi tiết</Button>,
                  <Button onClick={() => handleAddToCart(product)}>Thêm vào giỏ</Button>,
                  <Button type="default" style={{ background: '#b4005a', color: '#fff', borderColor: '#b4005a' }} onClick={() => handleOrderNow(product)}>Đặt hàng</Button>,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <div>Thương hiệu: {product.brand}</div>
                      <div>Giá: {product.price?.toLocaleString('vi-VN')} ₫</div>
                      <div>Tình trạng: {product.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}</div>
                      <Rate disabled value={product.rating || 0} style={{ fontSize: 16 }} />
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination
          style={{ marginTop: 24, textAlign: 'center' }}
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
        />
      </Spin>
      {/* Modal chi tiết sản phẩm */}
      <Modal
        visible={modalVisible}
        title={selectedProduct ? `Chi tiết sản phẩm: ${selectedProduct.name}` : ''}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <div>
            <img src={selectedProduct.images?.[0] || selectedProduct.image || '/assets/images/no-image.png'} alt={selectedProduct.name} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
            <h2>{selectedProduct.name} ({selectedProduct.brand})</h2>
            <div>Giá: {selectedProduct.price?.toLocaleString('vi-VN')} ₫</div>
            <div>Tình trạng: {selectedProduct.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}</div>
            <div>Mô tả: {selectedProduct.description}</div>
            <Rate disabled value={selectedProduct.rating || 0} style={{ fontSize: 18 }} />
            <Button type="primary" style={{ marginTop: 16 }} onClick={() => handleAddToCart(selectedProduct)}>Thêm vào giỏ</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
