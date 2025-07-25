import React from 'react';
import QRCode from 'qrcode.react';
import { Modal, Typography } from 'antd';

const { Title } = Typography;

const QRCodePayment = ({ visible, onClose, url, amount, info }) => {
  return (
    <Modal open={visible} onCancel={onClose} footer={null} title="Quét mã QR để thanh toán" centered>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <QRCode value={url} size={220} level="H" includeMargin={true} />
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Số tiền: <span style={{ color: '#2b46bd' }}>{amount ? amount.toLocaleString('vi-VN') + ' ₫' : ''}</span></Title>
          {info && <div style={{ marginTop: 8, color: '#888' }}>{info}</div>}
        </div>
        <div style={{ marginTop: 16, color: '#888', fontSize: 15 }}>
          Dùng app ngân hàng hoặc ví điện tử để quét mã QR và thanh toán.<br/>
          Sau khi thanh toán, vui lòng xác nhận với quản lý để hoàn tất đơn hàng.
        </div>
      </div>
    </Modal>
  );
};

export default QRCodePayment;
