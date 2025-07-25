import React, { useEffect, useState } from "react";
import { Table, Button, Input, Modal, message } from "antd";
import * as ProductService from "../../services/ProductService";
import * as OrderService from "../../services/OrderService";

const AdminStockManager = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [exportQty, setExportQty] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAllProducts();
      setProducts(res?.data || []);
    } catch {
      message.error("Không thể lấy danh sách sản phẩm");
    }
    setLoading(false);
  };

  const fetchBrands = async () => {
    try {
      const res = await ProductService.getAllBrands?.();
      setBrands(res?.data || []);
    } catch {
      setBrands([]);
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct || restockQty <= 0) return;
    try {
      await OrderService.restockProduct({ productId: selectedProduct._id || selectedProduct.id, quantity: restockQty });
      message.success("Đã nhập kho thành công!");
      setRestockModal(false);
      fetchProducts();
    } catch {
      message.error("Lỗi nhập kho!");
    }
  };

  const handleExport = async () => {
    if (!selectedProduct || exportQty <= 0) return;
    try {
      await OrderService.exportProduct({ productId: selectedProduct._id || selectedProduct.id, quantity: exportQty });
      message.success("Đã xuất kho thành công!");
      setExportModal(false);
      fetchProducts();
    } catch {
      message.error("Lỗi xuất kho!");
    }
  };

  const columns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
    { title: "Giá", dataIndex: "price", key: "price", render: v => v?.toLocaleString("vi-VN") + " ₫" },
    { title: "Số lượng kho", dataIndex: "quantity", key: "quantity" },
    {
      title: "Số lượng đã nhập kho của thương hiệu",
      key: "brandQty",
      render: (_, record) => {
        const brand = brands.find(b => b.name === record.brand);
        return brand ? brand.quantity : 0;
      }
    },
    {
      title: "Nhập kho",
      key: "restock",
      render: (_, record) => (
        <Button type="primary" onClick={() => { setSelectedProduct(record); setRestockModal(true); }}>
          Nhập thêm
        </Button>
      )
    },
    {
      title: "Xuất kho",
      key: "export",
      render: (_, record) => (
        <Button danger onClick={() => { setSelectedProduct(record); setExportModal(true); }}>
          Xuất kho
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý kho sản phẩm</h2>
      <Table columns={columns} dataSource={products} rowKey={r => r._id || r.id} loading={loading} />
      <Modal
        open={restockModal}
        title={`Nhập kho: ${selectedProduct?.name}`}
        onCancel={() => setRestockModal(false)}
        onOk={handleRestock}
        okText="Xác nhận"
      >
        <Input
          type="number"
          min={1}
          value={restockQty}
          onChange={e => setRestockQty(Number(e.target.value))}
          style={{ width: 120 }}
        />
      </Modal>
      <Modal
        open={exportModal}
        title={`Xuất kho: ${selectedProduct?.name}`}
        onCancel={() => setExportModal(false)}
        onOk={handleExport}
        okText="Xác nhận"
      >
        <Input
          type="number"
          min={1}
          value={exportQty}
          onChange={e => setExportQty(Number(e.target.value))}
          style={{ width: 120 }}
        />
      </Modal>
    </div>
  );
};

export default AdminStockManager;
