import React from "react";
import AdminStockManager from "../components/AdminStock/AdminStockManager";

const AdminStockPage = () => {
  return (
    <div style={{ padding: 32 }}>
      <h1>Quản lý kho sản phẩm</h1>
      <AdminStockManager />
    </div>
  );
};

export default AdminStockPage;
