import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Table, Card, Statistic, Row, Col, DatePicker, Button, message } from 'antd';
import RevenueChart from '../../components/RevenueChart';
import moment from 'moment';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const user = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchStats = async (startDate, endDate) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/order/stats', {
        params: {
          startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
          endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
        },
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      message.error('Lỗi lấy thống kê đơn hàng!');
    }
    setLoading(false);
  };

  useEffect(() => {
    const start = Array.isArray(dateRange) && dateRange[0] ? dateRange[0] : undefined;
    const end = Array.isArray(dateRange) && dateRange[1] ? dateRange[1] : undefined;
    fetchStats(start, end);
  }, [dateRange]);

  const columns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Số đơn hàng', dataIndex: 'orderCount', key: 'orderCount' },
    { title: 'Doanh thu (VNĐ)', dataIndex: 'revenue', key: 'revenue', render: (v) => v.toLocaleString('vi-VN') },
  ];

  if (!user?.isAdmin) {
    return <div style={{ padding: 24, color: 'red', fontWeight: 'bold' }}>Bạn không có quyền truy cập dashboard doanh thu!</div>;
  }
  return (
    <div style={{ padding: 24 }}>
      <Card title="Thống kê doanh thu & đơn hàng" style={{ marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col>
            <Button type="primary" onClick={() => fetchStats(dateRange[0], dateRange[1])} loading={loading}>
              Lấy thống kê
            </Button>
          </Col>
        </Row>
        {stats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic title="Tổng doanh thu" value={stats.totalRevenue} suffix="VNĐ" valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8}>
              <Statistic title="Tổng đơn hàng" value={stats.totalOrders} valueStyle={{ color: '#1890ff' }} />
            </Col>
            <Col span={8}>
              <Statistic title="Sản phẩm đã bán" value={stats.soldProducts} valueStyle={{ color: '#ff4d4f' }} />
            </Col>
          </Row>
        )}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Biểu đồ doanh thu theo ngày</h3>
          <RevenueChart data={Array.isArray(stats?.dailyStats) ? stats.dailyStats : []} />
        </div>
        <Table
          columns={columns}
          dataSource={Array.isArray(stats?.dailyStats) ? stats.dailyStats : []}
          rowKey="date"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
