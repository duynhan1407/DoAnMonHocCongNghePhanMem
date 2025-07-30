import { Menu } from 'antd';
import React, { useState } from 'react';
import { getItem } from '../../until';
import { UserOutlined, InboxOutlined, StarOutlined } from '@ant-design/icons';
import { ShopOutlined } from '@ant-design/icons';
import AdminStockManager from '../../components/AdminStock/AdminStockManager';
import AdminUser from '../../components/AdminUser/AdminUser';
import QuanLySanPham from '../../components/AdminProduct/AdminProduct';
import AdminOrder from '../../components/AdminOrder/AdminOrder';
import AdminDashboard from './AdminDashboard';
// ...existing code...
import BrandComponent from '../../components/BrandComponent/BrandComponent';
import AdminCategory from '../../components/AdminCategory/AdminCategory';
import AdminReviewPage from '../AdminReviewPage';

const AdminPage = () => {
  const menuItems = [
    getItem('Dashboard', 'dashboard', <InboxOutlined />),
    getItem('Người dùng', 'user', <UserOutlined />),
    getItem('Sản phẩm', 'product', <InboxOutlined />),
    getItem('Đơn hàng', 'order', <InboxOutlined />),
    getItem('Thương hiệu', 'brand', <InboxOutlined />),
    getItem('Quản lý danh mục', 'category', <InboxOutlined />),
    getItem('Quản lý kho', 'stock', <ShopOutlined />),
    getItem('Quản lý đánh giá', 'review', <StarOutlined />),
  ];

  const [selectedKey, setSelectedKey] = useState('dashboard'); // Default to dashboard

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'user':
        return <AdminUser />;
      case 'product':
        return <QuanLySanPham />;
      case 'order':
        return <AdminOrder />;
      case 'brand':
        return <BrandComponent />;
      case 'category':
        return <AdminCategory />;
      case 'stock':
        return <AdminStockManager />;
      case 'review':
        return <AdminReviewPage />;
      default:
        return <h2 style={{ textAlign: 'center' }}>Vui lòng chọn một mục từ menu</h2>;
    }
  };

  return (
    <>
      {/* <HeaderComponent isHiddenSearch={true} isHiddenInbox={true} /> */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap', // Allow wrapping on smaller screens
        }}
      >
        <Menu
          mode="inline"
          style={{
            width: 256,
            boxShadow: '1px 1px 2px #ccc',
            flexShrink: 0, // Prevent shrinking
          }}
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={[selectedKey]}
          breakpoint="lg"
        />
        <div style={{ flex: 1, marginTop: '15px', padding: '15px', minWidth: 0 }}>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default AdminPage;
