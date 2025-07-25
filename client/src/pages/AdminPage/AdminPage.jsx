import { Menu } from 'antd';
import React, { useState } from 'react';
import { getItem } from '../../until';
import { UserOutlined, InboxOutlined } from '@ant-design/icons';
import { ShopOutlined } from '@ant-design/icons';
import AdminStockManager from '../../components/AdminStock/AdminStockManager';
import AdminUser from '../../components/AdminUser/AdminUser';
import QuanLySanPham from '../../components/AdminProduct/AdminProduct';
import AdminOrder from '../../components/AdminOrder/AdminOrder';
import AdminDashboard from './AdminDashboard';
import ExportRevenue from './ExportRevenue';
import BrandComponent from '../../components/BrandComponent/BrandComponent';

const AdminPage = () => {
  const menuItems = [
  getItem('Dashboard', 'dashboard', <InboxOutlined />),
  getItem('Người dùng', 'user', <UserOutlined />),
  getItem('Sản phẩm', 'product', <InboxOutlined />),
  getItem('Đơn hàng', 'order', <InboxOutlined />),
  getItem('Thương hiệu', 'brand', <InboxOutlined />),
  getItem('Quản lý kho', 'stock', <ShopOutlined />),
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
      case 'stock':
        return <AdminStockManager />;
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
