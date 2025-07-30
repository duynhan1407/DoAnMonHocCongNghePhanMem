// Đã có import React ở trên, xóa dòng này
// Đã có import các component Ant Design ở trên, xóa dòng này

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// Đã có import useLocation ở trên, xóa dòng này
import { Input, Button, Select, Row, Col, Table, message } from 'antd';
import * as ProductService from '../../services/ProductService';
import * as CategoryService from '../../services/CategoryService';

const { Search } = Input;

// Đã có import useLocation ở trên, xóa dòng này

function TimKiemSanPham() {
    const [categoryMap, setCategoryMap] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [status, setStatus] = useState('');
    const [rating, setRating] = useState('');
    const [discount, setDiscount] = useState('');
    const location = useLocation();

    // Đặt handleSearch lên trước useEffect để tránh lỗi ReferenceError
    const handleSearch = async (catOverride) => {
        setLoading(true);
        try {
            const response = await ProductService.getAllProducts({
                name: searchTerm,
                category: catOverride || category,
                priceMin,
                priceMax,
                status,
                rating,
                discount
            });
            setProducts(response?.data || []);
        } catch (error) {
            message.error('Error searching products');
        } finally {
            setLoading(false);
        }
    };

    // Tự động tìm kiếm nếu có query category=nam
    useEffect(() => {
    // Lấy danh mục từ backend
    CategoryService.getAllCategories()
      .then(res => {
        setCategories(res?.data?.map(c => c.name) || []);
        // Tạo map id -> name nếu backend trả về id, hoặc map name -> name
        const map = {};
        (res?.data || []).forEach(c => {
          map[c.name] = c.name;
        });
        setCategoryMap(map);
      });
        const params = new URLSearchParams(location.search);
        const cat = params.get('category');
        if (cat) {
            setCategory(cat);
            handleSearch(cat);
        }
    }, [location.search, handleSearch]);

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh mục', dataIndex: 'category', key: 'category', render: v => categoryMap[v] || v },
        { title: 'Giá tiền', dataIndex: 'price', key: 'price', render: price => price ? Number(price).toLocaleString('vi-VN') + ' ₫' : '' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: v => v === 'Available' ? 'Còn hàng' : v === 'OutOfStock' ? 'Hết hàng' : v },
        { title: 'Đánh giá', dataIndex: 'rating', key: 'rating' },
    ];

    return (
        <div>
            <h2>Tìm kiếm sản phẩm đồng hồ</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Search
                        placeholder="Nhập tên sản phẩm đồng hồ"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="Chọn danh mục sản phẩm"
                        value={category}
                        onChange={(value) => setCategory(value)}
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="">Tất cả</Select.Option>
                        {categories.map(cat => (
                          <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={8}>
                    <Input
                        placeholder="Giá tối thiểu (₫)"
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        style={{ marginBottom: 8 }}
                    />
                    <Input
                        placeholder="Giá tối đa (₫)"
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                    />
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="Chọn trạng thái sản phẩm"
                        value={status}
                        onChange={(value) => setStatus(value)}
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="">Tất cả</Select.Option>
                        <Select.Option value="Available">Còn hàng</Select.Option>
                        <Select.Option value="OutOfStock">Hết hàng</Select.Option>
                    </Select>
                </Col>
                <Col span={8}>
                    <Input
                        placeholder="Đánh giá tối thiểu (0-5)"
                        type="number"
                        min={0}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                    />
                </Col>
                <Col span={8}>
                    <Input
                        placeholder="Mã giảm giá (discount)"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                </Col>
                <Col span={24} style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleSearch} loading={loading}>Tìm kiếm sản phẩm</Button>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={products}
                loading={loading}
                rowKey="_id"
                style={{ marginTop: 24 }}
                pagination={false}
            />
        </div>
    );
};

export default TimKiemSanPham;



