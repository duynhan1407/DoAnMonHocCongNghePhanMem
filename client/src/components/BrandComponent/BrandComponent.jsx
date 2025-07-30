import React, { useState, useEffect } from 'react';
import eventBus from '../../utils/eventBus';
import { Card, Table, Tag, Button, Modal, Form, Input, message } from 'antd';
import * as ProductService from '../../services/ProductService';
import * as BrandService from '../../services/BrandService';

const BrandComponent = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Chỉ lấy thương hiệu có sản phẩm còn hàng
  // Lấy tất cả thương hiệu đã thêm
  const fetchBrands = async () => {
    const res = await BrandService.getAllBrands();
    if (res?.data) {
      setBrands(res.data);
    }
  };


  // Hàm cập nhật lại products khi có thay đổi (ví dụ đổi màu, đổi số lượng)
  // ...existing code...

  useEffect(() => {
    // Lấy products thực tế, chỉ lấy sản phẩm còn hàng
    const fetchProducts = async () => {
      const res = await ProductService.getAllProducts();
      if (res?.data) {
        // Tách mỗi màu thành 1 sản phẩm riêng biệt với quantity riêng
        const productList = [];
        res.data.forEach(product => {
          if (Array.isArray(product.colors) && product.colors.length > 0) {
            product.colors.forEach((colorObj) => {
              productList.push({
                ...product,
                color: colorObj.color,
                quantity: typeof colorObj.quantity === 'number' ? colorObj.quantity : 0
              });
            });
          } else {
            productList.push({
              ...product,
              color: null,
              quantity: typeof product.quantity === 'number' ? product.quantity : 0
            });
          }
        });
        // Lấy tất cả sản phẩm (không lọc còn hàng)
        setProducts(productList);
        // Sau khi cập nhật products, mới gọi fetchBrands để cập nhật brands
        setTimeout(fetchBrands, 0);
      }
    };
    fetchProducts();
    // Lắng nghe reloadProducts để tự động reload số lượng khi có sự kiện từ eventBus hoặc localStorage
    const reloadHandler = () => {
      fetchProducts();
      fetchBrands();
    };
    eventBus.on('reloadProducts', reloadHandler);
    const storageHandler = (e) => {
      if (e.key === 'reloadProducts') {
        fetchProducts();
        fetchBrands();
      }
    };
    window.addEventListener('storage', storageHandler);
    // Cleanup khi unmount
    return () => {
      eventBus.off('reloadProducts', reloadHandler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  // Tổng số lượng sản phẩm còn lại trong kho cho mỗi thương hiệu (không cộng dồn theo màu)
  // Tổng số lượng sản phẩm của thương hiệu (mỗi màu là một sản phẩm riêng biệt)
  const getProductStock = (brandName) => {
    // Lấy tất cả sản phẩm cùng brand
    const filtered = products.filter((p) => p.brand === brandName);
    // Mỗi sản phẩm đã tách màu riêng, chỉ cần cộng quantity của từng sản phẩm
    return filtered.reduce((sum, p) => sum + (typeof p.quantity === 'number' ? p.quantity : 0), 0);
  };

  const getProductCount = (brandName) => {
    // Đếm tổng số sản phẩm (mỗi màu là 1 sản phẩm riêng biệt)
    const filtered = products.filter((p) => p.brand === brandName);
    let count = 0;
    filtered.forEach(p => {
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        count += p.colors.length;
      } else {
        count += 1;
      }
    });
    return count;
  };

  const columns = [
    { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name' },
    {
      title: 'Tổng số lượng sản phẩm trong kho',
      key: 'stock',
      render: (_, record) => (
        <Tag color={getProductStock(record.name) > 0 ? "green" : "red"}>
          {getProductStock(record.name)}
        </Tag>
      ),
    },
    {
      title: 'Số lượng sản phẩm',
      key: 'count',
      render: (_, record) => (
        <Tag color="blue">{getProductCount(record.name)}</Tag>
      ),
    },
  ];

  const handleAddBrand = async () => {
    try {
      const values = await form.validateFields();
      await BrandService.createBrand({ name: values.name });
      message.success('Đã thêm thương hiệu mới!');
      setIsModalOpen(false);
      form.resetFields();
      fetchBrands();
    } catch (err) {
      message.error('Lỗi thêm thương hiệu!');
    }
  };

  return (
    <Card title="Quản lý thương hiệu" style={{ margin: 24 }} extra={<Button type="primary" onClick={() => setIsModalOpen(true)}>Thêm thương hiệu</Button>}>
      <Table columns={columns} dataSource={brands} pagination={false} rowKey={record => record._id || record.name} />
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleAddBrand} title="Thêm thương hiệu mới">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true, message: 'Nhập tên thương hiệu!' }]}> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BrandComponent;
