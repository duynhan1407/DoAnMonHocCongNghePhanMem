import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Table, Popconfirm, message, Tag } from 'antd';
import * as BrandService from '../../services/BrandService';

import * as ProductService from '../../services/ProductService';

const BrandComponent = () => {
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Lấy brands từ backend
    const fetchBrands = async () => {
      const res = await BrandService.getAllBrands();
      if (res?.data) setBrands(res.data);
    };
    fetchBrands();
    // Lấy products thực tế
    const fetchProducts = async () => {
      const res = await ProductService.getAllProducts();
      if (res?.data) setProducts(res.data);
    };
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingBrand(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingBrand(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await BrandService.deleteBrand(id);
    setBrands(brands.filter((b) => b._id !== id));
    message.success('Đã xóa thương hiệu!');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const name = values.name.trim();
      // Kiểm tra trùng tên thương hiệu (không phân biệt hoa thường)
      if (!editingBrand && brands.some(b => b.name.toLowerCase() === name.toLowerCase())) {
        message.warning('Thương hiệu đã tồn tại!');
        return;
      }
      if (editingBrand) {
        const res = await BrandService.updateBrand(editingBrand._id, values);
        setBrands(brands.map((b) => (b._id === editingBrand._id ? res.data : b)));
        message.success('Cập nhật thương hiệu thành công!');
      } else {
        const res = await BrandService.createBrand(values);
        // Sau khi thêm, reload lại danh sách brands từ backend để đảm bảo đồng bộ
        const all = await BrandService.getAllBrands();
        setBrands(all.data);
        message.success('Thêm thương hiệu thành công!');
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      // Không làm gì, antd sẽ hiển thị lỗi validate
    }
  };

  const getProductCount = (brandName) =>
    products.filter((p) => p.brand === brandName).length;

  const columns = [
    { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name' },
    {
      title: 'Tổng số lượng sản phẩm trong kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => qty ?? 0
    },
    {
      title: 'Số lượng sản phẩm',
      key: 'count',
      render: (_, record) => (
        <Tag color="blue">{getProductCount(record.name)}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa thương hiệu?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Card title="Quản lý thương hiệu" extra={<Button onClick={handleAdd}>Thêm thương hiệu</Button>} style={{ margin: 24 }}>
      <Table columns={columns} dataSource={brands} pagination={false} rowKey={record => record._id || record.name} />
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleOk} title={editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}>
        <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thương hiệu"
          rules={[
            { required: true, message: 'Nhập tên thương hiệu!' },
            { validator: (_, value) => {
                if (typeof value === 'string' && value.trim() === '') {
                  return Promise.reject('Tên thương hiệu không được chỉ chứa khoảng trắng!');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input />
        </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BrandComponent;
