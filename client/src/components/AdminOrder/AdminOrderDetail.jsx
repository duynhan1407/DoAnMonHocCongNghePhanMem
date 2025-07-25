import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Card, Row, Col, Image, Tag, Typography, Divider, Spin } from "antd";
import * as OrderService from "../../services/OrderService";

const { Title, Text, Paragraph } = Typography;

const AdminOrderDetail = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    OrderService.getOrderById(orderId)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  return (
    <Modal
      open={!!orderId}
      onCancel={onClose}
      footer={null}
      width={800}
      title={order ? `Chi tiết đơn hàng #${order._id}` : "Đang tải..."}
    >
      {loading ? (
        <Spin />
      ) : order ? (
        <>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Khách hàng">{order.user?.name || order.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{order.user?.phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">{order.shippingAddress}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={order.status === "Delivered" ? "green" : order.status === "Pending" ? "orange" : "blue"}>
                {order.status === "Delivered" ? "Đã giao hàng" : order.status === "Pending" ? "Chờ xử lý" : order.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá trị">
              {order.totalPrice?.toLocaleString("vi-VN")} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt hàng">{new Date(order.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">Sản phẩm</Divider>
          <Row gutter={16}>
            {order.orderItems?.map((item, idx) => (
              <Col span={12} key={idx} style={{ marginBottom: 16 }}>
                <Card bordered>
                  <Row gutter={8} align="middle">
                    <Col span={8}>
                      <Image
                        src={item.image || "/assets/images/no-image.png"}
                        alt={item.name}
                        style={{ width: "100%", borderRadius: 8, marginBottom: 8 }}
                        fallback="/assets/images/no-image.png"
                      />
                    </Col>
                    <Col span={16}>
                      <Title level={5} style={{ marginBottom: 0 }}>{item.name}</Title>
                      <Text type="secondary">Số lượng: {item.qty}</Text><br />
                      <Text>Giá: {item.price?.toLocaleString("vi-VN")} ₫</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Text type="danger">Không tìm thấy thông tin đơn hàng.</Text>
      )}
    </Modal>
  );
};

export default AdminOrderDetail;
