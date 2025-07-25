import React, { useState, useEffect } from 'react';
import { Rate, Button, Input, message, List, Popconfirm, Select, Spin, Row, Col, Progress, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import * as ReviewService from '../../services/ReviewService';

const ReviewSection = ({ productId, user, isAdmin, onStats }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // id review đang xóa
  const [sort, setSort] = useState('newest');
  const [filterStar, setFilterStar] = useState(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const commentInput = React.useRef(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await ReviewService.getReviewsByProduct(productId);
      setReviews(res.data || []);
    } catch (err) {
      message.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

  // Tính tổng điểm, số lượng từng sao
  const total = reviews.length;
  const avg = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total) : 0;
  const starCount = [0, 0, 0, 0, 0];
  reviews.forEach(r => { starCount[r.rating - 1]++; });

  // Truyền dữ liệu tổng quan lên cha nếu có onStats
  useEffect(() => {
    if (typeof onStats === 'function') {
      onStats(avg, starCount, total);
    }
    // eslint-disable-next-line
  }, [avg, total, reviews]);

  // Sort/filter reviews
  let filtered = [...reviews];
  if (filterStar) filtered = filtered.filter(r => r.rating === filterStar);
  if (sort === 'newest') filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'oldest') filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === 'high') filtered = filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'low') filtered = filtered.sort((a, b) => a.rating - b.rating);

  const handleSubmit = async () => {
    if (!user) {
      message.warning('Bạn cần đăng nhập để đánh giá!');
      return;
    }
    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    setSubmitLoading(true);
    try {
      await ReviewService.createReview(productId, rating, comment, localStorage.getItem('access_token'));
      setComment('');
      setRating(5);
      await fetchReviews();
      message.success('Đã gửi đánh giá!');
      setPage(1);
    } catch (err) {
      message.error('Gửi đánh giá thất bại!');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setDeleteLoading(reviewId);
    try {
      await ReviewService.deleteReview(reviewId, localStorage.getItem('access_token'));
      await fetchReviews();
      message.success('Đã xóa đánh giá!');
    } catch (err) {
      message.error('Xóa đánh giá thất bại!');
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (commentInput.current) commentInput.current.focus();
  }, [rating]);

  // Phân trang review
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{ marginTop: 32 }}>
      <Row gutter={24} align="middle" style={{ flexWrap: 'wrap' }}>
        <Col xs={24} sm={6} style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{avg.toFixed(1)} <Rate disabled value={Number(avg)} style={{ fontSize: 20 }} /></div>
          <div style={{ color: '#888' }}>{total} đánh giá</div>
        </Col>
        <Col xs={24} sm={12}>
          {[5,4,3,2,1].map(star => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ width: 30 }}>{star} <Rate disabled value={star} style={{ fontSize: 14 }} /></span>
              <Progress percent={total ? Math.round(starCount[star-1]*100/total) : 0} showInfo={false} style={{ flex: 1, margin: '0 8px' }} />
              <span style={{ width: 30 }}>{starCount[star-1]}</span>
            </div>
          ))}
        </Col>
        <Col xs={24} sm={6}>
          <Select value={sort} onChange={setSort} style={{ width: '100%', marginBottom: 8 }}>
            <Select.Option value="newest">Mới nhất</Select.Option>
            <Select.Option value="oldest">Cũ nhất</Select.Option>
            <Select.Option value="high">Điểm cao nhất</Select.Option>
            <Select.Option value="low">Điểm thấp nhất</Select.Option>
          </Select>
          <Select value={filterStar} onChange={v => setFilterStar(v)} style={{ width: '100%' }} allowClear placeholder="Lọc theo số sao">
            <Select.Option value={undefined}>Tất cả</Select.Option>
            {[5,4,3,2,1].map(star => (
              <Select.Option key={star} value={star}>{star} sao</Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <div style={{ margin: '16px 0' }}>
        <Rate value={rating} onChange={setRating} />
        <Input.TextArea
          ref={commentInput}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          placeholder="Nhập đánh giá của bạn..."
          style={{ margin: '8px 0', width: '100%', maxWidth: 400 }}
          maxLength={300}
          showCount
        />
        <Button type="primary" onClick={handleSubmit} loading={submitLoading} style={{ marginTop: 8 }}>
          Gửi đánh giá
        </Button>
      </div>
      <Spin spinning={loading}>
        <List
          dataSource={paged}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            onChange: setPage,
            showSizeChanger: true,
            onShowSizeChange: (cur, size) => { setPageSize(size); setPage(1); },
            pageSizeOptions: [3,5,10,20],
          }}
          renderItem={item => (
            <List.Item
              actions={[(user && (item.user._id === user._id || isAdmin)) ? (
                <Popconfirm title="Bạn có chắc chắn muốn xóa đánh giá này?" onConfirm={() => handleDelete(item._id)} okButtonProps={{ loading: deleteLoading===item._id }}>
                  <Button danger size="small" loading={deleteLoading===item._id}>Xóa</Button>
                </Popconfirm>
              ) : null]}
            >
              <List.Item.Meta
                avatar={item.user?.avatar ? (
                  <Avatar src={item.user.avatar} />
                ) : (
                  <Avatar icon={<UserOutlined />} style={{ background: '#eee', color: '#333', fontWeight: 600 }}>
                    {item.user?.name?.[0] || 'U'}
                  </Avatar>
                )}
                title={<span>{item.user?.name || 'Ẩn danh'} - <Rate disabled value={item.rating} /></span>}
                description={item.comment}
              />
              <span style={{ color: '#888', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</span>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default ReviewSection;
