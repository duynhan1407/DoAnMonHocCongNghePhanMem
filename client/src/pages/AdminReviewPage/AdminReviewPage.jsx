import React, { useState, useEffect } from 'react';
import { Table, Button, Rate, Input, Modal, message, Popconfirm } from 'antd';
import * as ReviewService from '../../services/ReviewService';

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    // Lấy tất cả đánh giá từ ReviewService
    const fetchAllReviews = async () => {
      setLoading(true);
      try {
        const res = await ReviewService.getAllReviews();
        setReviews(res?.data || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReviews();
  }, []);

  // Xóa đánh giá
  const handleDelete = async (record) => {
    try {
      await ReviewService.deleteReview(record._id);
      setReviews(reviews.filter(r => r._id !== record._id));
      message.success('Đã xóa đánh giá!');
      // Phát sự kiện reload để trang quản lý kho cập nhật lại thống kê review
      window.dispatchEvent(new Event('reloadProducts'));
    } catch {
      message.error('Lỗi xóa đánh giá!');
    }
  };

  // Sửa đánh giá
  const handleEdit = (record) => {
    setSelectedReview(record);
    setEditContent(record.content);
    setEditRating(record.rating);
    setEditModalOpen(true);
  };
  const handleEditSubmit = () => {
    setReviews(reviews.map(r => r === selectedReview ? { ...r, content: editContent, rating: editRating } : r));
    setEditModalOpen(false);
    message.success('Đã cập nhật đánh giá!');
    // TODO: Gọi API cập nhật đánh giá trên backend
  };

  // Tìm kiếm theo tên sản phẩm hoặc người dùng
  const filteredReviews = reviews.filter(r =>
    r.productName?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Người đánh giá', dataIndex: 'user', key: 'user' },
    { title: 'Số sao', dataIndex: 'rating', key: 'rating', render: val => <Rate disabled value={val} /> },
    { title: 'Nội dung', dataIndex: 'content', key: 'content', render: val => <span>{val}</span> },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: val => <span>{val}</span> },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa đánh giá này?" onConfirm={() => handleDelete(record)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Quản lý đánh giá sản phẩm</h1>
      <Input.Search
        placeholder="Tìm kiếm theo sản phẩm hoặc người dùng"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 24, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={filteredReviews}
        rowKey={(_, idx) => idx}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Sửa đánh giá"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
      >
        <div style={{ marginBottom: 16 }}>
          <b>Số sao:</b>
          <Rate value={editRating} onChange={setEditRating} style={{ marginLeft: 12 }} />
        </div>
        <Input.TextArea
          rows={4}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminReviewPage;
