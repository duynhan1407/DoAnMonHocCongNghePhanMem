import React, { useEffect, useState } from "react";
import eventBus from '../../utils/eventBus';
import { Table, Button, Input, Modal, message, Form, Select } from "antd";
import * as ProductService from "../../services/ProductService";
import * as BrandService from "../../services/BrandService";
// Removed unused imports
// Removed unused BrandService import

const AdminStockManager = () => {
  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAllProducts();
      const rawProducts = res?.data || [];
      // Tách mỗi màu thành 1 dòng riêng biệt với quantity và status đúng
      const productList = [];
      await Promise.all(rawProducts.map(async (product) => {
        if (Array.isArray(product.colors) && product.colors.length > 0) {
          for (const colorObj of product.colors) {
            // Xác định trạng thái cho từng màu
            const colorStatus = (typeof colorObj.quantity === 'number' && colorObj.quantity > 0) ? 'Available' : 'OutOfStock';
            // Nếu trạng thái màu khác với DB thì cập nhật
            if (colorObj.status !== colorStatus) {
              // Gọi API cập nhật trạng thái cho màu
              await ProductService.updateProduct(product._id, {
                colors: product.colors.map(c => c.color === colorObj.color ? { ...c, status: colorStatus } : c)
              });
              colorObj.status = colorStatus;
            }
            productList.push({
              ...product,
              color: colorObj.color,
              images: colorObj.images,
              price: colorObj.price,
              description: colorObj.description,
              key: `${product._id}-${colorObj.color}`,
              quantity: typeof colorObj.quantity === 'number' ? colorObj.quantity : 0,
              status: colorStatus
            });
          }
        } else {
          // Sản phẩm không màu, trạng thái dựa vào tổng quantity
          const newStatus = product.quantity > 0 ? 'Available' : 'OutOfStock';
          if (product.status !== newStatus) {
            await ProductService.updateProduct(product._id, { status: newStatus });
            product.status = newStatus;
          }
          productList.push({
            ...product,
            color: null,
            key: `${product._id}-no-color`,
            quantity: typeof product.quantity === 'number' ? product.quantity : 0,
            status: newStatus
          });
        }
      }));
      setDisplayProducts(productList);
    } catch {
      message.error("Không thể lấy danh sách sản phẩm");
    }
    setLoading(false);
  }, []);
  // Removed unused products and reviewStats states
  // Removed unused reviewModal and setReviewModal states
  // Removed unused currentReviews and currentProductName states
  const [displayProducts, setDisplayProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [addForm] = Form.useForm();
  // Thêm sản phẩm mới
  // Lấy danh sách thương hiệu khi mở modal thêm sản phẩm
  useEffect(() => {
    if (addModal) {
      BrandService.getAllBrands().then(res => {
        setBrands(res?.data || []);
      });
    }
  }, [addModal]);

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
      message.success("Đã thêm sản phẩm mới!");
      setAddModal(false);
      addForm.resetFields();
      fetchProducts();
      eventBus.emit('reloadProductsFromStock');
    } catch (err) {
      if (err?.errorFields) return;
      message.error("Lỗi thêm sản phẩm!");
    }
  };

  useEffect(() => {
    fetchProducts();
    // Removed fetchBrands
    const reloadHandler = () => {
      fetchProducts();
      // Removed fetchBrands
    };
    eventBus.on('reloadProducts', reloadHandler);
    const storageHandler = (e) => {
      if (e.key === 'reloadProducts') {
        fetchProducts();
        // Removed fetchBrands
      }
    };
    window.addEventListener('storage', storageHandler);
    const orderSuccessHandler = () => {
      fetchProducts();
      // Removed fetchBrands
    };
    window.addEventListener('order-success', orderSuccessHandler);
    return () => {
      eventBus.off('reloadProducts', reloadHandler);
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('order-success', orderSuccessHandler);
    };
  }, [fetchProducts]);


  // Hàm cập nhật lại chỉ các dòng sản phẩm bị thay đổi (theo _id), giữ lại các dòng khác màu
  // Removed unused updateProductRows function

  // Lấy thống kê review cho tất cả sản phẩm
  // Lấy review chi tiết cho 1 sản phẩm
  // Removed unused fetchReviewsForProduct function

  // Removed unused fetchReviewStats function

  // Removed duplicate fetchProducts definition and cleaned up unreachable code


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
    // Đã loại bỏ cột thông số kỹ thuật theo yêu cầu
    // Đã ẩn cột đánh giá theo yêu cầu
    {
      title: "Nhập kho",
      key: "restock",
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => { 
            console.log('Selected product for restock:', record);
            setSelectedProduct(record); 
            setRestockQty(1);
            setRestockModal(true); 
          }}
        >
          Nhập thêm
        </Button>
      )
    },
    // Chỉ cho phép nhập kho, không xuất kho
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý kho sản phẩm</h2>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }} 
        onClick={() => {
          addForm.resetFields();
          setAddModal(true);
        }}
      >
        Thêm sản phẩm
      </Button>
      {/* Modal thêm sản phẩm đã được di chuyển xuống dưới */}
      {/* Đã loại bỏ bảng màu ở nút thêm sản phẩm theo yêu cầu */}
      <Table columns={columns} dataSource={displayProducts} rowKey={r => r.key} loading={loading} />
      {/* Đã loại bỏ modal đánh giá sản phẩm và các biến liên quan */}
      {/* Modal nhập kho */}
      <Modal
        open={restockModal}
        title={`Nhập kho: ${selectedProduct?.name}${selectedProduct?.color ? ` - Màu ${selectedProduct.color}` : ''}`}
        onCancel={() => {
          setRestockModal(false);
          setSelectedProduct(null);
          setRestockQty(1);
        }}
        onOk={async () => {
          try {
            if (!selectedProduct) {
              message.error('Không có sản phẩm được chọn!');
              return;
            }
            if (restockQty < 1) {
              message.error('Số lượng nhập phải lớn hơn 0!');
              return;
            }
            
            const updatedQuantity = selectedProduct.quantity + restockQty;
            const productId = selectedProduct._id;
            
            try {
              const payload = {
                quantity: updatedQuantity,
                color: selectedProduct.color || null
              };
              
              await ProductService.updateProductQuantity(productId, payload);
              message.success('Cập nhật số lượng thành công!');
              fetchProducts(); // Tải lại danh sách sản phẩm
              setRestockModal(false);
              setSelectedProduct(null);
              setRestockQty(1);
            } catch (error) {
              console.error('Error updating product quantity:', error);
              message.error('Có lỗi xảy ra khi cập nhật số lượng: ' + error.message);
            }
            
            message.success('Cập nhật số lượng thành công!');
            setRestockModal(false);
            setSelectedProduct(null);
            setRestockQty(1);
            fetchProducts();
            eventBus.emit('reloadProductsFromStock');
          } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật số lượng!');
          }
        }}
        okText="Xác nhận"
      >
        <div style={{ marginBottom: 8 }}>
          <b>Tên sản phẩm:</b> {selectedProduct?.name}
          {selectedProduct?.color && <span style={{ marginLeft: 16 }}><b>Màu:</b> {selectedProduct.color}</span>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Thương hiệu:</b> {selectedProduct?.brand}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Số lượng hiện tại:</b> {selectedProduct?.quantity || 0}
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
            <Select placeholder="Chọn thương hiệu">
              {brands.map(b => <Select.Option key={b._id} value={b.name}>{b.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="colors" label="Màu sắc (có thể chọn nhiều)">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập màu sắc"
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
