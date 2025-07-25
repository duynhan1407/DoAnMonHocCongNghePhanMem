import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  message,
  Table,
  Space,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  Tag,
  Descriptions,
} from "antd";
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import * as UserService from "../../services/UserServices";
import * as OrderService from "../../services/OrderService";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [pending, setPending] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [form] = Form.useForm();
  const [deleteModal, setDeleteModal] = useState({ open: false, record: null });

  // Fetch orders and users
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await OrderService.getAllOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
      setTotal(Array.isArray(res.data) ? res.data.length : 0);
      setDelivered(Array.isArray(res.data) ? res.data.filter(o => o.status === 'Delivered').length : 0);
      setPending(Array.isArray(res.data) ? res.data.filter(o => o.status === 'Pending').length : 0);
      setCancelled(Array.isArray(res.data) ? res.data.filter(o => o.status === 'Cancelled').length : 0);
    } catch (error) {
      message.error("Không thể lấy danh sách đơn hàng!");
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await UserService.getAllUser();
      setUsers(res.data || []);
    } catch (error) {
      message.error("Không thể lấy danh sách người dùng!");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // Modal create/update order
  const handleCreateOrder = () => {
    setCurrentOrder(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateOrder = async (values) => {
    try {
      if (currentOrder) {
        await OrderService.updateOrder(currentOrder._id, values);
        message.success("Cập nhật đơn hàng thành công!");
      } else {
        await OrderService.createOrder(values);
        message.success("Tạo đơn hàng thành công!");
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi tạo/cập nhật đơn hàng!");
    }
  };

  // Confirm order
  const handleConfirmOrder = async (record) => {
    try {
      await OrderService.updateOrder(record._id, { status: "Delivered" });
      message.success("Đã xác nhận giao hàng!");
      fetchOrders();
    } catch (error) {
      message.error("Không thể xác nhận: " + (error?.response?.data?.message || error.message));
    }
  };

  // Cancel order
  const handleCancelOrder = (record) => {
    setDeleteModal({ open: true, record });
  };

  const handleDeleteOrder = async () => {
    try {
      await OrderService.deleteOrder(deleteModal.record._id);
      message.success("Đã xóa đơn hàng!");
      setDeleteModal({ open: false, record: null });
      fetchOrders();
    } catch (error) {
      message.error("Không thể xóa: " + (error?.response?.data?.message || error.message));
    }
  };

  // Table columns
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span style={{ color: '#888' }}>{id?.slice(-6)?.toUpperCase()}</span>
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      render: (user) => user?.name || user?.email || "Không có thông tin"
    },
    {
      title: "Sản phẩm",
      dataIndex: "orderItems",
      key: "orderItems",
      render: (items) =>
        items && items.length > 0
          ? items.map((item, idx) => (
              <Tag color="blue" key={idx}>{item?.name || "N/A"} x{item?.qty}</Tag>
            ))
          : <span style={{ color: '#aaa' }}>Không có sản phẩm</span>
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total) => <span style={{ color: '#d4380d', fontWeight: 600 }}>{Number(total).toLocaleString("vi-VN")}₫</span>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = 'default', text = 'Chờ xác nhận';
        if (status === 'Delivered') { color = 'green'; text = 'Đã giao'; }
        else if (status === 'Cancelled') { color = 'red'; text = 'Đã hủy'; }
        else if (status === 'Pending') { color = 'gold'; text = 'Chờ xác nhận'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid) => (
        <Badge status={isPaid ? "success" : "warning"} text={isPaid ? "Đã thanh toán" : "Chưa thanh toán"} />
      )
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => { setDetailOrder(record); setDetailModal(true); }} />
          {record.status === 'Pending' && (
            <Button icon={<CheckCircleOutlined />} type="primary" onClick={() => handleConfirmOrder(record)}>
              Xác nhận
            </Button>
          )}
          {record.status !== 'Cancelled' && (
            <Button icon={<CloseCircleOutlined />} danger onClick={() => handleCancelOrder(record)}>
              Hủy
            </Button>
          )}
          <Modal
            title="Xác nhận xóa đơn hàng"
            open={deleteModal.open}
            onOk={handleDeleteOrder}
            onCancel={() => setDeleteModal({ open: false, record: null })}
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
          >
            <p>Bạn có chắc chắn muốn xóa đơn hàng này không?</p>
            <p style={{ color: '#d4380d' }}><b>Mã đơn:</b> {deleteModal.record?._id?.slice(-6)?.toUpperCase()}</p>
          </Modal>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered style={{ textAlign: 'center' }}>
            <Statistic title="Tổng đơn hàng" value={total} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered style={{ textAlign: 'center' }}>
            <Statistic title="Đã giao" value={delivered} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered style={{ textAlign: 'center' }}>
            <Statistic title="Chờ xác nhận" value={pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered style={{ textAlign: 'center' }}>
            <Statistic title="Đã hủy" value={cancelled} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
            Tạo đơn hàng
          </Button>
        </Col>
        <Col>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            placeholder="Lọc theo trạng thái"
            allowClear
          >
            <Select.Option value="">Tất cả</Select.Option>
            <Select.Option value="Pending">Chờ xác nhận</Select.Option>
            <Select.Option value="Delivered">Đã giao</Select.Option>
            <Select.Option value="Cancelled">Đã hủy</Select.Option>
          </Select>
        </Col>
      </Row>
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal tạo/cập nhật đơn hàng */}
      <Modal
        title={currentOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrUpdateOrder} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Khách hàng"
                rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
              >
                <Select placeholder="Chọn khách hàng">
                  {users.map((user) => (
                    <Select.Option key={user._id} value={user._id}>
                      {user.name || user.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderItems"
                label="Sản phẩm"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
              >
                <Input placeholder="Nhập danh sách sản phẩm (tạm thời)" />
                {/* TODO: Thay bằng Select sản phẩm thực tế */}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {currentOrder ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Form>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
      >
        {detailOrder && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã đơn">{detailOrder._id}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{detailOrder.user?.name || detailOrder.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">
              {detailOrder.orderItems?.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <Tag color="blue">{item?.name} x{item?.qty}</Tag>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                    <b>Giá:</b> {item?.price?.toLocaleString('vi-VN') || '-'}₫
                  </div>
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <span style={{ color: '#d4380d', fontWeight: 600 }}>{Number(detailOrder.totalPrice).toLocaleString("vi-VN")}₫</span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailOrder.status === 'Delivered' ? 'green' : detailOrder.status === 'Cancelled' ? 'red' : 'gold'}>
                {detailOrder.status === 'Delivered' ? 'Đã giao' : detailOrder.status === 'Cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Badge status={detailOrder.isPaid ? "success" : "warning"} text={detailOrder.isPaid ? "Đã thanh toán" : "Chưa thanh toán"} />
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{detailOrder.notes || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleString() : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrder;
