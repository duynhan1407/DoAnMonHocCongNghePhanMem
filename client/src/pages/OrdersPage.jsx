import React, { useState, useEffect } from 'react';
import { Select, message, Input, Modal, Descriptions, Tag, Button } from 'antd';
import * as OrderService from '../services/OrderService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [detailModal, setDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const access_token = localStorage.getItem('access_token');
        const res = await OrderService.getAllOrders(access_token, statusFilter);
        setOrders(res?.data || []);
      } catch (error) {
        message.error('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  // Lọc tìm kiếm client
  const filteredOrders = orders.filter(o => {
    if (!searchText.trim()) return true;
    const lower = searchText.trim().toLowerCase();
    return (
      o._id.toLowerCase().includes(lower) ||
      (o.orderItems?.map(i => i.name).join(' ') || '').toLowerCase().includes(lower) ||
      (o.totalPrice + '').toLowerCase().includes(lower) ||
      (o.createdAt && new Date(o.createdAt).toLocaleDateString().includes(lower))
    );
  });

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 30 }}>
      <h1 style={{ textAlign: 'center' }}>Lịch sử đơn hàng</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
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
        <Input.Search
          placeholder="Tìm kiếm mã đơn, sản phẩm, ngày, giá..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          Không có đơn hàng nào.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Mã đơn</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Sản phẩm</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Tổng tiền</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Trạng thái</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Thanh toán</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Ngày tạo</th>
              <th style={{ padding: 10, border: '1px solid #ccc' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o._id}>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>{o._id.slice(-6).toUpperCase()}</td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>{o.orderItems?.map(i => i.name).join(', ')}</td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center', color: '#d4380d', fontWeight: 600 }}>{Number(o.totalPrice).toLocaleString('vi-VN')} ₫</td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>
                  <Tag color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'gold'}>
                    {o.status === 'Delivered' ? 'Đã giao' : o.status === 'Cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                  </Tag>
                </td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>{o.createdAt && new Date(o.createdAt).toLocaleString()}</td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>
                  <Tag color={o.isPaid ? 'green' : 'red'}>{o.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
                </td>
                <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>
                  <Button size="small" onClick={() => { setDetailOrder(o); setDetailModal(true); }}>Xem</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal
        title="Chi tiết đơn hàng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={500}
      >
        {detailOrder && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã đơn">{detailOrder._id}</Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">{detailOrder.orderItems?.map(i => i.name).join(', ')}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">{Number(detailOrder.totalPrice).toLocaleString('vi-VN')} ₫</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailOrder.status === 'Delivered' ? 'green' : detailOrder.status === 'Cancelled' ? 'red' : 'gold'}>
                {detailOrder.status === 'Delivered' ? 'Đã giao' : detailOrder.status === 'Cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Tag color={detailOrder.isPaid ? 'green' : 'red'}>{detailOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{detailOrder.createdAt && new Date(detailOrder.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{detailOrder.notes || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default OrdersPage;
