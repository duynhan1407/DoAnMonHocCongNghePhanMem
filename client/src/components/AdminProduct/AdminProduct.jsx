import React, { useState, useEffect } from "react";
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
  Tag
} from "antd";
import { UploadOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import * as ProductService from "../../services/ProductService";
import { WrapperHeader } from "../HeaderComponent/Style";
import * as BrandService from '../../services/BrandService';


function QuanLySanPham() {
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

  const statusOptions = [
    { label: "Còn hàng", value: "Available", color: "green" },
    { label: "Hết hàng", value: "OutOfStock", color: "red" },
  ];

  const categories = [
    { label: "Nam", value: "nam" },
    { label: "Nữ", value: "nu" },
    { label: "Cặp đôi", value: "capdoi" },
  ];

  // Fetch product data
  const [brands, setBrands] = useState([]);
  const [newBrandInput, setNewBrandInput] = useState("");
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await ProductService.getAllProducts(params);
      if (response?.data && Array.isArray(response.data)) {
        setProducts(
          response.data.map((product) => ({
            ...product,
            key: product._id,
          }))
        );
        if (pagination.total !== (response.total || response.data.length)) {
          setPagination((prev) => ({ ...prev, total: response.total || response.data.length }));
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

  useEffect(() => {
    fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
    // eslint-disable-next-line
  }, [pagination.current, pagination.pageSize]);

  // Lấy brands từ backend khi mở modal
  const fetchBrands = async () => {
    const res = await BrandService.getAllBrands();
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

  const handleShowDetail = (product) => {
    setDetailProduct(product);
  };
  const handleCloseDetail = () => {
    setDetailProduct(null);
  };

const handleFormSubmit = async (values) => {
  setActionLoading(true);
  try {
    // Đảm bảo chỉ truyền mảng url string cho images
    let productData = { ...values };
    if (Array.isArray(values.images)) {
      productData.images = values.images.filter(img => typeof img === 'string');
      if (!productData.image && productData.images.length > 0) {
        productData.image = productData.images[0];
      }
    }
    if (currentProduct?._id) {
      await ProductService.updateProduct(currentProduct._id, productData);
      message.success("Cập nhật sản phẩm thành công!");
    } else {
      // Tự động sinh mã sản phẩm nếu chưa có
      if (!productData.productCode) {
        productData.productCode = 'SP' + Date.now() + Math.floor(Math.random()*1000);
      }
      await ProductService.createProduct(productData);
      message.success("Tạo sản phẩm mới thành công!");
    }
    fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
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
    const isImage = file.type === "image/jpeg" || file.type === "image/png";
    if (!isImage) {
      message.error("Chỉ được tải lên tệp JPG/PNG!");
      return Upload.LIST_IGNORE;
    }
  
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
    form.setFieldsValue(record);
  };

  const handleDeleteProduct = async (id) => {
    setActionLoading(true);
    try {
      await ProductService.deleteProduct(id);
      message.success("Xóa sản phẩm thành công!");
      fetchProducts({ page: pagination.current - 1, limit: pagination.pageSize });
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể xóa sản phẩm.");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name", "tên sản phẩm"),
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
    { title: "Đánh giá", dataIndex: "rating", key: "rating", sorter: (a, b) => a.rating - b.rating },
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
        // Ưu tiên lấy ảnh đầu tiên trong images, nếu không có thì lấy image
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
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditProduct(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ loading: actionLoading }}
          >
            <Button type="link" danger disabled={actionLoading}>
              Xóa
            </Button>
          </Popconfirm>
          <Button icon={<EyeOutlined />} onClick={() => handleShowDetail(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ margin: 24, borderRadius: 16, boxShadow: '0 2px 12px #eee' }}
      bodyStyle={{ padding: 24 }}
      title={<span style={{ fontWeight: 700, fontSize: 22, color: '#1890ff' }}>Quản lý sản phẩm</span>}
      extra={
        <Button icon={<PlusOutlined />} type="primary" style={{ borderRadius: 8 }} onClick={() => setIsModalOpen(true)}>
          Thêm sản phẩm
        </Button>
      }
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
        title={currentProduct?._id ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
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
              placeholder="Chọn thương hiệu"
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
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                    <Input
                      value={newBrandInput}
                      style={{ flex: 1, marginRight: 8 }}
                      placeholder="Thêm thương hiệu mới"
                      onChange={e => setNewBrandInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const value = newBrandInput.trim();
                          if (!value) return;
                          // Kiểm tra trùng tên thương hiệu
                          if (brands.some(b => b.name.toLowerCase() === value.toLowerCase())) {
                            message.warning('Thương hiệu đã tồn tại!');
                            return;
                          }
                          try {
                            await BrandService.createBrand({ name: value });
                            setNewBrandInput("");
                            const resAll = await BrandService.getAllBrands();
                            setBrands(resAll.data);
                            setTimeout(() => {
                              form.setFieldsValue({ brand: value });
                            }, 100);
                            message.success('Đã thêm thương hiệu mới!');
                          } catch (err) {
                            message.error('Không thể thêm thương hiệu mới!');
                          }
                        }
                      }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      style={{ marginLeft: 4 }}
                      onClick={async () => {
                        const value = newBrandInput.trim();
                        if (!value) return;
                        if (brands.some(b => b.name.toLowerCase() === value.toLowerCase())) {
                          message.warning('Thương hiệu đã tồn tại!');
                          return;
                        }
                        try {
                          await BrandService.createBrand({ name: value });
                          setNewBrandInput("");
                          const resAll = await BrandService.getAllBrands();
                          setBrands(resAll.data);
                          setTimeout(() => {
                            form.setFieldsValue({ brand: value });
                          }, 100);
                          message.success('Đã thêm thương hiệu mới!');
                        } catch (err) {
                          message.error('Không thể thêm thương hiệu mới!');
                        }
                      }}
                    >Thêm</Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
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
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng nhập đánh giá!" }]}
          >
            <InputNumber min={0} max={5} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="images" label="Hình ảnh sản phẩm">
            <Upload
              action="http://localhost:3001/api/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={handleBeforeUpload}
              multiple={true}
              accept=".jpg,.jpeg,.png"
            >
              {fileList.length < 8 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={actionLoading}>
              {currentProduct?._id ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal xem chi tiết sản phẩm */}
      <Modal
        open={!!detailProduct}
        onCancel={handleCloseDetail}
        footer={null}
        width={600}
        title={detailProduct ? `Chi tiết sản phẩm ${detailProduct.name}` : ""}
        centered
        bodyStyle={{ borderRadius: 12, padding: 24 }}
      >
        {detailProduct && (
          <div style={{ textAlign: "center" }}>
            {(() => {
              let imgUrl = '';
              if (Array.isArray(detailProduct.images) && detailProduct.images.length > 0) {
                imgUrl = detailProduct.images[0];
              } else if (detailProduct.image) {
                imgUrl = detailProduct.image;
              }
              if (!imgUrl) return <div>Không có ảnh</div>;
              const isFullUrl = imgUrl.startsWith('http://') || imgUrl.startsWith('https://');
              return (
                <img
                  src={isFullUrl ? imgUrl : `http://localhost:3001${imgUrl}`}
                  alt="Sản phẩm"
                  style={{ width: "100%", maxHeight: 350, objectFit: "cover", marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/default-product.jpg'; }}
                />
              );
            })()}
            <div style={{ margin: '12px 0' }}><b>Giá tiền:</b> <Tag color="green">{Number(detailProduct.price).toLocaleString("vi-VN")} ₫</Tag></div>
            <div><b>Giảm giá:</b> <Tag color="orange">{detailProduct.discount ? `${detailProduct.discount}%` : "Không có"}</Tag></div>
            <div><b>Đánh giá:</b> <Tag color="gold">{detailProduct.rating}</Tag></div>
            <div><b>Trạng thái:</b> <Badge color={statusOptions.find((option) => option.value === detailProduct.status)?.color} text={statusOptions.find((option) => option.value === detailProduct.status)?.label || "Không xác định"} /></div>
            <div style={{ marginTop: 8 }}><b>Mô tả:</b> {detailProduct.description}</div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default QuanLySanPham;
