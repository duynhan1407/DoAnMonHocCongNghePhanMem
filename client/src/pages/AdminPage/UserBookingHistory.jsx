import React, { useState } from 'react';
import { Table, Select, Spin } from 'antd';
import axios from 'axios';

const UserBookingHistory = () => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    axios.get('/api/user/all').then(res => {
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    }).catch(() => setUsers([]));
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios.get(`/api/booking/user/${userId}`).then(res => {
      setBookings(res.data);
      setLoading(false);
    });
  }, [userId]);

  const columns = [
    { title: 'Phòng', dataIndex: 'roomName', key: 'roomName' },
    { title: 'Ngày nhận', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Ngày trả', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Thanh toán', dataIndex: 'paymentStatus', key: 'paymentStatus' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Select
        style={{ width: 300, marginBottom: 16 }}
        placeholder="Chọn người dùng"
        onChange={setUserId}
        options={Array.isArray(users) ? users.map(u => ({ label: u.name, value: u._id })) : []}
      />
      {loading ? <Spin /> : <Table columns={columns} dataSource={bookings} rowKey="_id" />}
    </div>
  );
};

export default UserBookingHistory;
