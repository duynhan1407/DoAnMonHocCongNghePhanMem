import React, { useState, useEffect, useCallback } from 'react';
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
  Row,
  Col,
  Tag,
  Descriptions,
  Select,
} from 'antd';
import { UploadOutlined, PlusOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import * as UserService from '../../services/UserServices';
import { Card, Statistic, DatePicker } from 'antd';
import moment from 'moment';

const CLOUDINARY_UPLOAD_URL = process.env.REACT_APP_CLOUDINARY_UPLOAD_URL;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchText, setSearchText] = useState("");
  const [detailModal, setDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const access_token = localStorage.getItem('access_token');
      const { data } = await UserService.getAllUser(access_token);
      let filtered = data;
      // Lọc theo ngày tạo
      if (dateRange[0] && dateRange[1]) {
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        filtered = filtered.filter(u => {
          const created = moment(u.createdAt);
          return created.isBetween(start, end, null, '[]');
        });
      }
      // Tìm kiếm theo tên, email, số điện thoại
      if (searchText.trim()) {
        const lower = searchText.trim().toLowerCase();
        filtered = filtered.filter(u =>
          (u.name && u.name.toLowerCase().includes(lower)) ||
          (u.email && u.email.toLowerCase().includes(lower)) ||
          (u.phone && u.phone.toLowerCase().includes(lower))
        );
      }
      setUsers(filtered.map((user) => ({ ...user, key: user._id })));
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, searchText]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleFileChange = async ({ fileList: newFileList }) => {
    if (newFileList.length === 0) {
      setFileList([]);
      return;
    }
    const file = newFileList[0].originFileObj;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      try {
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setFileList([
            {
              uid: '-1',
              name: file.name,
              status: 'done',
              url: data.secure_url,
            },
          ]);
        } else {
          message.error('Upload ảnh thất bại!');
          setFileList([]);
        }
      } catch (err) {
        message.error('Upload ảnh thất bại!');
        setFileList([]);
      }
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const avatar = fileList[0]?.url || currentUser.avatar || null;

      const payload = {
        ...values,
        avatar,
      };

      const access_token = localStorage.getItem('access_token');
      if (currentUser._id) {
        await UserService.updateUser(currentUser._id, payload, access_token);
        message.success('Cập nhật người dùng thành công!');
      } else {
        await UserService.signupUser(payload, access_token);
        message.success('Thêm mới người dùng thành công!');
      }
      fetchUsers();
      handleCancel();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể lưu người dùng.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFileList([]);
    setCurrentUser({});
    form.resetFields();
  };

  const handleEdit = (record) => {
    setCurrentUser(record);
    setFileList(
      record.avatar
        ? [
            {
              uid: '-1',
              name: 'Ảnh đại diện',
              status: 'done',
              url: record.avatar,
            },
          ]
        : []
    );
    setIsModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleShowDetail = (record) => {
    setDetailUser(record);
    setDetailModal(true);
  };

  const handleChangeRole = async (record, newRole) => {
    try {
      const access_token = localStorage.getItem('access_token');
      await UserService.updateUser(record._id, { ...record, role: newRole }, access_token);
      message.success('Cập nhật vai trò thành công!');
      fetchUsers();
    } catch (error) {
      message.error('Không thể đổi vai trò.');
    }
  };

  const handleToggleActive = async (record) => {
    try {
      const access_token = localStorage.getItem('access_token');
      await UserService.updateUser(record._id, { ...record, active: !record.active }, access_token);
      message.success(record.active ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      fetchUsers();
    } catch (error) {
      message.error('Không thể thay đổi trạng thái tài khoản.');
    }
  };

  // Đã loại bỏ chức năng resetPassword vì không có API tương ứng

  const handleDelete = async (id) => {
    try {
      const access_token = localStorage.getItem('access_token');
      await UserService.deleteUser(id, access_token);
      message.success('Xóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể xóa người dùng.');
    }
  };

  const columns = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => (
        <img
          src={avatar || '/default-avatar.png'}
          alt="Ảnh đại diện"
          style={{ width: 50, height: 50, borderRadius: '50%' }}
        />
      ),
    },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active) => active !== false ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Đã khóa</Tag>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role || 'user'}
          style={{ width: 100 }}
          onChange={val => handleChangeRole(record, val)}
        >
          <Select.Option value="user">User</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleShowDetail(record)} />
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            icon={record.active !== false ? <LockOutlined /> : <UnlockOutlined />} 
            onClick={() => handleToggleActive(record)}
            type={record.active !== false ? 'default' : 'primary'}
          >
            {record.active !== false ? 'Khóa' : 'Mở khóa'}
          </Button>
          {/* <Button icon={<ReloadOutlined />} onClick={() => handleResetPassword(record)}>
            Reset mật khẩu
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '32px 16px',
          margin: '0 12px',
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 28 }} gutter={[8, 16]}>
          <Col xs={24} sm={12}>
            <h2 style={{ fontWeight: 700, fontSize: 28, color: '#2d3a4b', margin: 0 }}>Quản lý người dùng</h2>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8, fontWeight: 600, fontSize: 16 }}
              onClick={() => {
                setIsModalOpen(true);
                setCurrentUser({});
              }}
            >
              Thêm người dùng
            </Button>
          </Col>
        </Row>
        <Card
          title={<span style={{ fontWeight: 600, fontSize: 20, color: '#1890ff' }}>Thống kê người dùng</span>}
          style={{ marginBottom: 32, borderRadius: 14, boxShadow: '0 2px 12px #f0f2f5' }}
          bodyStyle={{ padding: 20 }}
        >
          <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 8 }}>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 8 }}>
              <Statistic title="Tổng số người dùng" value={users.length} valueStyle={{ color: '#1890ff', fontWeight: 700 }} />
            </Col>
            <Col xs={24} md={8} lg={12} style={{ marginBottom: 8 }}>
              <Input.Search
                placeholder="Tìm kiếm theo tên, email, số điện thoại"
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%', maxWidth: 400 }}
              />
            </Col>
          </Row>
          <div style={{ overflowX: 'auto', borderRadius: 12 }}>
            <Table
              columns={columns}
              dataSource={users}
              loading={loading}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              style={{ minWidth: 700, background: '#fff', borderRadius: 12 }}
              scroll={{ x: 700 }}
            />
          </div>
        </Card>
      </div>

      {/* Modal thêm/sửa user */}
      <Modal
        title={currentUser._id ? 'Chỉnh sửa người dùng' : 'Thêm mới người dùng'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        bodyStyle={{ borderRadius: 16, padding: 28 }}
        style={{ maxWidth: 420 }}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 8 }}>
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Ảnh đại diện">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
              accept=".jpg,.png"
              beforeUpload={() => false}
              showUploadList={{ showRemoveIcon: true }}
              style={{ width: '100%' }}
            >
              {fileList.length < 1 && <UploadOutlined />}
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 8, fontWeight: 600 }}>
            {currentUser._id ? 'Cập nhật người dùng' : 'Thêm người dùng'}
          </Button>
        </Form>
      </Modal>

      {/* Modal chi tiết user */}
      <Modal
        title="Chi tiết người dùng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={500}
        centered
        bodyStyle={{ borderRadius: 16, padding: 28 }}
      >
        {detailUser && (
          <Descriptions bordered column={1} size="middle" style={{ borderRadius: 12 }}>
            <Descriptions.Item label="Họ tên">{detailUser.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{detailUser.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detailUser.phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{detailUser.address}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {detailUser.active !== false ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Đã khóa</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={detailUser.role === 'admin' ? 'blue' : 'default'}>{detailUser.role === 'admin' ? 'Admin' : 'User'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {detailUser.createdAt && new Date(detailUser.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Ảnh đại diện">
              <img src={detailUser.avatar || '/default-avatar.png'} alt="avatar" style={{ width: 90, borderRadius: 10, boxShadow: '0 2px 8px #eee' }} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminUser;
