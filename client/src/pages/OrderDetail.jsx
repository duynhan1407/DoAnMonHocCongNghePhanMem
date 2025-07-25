import React, { useState } from "react";
import { Modal, Button, InputNumber, message, Spin, Radio } from "antd";
import * as OrderService from "../services/OrderService";
import { createVNPayUrl } from '../services/PaymentService';
import QRCodePayment from '../components/Payment/QRCodePayment';

const ProductDetailOrder = ({ product, visible, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [payType, setPayType] = useState('banking');
  const [paymentUrl, setPaymentUrl] = useState('');

  const handleOrder = async () => {
    setLoading(true);
    try {
      let orderId = null;
      let paymentUrl = '';
      const amount = Number(product.price) * quantity;
      if (payType === 'vnpay') {
        const payRes = await createVNPayUrl(amount);
        orderId = payRes.orderId;
        paymentUrl = payRes.paymentUrl;
        window.location.href = paymentUrl;
        setLoading(false);
        return;
      }
      const res = await OrderService.createOrder({
        productId: product._id,
        quantity,
        orderId,
      });
      if (res?.status === "OK") {
        message.success("Đặt hàng thành công! Vui lòng thanh toán để hoàn tất.");
        setShowQR(true);
      } else {
        message.error(res?.message || "Đặt hàng thất bại!");
      }
    } catch (err) {
      message.error("Lỗi khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQR = () => {
    setShowQR(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        title={product ? `Đặt hàng: ${product.name}` : ""}
        centered
      >
        {product ? (
          <Spin spinning={loading} tip="Đang xử lý...">
            <div style={{ textAlign: "center" }}>
              <img
                src={product.image && (product.image.startsWith('http') ? product.image : `http://localhost:3001${product.image}`)}
                alt="Sản phẩm"
                style={{ width: "100%", maxHeight: 350, objectFit: "cover", marginBottom: 16 }}
                onError={e => { e.target.onerror = null; e.target.src = '/default-product.jpg'; }}
              />
              <div><b>Loại sản phẩm:</b> {product.category || '-'}</div>
              <div><b>Giá tiền:</b> {Number(product.price).toLocaleString("vi-VN")} ₫</div>
              <div><b>Giảm giá:</b> {product.discount ? `${product.discount}%` : "Không có"}</div>
              <div><b>Mô tả:</b> {product.description}</div>
              <div style={{ margin: "16px 0" }}>
                <InputNumber
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={setQuantity}
                  style={{ width: 120 }}
                  addonAfter="cái"
                />
              </div>
              <Radio.Group value={payType} onChange={e => setPayType(e.target.value)} style={{ marginBottom: 16 }}>
                <Radio value="banking">QR Banking</Radio>
                <Radio value="vnpay">QR VNPAY</Radio>
              </Radio.Group>
              <Button type="primary" onClick={handleOrder} loading={loading} block>
                Đặt hàng & Thanh toán QR
              </Button>
            </div>
          </Spin>
        ) : null}
      </Modal>
      <QRCodePayment
        visible={showQR}
        onClose={handleCloseQR}
        url={payType === 'vnpay' ? paymentUrl : undefined}
        amount={Number(product?.price) * quantity}
        info={`Sản phẩm: ${product?.name}`}
        bankId={payType === 'banking' ? (product?.bankId || 'VCB') : undefined}
        account={payType === 'banking' ? (product?.bankAccount || '0123456789') : undefined}
        isVnpay={payType === 'vnpay'}
      />
    </>
  );
};

export default ProductDetailOrder;
