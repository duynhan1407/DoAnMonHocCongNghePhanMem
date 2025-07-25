import React, { useState, useEffect } from "react";
import { Select, Input, Button, Form, message, Spin } from "antd";
import axios from "axios";

const { Option } = Select;

const OrderPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/products`
        );
        setProducts(response.data);
      } catch (error) {
        message.error("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && quantity > 0) {
      setTotalPrice(selectedProduct.price * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedProduct, quantity]);

  const handleOrder = async (values) => {
    if (!selectedProduct || quantity < 1) {
      message.error("Vui lòng chọn sản phẩm và số lượng!");
      return;
    }
    setOrderLoading(true);

    const orderData = {
      ...values,
      orderItems: [
        {
          product: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity,
        },
      ],
      paymentMethod: values.paymentMethod,
      totalPrice,
      userId: user?._id,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/orders`,
        orderData
      );
      message.success("Đặt hàng thành công!");
      form.resetFields();
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      message.error("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Đặt hàng đồng hồ</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          layout="vertical"
          form={form}
          onFinish={handleOrder}
          initialValues={{
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
          }}
        >
          <Form.Item
            label="Chọn sản phẩm"
            name="product"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              onChange={(productId) =>
                setSelectedProduct(products.find((p) => p._id === productId))
              }
            >
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {product.name} - {Number(product.price).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Số lượng"
            name="quantity"
            initialValue={1}
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng chọn phương thức!" }]}
          >
            <Select placeholder="Chọn phương thức thanh toán">
              <Option value="Credit Card">Thẻ tín dụng</Option>
              <Option value="PayPal">PayPal</Option>
              <Option value="Cash">Tiền mặt</Option>
            </Select>
          </Form.Item>
          <div style={{ marginBottom: "20px" }}>
            <strong>Tổng tiền:</strong>{" "}
            {totalPrice > 0 ? Number(totalPrice).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫" : "0₫"}
          </div>
          <Button type="primary" htmlType="submit" loading={orderLoading}>
            Xác nhận đặt hàng
          </Button>
        </Form>
      )}
    </div>
  );
};

export default OrderPage;
