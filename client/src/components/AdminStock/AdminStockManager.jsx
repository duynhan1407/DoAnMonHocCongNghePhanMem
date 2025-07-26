import React, { useEffect, useState } from "react";
import eventBus from '../../utils/eventBus';
import { Table, Button, Input, Modal, message, Form, Select } from "antd";
import * as ProductService from "../../services/ProductService";
import * as OrderService from "../../services/OrderService";
import * as BrandService from "../../services/BrandService";

const AdminStockManager = () => {
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [addForm] = Form.useForm();
  // Thêm sản phẩm mới
  const handleAddProduct = async () => {
    try {
      const values = await addForm.validateFields();
      await ProductService.createProduct({
        name: values.name,
        brand: values.brand,
        quantity: values.quantity,
        colors: values.colors || [],
        productCode: Date.now().toString(),
        category: 'Khác',
        price: 0,
      });
      if (!brands.some(b => b.name === values.brand)) {
        setBrands([...brands, { name: values.brand }]);
      }
      message.success("Đã thêm sản phẩm mới!");
      setAddModal(false);
      addForm.resetFields();
      fetchProducts();
    } catch (err) {
      if (err?.errorFields) return;
      message.error("Lỗi thêm sản phẩm!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBrands();
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


  // Hàm cập nhật lại chỉ các dòng sản phẩm bị thay đổi (theo _id), giữ lại các dòng khác màu
  const updateProductRows = async (productId) => {
    try {
      const updatedRes = await ProductService.getAllProducts({ _id: productId });
      if (updatedRes?.data && Array.isArray(updatedRes.data)) {
        const updatedProduct = updatedRes.data[0];
        let updatedRows = [];
        if (Array.isArray(updatedProduct.colors) && updatedProduct.colors.length > 0) {
          updatedRows = updatedProduct.colors.map((color) => ({
            ...updatedProduct,
            color,
            key: `${updatedProduct._id}-${color}`,
          }));
        } else {
          updatedRows = [{
            ...updatedProduct,
            color: null,
            key: `${updatedProduct._id}-no-color`,
          }];
        }
        setDisplayProducts(prev => {
          // Loại bỏ các dòng cùng _id
          const filtered = prev.filter(p => p._id !== productId);
          return [...filtered, ...updatedRows];
        });
      } else {
        fetchProducts();
      }
    } catch {
      fetchProducts();
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAllProducts();
      const rawProducts = res?.data || [];
      setProducts(rawProducts);
      // Tách mỗi màu thành 1 dòng riêng biệt
      const productList = [];
      rawProducts.forEach(product => {
        if (Array.isArray(product.colors) && product.colors.length > 0) {
          product.colors.forEach((color) => {
            productList.push({
              ...product,
              color,
              key: `${product._id}-${color}`,
            });
          });
        } else {
          productList.push({
            ...product,
            color: null,
            key: `${product._id}-no-color`,
          });
        }
      });
      setDisplayProducts(productList);
    } catch {
      message.error("Không thể lấy danh sách sản phẩm");
    }
    setLoading(false);
  };

  const fetchBrands = async () => {
    try {
      const res = await ProductService.getAllBrands?.();
      setBrands(res?.data || []);
    } catch {
      setBrands([]);
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct || restockQty <= 0) return;
    try {
      await OrderService.restockProduct({ productId: selectedProduct._id || selectedProduct.id, quantity: restockQty });
      message.success("Đã nhập kho thành công!");
      setRestockModal(false);
      fetchProducts();
    } catch {
      message.error("Lỗi nhập kho!");
    }
  };


  const columns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color) => color ? <span style={{ background: '#e6f7ff', color: '#1890ff', borderRadius: 4, padding: '2px 8px', marginRight: 4 }}>{color}</span> : <span style={{ color: '#aaa' }}>Không có</span>
    },
    { title: "Số lượng kho", dataIndex: "quantity", key: "quantity" },
    {
      title: "Nhập kho",
      key: "restock",
      render: (_, record) => (
        <Button type="primary" onClick={() => { setSelectedProduct(record); setRestockModal(true); }}>
          Nhập thêm
        </Button>
      )
    },
    // Chỉ cho phép nhập kho, không xuất kho
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý kho sản phẩm</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setAddModal(true)}>
        Thêm sản phẩm
      </Button>
      <Table columns={columns} dataSource={displayProducts} rowKey={r => r.key} loading={loading} />
      {/* Modal nhập kho */}
      <Modal
        open={restockModal}
        title={`Nhập kho: ${selectedProduct?.name}`}
        onCancel={() => setRestockModal(false)}
        onOk={handleRestock}
        okText="Xác nhận"
      >
        <div style={{ marginBottom: 8 }}>
          <b>Tên sản phẩm:</b> {selectedProduct?.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Thương hiệu:</b> {selectedProduct?.brand}
        </div>
        <Input
          type="number"
          min={1}
          value={restockQty}
          onChange={e => setRestockQty(Number(e.target.value))}
          style={{ width: 120 }}
          placeholder="Nhập số lượng"
        />
      </Modal>
      {/* Modal thêm sản phẩm */}
      <Modal
        open={addModal}
        title="Thêm sản phẩm mới"
        onCancel={() => { setAddModal(false); addForm.resetFields(); }}
        onOk={handleAddProduct}
        okText="Thêm"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true, message: 'Chọn thương hiệu' }]}> 
            <Select
              showSearch
              placeholder="Chọn thương hiệu"
              optionFilterProp="children"
              allowClear
              notFoundContent={brands && brands.length === 0 ? 'Chưa có thương hiệu' : null}
            >
              {brands.map(b => <Select.Option key={b.name} value={b.name}>{b.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng nhập kho ban đầu" rules={[{ required: true, message: 'Nhập số lượng' }]}> 
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="colors" label="Màu sắc (có thể chọn nhiều)">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập hoặc chọn màu sắc, ví dụ: Đỏ, Xanh, Đen..."
              tokenSeparators={[',']}
              allowClear
              // Không lấy options từ sản phẩm, chỉ cho nhập tự do
              options={[]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminStockManager;
