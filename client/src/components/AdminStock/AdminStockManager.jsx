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
      // Map colors to array of objects for new schema, khởi tạo quantity cho từng màu
      let colorsArr = [];
      let payload = {
        name: values.name,
        brand: values.brand,
        productCode: Date.now().toString(),
        category: 'Khác',
        price: 0,
      };
      if (Array.isArray(values.colors) && values.colors.length > 0) {
        // Nếu có nhiều màu, lấy số lượng riêng cho từng màu từ values[`quantity_${color}`]
        colorsArr = values.colors.map(c => ({
          color: c,
          images: [],
          price: 0,
          description: '',
          quantity: Number(values[`quantity_${c}`]) || 0
        }));
        payload.colors = colorsArr;
      } else {
        payload.quantity = values.quantity;
      }
      await ProductService.createProduct(payload);
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
    // Lắng nghe sự kiện đặt hàng thành công từ HomePage/PaymentPage
    const orderSuccessHandler = () => {
      fetchProducts();
      fetchBrands();
    };
    window.addEventListener('order-success', orderSuccessHandler);
    // Cleanup khi unmount
    return () => {
      eventBus.off('reloadProducts', reloadHandler);
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('order-success', orderSuccessHandler);
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
          updatedRows = updatedProduct.colors.map((colorObj) => ({
            ...updatedProduct,
            color: colorObj.color,
            images: colorObj.images,
            price: colorObj.price,
            description: colorObj.description,
            key: `${updatedProduct._id}-${colorObj.color}`,
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
      // Tự động cập nhật trạng thái sản phẩm dựa vào số lượng
      await Promise.all(rawProducts.map(async (product) => {
        const newStatus = product.quantity > 0 ? 'Available' : 'OutOfStock';
        if (product.status !== newStatus) {
          await ProductService.updateProduct(product._id, { status: newStatus });
          product.status = newStatus;
        }
      }));
      setProducts(rawProducts);
      // Tách mỗi màu thành 1 dòng riêng biệt
      const productList = [];
      rawProducts.forEach(product => {
        if (Array.isArray(product.colors) && product.colors.length > 0) {
          product.colors.forEach((colorObj) => {
            productList.push({
              ...product,
              color: colorObj.color,
              images: colorObj.images,
              price: colorObj.price,
              description: colorObj.description,
              key: `${product._id}-${colorObj.color}`,
              quantity: typeof colorObj.quantity === 'number' ? colorObj.quantity : 0 // Luôn chỉ lấy số lượng từng màu
            });
          });
        } else {
          productList.push({
            ...product,
            color: null,
            key: `${product._id}-no-color`,
            quantity: typeof product.quantity === 'number' ? product.quantity : 0
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
      // Nếu sản phẩm có màu, truyền thêm color
      const restockPayload = { productId: selectedProduct._id || selectedProduct.id, quantity: restockQty };
      if (selectedProduct.color) {
        restockPayload.color = selectedProduct.color;
      }
      await OrderService.restockProduct(restockPayload);
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
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => {
        if (selectedProduct && selectedProduct.colors) {
          addForm.setFieldsValue({ colors: selectedProduct.colors });
        }
        setAddModal(true);
      }}>
        Thêm sản phẩm
      </Button>
      {/* Đã loại bỏ bảng màu ở nút thêm sản phẩm theo yêu cầu */}
      <Table columns={columns} dataSource={displayProducts} rowKey={r => r.key} loading={loading} />
      {/* Modal nhập kho */}
      <Modal
        open={restockModal}
        title={`Nhập kho: ${selectedProduct?.name}${selectedProduct?.color ? ` - Màu ${selectedProduct.color}` : ''}`}
        onCancel={() => setRestockModal(false)}
        onOk={handleRestock}
        okText="Xác nhận"
      >
        <div style={{ marginBottom: 8 }}>
          <b>Tên sản phẩm:</b> {selectedProduct?.name}
          {selectedProduct?.color && <span style={{ marginLeft: 16 }}><b>Màu:</b> {selectedProduct.color}</span>}
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
              {brands.map(b => (
                <Select.Option key={b.name} value={b.name}>{b.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="colors" label="Màu sắc (có thể chọn nhiều)">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập màu sắc, ví dụ: Đỏ, Xanh, Đen... (gõ tên màu rồi enter)"
              tokenSeparators={[',']}
              allowClear
              options={[]}
              onChange={(colors) => {
                // Đảm bảo giá trị truyền vào luôn là mảng string
                const colorArr = colors.map(c => typeof c === 'string' ? c : (c?.value || String(c)));
                // Xóa các field số lượng của màu đã bị xóa
                const currentFields = addForm.getFieldsValue();
                Object.keys(currentFields).forEach(key => {
                  if (key.startsWith('quantity_')) {
                    const colorKey = key.replace('quantity_', '');
                    if (!colorArr.includes(colorKey)) {
                      addForm.setFieldsValue({ [key]: undefined });
                    }
                  }
                });
                // Thêm field số lượng cho màu mới
                colorArr.forEach(color => {
                  if (!addForm.getFieldValue(`quantity_${color}`)) {
                    addForm.setFieldsValue({ [`quantity_${color}`]: 0 });
                  }
                });
                // Force update form to re-render quantity fields immediately
                addForm.setFieldsValue({ colors: colorArr });
              }}
            />
            {/* Các ô nhập số lượng cho từng màu luôn nằm trong Form.Item colors để đảm bảo kết nối form */}
            {(addForm.getFieldValue('colors') && Array.isArray(addForm.getFieldValue('colors')) && addForm.getFieldValue('colors').length > 0) && addForm.getFieldValue('colors').map(color => (
              color && typeof color === 'string' && color.trim() !== '' ? (
                <Form.Item
                  key={`quantity_${color}`}
                  name={`quantity_${color}`}
                  label={`${addForm.getFieldValue('name') || 'Sản phẩm'} (${color})`}
                  rules={[{ required: true, message: `Nhập số lượng cho ${addForm.getFieldValue('name') || 'sản phẩm'} (${color})` }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              ) : null
            ))}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminStockManager;
