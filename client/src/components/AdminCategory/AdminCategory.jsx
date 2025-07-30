import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, message } from 'antd';
import * as CategoryService from '../../services/CategoryService';
import * as ProductService from '../../services/ProductService';

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
    // Lấy toàn bộ sản phẩm để hiển thị mô tả
    ProductService.getAllProducts().then(res => {
      setAllProducts(res?.data || []);
    });
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await CategoryService.getAllCategories();
      setCategories(res?.data?.map(c => c.name) || []);
      // Lấy tổng số lượng sản phẩm còn hàng trong kho cho từng danh mục
      const prodRes = await ProductService.getAllProducts();
      const counts = {};
      (prodRes?.data || []).forEach(p => {
        if (p.category) {
          let totalQty = 0;
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            p.colors.forEach(colorObj => {
              if (typeof colorObj.quantity === 'number' && colorObj.quantity > 0) {
                totalQty += colorObj.quantity;
              }
            });
          } else if (typeof p.quantity === 'number' && p.quantity > 0) {
            totalQty += p.quantity;
          }
          counts[p.category] = (counts[p.category] || 0) + totalQty;
        }
      });
      setCategoryCounts(counts);
    } catch {
      message.error('Không lấy được danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return message.warning('Nhập tên danh mục!');
    if (categories.includes(newCategory.trim())) return message.warning('Danh mục đã tồn tại!');
    CategoryService.createCategory(newCategory.trim())
      .then(() => {
        fetchCategories();
        setNewCategory('');
        message.success('Thêm danh mục thành công!');
      })
      .catch(() => message.error('Lỗi khi thêm danh mục!'));
  };

  const handleEditCategory = (cat) => {
    setEditCategory(cat);
    setEditValue(cat);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) return message.warning('Nhập tên danh mục!');
    CategoryService.getAllCategories()
      .then(res => {
        const idx = categories.findIndex(c => c === editCategory);
        const id = res?.data?.[idx]?._id;
        if (!id) return message.error('Không tìm thấy danh mục!');
        CategoryService.updateCategory(id, editValue.trim())
          .then(() => {
            fetchCategories();
            setEditCategory(null);
            setEditValue('');
            message.success('Cập nhật danh mục thành công!');
          })
          .catch(() => message.error('Lỗi khi cập nhật danh mục!'));
      });
  };

  const handleDeleteCategory = (cat) => {
    Modal.confirm({
      title: 'Xóa danh mục',
      content: `Bạn có chắc muốn xóa danh mục "${cat}"?`,
      onOk: async () => {
        try {
          const idx = categories.findIndex(c => c === cat);
          const res = await CategoryService.getAllCategories();
          await CategoryService.deleteCategory(res.data.data[idx]._id);
          fetchCategories();
          message.success('Xóa danh mục thành công!');
        } catch {
          message.error('Lỗi khi xóa danh mục!');
        }
      }
    });
  };

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name', render: (v, r) => r },
    { title: 'Số lượng sản phẩm', key: 'count', render: (_, cat) => categoryCounts[cat] || 0 },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, cat) => (
        <>
          <Button type="link" onClick={() => handleEditCategory(cat)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDeleteCategory(cat)}>Xóa</Button>
        </>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12 }}>
      <h2>Quản lý danh mục sản phẩm</h2>
      <Input
        placeholder="Thêm danh mục mới"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
        style={{ width: 300, marginRight: 12 }}
      />
      <Button type="primary" onClick={handleAddCategory}>Thêm</Button>
      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey={r => r}
        style={{ marginTop: 24 }}
        pagination={false}
      />
      <Modal
        open={!!editCategory}
        title="Sửa danh mục"
        onOk={handleSaveEdit}
        onCancel={() => setEditCategory(null)}
      >
        <Input value={editValue} onChange={e => setEditValue(e.target.value)} />
      </Modal>
    </div>
  );
};

export default AdminCategory;
