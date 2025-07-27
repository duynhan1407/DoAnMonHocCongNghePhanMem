
import React, { useState, useEffect } from "react";
import eventBus from '../../utils/eventBus';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  message,
  Table,
  Space,
  Form,
  Input,
  Upload,
  Popconfirm,
  Select,
  InputNumber,
  Card,
  Badge,
  Tag,
} from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined, UploadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllBrands as getAllBrandsFromProduct } from '../../services/ProductService';
import { getAllBrands, createBrand } from '../../services/BrandService';

function QuanLySanPham() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const searchInput = React.useRef(null);

  // Trạng thái đơn hàng mới
  const statusOptions = [
    { label: "Còn hàng", value: "Available", color: "green" },
    { label: "Hết hàng", value: "OutOfStock", color: "red" },
    { label: "Đang xác nhận", value: "confirming", color: "orange" },
    { label: "Đang giao hàng", value: "shipping", color: "blue" },
    { label: "Đã giao hàng", value: "delivered", color: "green" },
  ];

  const categories = [
    { label: "Nam", value: "nam" },
    { label: "Nữ", value: "nu" },
    { label: "Cặp đôi", value: "capdoi" },
  ];

  // Fetch product data
  const [brands, setBrands] = useState([]);
  const [newBrandInput, setNewBrandInput] = useState("");
  const [productNamesInStock, setProductNamesInStock] = useState([]);
  const [productBrandMap, setProductBrandMap] = useState({});
  // Hiển thị mỗi màu là 1 dòng riêng biệt với số lượng riêng
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getAllProducts(params);
      if (response?.data && Array.isArray(response.data)) {
        // Tự động cập nhật trạng thái sản phẩm dựa vào số lượng
        await Promise.all(response.data.map(async (product) => {
          let newStatus = 'OutOfStock';
          if (Array.isArray(product.colors) && product.colors.length > 0) {
            // Nếu có màu, kiểm tra quantity của từng màu
            const hasStock = product.colors.some(c => typeof c.quantity === 'number' && c.quantity > 0);
            newStatus = hasStock ? 'Available' : 'OutOfStock';
          } else {
            newStatus = product.quantity > 0 ? 'Available' : 'OutOfStock';
          }
          if (product.status !== newStatus) {
            await updateProduct(product._id, { status: newStatus });
            product.status = newStatus;
          }
        }));
        // Tách mỗi màu thành 1 dòng riêng biệt
        const productList = [];
        response.data.forEach(product => {
          if (Array.isArray(product.colors) && product.colors.length > 0) {
            product.colors.forEach((colorObj) => {
              productList.push({
                ...product,
                color: colorObj.color,
                images: colorObj.images,
                price: colorObj.price,
                description: colorObj.description,
                key: `${product._id}-${colorObj.color}`,
                quantity: typeof colorObj.quantity === 'number' ? colorObj.quantity : 0,
                rating: typeof colorObj.rating === 'number' ? colorObj.rating : 0 // rating từng màu
              });
            });
          } else {
            productList.push({
              ...product,
              color: null,
              key: `${product._id}-no-color`,
              quantity: typeof product.quantity === 'number' ? product.quantity : 0,
              rating: typeof product.rating === 'number' ? product.rating : 0
            });
          }
        });
        // Lọc quantity > 0
        const filteredList = productList.filter(p => (p.quantity || 0) > 0);
        setProducts(filteredList);
        if (pagination.total !== (response.total || filteredList.length)) {
          setPagination((prev) => ({ ...prev, total: response.total || filteredList.length }));
        }
      } else {
        throw new Error("Invalid product data structure.");
      }
    } catch (error) {
      message.error(`Không thể tải danh sách sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách tên sản phẩm từ kho (quantity > 0)
  // (Retain for modal logic, but only for update, not creation)
  const fetchProductNamesInStock = async () => {
    try {
      const res = await getAllProducts();
      if (res?.data && Array.isArray(res.data)) {
        const filtered = res.data.filter(p => (p.quantity || 0) > 0);
        const names = filtered.map(p => p.name);
        setProductNamesInStock([...new Set(names)]);
        // Map tên sản phẩm sang brand
        const map = {};
        filtered.forEach(p => {
          if (p.name && p.brand) map[p.name] = p.brand;
        });
        setProductBrandMap(map);
      }
    } catch {}
  };


  useEffect(() => {
    fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
    // Lắng nghe reloadProducts để tự động reload sản phẩm khi có sự kiện từ eventBus hoặc localStorage
    const reloadHandler = () => {
      fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
    };
    eventBus.on('reloadProducts', reloadHandler);
    const storageHandler = (e) => {
      if (e.key === 'reloadProducts') {
        fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
      }
    };
    window.addEventListener('storage', storageHandler);
    // Cleanup khi unmount
    return () => {
      eventBus.off('reloadProducts', reloadHandler);
      window.removeEventListener('storage', storageHandler);
    };
    // eslint-disable-next-line
  }, [pagination.current, pagination.pageSize]);

  // Lấy tên sản phẩm từ kho khi mở modal tạo/sửa sản phẩm
  useEffect(() => {
    if (isModalOpen) {
      fetchProductNamesInStock();
    }
  }, [isModalOpen]);

  // Lấy brands từ backend khi mở modal
  const fetchBrands = async () => {
    const res = await getAllBrands();
    if (res?.data) setBrands(res.data);
  };

  useEffect(() => {
    fetchBrands();
  }, [isModalOpen]);

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = clearFilters => {
    clearFilters();
    setSearchText("");
  };

  // Chuyển sang trang chi tiết sản phẩm
  const handleShowDetail = (product) => {
    if (product && product._id) {
      navigate(`/product/${product._id}`);
    }
  };

  // Thêm vào giỏ hàng (localStorage)
  const handleAddToCart = (product) => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Nếu đã có sản phẩm cùng id và màu thì tăng số lượng, ngược lại thêm mới
    const idx = cart.findIndex(
      (item) => item._id === product._id && item.color === product.color
    );
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image,
        color: product.color,
        quantity: 1,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    message.success('Đã thêm vào giỏ hàng!');
  };

  const handleFormSubmit = async (values) => {
    setActionLoading(true);
    try {
      // Chỉ cho phép cập nhật, không cho phép tạo mới
      if (!currentProduct?._id) {
        message.error("Chỉ được cập nhật sản phẩm, không được thêm mới ở đây!");
        setActionLoading(false);
        return;
      }
      // Đảm bảo chỉ truyền mảng url string cho images
      let productData = { ...values };
      if (Array.isArray(values.images)) {
        productData.images = values.images.filter(img => typeof img === 'string');
        if (!productData.image && productData.images.length > 0) {
          productData.image = productData.images[0];
        }
      }
      // Chỉ cập nhật đúng màu đang chọn, không ghi đè toàn bộ mảng colors
      if (Array.isArray(currentProduct.colors) && currentProduct.colors.length > 0 && currentProduct.color) {
        // Tìm index màu đang chọn
        const idx = currentProduct.colors.findIndex(c => c.color === currentProduct.color);
        if (idx > -1) {
          // Tạo bản sao mảng colors, chỉ cập nhật đúng màu đang chọn
          const newColors = currentProduct.colors.map((c, i) => {
            if (i === idx) {
              return {
                ...c,
                images: productData.images,
                price: productData.price,
                description: productData.description,
                quantity: typeof productData.quantity === 'number' ? productData.quantity : c.quantity
              };
            }
            return c;
          });
          productData.colors = newColors;
        }
      }
      await updateProduct(currentProduct._id, productData);
      // Luôn reload lại danh sách sản phẩm từ backend để đồng bộ dữ liệu
      fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
      message.success("Cập nhật sản phẩm thành công!");
      // Cập nhật lại chỉ dòng sản phẩm vừa sửa, giữ lại các dòng khác màu
      const updatedRes = await getAllProducts({ _id: currentProduct._id });
      if (updatedRes?.data && Array.isArray(updatedRes.data)) {
        const updatedProduct = updatedRes.data[0];
        // Tách mỗi màu thành 1 dòng riêng biệt
        let updatedRows = [];
        if (Array.isArray(updatedProduct.colors) && updatedProduct.colors.length > 0) {
          updatedRows = updatedProduct.colors.map((color) => ({
            ...updatedProduct,
            color: color.color,
            images: color.images,
            price: color.price,
            description: color.description,
            key: `${updatedProduct._id}-${color.color}`,
          }));
        } else {
          updatedRows = [{
            ...updatedProduct,
            color: null,
            key: `${updatedProduct._id}-no-color`,
          }];
        }
        setProducts(prev => {
          // Loại bỏ các dòng cùng _id
          const filtered = prev.filter(p => p._id !== currentProduct._id);
          // Thêm lại các dòng mới
          return [...filtered, ...updatedRows].filter(p => (p.quantity || 0) > 0);
        });
      } else {
        fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
      }
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu thông tin sản phẩm.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFileList([]);
    setCurrentProduct(null);
    form.resetFields();
  };

  const handleBeforeUpload = (file) => {
    // Chỉ kiểm tra dung lượng, không kiểm tra định dạng file
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Chỉ giữ lại fileList cho preview, form chỉ lưu url string
    const filesWithUrl = newFileList.map((file) => ({
      ...file,
      url: file.response?.url || file.url,
    }));
    setFileList(filesWithUrl);
    // Lấy tất cả url ảnh đã upload thành công
    const uploadedUrls = filesWithUrl
      .filter(f => f.status === 'done' && (f.response?.url || f.url))
      .map(f => f.response?.url || f.url);
    form.setFieldsValue({ images: uploadedUrls });
  };

  const handleEditProduct = (record) => {
    setCurrentProduct(record);
    // Ưu tiên lấy tất cả ảnh từ images (nếu có), nếu không thì lấy image
    let imagesArr = [];
    if (Array.isArray(record.images) && record.images.length > 0) {
      imagesArr = record.images.map((img, idx) => ({
        uid: String(-idx - 1),
        name: `Uploaded Image ${idx + 1}`,
        status: "done",
        url: img.startsWith('http://') || img.startsWith('https://') ? img : `http://localhost:3001${img}`,
      }));
    } else if (record.image) {
      imagesArr = [{
        uid: "-1",
        name: "Uploaded Image",
        status: "done",
        url: record.image.startsWith('http://') || record.image.startsWith('https://') ? record.image : `http://localhost:3001${record.image}`,
      }];
    }
    setFileList(imagesArr);
    setIsModalOpen(true);
    // Khi sửa, chỉ cho phép sửa đúng màu của dòng đó, không ảnh hưởng màu khác
    if (record._id) {
      form.setFieldsValue({ ...record, colors: record.color ? [record.color] : [] });
    } else {
      form.setFieldsValue({ ...record, colors: record.color ? [record.color] : [] });
    }
  };

  const handleDeleteProduct = async (id) => {
    setActionLoading(true);
    try {
      // Nếu đang hiển thị theo màu, chỉ xóa màu đó khỏi mảng colors
      const product = products.find(p => p._id === id);
      if (product && product.color) {
        // Lấy sản phẩm gốc từ backend
        const res = await getAllProducts({ _id: id });
        const fullProduct = res?.data?.[0];
        if (fullProduct && Array.isArray(fullProduct.colors)) {
          const newColors = fullProduct.colors.filter(c => c.color !== product.color);
          if (newColors.length === 0) {
            // Nếu không còn màu nào, xóa toàn bộ sản phẩm
            await deleteProduct(id);
          } else {
            // Nếu còn màu, cập nhật lại mảng colors
            await updateProduct(id, { colors: newColors });
          }
        }
      } else {
        // Nếu không có màu, xóa toàn bộ sản phẩm
        await deleteProduct(id);
      }
      message.success("Xóa sản phẩm thành công!");
      fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể xóa sản phẩm.");
    } finally {
      setActionLoading(false);
    }
  };

  // Đã có state productNamesInStock lấy từ kho

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name", "tên sản phẩm"),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color) => color ? <Tag color="blue">{color}</Tag> : <Tag color="default">Không có</Tag>
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) =>
        price !== undefined && price !== null
          ? `${Number(price).toLocaleString("vi-VN")} ₫`
          : "",
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discount",
      key: "discount",
      sorter: (a, b) => (a.discount || 0) - (b.discount || 0),
      render: (discount) => (discount ? `${discount}%` : "Không có giảm giá"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: statusOptions,
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const option = statusOptions.find((option) => option.value === status);
        return option ? <Badge color={option.color} text={option.label} /> : <Tag>Không xác định</Tag>;
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: (_, record) => {
        let imgUrl = '';
        if (Array.isArray(record.images) && record.images.length > 0) {
          imgUrl = record.images[0];
        } else if (record.image) {
          imgUrl = record.image;
        }
        if (!imgUrl) return "Không có ảnh";
        const isFullUrl = imgUrl.startsWith('http://') || imgUrl.startsWith('https://');
        return (
          <img
            src={isFullUrl ? imgUrl : `http://localhost:3001${imgUrl}`}
            alt="Sản phẩm"
            style={{ width: 100, height: 100, objectFit: "cover", cursor: "pointer" }}
            onClick={() => handleShowDetail(record)}
            onError={e => { e.target.onerror = null; e.target.src = '/default-product.jpg'; }}
          />
        );
      },
    },
    {
      title: "Số lượng kho",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => qty > 0
        ? <Badge count={qty} style={{ backgroundColor: '#52c41a' }} />
        : <Badge count={0} style={{ backgroundColor: '#f5222d' }} text={<Tag color="red">Hết hàng</Tag>} />
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          minHeight: 48,
          height: '100%',
        }}>
          <Button
            type="primary"
            size="small"
            style={{ minWidth: 80, fontWeight: 500, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => handleEditProduct(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ loading: actionLoading }}
          >
            <Button
              type="default"
              danger
              size="small"
              style={{ minWidth: 80, fontWeight: 500, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={actionLoading}
            >
              Xóa
            </Button>
          </Popconfirm>
          <Button
            icon={<EyeOutlined />}
            size="small"
            style={{ minWidth: 40, height: 36, background: '#f5f5f5', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => handleShowDetail(record)}
          />
        </div>
      ),
    },
  ];

  // Đóng modal chi tiết sản phẩm
  const handleCloseDetail = () => {
    setDetailProduct(null);
  };

  return (
    <Card
      style={{ margin: 24, borderRadius: 16, boxShadow: '0 2px 12px #eee' }}
      bodyStyle={{ padding: 24 }}
      title={<span style={{ fontWeight: 700, fontSize: 22, color: '#1890ff' }}>Quản lý sản phẩm</span>}
      // Không hiển thị nút Thêm sản phẩm
      extra={null}
    >
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
          showSizeChanger: true,
        }}
        scroll={{ x: 900 }}
        style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}
      />
      <Modal
        title={currentProduct?._id ? "Chỉnh sửa sản phẩm" : ""}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
        bodyStyle={{ borderRadius: 12, padding: 24 }}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item
            name="brand"
            label="Thương hiệu"
            rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
          >
            <Select
              showSearch
              placeholder="Chọn hoặc nhập thương hiệu mới"
              options={brands && Array.isArray(brands) ? brands.map(b => ({ label: b.name, value: b.name })) : []}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={!brands}
              notFoundContent={brands && brands.length === 0 ? 'Chưa có thương hiệu' : null}
              allowClear
              showArrow
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                    <Input
                      style={{ flex: 'auto' }}
                      placeholder="Thêm thương hiệu mới và nhấn Enter"
                      onPressEnter={async e => {
                        const value = e.target.value.trim();
                        if (value && !brands.some(b => b.name === value)) {
                          try {
                            await createBrand({ name: value });
                            const res = await getAllBrands();
                            setBrands(res.data || []);
                            form.setFieldsValue({ brand: value });
                            message.success('Đã thêm thương hiệu mới!');
                          } catch {
                            message.error('Lỗi thêm thương hiệu!');
                          }
                        }
                      }}
                    />
                  </div>
                </>
              )}
            >
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng chọn tên sản phẩm!" }]}
          >
            {/* Luôn disabled, chỉ cho phép sửa các trường khác */}
            <Input disabled value={form.getFieldValue('name') || currentProduct?.name || ''} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá tiền"
            rules={[{ required: true, message: "Vui lòng nhập giá tiền!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={value => value.replace(/\D/g, "")}
              addonAfter="₫"
            />
          </Form.Item>
          <Form.Item
            name="discount"
            label="Giảm giá (%)"
            rules={[{ required: true, message: "Vui lòng nhập giảm giá!" }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select
              options={categories}
              placeholder="Chọn danh mục"
              allowClear
            />
          </Form.Item>
          {/* Trạng thái sản phẩm sẽ tự động cập nhật theo số lượng, không cho phép chỉnh sửa ở đây */}
          <Form.Item name="images" label="Hình ảnh sản phẩm">
            <Upload
              action="http://localhost:3001/api/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={handleBeforeUpload}
              multiple={true}
            >
              {fileList.length < 8 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="colors"
            label="Màu sắc (có thể chọn nhiều)"
            rules={[{ required: false }]}
          >
            {/* Khi sửa, chỉ cho phép sửa đúng màu của dòng đó */}
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Nhập hoặc chọn màu sắc, ví dụ: Đỏ, Xanh, Đen..."
              tokenSeparators={[',']}
              allowClear
              disabled={true}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={actionLoading} style={{ width: 160 }}>
              Cập nhật sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Đã chuyển sang trang chi tiết sản phẩm, không dùng modal ở đây nữa */}
    </Card>
  );
}

export default QuanLySanPham;
