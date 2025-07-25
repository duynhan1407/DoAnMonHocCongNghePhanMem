import React, { useEffect, useState } from 'react';
import { Badge, Col, message, Popover } from 'antd';
import { Wrappercontent, WrapperHeader, WrapperHeaderAccount, WrapperTextHeader, WrapperTextHeaderSmall, SearchInput } from './Style';
import { UserOutlined, CaretDownOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserServices from '../../services/UserServices';
import { logoutUser } from '../../redux/Slide/userSlide';

const HeaderComponent = ({ isHiddenSearch = false, isHiddenInbox = false }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Thêm trạng thái cho giá trị tìm kiếm

  const handleNavigateLogin = () => {
    navigate('/sign-in');
  };

  const handleLogout = async () => {
    try {
      await UserServices.logoutUser();
      dispatch(logoutUser());
      message.success('Đăng xuất thành công!');
      navigate('/sign-in');
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleSearch = () => {
    // Đây là nơi bạn xử lý tìm kiếm, ví dụ bạn có thể gọi API để tìm kiếm
    if (searchTerm) {
      console.log("Tìm kiếm theo từ khóa: ", searchTerm);
      // Thực hiện hành động tìm kiếm tại đây (ví dụ gọi API hoặc thay đổi dữ liệu hiển thị)
    } else {
      message.warning("Vui lòng nhập từ khóa tìm kiếm");
    }
  };

  useEffect(() => {
    setUserName(user?.name);
    setUserAvatar(user?.avatar);
  }, [user?.name, user?.avatar]);

  const content = (
    <div>
      <Wrappercontent onClick={() => navigate('/profile')}>Thông tin người dùng</Wrappercontent>
      {user?.isAdmin && (
        <Wrappercontent onClick={() => navigate('/admin')}>Quản lý hệ thống</Wrappercontent>
      )}
      <Wrappercontent onClick={handleLogout}>Đăng xuất</Wrappercontent>
    </div>
  );

  return (
    <div>
      <WrapperHeader
        style={{ justifyContent: isHiddenInbox && isHiddenSearch ? 'space-between' : 'unset' }}
      >
        {/* Logo Section */}
        <Col span={6}>
          <WrapperTextHeader onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Watch Store
          </WrapperTextHeader>
        </Col>

        {/* Search Bar Section */}
        <Col span={12}>
          {!isHiddenSearch && (
            <SearchInput
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm} // Liên kết giá trị tìm kiếm với trạng thái
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị tìm kiếm khi người dùng nhập
              onPressEnter={handleSearch} // Tìm kiếm khi nhấn Enter
              style={{
                padding: '12px 20px',
                border: '1px solid #ddd',
                borderRadius: '25px',
                backgroundColor: '#f9f9f9',
                width: '70%',
                outline: 'none',
              }}
            />
          )}
        </Col>

        {/* User & Inbox Section */}
        <Col span={6} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <WrapperHeaderAccount>
            {userAvatar ? (
              <img
                src={userAvatar}
                style={{
                  height: '60px',
                  width: '60px',
                  borderRadius: '50px',
                  objectFit: 'cover',
                }}
                alt="avatar"
              />
            ) : (
              <UserOutlined style={{ fontSize: '30px' }} />
            )}
            {user?.access_token ? (
              <Popover content={content} title="Tài khoản" trigger="hover">
                <div style={{ cursor: 'pointer' }}>{userName || user?.email}</div>
              </Popover>
            ) : (
              <div onClick={handleNavigateLogin} style={{ cursor: 'pointer' }}>
                <WrapperTextHeaderSmall>Đăng nhập/Đăng ký</WrapperTextHeaderSmall>
                <div>
                  <WrapperTextHeaderSmall>Tài khoản</WrapperTextHeaderSmall>
                </div>
                <CaretDownOutlined />
              </div>
            )}
          </WrapperHeaderAccount>

          {/* Inbox Icon */}
          {!isHiddenInbox && (
            <Badge count={4} size="small">
              <InboxOutlined style={{ fontSize: '30px', color: '#fff' }} />
            </Badge>
          )}
        </Col>
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;
